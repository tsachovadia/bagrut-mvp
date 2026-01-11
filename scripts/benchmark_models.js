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
const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
    console.error("Error: OPENROUTER_API_KEY not found in .env");
    process.exit(1);
}

const INPUT_PDF = path.join(__dirname, '../assets/bagrut_axaple_files/tsach_bagrut.pdf');
const TEMP_PNG = path.join(__dirname, '../assets/bagrut_axaple_files/temp_benchmark.png');
const OUTPUT_REPORT = path.join(__dirname, '../assets/bagrut_axaple_files/benchmark_raw_results_refined.txt');

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
    { id: "openai/gpt-4o", name: "GPT-4o (Full)" },
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo Vision" },
    { id: "meta-llama/llama-3.2-90b-vision-instruct", name: "Llama 3.2 90B Vision" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "meta-llama/llama-3.2-11b-vision-instruct", name: "Llama 3.2 11B Vision" }
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

async function callModel(model, base64Image) {
    console.log(`\nTesting Model: ${model.name} (${model.id})...`);
    const start = Date.now();

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model.id,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: SYSTEM_PROMPT },
                            { type: "image_url", image_url: { url: base64Image } }
                        ]
                    }
                ],
                temperature: 0.0 // Deterministic for benchmark
            })
        });

        const data = await response.json();
        const duration = (Date.now() - start) / 1000;

        if (!response.ok) {
            console.error(`Error ${response.status}:`, data);
            return { error: `HTTP ${response.status}`, duration };
        }

        if (data.error) {
            console.error(`API Error:`, data.error);
            return { error: data.error.message, duration };
        }

        const output = data.choices?.[0]?.message?.content || "No output";
        // Attempt to extract usage if available
        const costInfo = data.usage ? `Tokens: In=${data.usage.prompt_tokens}, Out=${data.usage.completion_tokens}` : "Usage info unavailable";

        console.log(`> Success (${duration.toFixed(2)}s)`);
        return { output, duration, costInfo };

    } catch (err) {
        console.error("Fetch error:", err.message);
        return { error: err.message, duration: (Date.now() - start) / 1000 };
    }
}

// --- MAIN ---
(async () => {
    console.log("Starting Model Benchmark... Saving raw results ONLY.");

    // 1. Prepare Image
    if (!convertPdfToPng(INPUT_PDF, TEMP_PNG)) {
        console.error("Aborting benchmark due to image conversion failure.");
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(TEMP_PNG);
    const base64Image = `data:image/png;base64,${fileBuffer.toString('base64')}`;

    let rawOutput = `BENCHMARK EXECUTION DATE: ${new Date().toISOString()}\n`;
    rawOutput += `INPUT FILE: ${path.basename(INPUT_PDF)}\n`;
    rawOutput += `================================================================================\n\n`;

    // 2. Loop Models
    for (const model of MODELS) {

        const result = await callModel(model, base64Image);

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

        // Small pause
        await new Promise(r => setTimeout(r, 1000));
    }

    // 3. Save Raw Report
    fs.writeFileSync(OUTPUT_REPORT, rawOutput);
    console.log(`\nBenchmark Complete! Raw dump saved to: ${OUTPUT_REPORT}`);
})();
