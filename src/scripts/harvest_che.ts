import fs from 'fs';
import * as cheerio from 'cheerio';

const CHE_ENDPOINT = 'https://che.org.il/wp-content/themes/malag_theme/get-courses-institutes.php';
// Ariel University ID from previous probe
const INSTITUTION_ID = '15369';

async function fetchChePageByUrl(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.text();
    } catch (e) { return null; }
}

async function runHarvest() {
    console.log('🔍 Probing for Program endpoint...');

    // Variant 1: get-courses-institutes.php?id=...
    // This is the most likely candidate based on standard WordPress/PHP patterns
    const url1 = `${CHE_ENDPOINT}?id=${INSTITUTION_ID}&lang=he`;
    console.log(`Testing URL 1: ${url1}`);
    const html1 = await fetchChePageByUrl(url1);

    // Variant 2: get-courses-institutes.php?institution_id=...
    // Explicit parameter name
    const url2 = `${CHE_ENDPOINT}?institution_id=${INSTITUTION_ID}&lang=he`;
    console.log(`Testing URL 2: ${url2}`);
    const html2 = await fetchChePageByUrl(url2);

    // Variant 3: "get-courses.php" - Pure guess, but common naming convention
    const url3 = 'https://che.org.il/wp-content/themes/malag_theme/get-courses.php?id=' + INSTITUTION_ID + '&lang=he';
    console.log(`Testing URL 3: ${url3}`);
    const html3 = await fetchChePageByUrl(url3);

    // Analyze results
    [html1, html2, html3].forEach((h, i) => {
        if (!h) {
            console.log(`\n❌ Result ${i + 1}: Failed to fetch`);
            return;
        }

        console.log(`\n--- Result ${i + 1} ---`);
        console.log(`Length: ${h.length} chars`);

        // Log a snippet
        const snippet = h.substring(0, 600).replace(/\s+/g, ' ');
        console.log(`Snippet: ${snippet}`);

        // Check for program keywords
        if (h.includes('מחשב') || h.includes('הנדסה') || h.includes('תוכניות לימוד')) {
            console.log(`✅ FOUND PROGRAMS IN VARIANT ${i + 1}`);
        }

        // Check if it's just the institution list again
        if (h.includes('institution-15369')) {
            console.log(`⚠️  Variant ${i + 1} returned the Institution List again.`);
        }
    });

    // Save for deeper inspection if needed
    if (html1) fs.writeFileSync('che_probe_variant1.html', html1);
    if (html2) fs.writeFileSync('che_probe_variant2.html', html2);
    if (html3) fs.writeFileSync('che_probe_variant3.html', html3);
}

runHarvest();
