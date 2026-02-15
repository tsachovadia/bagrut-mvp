/**
 * Facebook Group Scraper
 * Uses mbasic.facebook.com (simple HTML, pagination, no infinite scroll)
 *
 * Usage:
 *   node scripts/scrape-fb-group.js <GROUP_ID_OR_URL>
 *   node scripts/scrape-fb-group.js --resume   (continue from last session)
 *
 * The script opens a real browser - you log in manually, then it starts scraping.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'fb-data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const STATE_FILE = path.join(DATA_DIR, 'scrape-state.json');
const COMMENTS_DIR = path.join(DATA_DIR, 'comments');

// --- Config ---
const DELAY_MIN_MS = 2500;
const DELAY_MAX_MS = 5500;
const PAUSE_EVERY_N_PAGES = 15;       // longer pause every N pages
const LONG_PAUSE_MS = 30_000;          // 30s pause to avoid detection
const MAX_POSTS_PER_SESSION = 500;     // safety limit per session
const COMMENT_FETCH_DELAY_MS = 2000;   // delay before fetching each post's comments

// --- Helpers ---
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  const ms = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
  return sleep(ms);
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

function saveComments(postId, comments) {
  if (!fs.existsSync(COMMENTS_DIR)) fs.mkdirSync(COMMENTS_DIR, { recursive: true });
  const file = path.join(COMMENTS_DIR, `${postId}.json`);
  fs.writeFileSync(file, JSON.stringify(comments, null, 2));
}

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, () => { rl.close(); resolve(); });
  });
}

function saveDebugHtml(html, label) {
  const file = path.join(DATA_DIR, `debug_${label}_${Date.now()}.html`);
  fs.writeFileSync(file, html);
  console.log(`  [debug] HTML saved to: ${file}`);
}

function extractGroupId(input) {
  if (!input) return null;
  // Direct ID
  if (/^\d+$/.test(input)) return input;
  // URL like https://www.facebook.com/groups/GROUP_NAME_OR_ID/...
  const match = input.match(/facebook\.com\/groups\/([^/?]+)/);
  return match ? match[1] : input;
}

// --- Main Scraping Logic ---
async function scrapeGroupPage(page) {
  const posts = [];

  // mbasic posts are in article tags or divs with data-ft attribute
  // Try multiple selectors since mbasic structure can vary
  const postElements = await page.$$('article, div[data-ft], #m_group_stories_container > div > div');

  for (const el of postElements) {
    try {
      const post = {};

      // Author - usually in a strong > a or h3 > a tag
      const authorEl = await el.$('strong a, h3 a');
      if (authorEl) {
        post.author = await authorEl.innerText().catch(() => '');
        post.authorUrl = await authorEl.getAttribute('href').catch(() => '');
        if (post.authorUrl && !post.authorUrl.startsWith('http')) {
          post.authorUrl = 'https://mbasic.facebook.com' + post.authorUrl;
        }
      }

      // Post text - in paragraphs within the post
      const textParts = [];
      const textEls = await el.$$('p');
      for (const p of textEls) {
        const t = await p.innerText().catch(() => '');
        if (t.trim()) textParts.push(t.trim());
      }
      // Also try div > span for text content
      if (textParts.length === 0) {
        const spans = await el.$$('div > span');
        for (const s of spans) {
          const t = await s.innerText().catch(() => '');
          if (t.trim() && t.length > 10) textParts.push(t.trim());
        }
      }
      post.text = textParts.join('\n');

      // Post link (to fetch comments later)
      const postLink = await el.$('a[href*="/story.php"], a[href*="/groups/"][href*="/permalink/"], a[href*="/posts/"]');
      if (postLink) {
        let href = await postLink.getAttribute('href');
        if (href && !href.startsWith('http')) {
          href = 'https://mbasic.facebook.com' + href;
        }
        post.postUrl = href;
        // Extract post ID from URL
        const idMatch = href.match(/(?:story_fbid=|permalink\/|posts\/)(\d+)/);
        if (idMatch) post.id = idMatch[1];
      }

      // Timestamp - usually in an abbr tag or a small text
      const timeEl = await el.$('abbr');
      if (timeEl) {
        post.timestamp = await timeEl.innerText().catch(() => '');
      }

      // Reactions count
      const reactEl = await el.$('a[href*="reaction/profile"], span[id*="like"]');
      if (reactEl) {
        post.reactions = await reactEl.innerText().catch(() => '');
      }

      // Comment count hint
      const commentCountEl = await el.$('a[href*="comment"]');
      if (commentCountEl) {
        post.commentCountHint = await commentCountEl.innerText().catch(() => '');
      }

      // Only save if we have meaningful content
      if (post.text || post.author) {
        if (!post.id) post.id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        post.scrapedAt = new Date().toISOString();
        posts.push(post);
      }
    } catch (err) {
      console.log('  [warn] Failed to parse a post element:', err.message);
    }
  }

  return posts;
}

async function scrapeComments(page, postUrl) {
  if (!postUrl) return [];

  try {
    await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(COMMENT_FETCH_DELAY_MS);

    const comments = [];
    // Comments on mbasic are usually in div elements after the main post
    const commentEls = await page.$$('div[id^="comment_"], div[data-sigil="comment"]');

    // Fallback: try broader selectors
    const els = commentEls.length > 0
      ? commentEls
      : await page.$$('#m_story_permalink_view div > div > div:has(h3)');

    for (const el of els) {
      try {
        const comment = {};
        const authorEl = await el.$('h3 a, strong a');
        if (authorEl) {
          comment.author = await authorEl.innerText().catch(() => '');
          comment.authorUrl = await authorEl.getAttribute('href').catch(() => '');
        }

        const textEl = await el.$('div[data-sigil="comment-body"], div > div > span, div:nth-child(2)');
        if (textEl) {
          comment.text = await textEl.innerText().catch(() => '');
        }

        if (comment.author || comment.text) {
          comment.scrapedAt = new Date().toISOString();
          comments.push(comment);
        }
      } catch { /* skip bad comment */ }
    }

    // Check for "more comments" link and follow
    let moreLink = await page.$('a[href*="comment"][href*="see_next"]');
    let morePages = 0;
    while (moreLink && morePages < 10) {
      const href = await moreLink.getAttribute('href');
      const fullUrl = href.startsWith('http') ? href : 'https://mbasic.facebook.com' + href;
      await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await sleep(COMMENT_FETCH_DELAY_MS);

      const moreCommentEls = await page.$$('div[id^="comment_"], div[data-sigil="comment"]');
      for (const el of moreCommentEls) {
        try {
          const comment = {};
          const authorEl = await el.$('h3 a, strong a');
          if (authorEl) {
            comment.author = await authorEl.innerText().catch(() => '');
          }
          const textEl = await el.$('div[data-sigil="comment-body"], div > div > span');
          if (textEl) {
            comment.text = await textEl.innerText().catch(() => '');
          }
          if (comment.author || comment.text) {
            comment.scrapedAt = new Date().toISOString();
            comments.push(comment);
          }
        } catch { /* skip */ }
      }

      moreLink = await page.$('a[href*="comment"][href*="see_next"]');
      morePages++;
    }

    return comments;
  } catch (err) {
    console.log('  [warn] Failed to scrape comments:', err.message);
    return [];
  }
}

async function findNextPageLink(page) {
  // mbasic has "See More Posts" or "עוד פוסטים" pagination link
  const nextLink = await page.$([
    'a[href*="bacr="]',                    // mbasic pagination param
    'a[href*="groupid="][href*="start="]', // alternative pagination
    '#m_group_stories_container a[href*="?"]',
    'a:has-text("See More Posts")',
    'a:has-text("See more posts")',
    'a:has-text("עוד פוסטים")',
    'a:has-text("הצג עוד")',
  ].join(', '));

  if (nextLink) {
    let href = await nextLink.getAttribute('href');
    if (href && !href.startsWith('http')) {
      href = 'https://mbasic.facebook.com' + href;
    }
    return href;
  }
  return null;
}

// --- Entry Point ---
async function main() {
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');
  const groupInput = args.find(a => a !== '--resume');
  const fetchComments = !args.includes('--no-comments');

  // Ensure data dir exists
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(COMMENTS_DIR)) fs.mkdirSync(COMMENTS_DIR, { recursive: true });

  let state = loadState();
  let allPosts = loadPosts();
  const existingIds = new Set(allPosts.map(p => p.id));

  let groupId;
  let startUrl;

  if (isResume && state) {
    groupId = state.groupId;
    startUrl = state.nextPageUrl;
    console.log(`\n>> Resuming scrape for group: ${groupId}`);
    console.log(`>> Already have ${allPosts.length} posts saved`);
    console.log(`>> Continuing from: ${startUrl}\n`);
  } else {
    if (!groupInput) {
      console.log('Usage:');
      console.log('  node scripts/scrape-fb-group.js <GROUP_ID_OR_URL>');
      console.log('  node scripts/scrape-fb-group.js --resume');
      console.log('  node scripts/scrape-fb-group.js <GROUP_ID> --no-comments');
      process.exit(1);
    }
    groupId = extractGroupId(groupInput);
    startUrl = `https://mbasic.facebook.com/groups/${groupId}`;
    console.log(`\n>> Scraping group: ${groupId}`);
    console.log(`>> Starting URL: ${startUrl}\n`);
  }

  // Launch browser - NOT headless so user can log in
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    locale: 'he-IL',
  });

  // Try to load saved cookies
  const cookiesFile = path.join(DATA_DIR, 'cookies.json');
  if (fs.existsSync(cookiesFile)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
      await context.addCookies(cookies);
      console.log('>> Loaded saved cookies');
    } catch { /* ignore */ }
  }

  const page = await context.newPage();

  // Navigate to Facebook
  console.log('>> Opening Facebook...');
  await page.goto('https://mbasic.facebook.com', { waitUntil: 'domcontentloaded' });

  // Wait for user to log in manually
  console.log('\n========================================');
  console.log('>>  Log in to Facebook in the browser window.');
  console.log('>>  When you are logged in, come back here');
  console.log('>>  and press ENTER to start scraping.');
  console.log('========================================\n');
  await waitForEnter('>> Press ENTER when logged in... ');

  // Save cookies for next session
  const cookies = await context.cookies();
  fs.writeFileSync(cookiesFile, JSON.stringify(cookies, null, 2));
  console.log('>> Cookies saved for next session');

  // Navigate to group
  console.log(`\n>> Navigating to group: ${startUrl}\n`);
  await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000);

  let currentUrl = startUrl;
  let pageNum = state?.pageNum || 0;
  let newPostsThisSession = 0;

  console.log('>> Starting scrape loop...\n');

  while (newPostsThisSession < MAX_POSTS_PER_SESSION) {
    pageNum++;
    console.log(`--- Page ${pageNum} | Total posts: ${allPosts.length} | New this session: ${newPostsThisSession} ---`);
    console.log(`    URL: ${currentUrl.substring(0, 100)}...`);

    // Scrape posts on current page
    const pagePosts = await scrapeGroupPage(page);
    console.log(`    Found ${pagePosts.length} posts on this page`);

    // Save debug HTML if no posts found on first page
    if (pagePosts.length === 0 && pageNum <= 2) {
      const html = await page.content();
      saveDebugHtml(html, `page${pageNum}`);
    }

    let newOnThisPage = 0;
    for (const post of pagePosts) {
      if (!existingIds.has(post.id)) {
        // Fetch comments for this post
        if (fetchComments && post.postUrl) {
          console.log(`    Fetching comments for post ${post.id}...`);
          const comments = await scrapeComments(page, post.postUrl);
          post.commentCount = comments.length;
          if (comments.length > 0) {
            saveComments(post.id, comments);
            console.log(`    -> ${comments.length} comments saved`);
          }
          // Navigate back to the group page
          await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await sleep(1500);
        }

        allPosts.push(post);
        existingIds.add(post.id);
        newOnThisPage++;
        newPostsThisSession++;
      }
    }

    console.log(`    New posts: ${newOnThisPage} (${pagePosts.length - newOnThisPage} duplicates skipped)`);

    // Save incrementally
    savePosts(allPosts);

    // Find next page
    const nextUrl = await findNextPageLink(page);
    if (!nextUrl) {
      console.log('\n>> No more pages found. Scraping complete!');
      break;
    }

    // Save state for resume
    saveState({ groupId, nextPageUrl: nextUrl, pageNum, totalPosts: allPosts.length });

    // Long pause every N pages
    if (pageNum % PAUSE_EVERY_N_PAGES === 0) {
      console.log(`\n>> Safety pause (${LONG_PAUSE_MS / 1000}s) to avoid detection...\n`);
      await sleep(LONG_PAUSE_MS);
    }

    // Random delay between pages
    await randomDelay();

    // Navigate to next page
    currentUrl = nextUrl;
    try {
      await page.goto(nextUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(1500);
    } catch (err) {
      console.log(`\n>> Navigation error: ${err.message}`);
      console.log('>> Saving state and stopping. Use --resume to continue.\n');
      saveState({ groupId, nextPageUrl: nextUrl, pageNum, totalPosts: allPosts.length });
      break;
    }

    // Check if we got blocked (redirected to login/checkpoint)
    const curUrl = page.url();
    if (curUrl.includes('/login') || curUrl.includes('/checkpoint')) {
      console.log('\n>> BLOCKED! Facebook redirected to login/checkpoint.');
      console.log('>> State saved. Wait a few hours and use --resume to continue.\n');
      saveState({ groupId, nextPageUrl: nextUrl, pageNum, totalPosts: allPosts.length });
      break;
    }
  }

  // Final save
  savePosts(allPosts);
  saveState({ groupId, nextPageUrl: currentUrl, pageNum, totalPosts: allPosts.length });

  // Save cookies again
  const finalCookies = await context.cookies();
  fs.writeFileSync(cookiesFile, JSON.stringify(finalCookies, null, 2));

  console.log('\n========================================');
  console.log(`>> DONE! Total posts saved: ${allPosts.length}`);
  console.log(`>> New posts this session: ${newPostsThisSession}`);
  console.log(`>> Data saved to: ${POSTS_FILE}`);
  console.log(`>> Comments saved to: ${COMMENTS_DIR}/`);
  console.log('>> Run with --resume to continue from where you stopped');
  console.log('========================================\n');

  await browser.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
