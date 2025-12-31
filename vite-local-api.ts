
import { IncomingMessage, ServerResponse } from 'http';
import { loadEnv } from 'vite';

const KNOWN_SUBJECTS = [
    "עברית - הבעה ולשון",
    "אנגלית",
    "מתמטיקה",
    "היסטוריה",
    "אזרחות",
    "תנ\"ך",
    "ספרות",
    "פיסיקה",
    "כימיה",
    "ביולוגיה",
    "מדעי המחשב",
    "גיאוגרפיה",
    "מדעי החברה",
    "פילוסופיה",
    "אמנות",
    "מוסיקה",
    "תיאטרון",
    "קולנוע",
    "ניהול עסקי",
    "כלכלה",
    "ערבית",
    "צרפתית",
    "תלמוד / תושב״ע",
    "מחשבת ישראל",
    "עברית לדוברי ערבית",
    "ערבית לדוברי ערבית",
    "דת / מורשת (אסלאם/נצרות)",
    "מורשת דרוזית"
];

export function extractGradesMiddleware() {
    // Load env vars (including OPENROUTER_API_KEY from .env)
    const env = loadEnv('', process.cwd(), '');
    const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;

    return {
        name: 'vite-local-api',
        configureServer(server: any) {
            server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Function) => {
                if (req.url === '/api/extract-grades' && req.method === 'POST') {
                    if (!OPENROUTER_API_KEY) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'OpenRouter API Key not configured in .env' }));
                        return;
                    }

                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', async () => {
                        try {
                            const { fileBase64 } = JSON.parse(body);

                            if (!fileBase64) {
                                res.statusCode = 400;
                                res.end(JSON.stringify({ error: 'No file provided' }));
                                return;
                            }

                            // Call OpenRouter
                            const responseAI = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    model: "google/gemini-2.0-flash-exp:free",
                                    messages: [
                                        {
                                            role: "system",
                                            content: `You are a helper that extracts Israeli Bagrut (Matriculation) grades from document images/PDFs.
                                            Output STRICT JSON only. No markdown formatting.
                                            Return an array of objects: [{ "subject": string, "units": number, "grade": number }].
                                            
                                            Rules:
                                            1. Normalize subject names to this exact list if possible: ${KNOWN_SUBJECTS.join(", ")}.
                                            2. If a subject is not in the list, use its Hebrew name as appears in the document.
                                            3. Extract 'Yehidot Limud' (Units) as an integer.
                                            4. Extract 'Tziyun Sofi' (Final Grade) as an integer.
                                            5. Ignore rows that don't look like final grades (e.g. sub-components).`
                                        },
                                        {
                                            role: "user",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Extract the full list of grades from this document."
                                                },
                                                {
                                                    type: "image_url",
                                                    image_url: {
                                                        url: fileBase64
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                })
                            });

                            if (!responseAI.ok) {
                                const errText = await responseAI.text();
                                console.error("OpenRouter Error:", errText);
                                throw new Error(`OpenRouter API Error: ${responseAI.statusText}`);
                            }

                            const data = await responseAI.json() as any;
                            const content = data.choices[0].message.content;

                            // Clean markdown code blocks if present
                            const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
                            const grades = JSON.parse(jsonStr);

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ grades }));
                        } catch (error: any) {
                            console.error('Middleware Processing Error:', error);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error.message || 'Failed to process request' }));
                        }
                    });
                } else {
                    next();
                }
            });
        }
    };
}
