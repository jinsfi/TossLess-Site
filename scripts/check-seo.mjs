// Runs after `astro build`. Fails the build when the generated pages break the SEO rules:
// unique titles and descriptions, absolute canonical URLs on the real domain, description length,
// no draft articles in the sitemap or RSS, and a robots.txt that points at the sitemap that exists.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ORIGIN = 'https://tosslessapp.com';
const MAX_DESCRIPTION = 160;

const errors = [];
const fail = (msg) => errors.push(msg);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const attr = (html, re) => html.match(re)?.[1];
const pageName = (file) => '/' + relative(DIST, file).split(sep).join('/');

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const titles = new Map();
const descriptions = new Map();

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const name = pageName(file);
  const noindex = /<meta name="robots" content="noindex"/.test(html);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);

  if (!title) fail(`${name}: missing <title>`);
  if (!description) fail(`${name}: missing meta description`);
  else if (description.length > MAX_DESCRIPTION) fail(`${name}: description is ${description.length} characters (max ${MAX_DESCRIPTION})`);
  if (!canonical) fail(`${name}: missing canonical link`);
  else if (!canonical.startsWith(ORIGIN + '/')) fail(`${name}: canonical is not absolute on ${ORIGIN}: ${canonical}`);

  if (!html.includes('property="og:image"')) fail(`${name}: missing og:image`);
  if (!html.includes('name="twitter:card" content="summary_large_image"')) fail(`${name}: missing twitter:card`);

  if (!noindex) {
    if (title) titles.set(title, [...(titles.get(title) ?? []), name]);
    if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), name]);
  }
}

for (const [title, names] of titles) if (names.length > 1) fail(`duplicate title "${title}" on ${names.join(', ')}`);
for (const [d, names] of descriptions) if (names.length > 1) fail(`duplicate description "${d.slice(0, 60)}…" on ${names.join(', ')}`);

// robots.txt must point at the sitemap index that exists.
const robots = await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => '');
const sitemapLine = robots.match(/^Sitemap:\s*(\S+)/im)?.[1];
if (!sitemapLine) fail('robots.txt has no Sitemap line');
else {
  const path = new URL(sitemapLine).pathname.slice(1);
  if (!(await stat(join(DIST, path)).catch(() => null))) fail(`robots.txt points to ${sitemapLine} but ${path} was not built`);
}

// Drafts must not leak into the sitemap or RSS: every URL they list must be a built page.
const built = new Set(pages.map((f) => pageName(f).replace(/index\.html$/, '')));
for (const file of files.filter((f) => /sitemap-\d+\.xml$/.test(f))) {
  const xml = await readFile(file, 'utf8');
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    if (!built.has(path)) fail(`sitemap lists ${loc} but no such page was built`);
  }
}
const rssXml = await readFile(join(DIST, 'rss.xml'), 'utf8').catch(() => '');
if (!rssXml) fail('rss.xml was not built');
for (const [, link] of rssXml.matchAll(/<link>([^<]+)<\/link>/g)) {
  const path = new URL(link).pathname;
  if (path !== '/' && !built.has(path)) fail(`rss.xml lists ${link} but no such page was built`);
}

if (errors.length) {
  console.error(`\nSEO check failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`SEO check passed: ${pages.length} pages, unique titles and descriptions, canonicals on ${ORIGIN}, sitemap and RSS clean.`);
