import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

const ASSETS_DIR = path.join(rootDir, 'marketing/assets/reels');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

// Check if directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Directory not found: ${ASSETS_DIR}`);
    process.exit(1);
}

console.log(`📂 Scanning: ${ASSETS_DIR}`);
console.log(`🔑 API Key Present: ${!!OPENAI_API_KEY}`);

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

    if (!OPENAI_API_KEY) {
        console.warn(`   ⚠️ Skipping transcription: No API Key (OPENAI_API_KEY/OPENROUTER_API_KEY) found.`);
        return;
    }

    console.log(`   🎙️ Transcribing: ${path.basename(audioPath)}...`);

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(audioPath);
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    formData.append('file', blob, path.basename(audioPath));
    formData.append('model', 'whisper-1');

    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const analysis = {
            filename: path.basename(audioPath),
            text: data.text,
            duration: data.duration, // Whisper usually returns duration, if not we might need ffmpeg for it
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
        console.log(`   ✅ Saved analysis to: ${path.basename(jsonPath)}`);

    } catch (error) {
        console.error(`   ❌ Transcription failed:`, error.message);
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
