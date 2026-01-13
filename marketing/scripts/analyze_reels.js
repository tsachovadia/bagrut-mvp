import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

const ASSETS_DIR = path.join(rootDir, 'marketing/assets/reels');
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

// Check if directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Directory not found: ${ASSETS_DIR}`);
    process.exit(1);
}

console.log(`📂 Scanning: ${ASSETS_DIR}`);
console.log(`🔑 API Key Present: ${!!GOOGLE_API_KEY}`);

async function extractAudio(videoPath) {
    const audioPath = videoPath.replace(/\.(mp4|mov|avi)$/i, '.mp3');

    if (fs.existsSync(audioPath)) {
        console.log(`   ⏭️ Audio already extracted: ${path.basename(audioPath)}`);
        return audioPath;
    }

    console.log(`   🔊 Extracting audio from: ${path.basename(videoPath)}`);
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 4 -y "${audioPath}"`, (error) => {
            if (error) reject(error);
            else resolve(audioPath);
        });
    });
}

async function transcribeAudio(audioPath) {
    const jsonPath = audioPath.replace('.mp3', '_analysis.json');
    if (fs.existsSync(jsonPath)) {
        console.log(`   ⏭️ Transcription already exists: ${path.basename(jsonPath)}`);
        return;
    }

    if (!GOOGLE_API_KEY) {
        console.warn(`   ⚠️ Skipping transcription: No API Key (GEMINI_API_KEY) found.`);
        return;
    }

    console.log(`   🎙️ Transcribing with Gemini: ${path.basename(audioPath)}...`);

    try {
        const fileManager = new GoogleAIFileManager(GOOGLE_API_KEY);
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

        // Upload file
        const uploadResult = await fileManager.uploadFile(audioPath, {
            mimeType: "audio/mp3",
            displayName: path.basename(audioPath),
        });

        console.log(`      Upload successful: ${uploadResult.file.uri}`);

        // Wait for processing? Usually audio is fast, but let's just generate.
        // Prompt for transcription
        const result = await model.generateContent([
            "Transcribe this audio file verbatim. Output only the text.",
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        const text = result.response.text();

        const analysis = {
            filename: path.basename(audioPath),
            text: text,
            provider: 'gemini-1.5-flash',
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
        console.log(`   ✅ Saved analysis to: ${path.basename(jsonPath)}`);

    } catch (error) {
        console.error(`   ❌ Transcription failed:`, error);
    }
}

async function main() {
    const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(mp4|mov|avi)$/i.test(f));

    if (files.length === 0) {
        console.log('⚠️ No video files found in marketing/assets/reels');
        return;
    }

    for (const file of files) {
        const videoPath = path.join(ASSETS_DIR, file);
        try {
            const audioPath = await extractAudio(videoPath);
            await transcribeAudio(audioPath);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
    console.log('✨ Done processing reels.');
}

main();
