/**
 * URL article extraction for the Pace PWA.
 *
 * Fetches a URL via a public CORS proxy, parses the HTML in-browser via
 * DOMParser, and runs Mozilla Readability to extract the main content
 * (title, byline, body) — the same algorithm Firefox's Reader View uses.
 *
 * Trade-offs:
 *  - Public CORS proxies (`corsproxy.io`, `allorigins.win`) are convenient
 *    but flaky; some sites block them, some sites set strict CSP that
 *    breaks fetch-via-proxy. We try a primary proxy then a fallback.
 *  - All extraction runs in the browser — no backend dependency.
 *  - Article quality is determined by Readability — it nails most blogs
 *    and news sites, struggles on heavily-JS-rendered SPAs (those would
 *    need a server-side headless browser, deferred to v2).
 */

import { Readability } from '@mozilla/readability';

export interface ExtractedArticle {
  title: string;
  author?: string;
  content: string;        // plain text with paragraph breaks preserved
  siteName?: string;
  url: string;
}

const PROXIES = [
  (url: string): string => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string): string => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT = 'Mozilla/5.0 PaceReader/1.0';

async function fetchHtmlViaProxy(url: string): Promise<string> {
  let lastError: unknown;
  for (const buildProxyUrl of PROXIES) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(buildProxyUrl(url), {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
      });
      window.clearTimeout(timeout);
      if (!response.ok) {
        lastError = new Error(`Proxy returned ${response.status}`);
        continue;
      }
      const text = await response.text();
      if (text.length < 200) {
        lastError = new Error('Empty or near-empty response');
        continue;
      }
      return text;
    } catch (err) {
      window.clearTimeout(timeout);
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Article fetch failed');
}

function paragraphsFromTextContent(text: string): string {
  // Readability's `textContent` collapses whitespace per node — restore
  // paragraph breaks by splitting on runs of 2+ newlines from the source.
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n');
}

export async function extractArticle(rawUrl: string): Promise<ExtractedArticle> {
  // Validate + normalize the URL up front — fail fast on garbage input.
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL must be http or https');
  }

  const html = await fetchHtmlViaProxy(url.toString());

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Readability resolves relative links against `document.baseURI`. Inject
  // a <base> tag so the extracted content's URLs match the source domain.
  const base = doc.createElement('base');
  base.href = url.toString();
  doc.head.prepend(base);

  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article) {
    throw new Error('Could not extract article content');
  }

  const cleanedContent = paragraphsFromTextContent(article.textContent ?? '');
  if (cleanedContent.length < 200) {
    throw new Error('Article body looks empty — page may render via JavaScript');
  }

  const result: ExtractedArticle = {
    title: article.title?.trim() || url.hostname,
    content: cleanedContent,
    url: url.toString(),
  };
  if (article.byline) {
    const author = article.byline.replace(/^by\s+/i, '').trim();
    if (author) result.author = author;
  }
  if (article.siteName) result.siteName = article.siteName;
  return result;
}
