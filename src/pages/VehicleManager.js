import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Wrench, 
  Fuel, 
  AlertTriangle, 
  ClipboardList, 
  CheckCircle, 
  Thermometer, 
  Droplet, 
  Disc, 
  Zap,
  Car,
  ShieldAlert,
  Battery,
  Gauge,
  Camera,
  X,
  Video,
  Phone,
  PhoneOff,
  ShoppingCart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../config/api';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  
  return (
    <div className="markdown-content" style={{ fontSize: '0.95rem' }}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} style={{ height: '0.5rem' }} />;

        const parseBold = (text) => {
          const parts = text.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} style={{ color: 'var(--text-main)' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        if (trimmed.startsWith('### ')) {
            return <h4 key={index} style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{parseBold(trimmed.slice(4))}</h4>;
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={index} style={{ display: 'flex', gap: '0.75rem', marginLeft: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.6rem' }} />
              <span style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>{parseBold(trimmed.slice(2))}</span>
            </div>
          );
        }

        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          return (
            <div key={index} style={{ display: 'flex', gap: '0.75rem', marginLeft: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', minWidth: '1.5rem' }}>{numberMatch[1]}.</span>
              <span style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>{parseBold(numberMatch[2])}</span>
            </div>
          );
        }

        return <p key={index} style={{ marginBottom: '0.75rem', lineHeight: '1.6', color: 'var(--text-gray)' }}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};

const VehicleManager = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Diagnosis State
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(true);
  const [expandedFix, setExpandedFix] = useState(false);

  // Live AI State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState('disconnected'); // disconnected, connecting, connected
  const videoRef = React.useRef(null);
  const wsRef = React.useRef(null);
  const audioContextRef = React.useRef(null);

  // Emergency State
  const [emergencyStep, setEmergencyStep] = useState(null);

  // Service Log State
  const [serviceLogs, setServiceLogs] = useState([]);
  const [newLog, setNewLog] = useState({ date: '', type: 'Oil Change', cost: '', mileage: '', provider: '', description: '' });
  const [showLogForm, setShowLogForm] = useState(false);

  // Fuel Log State
  const [fuelLogs, setFuelLogs] = useState([]);
  const [newFuelLog, setNewFuelLog] = useState({ date: '', odometer: '', fuelAmount: '', pricePerUnit: '', totalCost: '', fullTank: true });
  const [showFuelForm, setShowFuelForm] = useState(false);

  const fetchVehicleData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`);
      const data = await response.json();
      if (data.vehicle) {
        setVehicle(data.vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

  const fetchServiceLogs = useCallback(async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}/logs`);
        const data = await response.json();
        setServiceLogs(data.logs || []);
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
  }, [id]);

  const fetchFuelLogs = useCallback(async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}/fuel-logs`);
        const data = await response.json();
        setFuelLogs(data.logs || []);
    } catch (error) {
        console.error('Error fetching fuel logs:', error);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'history') {
        fetchServiceLogs();
    } else if (activeTab === 'fuel') {
        fetchFuelLogs();
    }
  }, [activeTab, fetchServiceLogs, fetchFuelLogs]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_BASE_URL}/api/service-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newLog, VehicleId: id })
        });
        if (response.ok) {
            fetchServiceLogs();
            setShowLogForm(false);
            setNewLog({ date: '', type: 'Oil Change', cost: '', mileage: '', provider: '', description: '' });
        }
    } catch (error) {
        console.error('Error saving log:', error);
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_BASE_URL}/api/fuel-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newFuelLog, VehicleId: id })
        });
        if (response.ok) {
            fetchFuelLogs();
            setShowFuelForm(false);
            setNewFuelLog({ date: '', odometer: '', fuelAmount: '', pricePerUnit: '', totalCost: '', fullTank: true });
        }
    } catch (error) {
        console.error('Error saving fuel log:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    setDiagnosisLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            vehicleId: id, 
            symptoms,
            make: vehicle?.make,
            model: vehicle?.model,
            year: vehicle?.year,
            image: selectedImage
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.error || 'Failed to generate diagnosis');
      }
      
      setDiagnosisResult(data);
    } catch (error) {
      console.error("Diagnosis failed:", error);
      // Mock response for demo if API fails
      setTimeout(() => {
        setDiagnosisResult({
            issue: "Potential Alternator Failure (Demo Mode)",
            severity: "High",
            estimatedCost: "$400 - $600",
            parts: ["Alternator", "Serpentine Belt"],
            fix: "The AI service is currently unavailable. This is a demo result. Please check your API key and server logs."
        });
      }, 1000);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'diagnostics', label: 'Diagnostics', icon: ClipboardList },
    { id: 'live', label: 'Live AI', icon: Video },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'history', label: 'Service History', icon: ClipboardList },
    { id: 'fuel', label: 'Fuel', icon: Fuel },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  ];

  const startLiveSession = async () => {
    try {
      setLiveStatus('connecting');
      console.log("Requesting camera/microphone access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Camera access granted");
      setStreamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize WebSocket with specific path
      const wsUrl = `${WS_BASE_URL}/live-ai`;
      console.log(`Attempting to connect to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Backend WebSocket');
        setLiveStatus('connected');
        setIsLiveActive(true);
        startMediaStreaming(stream, ws);
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setLiveStatus('error');
        alert("Failed to connect to Live AI Server. Ensure backend is running on port 5000.");
      };

      ws.onmessage = async (event) => {
        // Handle incoming audio from Gemini
        try {
            const data = JSON.parse(event.data);
            
            if (data.error) {
                console.error("Backend reported error:", data.error);
                alert(`Live AI Error: ${data.error}`);
                setLiveStatus('error');
                return;
            }

            if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const pcmBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
                playPcmAudio(pcmBase64);
            }
        } catch (e) {
            // Ignore parse errors or non-JSON messages
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setLiveStatus('disconnected');
        setIsLiveActive(false);
        setStreamActive(false);
        stopMediaStreaming();
      };

    } catch (error) {
      console.error('Error starting live session:', error);
      setLiveStatus('error');
      setStreamActive(false);
      alert(`Camera Error: ${error.message}. Please allow camera access.`);
    }
  };

  const stopLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopMediaStreaming();
    setIsLiveActive(false);
    setStreamActive(false);
    setLiveStatus('disconnected');
  };

  const startMediaStreaming = (stream, ws) => {
    // Audio Streaming
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      // Downsample/Convert to PCM 16-bit
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        let s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Convert to base64
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
      
      ws.send(JSON.stringify({
        realtime_input: {
          media_chunks: [{
            mime_type: "audio/pcm",
            data: base64Audio
          }]
        }
      }));
    };

    // Video Streaming (1 FPS)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const videoInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN || !videoRef.current) {
        clearInterval(videoInterval);
        return;
      }
      
      canvas.width = 320;
      canvas.height = 240;
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
      
      ws.send(JSON.stringify({
        realtime_input: {
          media_chunks: [{
            mime_type: "image/jpeg",
            data: base64Image
          }]
        }
      }));
    }, 1000);
  };

  const stopMediaStreaming = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const playPcmAudio = (base64Pcm) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 }); // Gemini output is usually 24kHz
    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
    }

    const buffer = audioContext.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const renderLiveAI = () => (
    <div className="live-ai-container" style={{ textAlign: 'center' }}>
      <div className="feature-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Video size={28} color="var(--primary)" />
                Live AI Mechanic
            </h2>
            <p style={{ color: 'var(--text-gray)' }}>
                Connect directly with Gemini AI. Show your vehicle's issue and talk to the AI in real-time.
            </p>
        </div>

        <div style={{ position: 'relative', background: '#000', borderRadius: '1rem', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '2rem' }}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: streamActive ? 1 : 0.3 }} 
            />
            
            {!streamActive && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
                    <Camera size={48} style={{ opacity: 0.5 }} />
                </div>
            )}

            {isLiveActive && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '2rem', color: 'white', fontSize: '0.85rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }}></div>
                    LIVE
                </div>
            )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {!isLiveActive ? (
                <button 
                    onClick={startLiveSession}
                    disabled={liveStatus === 'connecting'}
                    style={{ 
                        background: 'var(--success)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '1rem 2rem', 
                        borderRadius: '2rem', 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                >
                    <Phone size={24} />
                    {liveStatus === 'connecting' ? 'Connecting...' : 'Start Video Call'}
                </button>
            ) : (
                <button 
                    onClick={stopLiveSession}
                    style={{ 
                        background: 'var(--danger)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '1rem 2rem', 
                        borderRadius: '2rem', 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                >
                    <PhoneOff size={24} />
                    End Call
                </button>
            )}
        </div>
      </div>
    </div>
  );

  const calculateHealthScore = (v) => {
    if (!v) return 0;
    let score = 100;
    const age = new Date().getFullYear() - v.year;
    score -= age * 2; // Deduct 2 points per year
    score -= Math.floor(v.mileage / 10000); // Deduct 1 point per 10k miles
    return Math.max(0, Math.min(100, score));
  };

  const renderOverview = () => {
    const healthScore = calculateHealthScore(vehicle);
    
    return (
    <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <div className="feature-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Vehicle Health</h3>
          <Activity color="var(--primary)" />
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: healthScore > 80 ? '#10b981' : '#f59e0b' }}>
          {healthScore}%
        </div>
        <p style={{ color: 'var(--text-gray)' }}>Based on age and mileage analysis</p>
      </div>

      <div className="feature-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Stats</h3>
          <Car color="var(--secondary)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>Mileage</span>
            <span style={{ fontWeight: '600' }}>{vehicle?.mileage ? vehicle.mileage.toLocaleString() : 'N/A'} mi</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>Type</span>
            <span style={{ fontWeight: '600' }}>{vehicle?.type || 'Car'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>Fuel</span>
            <span style={{ fontWeight: '600' }}>{vehicle?.fuelType || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>Transmission</span>
            <span style={{ fontWeight: '600' }}>{vehicle?.transmission || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>VIN</span>
            <span style={{ fontFamily: 'monospace' }}>{vehicle?.vin || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>License Plate</span>
            <span style={{ fontFamily: 'monospace' }}>{vehicle?.plateNumber || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)' }}>Last Service</span>
            <span>{vehicle?.lastServiceDate || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderDiagnostics = () => (
    <div className="diagnostics-container">
      {!diagnosisResult ? (
        <form onSubmit={handleDiagnosisSubmit} className="feature-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0 }}>New Diagnosis</h3>
          <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>Describe the symptoms or upload a photo of the issue.</p>
          
          <div className="form-group">
            <textarea 
              className="form-textarea"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Squeaking noise when braking, engine stalling at red lights..."
              style={{ width: '100%', minHeight: '150px', padding: '1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            {!selectedImage ? (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                padding: '1rem', 
                border: '2px dashed var(--border)', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}>
                <Camera size={20} />
                <span>Upload Photo (Optional)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={selectedImage} 
                  alt="Upload preview" 
                  style={{ maxHeight: '200px', borderRadius: '0.5rem', border: '1px solid var(--border)' }} 
                />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '-10px', 
                    background: 'var(--danger)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={diagnosisLoading || (!symptoms && !selectedImage)}
            style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {diagnosisLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={20} />
                Run AI Diagnosis
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="diagnosis-result">
          <button 
            onClick={() => { setDiagnosisResult(null); setSymptoms(''); setSelectedImage(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
          >
            ← New Diagnosis
          </button>
          
          <div className="feature-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>{diagnosisResult.issue}</h2>
                <span style={{ 
                  background: diagnosisResult.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                  color: diagnosisResult.severity === 'High' ? '#ef4444' : '#f59e0b',
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '600' 
                }}>
                  {diagnosisResult.severity} Severity
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Estimated Cost</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{diagnosisResult.estimatedCost}</div>
              </div>
            </div>

            {/* Parts Section - Compact */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}><Wrench size={18} /> Required Parts</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {diagnosisResult.parts.map((part, i) => (
                    <div key={i} style={{ 
                        background: 'var(--bg-body)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '2rem', 
                        border: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {part}
                        <a 
                            href={`https://www.amazon.in/s?k=${encodeURIComponent(part + " " + vehicle?.make + " " + vehicle?.model)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                            Buy
                        </a>
                    </div>
                  ))}
                </div>
            </div>

            {/* Analysis Section - Collapsible */}
            {diagnosisResult.analysis && (
                <div style={{ marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <button 
                        onClick={() => setExpandedAnalysis(!expandedAnalysis)}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1rem', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            fontWeight: '600'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} color="#3b82f6" /> Technical Analysis
                        </span>
                        {expandedAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <AnimatePresence>
                        {expandedAnalysis && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                                    <MarkdownRenderer content={diagnosisResult.analysis} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Fix Section - Collapsible */}
            {diagnosisResult.fix && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <button 
                        onClick={() => setExpandedFix(!expandedFix)}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1rem', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            fontWeight: '600'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} color="#10b981" /> Step-by-Step Repair Guide
                        </span>
                        {expandedFix ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <AnimatePresence>
                        {expandedFix && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                                    <MarkdownRenderer content={diagnosisResult.fix} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderMaintenance = () => {
    const getStatus = (mileage, interval) => {
        if (!mileage) return 'Unknown';
        const remainder = mileage % interval;
        if (remainder > (interval * 0.9)) return 'Due Soon';
        if (remainder < (interval * 0.1)) return 'Good'; // Just serviced
        return 'Good';
    };

    const mileage = vehicle?.mileage || 0;

    const items = [
      { name: 'Engine Oil', status: getStatus(mileage, 5000), icon: Droplet, interval: 'Every 5k miles' },
      { name: 'Brake Pads', status: getStatus(mileage, 30000), icon: Disc, interval: 'Every 30k miles' },
      { name: 'Tire Rotation', status: getStatus(mileage, 6000), icon: Gauge, interval: 'Every 6k miles' },
      { name: 'Coolant Flush', status: getStatus(mileage, 50000), icon: Thermometer, interval: 'Every 50k miles' },
      { name: 'Battery Check', status: 'Good', icon: Battery, interval: 'Every 3 years' },
    ];

    const getStatusColor = (status) => {
      switch(status) {
        case 'Good': return '#10b981';
        case 'Due Soon': return '#f59e0b';
        case 'Overdue': return '#ef4444';
        default: return 'var(--text-gray)';
      }
    };

    return (
      <div className="maintenance-wrapper">
        <div className="maintenance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {items.map((item, index) => (
            <div key={index} className="feature-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '0.5rem' }}>
                <item.icon size={24} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{item.name}</span>
                    <span style={{ color: getStatusColor(item.status), fontSize: '0.85rem', fontWeight: '600' }}>{item.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{item.interval}</div>
                </div>
            </div>
            ))}
        </div>

        {/* Recommended Products Section */}
        <div className="recommendations-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <ShoppingCart size={24} color="#f59e0b" /> 
                Recommended for your {vehicle?.make} {vehicle?.model}
            </h3>
            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                {/* Product 1: Maintenance */}
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent(vehicle?.make + " " + vehicle?.model + " maintenance kit")}`} target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧰</div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Maintenance Kit</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Filters, fluids & basics.</p>
                    <span style={{ background: '#f90', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Find on Amazon</span>
                </a>

                {/* Product 2: Cleaning */}
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent("car cleaning kit")}`} target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Detailing Set</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Keep it looking new.</p>
                    <span style={{ background: '#f90', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Find on Amazon</span>
                </a>

                {/* Product 3: Tech */}
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent("car accessories " + vehicle?.year)}`} target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔌</div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Tech Upgrades</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Chargers, mounts & more.</p>
                    <span style={{ background: '#f90', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Find on Amazon</span>
                </a>

                {/* Product 4: Safety */}
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent("vehicle emergency kit")}`} target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⛑️</div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Safety Gear</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>First aid & tools.</p>
                    <span style={{ background: '#f90', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Find on Amazon</span>
                </a>

            </div>
        </div>
      </div>
    );
  };

  const renderServiceHistory = () => (
    <div className="service-history-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Service Log</h2>
            <button 
                onClick={() => setShowLogForm(!showLogForm)}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
            >
                {showLogForm ? 'Cancel' : '+ Add Entry'}
            </button>
        </div>

        <AnimatePresence>
            {showLogForm && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleLogSubmit}
                    className="feature-card"
                    style={{ marginBottom: '2rem', overflow: 'hidden' }}
                >
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" required className="form-input" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="form-input" value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value})}>
                                <option>Oil Change</option>
                                <option>Tire Rotation</option>
                                <option>Brake Service</option>
                                <option>Inspection</option>
                                <option>Repair</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cost ($)</label>
                            <input type="number" className="form-input" placeholder="0.00" value={newLog.cost} onChange={e => setNewLog({...newLog, cost: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Mileage</label>
                            <input type="number" className="form-input" placeholder={vehicle?.mileage} value={newLog.mileage} onChange={e => setNewLog({...newLog, mileage: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Provider</label>
                        <input className="form-input" placeholder="e.g. Jiffy Lube or DIY" value={newLog.provider} onChange={e => setNewLog({...newLog, provider: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea className="form-textarea" placeholder="Details about the service..." value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})} />
                    </div>
                    <button type="submit" className="submit-button">Save Entry</button>
                </motion.form>
            )}
        </AnimatePresence>

        <div className="logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {serviceLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                    <p>No service history recorded yet.</p>
                </div>
            ) : (
                serviceLogs.map((log) => (
                    <div key={log.id} className="feature-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{log.type}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', background: 'var(--bg-dark)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{log.date}</span>
                            </div>
                            <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                {log.provider} • {log.mileage ? `${log.mileage.toLocaleString()} mi` : 'No mileage'}
                            </div>
                            {log.description && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{log.description}</div>}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)' }}>
                            ${log.cost || '0'}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  const renderFuel = () => {
    // Calculate efficiency for each log
    const logsWithEfficiency = fuelLogs.map((log, index) => {
        let efficiency = null;
        if (index < fuelLogs.length - 1) {
            const prevLog = fuelLogs[index + 1];
            const distance = log.odometer - prevLog.odometer;
            if (distance > 0 && log.fuelAmount > 0) {
                efficiency = distance / log.fuelAmount;
            }
        }
        return { ...log, efficiency };
    });

    // Calculate average efficiency
    const validEfficiencies = logsWithEfficiency.filter(l => l.efficiency !== null).map(l => l.efficiency);
    const avgEfficiency = validEfficiencies.length > 0 
        ? (validEfficiencies.reduce((a, b) => a + b, 0) / validEfficiencies.length).toFixed(1) 
        : 'N/A';

    return (
    <div className="fuel-container">
      <div className="feature-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Fuel size={32} color="#10b981" />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{avgEfficiency} {vehicle?.fuelType === 'Electric' ? 'km/kWh' : 'km/l'}</h2>
            <p style={{ margin: 0, color: 'var(--text-gray)' }}>Average Real-world Efficiency</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
                onClick={() => setShowFuelForm(!showFuelForm)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: '600' }}
            >
                {showFuelForm ? 'Cancel' : 'Log Fill-up'}
            </button>
        </div>
      </div>

      <AnimatePresence>
        {showFuelForm && (
            <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleFuelSubmit}
                className="feature-card"
                style={{ marginBottom: '2rem', overflow: 'hidden' }}
            >
                <div className="form-row">
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" required className="form-input" value={newFuelLog.date} onChange={e => setNewFuelLog({...newFuelLog, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Odometer Reading</label>
                        <input type="number" required className="form-input" placeholder="Current mileage" value={newFuelLog.odometer} onChange={e => setNewFuelLog({...newFuelLog, odometer: e.target.value})} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Fuel Amount ({vehicle?.fuelType === 'Electric' ? 'kWh' : 'Liters/Gallons'})</label>
                        <input type="number" step="0.01" required className="form-input" placeholder="Amount filled" value={newFuelLog.fuelAmount} onChange={e => setNewFuelLog({...newFuelLog, fuelAmount: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Total Cost</label>
                        <input type="number" step="0.01" className="form-input" placeholder="Total price paid" value={newFuelLog.totalCost} onChange={e => setNewFuelLog({...newFuelLog, totalCost: e.target.value})} />
                    </div>
                </div>
                <button type="submit" className="submit-button">Save Fuel Log</button>
            </motion.form>
        )}
      </AnimatePresence>

      <div className="logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {logsWithEfficiency.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No fuel logs recorded yet.</p>
            </div>
        ) : (
            logsWithEfficiency.map((log) => (
                <div key={log.id} className="feature-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{log.date}</span>
                            {log.efficiency && (
                                <span style={{ fontSize: '0.85rem', color: 'white', background: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                                    {log.efficiency.toFixed(1)} {vehicle?.fuelType === 'Electric' ? 'km/kWh' : 'km/l'}
                                </span>
                            )}
                        </div>
                        <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                            {log.odometer.toLocaleString()} mi • {log.fuelAmount} {vehicle?.fuelType === 'Electric' ? 'kWh' : 'L'}
                        </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                        ${log.totalCost || '0'}
                    </div>
                </div>
            ))
        )}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Efficiency Tips</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[
          "Maintain steady speed on highways to improve mileage by up to 15%.",
          "Remove excess weight from the trunk to reduce engine load.",
          "Check tire pressure monthly; under-inflated tires increase resistance.",
          "Use cruise control on flat roads to maintain constant velocity."
        ].map((tip, i) => (
          <div key={i} className="feature-card" style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{i+1}</div>
            <p style={{ margin: 0, color: 'var(--text-main)' }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
  };

  const renderEmergency = () => {
    const emergencies = [
      { id: 'flat', label: 'Flat Tire', icon: Disc, steps: ["Pull over safely", "Turn on hazards", "Locate spare & jack", "Loosen lugs before lifting", "Lift car, swap tire", "Tighten lugs in star pattern"] },
      { id: 'heat', label: 'Overheating', icon: Thermometer, steps: ["Stop immediately", "Turn off engine", "Open hood (wait for steam to clear)", "Do NOT open radiator cap while hot", "Check coolant level once cool"] },
      { id: 'battery', label: 'Dead Battery', icon: Battery, steps: ["Locate jumper cables", "Connect Red to Dead (+)", "Connect Red to Good (+)", "Connect Black to Good (-)", "Connect Black to metal on Dead car", "Start Good car, then Dead car"] },
      { id: 'accident', label: 'Accident', icon: ShieldAlert, steps: ["Check for injuries", "Call 911 if needed", "Move to safety if possible", "Exchange info", "Take photos", "File report"] },
    ];

    return (
      <div className="emergency-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {emergencies.map((item) => (
            <button
              key={item.id}
              onClick={() => setEmergencyStep(item)}
              style={{ 
                background: emergencyStep?.id === item.id ? 'var(--danger)' : 'var(--bg-card)', 
                border: emergencyStep?.id === item.id ? 'none' : '1px solid var(--border)', 
                padding: '1.5rem', 
                borderRadius: '1rem', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                color: emergencyStep?.id === item.id ? 'white' : 'var(--text-main)',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <item.icon size={32} color={emergencyStep?.id === item.id ? 'white' : 'var(--danger)'} />
              <span style={{ fontWeight: '600' }}>{item.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {emergencyStep && (
            <motion.div
              key={emergencyStep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="feature-card"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '1rem', padding: '2rem' }}
            >
              <h3 style={{ marginTop: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={24} />
                Immediate Actions: {emergencyStep.label}
              </h3>
              <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {emergencyStep.steps.map((step, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{step}</li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="vehicle-manager" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="vm-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {vehicle?.year} {vehicle?.make} {vehicle?.model}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-gray)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Car size={16} /> {vehicle?.vin}</span>
        </div>
      </div>

      <div className="tabs-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1.5rem',
                color: isActive ? 'var(--primary)' : 'var(--text-gray)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: isActive ? '600' : '500',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    bottom: '-0.5rem',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--primary)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'diagnostics' && renderDiagnostics()}
            {activeTab === 'live' && renderLiveAI()}
            {activeTab === 'maintenance' && renderMaintenance()}
            {activeTab === 'history' && renderServiceHistory()}
            {activeTab === 'fuel' && renderFuel()}
            {activeTab === 'emergency' && renderEmergency()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VehicleManager;
