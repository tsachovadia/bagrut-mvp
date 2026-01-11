
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = 'http://localhost:5173/api/extract-grades';
const INPUT_FILE = path.join(__dirname, '../assets/bagrut_axaple_files/tsach_bagrut.pdf');
const TEMP_PNG = path.join(__dirname, '../assets/bagrut_axaple_files/temp_tsach.png');
const OUTPUT_FILE = path.join(__dirname, '../assets/bagrut_axaple_files/tsach_bagrut_raw.txt');

async function saveRawOcr() {
    try {
        console.log(`Processing input file: ${INPUT_FILE}`);
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`Input file not found: ${INPUT_FILE}`);
        }

        let fileToUpload = INPUT_FILE;
        let mimeType = 'application/pdf';
        let cleanup = false;

        // Convert PDF to PNG using macOS sips (for compatibility with GPT-4o / Azure)
        if (INPUT_FILE.toLowerCase().endsWith('.pdf')) {
            console.log('Converting PDF to PNG for robust model support (High Res)...');
            try {
                // Set DPI to 300 for better OCR
                execSync(`sips -s format png -s dpiHeight 300 -s dpiWidth 300 "${INPUT_FILE}" --out "${TEMP_PNG}"`);
                fileToUpload = TEMP_PNG;
                mimeType = 'image/png';
                cleanup = true;
                console.log('Conversion successful.');
            } catch (e) {
                console.warn('PDF conversion failed, trying original file:', e.message);
                // Fallback to original PDF
            }
        }

        const fileBuffer = fs.readFileSync(fileToUpload);
        const base64File = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        console.log('Sending request to local API (RAW TEXT MODE)...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileBase64: base64File,
                fileType: mimeType,
                rawTextOnly: true
            })
        });

        if (cleanup && fs.existsSync(TEMP_PNG)) {
            fs.unlinkSync(TEMP_PNG);
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();

        if (data.success && data.rawText) {
            console.log(`Success! Saving output to: ${OUTPUT_FILE}`);

            const timestamp = new Date().toISOString();
            const usedModel = data.usedModel || "Unknown Model";
            const promptUsed = data.promptUsed || "Unknown Prompt";

            const fileContent = `---
Model: ${usedModel}
Date: ${timestamp}
Prompt:
${promptUsed}
---

${data.rawText}`;

            fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
            console.log('---------------------------------------------------');
            console.log('RAW TEXT SAVED with Metadata Header');
            console.log('---------------------------------------------------');
        } else {
            console.error('API succeeded but returned no rawText:', data);
        }

    } catch (error) {
        console.error('Fatal Error:', error.message);
        process.exit(1);
    }
}

saveRawOcr();
