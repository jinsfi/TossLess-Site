// Runs after `astro build`. Fails the build when a page links to an internal page, file or #section that does not exist.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ORIGIN = 'https://tosslessapp.com';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const exists = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

/** Map a URL path like /about/ or /rss.xml to the file the host would serve. */
async function resolveFile(path) {
  const clean = decodeURIComponent(path).replace(/^\//, '');
  for (const candidate of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const full = join(DIST, candidate);
    if (clean !== '' || candidate.endsWith('index.html')) if (await exists(full)) return full;
  }
  return null;
}

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const idCache = new Map();
async function idsOf(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\b(?:id|name)="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const errors = [];
let checked = 0;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const pagePath = '/' + relative(DIST, file).split(sep).join('/').replace(/index\.html$/, '');
  const urls = [];
  for (const m of html.matchAll(/<(a|link|img|script|source)\b[^>]*>/g)) {
    const tag = m[0];
    const rel = tag.match(/\brel="([^"]*)"/)?.[1] ?? '';
    if (m[1] === 'link' && /canonical/.test(rel)) continue; // canonical is checked by check-seo
    for (const attr of tag.matchAll(/\b(?:href|src)="([^"]*)"/g)) urls.push(attr[1]);
    const srcset = tag.match(/\bsrcset="([^"]*)"/)?.[1];
    if (srcset) for (const part of srcset.split(',')) urls.push(part.trim().split(/\s+/)[0]);
  }

  for (const raw of urls) {
    if (!raw || /^(mailto:|tel:|data:|javascript:)/.test(raw)) continue;
    let url;
    try {
      url = new URL(raw, ORIGIN + pagePath);
    } catch {
      errors.push(`${pagePath}: malformed link "${raw}"`);
      continue;
    }
    if (url.origin !== ORIGIN) continue; // external links are not checked here
    checked++;
    const target = url.pathname === '/' ? join(DIST, 'index.html') : await resolveFile(url.pathname);
    if (!target) {
      errors.push(`${pagePath}: broken link to ${url.pathname}`);
      continue;
    }
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !(await idsOf(target)).has(id)) errors.push(`${pagePath}: link to ${url.pathname}${url.hash} but that page has no #${id}`);
    }
  }
}

if (errors.length) {
  console.error(`\nLink check failed (${errors.length}):`);
  for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked} internal links across ${pages.length} pages.`);
