// Script to list available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
    console.log('📋 Fetching available Gemini models...\n');

    try {
        const models = await genAI.listModels();

        console.log('✅ Available models:');
        console.log('='.repeat(80));

        for (const model of models) {
            console.log(`\n🔹 Model: ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }

        console.log('\n' + '='.repeat(80));

    } catch (error) {
        console.error('❌ Error listing models:', error.message);
    }
}

listModels();
