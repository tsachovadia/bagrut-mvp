
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetsPath = path.join(__dirname, 'targets.json');
const targets = JSON.parse(await fs.readFile(targetsPath, 'utf8'));

// Configuration
const MAX_DEPTH = 2;
const MAX_PAGES = 50; // Safety limit per site
const CONCURRENCY = 2; // Pages to crawl in parallel per site

async function crawlSite(target) {
    const baseUrl = new URL(target.url);
    const visited = new Set();
    const queue = [{ url: target.url, depth: 0 }];
    const sitemap = [];

    console.log(`Starting crawl for: ${target.name} (${target.url})`);

    while (queue.length > 0 && visited.size < MAX_PAGES) {
        const { url, depth } = queue.shift();

        if (visited.has(url)) continue;
        visited.add(url);

        if (depth > MAX_DEPTH) continue;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                console.warn(`Failed to fetch ${url}: ${response.status}`);
                continue;
            }

            const buffer = await response.arrayBuffer();
            // Try to detect charset from headers or default to utf-8, fallback to windows-1255 for Hebrew
            const contentType = response.headers.get('content-type') || '';
            let decoder;
            if (contentType.includes('charset=')) {
                const charset = contentType.split('charset=')[1].split(';')[0].trim();
                try {
                    decoder = new TextDecoder(charset);
                } catch (e) {
                    decoder = new TextDecoder('utf-8');
                }
            } else {
                // Heuristic: try utf-8, if lots of replacement chars, might be windows-1255
                // For simplicity, we can default to utf-8 but for known hebrew sites windows-1255 is common legacy.
                // However, modern sites usually use utf-8. 
                // The headers didn't show charset for some?
                // Let's assume utf-8 first.
                decoder = new TextDecoder('utf-8');
            }

            let html = decoder.decode(buffer);

            // Check for meta charset if header was missing
            if (!contentType.includes('charset=')) {
                const match = html.match(/<meta.*?charset=["']?([\w-]+)["']?/i);
                if (match && match[1]) {
                    try {
                        const metaCharset = match[1];
                        if (metaCharset.toLowerCase() !== 'utf-8') {
                            decoder = new TextDecoder(metaCharset);
                            html = decoder.decode(buffer);
                        }
                    } catch (e) { }
                }
            }

            const $ = cheerio.load(html);
            const title = $('title').text().trim();
            const links = [];

            $('a').each((i, el) => {
                let href = $(el).attr('href');
                if (!href) return;

                try {
                    // Fix relative paths
                    const urlObj = new URL(href, url);
                    const absoluteUrl = urlObj.href;

                    // Only internal links
                    if (absoluteUrl.startsWith(target.url) && !absoluteUrl.includes('#')) {
                        links.push(absoluteUrl);
                        if (!visited.has(absoluteUrl) && depth < MAX_DEPTH) {
                            queue.push({ url: absoluteUrl, depth: depth + 1 });
                        }
                    }
                } catch (e) {
                    // Ignore invalid URLs
                }
            });

            sitemap.push({
                url,
                title,
                depth,
                internal_links_count: links.length
            });

            // Be nice to the server
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error(`Error crawling ${url}:`, error.message);
        }
    }

    // Save sitemap
    const outputDir = path.join(__dirname, '../competitors', target.id);
    // Ensure dir exists (redundant if we run the mkdir command, but good practice)
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'sitemap.json');
    await fs.writeFile(outputPath, JSON.stringify(sitemap, null, 2));
    console.log(`Saved sitemap for ${target.name} to ${outputPath} (${sitemap.length} pages)`);
}

async function run() {
    for (const target of targets) {
        await crawlSite(target);
    }
}

run();
