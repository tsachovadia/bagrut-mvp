
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY not found in .env");
    console.error("Please get your key from: https://aistudio.google.com/app/apikey");
    process.exit(1);
}

const INPUT_PDF = path.join(__dirname, '../assets/bagrut_axaple_files/tsach_bagrut.pdf');
const TEMP_PNG = path.join(__dirname, '../assets/bagrut_axaple_files/temp_benchmark_google.png');
const OUTPUT_REPORT = path.join(__dirname, '../assets/bagrut_axaple_files/benchmark_google_raw_results.txt');

const SYSTEM_PROMPT = `You are an expert document analyzer specializing in Israeli Bagrut transcripts.
Your goal is 100% accuracy. Follow this step-by-step logic:

1. HEADER EXTRACTION:
   - Identify the student's full name next to the label 'הבוגר/ת'. 
   - Identify the school name next to 'בי"ס'.
   - Identify the ID number (9 digits) next to 'מס' זהות'.

2. TABLE EXTRACTION (ROW-BY-ROW):
   - Analyze each row as a single unit.
   - For each row, extract: [Exam Code], [Subject Name], [Units], [Grade in words], [Sub-grade (תת)], [Final Grade (סופי)], [Exam Date].
   
3. SELF-CORRECTION & VALIDATION:
   - HEBREW CONTEXT: If you see 'טות' or 'טות מאוד', correct it to 'טוב' or 'טוב מאוד'. 
   - RTL/LTR FIX: Ensure numeric grades are assigned to the correct columns (Sub-grade vs. Final Grade). The 'סופי' (Final) column is usually the leftmost grade in the table.
   - SUBJECT CODES: Cross-reference the Exam Code with the Subject Name (e.g., Code 035500 is ALWAYS Mathematics).

4. FORMAT:
   Return a clean Markdown table. If a value is missing, leave it empty.`;

const MODELS = [
    { id: "gemini-2.0-flash-001", name: "Gemini 2.0 Flash (001)" },
    { id: "gemini-flash-latest", name: "Gemini 1.5 Flash (Latest)" },
    { id: "gemini-pro-latest", name: "Gemini 1.5 Pro (Latest)" }
];

// --- UTILITIES ---

function convertPdfToPng(pdfPath, pngPath) {
    if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);
    console.log(`Converting PDF to PNG (300 DPI)...`);
    try {
        execSync(`sips -s format png -s dpiHeight 300 -s dpiWidth 300 "${pdfPath}" --out "${pngPath}"`);
        console.log("Conversion successful.");
        return true;
    } catch (e) {
        console.error("PDF conversion failed:", e.message);
        return false;
    }
}

async function callGoogleModel(modelConfig, imagePath, retryCount = 0) {
    console.log(`\nTesting Model: ${modelConfig.name} (${modelConfig.id})...`);
    const start = Date.now();

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: modelConfig.id,
            generationConfig: {
                temperature: 0.0,
            }
        });

        const imageBuffer = fs.readFileSync(imagePath);
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/png",
            },
        };

        const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
        const response = await result.response;
        const text = response.text();
        const duration = (Date.now() - start) / 1000;

        console.log(`> Success (${duration.toFixed(2)}s)`);

        let usageInfo = "Usage info unavailable";
        if (response.usageMetadata) {
            usageInfo = `Tokens: In=${response.usageMetadata.promptTokenCount}, Out=${response.usageMetadata.candidatesTokenCount}`;
        }

        return { output: text, duration, costInfo: usageInfo };

    } catch (err) {
        // Handle 429 Rate Limit
        if (err.message.includes("429") && retryCount < 1) {
            console.log("Rate limit hit. Waiting 30 seconds before retrying...");
            await new Promise(r => setTimeout(r, 30000));
            return callGoogleModel(modelConfig, imagePath, retryCount + 1);
        }

        console.error("Google AI Error:", err.message);
        return { error: err.message, duration: (Date.now() - start) / 1000 };
    }
}

// --- MAIN ---
(async () => {
    console.log("Starting Google AI SDK Benchmark...");

    // 1. Prepare Image
    if (!convertPdfToPng(INPUT_PDF, TEMP_PNG)) {
        process.exit(1);
    }

    let rawOutput = `BENCHMARK EXECUTION DATE: ${new Date().toISOString()}\n`;
    rawOutput += `INPUT FILE: ${path.basename(INPUT_PDF)}\n`;
    rawOutput += `SDK: @google/generative-ai\n`;
    rawOutput += `================================================================================\n\n`;

    // 2. Loop Models
    for (const model of MODELS) {
        const result = await callGoogleModel(model, TEMP_PNG);

        rawOutput += `--------------------------------------------------\n`;
        rawOutput += `MODEL: ${model.name} (${model.id})\n`;
        rawOutput += `TIME: ${result.duration.toFixed(2)}s\n`;
        rawOutput += `PROMPT:\n${SYSTEM_PROMPT}\n\n`;
        rawOutput += `RESPONSE:\n`;

        if (result.error) {
            rawOutput += `[ERROR] ${result.error}\n`;
        } else {
            rawOutput += `${result.output}\n`;
        }
        rawOutput += `--------------------------------------------------\n\n`;

        // Extended pause for Free Tier
        console.log("Waiting 15s to respect rate limits...");
        await new Promise(r => setTimeout(r, 15000));
    }

    // 3. Save Raw Report
    fs.writeFileSync(OUTPUT_REPORT, rawOutput);
    console.log(`\nBenchmark Complete! Raw dump saved to: ${OUTPUT_REPORT}`);
})();
