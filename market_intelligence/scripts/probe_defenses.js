
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetsPath = path.join(__dirname, 'targets.json');
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8'));
const REPORT_PATH = path.join(__dirname, '../reports/probe_results.md');

async function probeUrl(url) {
    try {
        console.log(`Probing ${url}...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        const text = await response.text();
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const isCaptcha = text.toLowerCase().includes('captcha') ||
            text.toLowerCase().includes('human verification') ||
            text.toLowerCase().includes('challenge-form');

        const isWaf = headers['server']?.includes('cloudflare') ||
            headers['x-protected-by'] ||
            headers['cf-ray'];

        return {
            status: response.status,
            blocked: response.status === 403 || response.status === 406 || response.status === 429,
            captcha: !!isCaptcha,
            waf: isWaf ? (headers['server'] || 'Detected') : false,
            server: headers['server'] || 'Unknown'
        };

    } catch (error) {
        return {
            status: 'ERROR',
            error: error.message,
            blocked: true,
            captcha: false,
            waf: false
        };
    }
}

async function run() {
    let report = '# Competitor Scrapeability Audit\n\n| Name | Status | Blocked? | Captcha? | WAF/Server | Error |\n|---|---|---|---|---|---|\n';

    for (const target of targets) {
        const result = await probeUrl(target.url);
        report += `| ${target.name} | ${result.status} | ${result.blocked ? '🔴 YES' : '🟢 NO'} | ${result.captcha ? '⚠️ YES' : 'NO'} | ${result.waf || result.server} | ${result.error || ''} |\n`;

        // Also probe calculator URL if different
        if (target.calculator_url && target.calculator_url !== target.url) {
            // slight delay
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    await fs.writeFile(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

run();
