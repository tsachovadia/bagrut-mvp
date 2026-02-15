
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

                // 5. ADMIN API PROXY (Local Simulation)
                const adminRoutes = [
                    '/api/telegram-rooms',
                    '/api/admin/partners',
                    '/api/admin/partner-billing',
                    '/api/metrics/overview',
                    '/api/metrics/funnel',
                    '/api/metrics/segments',
                    '/api/metrics/timeseries',
                    '/api/metrics/client-view',
                    '/api/client-portal-auth'
                ];

                if (adminRoutes.some(route => req.url.startsWith(route))) {
                    try {
                        console.log(`[API] ${req.url} handled by local proxy`);
                        if (!process.env.VITE_ADMIN_API_TOKEN) {
                            console.warn('[API] WARNING: VITE_ADMIN_API_TOKEN is missing in server process.env!');
                        }

                        // Parse body for POST/PUT/PATCH
                        let body = {};
                        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                            body = await parseBody();
                        }

                        // Parse Query Params
                        const url = new URL(req.url, `http://${req.headers.host}`);
                        const query: Record<string, string> = {};
                        url.searchParams.forEach((value, key) => {
                            query[key] = value;
                        });

                        // Mock Vercel Request
                        const vercelReq: any = {
                            method: req.method,
                            body: body,
                            headers: req.headers,
                            query: query,
                            cookies: {}
                        };

                        // Mock Vercel Response
                        const vercelRes: any = {
                            statusCode: 200,
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

                        // Route to appropriate handler
                        const cleanUrl = req.url.split('?')[0];
                        let handlerPath = '';

                        if (cleanUrl === '/api/telegram-rooms') handlerPath = './api/telegram-rooms.ts';
                        else if (cleanUrl === '/api/admin/partners') handlerPath = './api/admin/partners.ts';
                        else if (cleanUrl === '/api/admin/partner-billing') handlerPath = './api/admin/partner-billing.ts';
                        else if (cleanUrl === '/api/client-portal-auth') handlerPath = './api/client-portal-auth.ts';
                        else if (cleanUrl.startsWith('/api/metrics/')) {
                            const metricName = cleanUrl.replace('/api/metrics/', '');
                            handlerPath = `./api/metrics/${metricName}.ts`;
                        }

                        if (handlerPath) {
                            // Use jiti or similar if needed, but for now assuming ts-node or vite handles the import
                            // Note: Vite's ssrLoadModule is perfect for this!
                            const mod = await server.ssrLoadModule(handlerPath);
                            if (mod.default) {
                                await mod.default(vercelReq, vercelRes);
                            } else {
                                console.error(`[Local API] No default export in ${handlerPath}`);
                                sendError(500, 'Handler configuration error');
                            }
                        } else {
                            sendError(404, 'Route handler not found');
                        }
                        return;

                    } catch (e: any) {
                        console.error(`[Local API] Error handling ${req.url}:`, e);
                        return sendError(500, e.message);
                    }
                }

                next();
            });
        }
    };
}
