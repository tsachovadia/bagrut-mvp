
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error('No API Key found');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function listModels() {
    try {
        // The SDK might not expose listModels directly on genAI instance in all versions,
        // but let's try assuming standard usage or check documentation pattern.
        // Actually, sometimes it's under a specific manager.
        // Let's try a direct fetch if SDK doesn't make it obvious, but SDK usually has it.
        // Re-checking SDK docs (mental model): genAI.getGenerativeModel is the main entry.
        // There isn't always a listModels on the top level class in the JS SDK.
        // Let's try a raw fetch to the API endpoint for listing models.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
