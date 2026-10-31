// Generates the raster images in public/ from public/logo.svg.
// Run once with `node scripts/generate-icons.mjs`, then commit the PNGs.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = await readFile(new URL('../public/logo.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Square logo for structured data and the press kit.
await sharp(logo, { density: 1200 }).resize(512, 512).png().toFile(out('logo-512.png'));
await sharp(logo, { density: 1200 }).resize(512, 512).png().toFile(out('press/tossless-icon.png'));

// iOS home-screen icon: full-bleed square (iOS rounds the corners itself).
const bleed = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 48 48"><rect width="48" height="48" fill="#2E7D4F"/>${
    logo.toString().match(/<path[\s\S]*<\/svg>/)[0].replace('</svg>', '')
  }</svg>`,
);
await sharp(bleed, { density: 600 }).resize(180, 180).png().toFile(out('apple-touch-icon.png'));

// 1200x630 default share image.
const og = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FAF7F2"/>
      <stop offset="1" stop-color="#E6F1E4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(90 90) scale(2.6)">${logo.toString().replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
  <text x="90" y="340" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="#1E2420">Know what to</text>
  <text x="90" y="445" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="#2E7D4F">eat first.</text>
  <text x="90" y="540" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="38" fill="#6B726D">TossLess · tosslessapp.com</text>
</svg>`);
await sharp(og).png().toFile(out('og-default.png'));

console.log('Generated logo-512.png, press/tossless-icon.png, apple-touch-icon.png, og-default.png');
