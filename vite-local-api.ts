
import { loadEnv } from 'vite';
import { GradeExtractionService } from './api/services/grade-extraction';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately for server-side code
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Increase payload limit for images


export function extractGradesMiddleware() {
    // Load env vars from .env file
    const env = loadEnv('', process.cwd(), '');
    const GOOGLE_API_KEY = env.GEMINI_API_KEY;

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
                        console.error("[Local API] /api/ocr/extract Failed:", e);
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            error: e.message,
                            details: e,
                            stack: e.stack
                        }));
                        return;
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
                        console.error("[Local API] /api/ocr/normalize Failed:", e);
                        res.statusCode = 500;
                        res.end(JSON.stringify({
                            error: e.message,
                            details: e,
                            stack: e.stack
                        }));
                        return;
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

                // 4. TELEGRAM WEBHOOK (Local Simulation)
                if (req.url === '/api/telegram-webhook' && req.method === 'POST') {
                    try {
                        console.log("[API] /api/telegram-webhook received POST");
                        const body = await parseBody();

                        // Mock Vercel Request
                        const vercelReq: any = {
                            method: 'POST',
                            body: body,
                            headers: req.headers,
                            query: {},
                            cookies: {}
                        };

                        // Mock Vercel Response
                        const vercelRes: any = {
                            status: (code: number) => {
                                res.statusCode = code;
                                return vercelRes;
                            },
                            json: (data: any) => {
                                sendJson(data);
                                return vercelRes;
                            },
                            send: (data: any) => {
                                res.end(data);
                                return vercelRes;
                            },
                            setHeader: (name: string, value: string) => {
                                res.setHeader(name, value);
                                return vercelRes;
                            }
                        };

                        // Dynamic import to handle env loading order
                        const { default: telegramHandler } = await import('./api/telegram-webhook');
                        await telegramHandler(vercelReq, vercelRes);
                        return;

                    } catch (e: any) {
                        console.error("[Local API] Telegram Webhook Failed:", e);
                        return sendError(500, e.message);
                    }
                }

                next();
            });
        }
    };
}
