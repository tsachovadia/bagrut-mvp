import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error("Error: OPENROUTER_API_KEY is missing in .env");
    process.exit(1);
}

const FILE_PATH = "/Users/syrianhammer/Library/Mobile Documents/com~apple~CloudDocs/Documents/1 Projects/Launch_Pad_MVP/bagrut-mvp/assets/bagrut_axaple_files/tsach_bagrut.pdf";

const KNOWN_SUBJECTS = [
    "עברית - הבעה ולשון",
    "אנגלית",
    "מתמטיקה",
    "היסטוריה",
    "אזרחות",
    "תנ\"ך",
    "ספרות",
    // Science & Tech
    "פיסיקה",
    "כימיה",
    "ביולוגיה",
    "מדעי המחשב",
    "הנדסת תוכנה",
    "רובוטיקה",
    "מערכות אלקטרוניות",
    "ביוטכנולוגיה",
    "חקלאות",
    // Social
    "פסיכולוגיה",
    "סוציולוגיה",
    "כלכלה",
    "ניהול עסקי",
    "משפטים",
    "תקשורת",
    "גיאוגרפיה",
    "מדעי החברה",
    // Humanities
    "פילוסופיה",
    "אמנות",
    "מוסיקה",
    "תיאטרון",
    "קולנוע",
    "מחול",
    "עיצוב",
    // Languages
    "ערבית",
    "צרפתית",
    "רוסית",
    "ספרדית",
    "סינית",
    // Sector Specific
    "תלמוד / תושב״ע",
    "מחשבת ישראל",
    "עברית לדוברי ערבית",
    "ערבית לדוברי ערבית",
    "דת / מורשת (אסלאם/נצרות)",
    "מורשת דרוזית",
    // Other
    "חינוך גופני",
    "עבודת גמר"
];


async function testExtraction() {
    try {
        console.log(`Reading file: ${FILE_PATH}`);
        const fileBuffer = fs.readFileSync(FILE_PATH);
        const base64File = fileBuffer.toString('base64');
        const fileType = path.extname(FILE_PATH) === '.pdf' ? 'application/pdf' : 'image/jpeg';
        const dataUrl = `data:${fileType};base64,${base64File}`;

        console.log("Sending request to Local API (Middleware)...");
        console.log("Note: Ensure 'npm run dev' is running in another terminal!");

        const response = await fetch("http://localhost:5173/api/extract-grades", { // Assuming default Vite port
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileBase64: dataUrl,
                fileType: fileType
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        console.log("\nSuccess! Results:");
        console.log("Used Model:", data.usedModel);
        console.log("Grades:", JSON.stringify(data.grades, null, 2));

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testExtraction();
