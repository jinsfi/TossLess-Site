// Validates src/data/foods.json and writes src/data/foods.verified.json, the only file the shelf-life page reads.
// - An entry with a TODO-VERIFY value, or with no source URL, is left out and listed here.
// - Duplicate ids or malformed entries fail the build.
// Usage: node scripts/check-foods.mjs [input.json] [output.json]
import { readFileSync, writeFileSync } from 'node:fs';

const fromUrl = (p) => new URL(p, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const input = process.argv[2] ?? fromUrl('../src/data/foods.json');
const output = process.argv[3] ?? fromUrl('../src/data/foods.verified.json');

const CATEGORIES = ['salads', 'deli', 'meat', 'poultry', 'seafood', 'eggs', 'prepared', 'canned'];
const errors = [];
const excluded = [];

let foods;
try {
  foods = JSON.parse(readFileSync(input, 'utf8'));
} catch (e) {
  console.error(`check-foods: cannot read ${input}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(foods)) {
  console.error('check-foods: foods.json must be an array.');
  process.exit(1);
}

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isTimeOrNull = (v) => v === null || typeof v === 'string';
const seen = new Set();
const verified = [];

foods.forEach((f, i) => {
  const where = `entry ${i + 1}${f && f.id ? ` (${f.id})` : ''}`;
  const problems = [];
  if (!f || typeof f !== 'object') return errors.push(`${where}: not an object`);
  if (!isText(f.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.id)) problems.push('id must be lowercase words joined by hyphens');
  if (!isText(f.name)) problems.push('name is required');
  if (!Array.isArray(f.aliases) || !f.aliases.every(isText)) problems.push('aliases must be a list of text');
  if (!CATEGORIES.includes(f.category)) problems.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  for (const k of ['pantry', 'fridge', 'freezer']) if (!isTimeOrNull(f[k])) problems.push(`${k} must be text or null`);
  if (typeof f.notes !== 'string') problems.push('notes must be text (use "" for none)');
  if (!f.source || typeof f.source !== 'object' || typeof f.source.name !== 'string' || typeof f.source.url !== 'string') problems.push('source must be { name, url }');
  if (f.article !== undefined && typeof f.article !== 'string') problems.push('article must be text');
  if (f.article && !/^\/blog\/[a-z0-9-]+\/$/.test(f.article)) problems.push('article must look like /blog/slug/');
  if (f.source && f.source.url && !/^https:\/\//.test(f.source.url)) problems.push('source.url must start with https://');
  if (f.id) {
    if (seen.has(f.id)) problems.push('duplicate id');
    seen.add(f.id);
  }
  if (problems.length) return errors.push(`${where}: ${problems.join('; ')}`);

  if (f.pantry === null && f.fridge === null && f.freezer === null) problems.push('has no storage time at all');
  if (problems.length) return errors.push(`${where}: ${problems.join('; ')}`);

  const todo = ['pantry', 'fridge', 'freezer'].some((k) => typeof f[k] === 'string' && f[k].includes('TODO-VERIFY'));
  if (todo) return excluded.push(`${f.id}: has a TODO-VERIFY value`);
  if (!f.source.url) return excluded.push(`${f.id}: no source URL`);
  verified.push({ ...f, article: f.article ?? '' });
});

if (errors.length) {
  console.error(`\ncheck-foods failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

writeFileSync(output, JSON.stringify(verified, null, 2) + '\n');
console.log(`check-foods: ${verified.length} verified foods written, ${excluded.length} excluded.`);
if (excluded.length) {
  console.log('Excluded (not shown on the site until fixed):');
  for (const e of excluded) console.log(`  - ${e}`);
}
