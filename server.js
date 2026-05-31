const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Helper: List models directly via REST API to bypass SDK version issues
async function getAvailableModels() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const models = data.models || [];
        
        // Filter for models that support generateContent
        const contentModels = models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent')
        );
        
        return contentModels.map(m => m.name.replace('models/', ''));
    } catch (error) {
        console.error("⚠️ Could not list models via API:", error.message);
        return [];
    }
}

// Helper: Try multiple models until one works
async function generateContentWithFallback(prompt, imageBase64 = null) {
    // 1. Try to get actual available models from API first
    const availableModels = await getAvailableModels();
    
    // 2. Define our preferred order
    const preferredOrder = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-latest",
        "gemini-pro", 
        "gemini-1.0-pro"
    ];

    // 3. Create a candidate list: Available ones first (sorted by preference), then the hardcoded list as backup
    let candidates = [];
    
    if (availableModels.length > 0) {
        console.log(`📋 Found ${availableModels.length} active models for your account.`);
        // Sort available models by our preference
        candidates = availableModels.sort((a, b) => {
            const indexA = preferredOrder.indexOf(a);
            const indexB = preferredOrder.indexOf(b);
            // If both are in preference list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only a is in list, it comes first
            if (indexA !== -1) return -1;
            // If only b is in list, it comes first
            if (indexB !== -1) return 1;
            // Otherwise keep original order
            return 0;
        });
    } else {
        console.log("⚠️ specific model list unavailable, using defaults.");
        candidates = preferredOrder;
    }

    let lastError = null;

    for (const modelName of candidates) {
        try {
            console.log(`🤖 Attempting generation with: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            let parts = [{ text: prompt }];
            
            if (imageBase64) {
                // Handle image compatibility
                // gemini-pro (1.0) is text only.
                const isTextOnly = modelName.includes('gemini-pro') && !modelName.includes('vision') && !modelName.includes('1.5');
                
                if (isTextOnly) {
                    console.log(`⚠️ Model ${modelName} might be text-only. Skipping image to be safe.`);
                    parts[0].text += "\n\n(Note: Image analysis was skipped because the available AI model is text-only.)";
                } else {
                    parts.push({
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: imageBase64
                        }
                    });
                }
            }

            const result = await model.generateContent(parts);
            const response = await result.response;
            return response.text();
            
        } catch (error) {
            console.warn(`❌ Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }
    
    throw lastError || new Error("All available Gemini models failed.");
}

// Database Setup (SQLite)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// Vehicle Model
const Vehicle = sequelize.define('Vehicle', {
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    mileage: { type: DataTypes.INTEGER, allowNull: true }, // Made optional
    type: { type: DataTypes.STRING, defaultValue: 'Car' }, // Car, Bike, Truck, etc.
    fuelType: { type: DataTypes.STRING }, // Petrol, Diesel, Electric, Hybrid
    transmission: { type: DataTypes.STRING }, // Automatic, Manual
    fuelEfficiency: { type: DataTypes.FLOAT }, // km/l or MPG
    vin: { type: DataTypes.STRING },
    plateNumber: { type: DataTypes.STRING, allowNull: true },
    lastServiceDate: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT },
    // Maintenance Fields
    lastOilChange: { type: DataTypes.DATEONLY },
    lastBrakeCheck: { type: DataTypes.DATEONLY },
    lastTyreCheck: { type: DataTypes.DATEONLY },
    lastCoolantCheck: { type: DataTypes.DATEONLY }
});

// Service Log Model
const ServiceLog = sequelize.define('ServiceLog', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }, // e.g., "Oil Change", "Repair", "Inspection"
    description: { type: DataTypes.TEXT },
    cost: { type: DataTypes.FLOAT },
    mileage: { type: DataTypes.INTEGER },
    provider: { type: DataTypes.STRING } // e.g., "Jiffy Lube", "DIY"
});

// Fuel Log Model
const FuelLog = sequelize.define('FuelLog', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    odometer: { type: DataTypes.INTEGER, allowNull: false },
    fuelAmount: { type: DataTypes.FLOAT, allowNull: false }, // Liters or Gallons
    pricePerUnit: { type: DataTypes.FLOAT },
    totalCost: { type: DataTypes.FLOAT },
    fullTank: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Relationships
Vehicle.hasMany(ServiceLog);
ServiceLog.belongsTo(Vehicle);
Vehicle.hasMany(FuelLog);
FuelLog.belongsTo(Vehicle);

// Sync Database
sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables created!');
});

// --- API Endpoints ---

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        res.json({ vehicles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ vehicle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new vehicle
app.post('/api/vehicles', async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.json({ vehicle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        await Vehicle.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Service Log Endpoints ---

// Get logs for a vehicle
app.get('/api/vehicles/:id/logs', async (req, res) => {
    try {
        const logs = await ServiceLog.findAll({
            where: { VehicleId: req.params.id },
            order: [['date', 'DESC']]
        });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a service log
app.post('/api/service-logs', async (req, res) => {
    try {
        const log = await ServiceLog.create(req.body);
        res.json({ log });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Fuel Log Endpoints ---

// Get fuel logs for a vehicle
app.get('/api/vehicles/:id/fuel-logs', async (req, res) => {
    try {
        const logs = await FuelLog.findAll({
            where: { VehicleId: req.params.id },
            order: [['odometer', 'DESC']] // Order by odometer to calculate efficiency easily
        });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a fuel log
app.post('/api/fuel-logs', async (req, res) => {
    try {
        const log = await FuelLog.create(req.body);
        res.json({ log });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chat Endpoint (Enhanced for new features)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, vehicleContext, history } = req.body;

        // Construct the system prompt with new capabilities
        const systemPrompt = `You are an advanced AI Auto-Expert and Mechanic Assistant.
        
        Current Vehicle Context:
        Make: ${vehicleContext.make}
        Model: ${vehicleContext.model}
        Year: ${vehicleContext.year}
        Mileage: ${vehicleContext.mileage} km
        
        Your Capabilities:
        1. **Diagnosis**: Analyze symptoms and identify problems.
        2. **Repair Cost Estimator**: When a problem is identified, ALWAYS provide:
           - Estimated Repair Cost (Parts + Labor) in USD/INR (mention currency).
           - Time Required for repair.
           - Severity Scale (Low/Medium/High).
        3. **Parts Suggestion**: Recommend specific parts (e.g., "Bosch Oil Filter", "NGK Spark Plugs") if applicable.
        4. **Fuel Efficiency**: If the user asks about mileage/fuel, analyze driving habits (if provided) or give general tips for this specific car model.
        5. **Breakdown Emergency**: If the user is in an emergency (e.g., "car stopped", "smoke"), provide immediate safety steps, temporary fixes, and what to check first.
        
        Format your responses using Markdown. Use bolding for key metrics like Cost and Severity.
        
        User Query: ${message}`;

        // Convert history to Gemini format if needed, or just append to prompt
        // For simplicity in this version, we'll send the prompt directly. 
        // In a production app, we'd manage chat history tokens better.
        
        const reply = await generateContentWithFallback(systemPrompt);
        res.json({ reply });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// Diagnosis endpoint
app.post('/api/diagnosis', async (req, res) => {
    try {
        const { make, model, year, mileage, problem, symptoms, vehicleId, image } = req.body;

        // If vehicleId is provided, fetch details from DB if missing
        let vehicleDetails = { make, model, year, mileage };
        if (vehicleId && (!make || !model)) {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (vehicle) {
                vehicleDetails = {
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    mileage: vehicle.mileage
                };
            }
        }

        const prompt = `You are a Senior Automotive Engineer AI. Provide a highly detailed, professional diagnosis.
        
        Vehicle: ${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}
        Symptoms: ${symptoms || problem}
        ${image ? 'An image is provided. Analyze it for specific visual evidence of failure.' : ''}

        Return ONLY a valid JSON object with this exact structure. Ensure all strings are properly escaped, especially newlines and quotes. Do not use markdown formatting.
        {
            "issue": "Precise technical name of the fault",
            "severity": "Low" | "Medium" | "High" | "Critical",
            "estimatedCost": "Estimated cost range in Indian Rupees (₹) (e.g. ₹2,000 - ₹5,000)",
            "parts": ["Detailed list of parts", "Include part numbers if common"],
            "analysis": "In-depth technical explanation. Why did this happen? What are the symptoms indicating? What happens if ignored?",
            "fix": "Comprehensive step-by-step repair procedure. Include safety warnings and required tools."
        }`;

        try {
            const imageBase64 = image ? image.split(',')[1] : null;
            let diagnosisText = await generateContentWithFallback(prompt, imageBase64);
            
            // Process result...
            // Remove markdown code blocks if present
            diagnosisText = diagnosisText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Attempt to parse
            let diagnosisJson;
            try {
                diagnosisJson = JSON.parse(diagnosisText);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.log("Raw Text:", diagnosisText);
                // Fallback: Try to extract JSON object if surrounded by text
                const jsonMatch = diagnosisText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        diagnosisJson = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        throw parseError; // Throw original error if fallback fails
                    }
                } else {
                    throw parseError;
                }
            }
            return res.json(diagnosisJson);

        } catch (error) {
            console.error("Diagnosis generation failed:", error);
            throw error;
        }

    } catch (error) {
        console.error('Error generating diagnosis:', error);
        res.status(500).json({
            error: 'Failed to generate diagnosis',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Auto-Expert API is running' });
});

const server = app.listen(PORT, async () => {
    console.log(`🚗 Auto-Expert API server running on port ${PORT}`);
    console.log(`✅ API Key configured: ${process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
});

// --- WebSocket Server for Live AI ---
// Simplified setup: Attach directly to server with specific path
const wss = new WebSocket.Server({ server, path: '/live-ai' });

server.on('upgrade', (request, socket, head) => {
    console.log(`Upgrade request received for: ${request.url}`);
});

wss.on('connection', (ws) => {
    console.log('Client connected to Live AI Endpoint');

    // Connect to Gemini Live API
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${process.env.GOOGLE_API_KEY}`;
    console.log('Connecting to Gemini at:', geminiUrl.replace(process.env.GOOGLE_API_KEY, 'HIDDEN_KEY'));
    
    const geminiWs = new WebSocket(geminiUrl);

    geminiWs.on('open', () => {
        console.log('Connected to Gemini Live API');
        // Send initial setup
        const setupMessage = {
            setup: {
                model: "models/gemini-2.0-flash-exp",
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: {
                                voice_name: "Puck"
                            }
                        }
                    }
                }
            }
        };
        geminiWs.send(JSON.stringify(setupMessage));
    });

    geminiWs.on('message', (data) => {
        // Forward message from Gemini to Client
        ws.send(data);
    });

    geminiWs.on('error', (error) => {
        console.error('Gemini WebSocket Error:', error);
        ws.send(JSON.stringify({ error: "Gemini connection failed: " + error.message }));
    });

    geminiWs.on('close', (code, reason) => {
        console.log(`Gemini WebSocket closed: ${code} - ${reason}`);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ error: `Gemini connection closed: ${reason}` }));
            ws.close();
        }
    });

    // Handle messages from Client
    ws.on('message', (message) => {
        // Message is expected to be JSON string
        try {
            const parsed = JSON.parse(message);
            
            // If it's a client setup message (optional, we did it above), ignore or merge
            // If it's realtime_input, forward to Gemini
            if (parsed.realtime_input) {
                if (geminiWs.readyState === WebSocket.OPEN) {
                    geminiWs.send(message);
                }
            }
        } catch (e) {
            console.error('Error parsing client message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.close();
        }
    });
});
