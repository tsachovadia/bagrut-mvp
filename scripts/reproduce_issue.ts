
import { GradeExtractionService } from '../api/services/grade-extraction';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables for API Key
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found in .env (GOOGLE_API_KEY or OPENROUTER_API_KEY)");
    process.exit(1);
}

// Path to sample file
const sampleFilePath = path.join(process.cwd(), 'assets/bagrut_axaple_files/tsach_bagrut.pdf');

async function run() {
    try {
        console.log(`📄 Reading file: ${sampleFilePath}`);
        const fileBuffer = fs.readFileSync(sampleFilePath);
        const fileBase64 = fileBuffer.toString('base64');
        const mimeType = 'application/pdf'; // Assuming PDF based on extension

        // Create Service
        const service = new GradeExtractionService(apiKey!);

        console.log("🚀 Starting Extraction (Phase 1 & 2)...");

        // 1. Extract Raw Text
        const textResult = await service.extractRawText(`data:${mimeType};base64,${fileBase64}`);
        console.log("\n--- [Phase 1] Raw Text Preview (First 500 chars) ---");
        console.log(textResult.rawText?.slice(0, 500) + "...\n");

        // 2. Normalize
        if (textResult.rawText) {
            const jsonResult = await service.normalizeTextToJSON(textResult.rawText);
            console.log("\n--- [Phase 2] Normalized JSON Output ---");
            console.log(JSON.stringify(jsonResult.grades, null, 2));
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

run();
