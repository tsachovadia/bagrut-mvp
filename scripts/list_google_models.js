
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // There isn't a direct "listModels" on the main class in the Node SDK cleanly exposed 
        // in the same way as the REST API, but we can try to guess or just test a known valid one
        // Actually, checking documentation... there is no client.listModels() in the high level SDK 
        // easily usable without importing the ModelService.
        // Let's rely on standard model names documented: 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'
        // The previous error for 1.5-pro was "models/gemini-1.5-pro is not found... Call ListModels".

        // We'll try to fetch via REST as a fallback to see the list
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("Could not list models via REST:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
