
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GradeExtractionService } from './grade-extraction.js';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb',
        },
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("[API] /api/ocr/extract request received");

        // Debug headers and body type
        console.log("[API] Request content-length:", req.headers['content-length']);

        const { fileBase64 } = req.body;
        console.log("[API] Body parsed. fileBase64 exists?", !!fileBase64);
        console.log("[API] fileBase64 length:", fileBase64 ? fileBase64.length : 'N/A');

        if (!fileBase64) {
            console.error("[API] Error: Missing fileBase64 in body");
            return res.status(400).json({ error: 'No fileBase64 provided' });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        console.log("[API] Checking GOOGLE_API_KEY presence:", !!apiKey);

        if (!apiKey) {
            console.error("[API] Error: Missing GOOGLE_API_KEY env var");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log("[API] Initializing GradeExtractionService...");
        const extractionService = new GradeExtractionService(apiKey);

        console.log("[API] Calling extractionService.extractRawText...");
        const result = await extractionService.extractRawText(fileBase64);
        console.log("[API] extractRawText completed successfully");

        return res.status(200).json({ success: true, ...result });

    } catch (error: any) {
        console.error('[API] Critical Error in /api/ocr/extract handler:', error);
        console.error('[API] Error Stack:', error.stack);
        return res.status(500).json({
            error: error.message || 'Failed to extract text',
            details: error, // Return full error object
            stack: error.stack // Return stack trace
        });
    }
}
