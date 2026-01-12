
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GradeExtractionService } from '../../services/grade-extraction';

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
        const { rawText } = req.body;
        if (!rawText) return res.status(400).json({ error: 'No rawText provided' });

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("Missing GOOGLE_API_KEY");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const extractionService = new GradeExtractionService(apiKey);

        console.log("[API] /api/ocr/normalize calling Phase 2...");
        const result = await extractionService.normalizeTextToJSON(rawText);

        return res.status(200).json({ success: true, ...result });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to normalize text' });
    }
}
