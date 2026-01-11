
import { loadEnv } from 'vite';
import { GradeExtractionService } from './api/services/grade-extraction';

// Increase payload limit for images
const PAYLOAD_LIMIT = '10mb';

export function extractGradesMiddleware() {
    // Load env vars from .env file
    const env = loadEnv('', process.cwd(), '');
    const GOOGLE_API_KEY = env.GOOGLE_API_KEY;

    // Initialize Service
    const extractionService = new GradeExtractionService(GOOGLE_API_KEY);

    return {
        name: 'vite-local-api',
        configureServer(server: any) {
            server.middlewares.use(async (req: any, res: any, next: any) => {

                // Helper to parse body
                const parseBody = async () => {
                    const chunks: any[] = [];
                    for await (const chunk of req) chunks.push(chunk);
                    return JSON.parse(Buffer.concat(chunks).toString());
                };

                // Helper to send response
                const sendJson = (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                };

                const sendError = (code: number, msg: string) => {
                    res.statusCode = code;
                    res.end(JSON.stringify({ error: msg }));
                };

                // --- ROUTER ---

                // 1. PHASE 1: OCR ONLY
                if (req.url === '/api/ocr/extract' && req.method === 'POST') {
                    try {
                        const body = await parseBody();
                        if (!body.fileBase64) return sendError(400, 'No fileBase64 provided');

                        console.log("[API] /api/ocr/extract calling Phase 1...");
                        const result = await extractionService.extractRawText(body.fileBase64);
                        return sendJson({ success: true, ...result });

                    } catch (e: any) {
                        return sendError(500, e.message);
                    }
                }

                // 2. PHASE 2: NORMALIZE ONLY
                if (req.url === '/api/ocr/normalize' && req.method === 'POST') {
                    try {
                        const body = await parseBody();
                        if (!body.rawText) return sendError(400, 'No rawText provided');

                        console.log("[API] /api/ocr/normalize calling Phase 2...");
                        const result = await extractionService.normalizeTextToJSON(body.rawText);
                        return sendJson({ success: true, ...result });

                    } catch (e: any) {
                        return sendError(500, e.message);
                    }
                }

                // 3. FULL FLOW (Legacy / Convenience)
                if (req.url === '/api/extract-grades' && req.method === 'POST') {
                    try {
                        const body = await parseBody();
                        if (!body.fileBase64) return sendError(400, 'No fileBase64 provided');

                        console.log("[API] /api/extract-grades calling Full Flow...");
                        const result = await extractionService.extractGrades(body.fileBase64);
                        return sendJson({ success: true, ...result });

                    } catch (e: any) {
                        return sendError(500, e.message);
                    }
                }

                next();
            });
        }
    };
}
