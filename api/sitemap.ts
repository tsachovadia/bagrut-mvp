import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = 'https://mitlabtim.co.il';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/calculator', priority: '0.9', changefreq: 'weekly' },
    { path: '/programs', priority: '0.9', changefreq: 'weekly' },
    { path: '/dashboard', priority: '0.8', changefreq: 'weekly' },
    { path: '/open-days', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/tracking', priority: '0.6', changefreq: 'weekly' },
    { path: '/collaborations', priority: '0.5', changefreq: 'monthly' },
    { path: '/write-for-us', priority: '0.4', changefreq: 'monthly' },
];

// Known blog article slugs (mirrored from src/data/articles.ts to avoid importing frontend code)
const BLOG_SLUGS = [
    'how-to-calculate-bagrut-average-2026',
    'psychometric-guide-2026',
    'degree-dating-psychology-vs-engineering',
    'open-days-2026-guide',
];

function escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        // Fetch all program IDs from Supabase
        const { data: programs, error } = await supabase
            .from('programs')
            .select('id')
            .order('id');

        if (error) {
            console.error('Sitemap: failed to fetch programs', error.message);
        }

        const today = new Date().toISOString().split('T')[0];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        for (const page of STATIC_PAGES) {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Blog articles
        for (const slug of BLOG_SLUGS) {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}/blog/${escapeXml(slug)}</loc>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        }

        // Dynamic program pages
        if (programs && programs.length > 0) {
            for (const program of programs) {
                xml += `  <url>\n`;
                xml += `    <loc>${BASE_URL}/program/${escapeXml(program.id)}</loc>\n`;
                xml += `    <lastmod>${today}</lastmod>\n`;
                xml += `    <changefreq>monthly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += `  </url>\n`;
            }
        }

        xml += '</urlset>';

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err);
        return res.status(500).send('Internal server error');
    }
}
