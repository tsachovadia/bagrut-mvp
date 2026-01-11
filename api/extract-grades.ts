import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GradeExtractionService } from './services/grade-extraction';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Vercel limit
        },
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
        const { fileBase64, fileType } = req.body;

        if (!fileBase64) {
            return res.status(400).json({ error: 'No file content provided' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("Missing OPENROUTER_API_KEY");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const extractionService = new GradeExtractionService(apiKey);
        const result = await extractionService.extractGrades(fileBase64);

        return res.status(200).json({
            success: true,
            grades: result.grades,
            usedModel: result.usedModel
        });

    } catch (error: any) {
        console.error('API Error:', error);

        // Handle specific errors
        if (error.message.includes('Rate limit')) {
            return res.status(429).json({ error: 'System is busy. Please try again in a minute.' });
        }

        return res.status(500).json({
            error: error.message || 'Failed to process file'
        });
    }
}
