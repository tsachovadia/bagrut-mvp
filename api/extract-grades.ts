import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb',
        },
    },
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    if (!OPENROUTER_API_KEY) {
        return response.status(500).json({ error: 'OpenRouter API Key not configured' });
    }

    const { fileBase64 } = request.body;

    if (!fileBase64) {
        return response.status(400).json({ error: 'No file provided' });
    }

    try {
        const responseAI = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free", // Or google/gemini-flash-1.5
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
                                type: "image_url", // OpenRouter supports image_url for base64
                                image_url: {
                                    url: fileBase64 // Expecting 'data:image/jpeg;base64,...'
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

        return response.status(200).json({ grades });

    } catch (error: any) {
        console.error('Extraction Error:', error);
        return response.status(500).json({ error: error.message || 'Failed to extract grades' });
    }
}
