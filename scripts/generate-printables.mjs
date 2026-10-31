// Generates the printable PDFs in public/printables/. Run with `npm run printables`, then commit the PDFs.
// Storage times in the chart are copied from the official FoodSafety.gov Cold Food Storage Chart. Change them
// only by re-checking that page. The inventory sheets are blank templates with no storage times.
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import PDFDocument from 'pdfkit';

const OUT = new URL('../public/printables/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const GREEN = '#2E7D4F';
const TINT = '#E6F1E4';
const INK = '#1E2420';
const MUTED = '#5F6661';
const LINE = '#C9D6CC';
const M = 40; // page margin
const W = 612 - M * 2; // usable width on US Letter

const SOURCE = {
  name: 'FoodSafety.gov, Cold Food Storage Chart',
  url: 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts',
  reviewed: 'September 19, 2023',
};

// [food, type, fridge, freezer], copied from the official chart.
const chart = [
  ['Salads', 'Egg, chicken, ham, tuna, and macaroni salads', '3 to 4 days', 'Does not freeze well'],
  ['Hot dogs', 'Opened package', '1 week', '1 to 2 months'],
  ['', 'Unopened package', '2 weeks', '1 to 2 months'],
  ['Luncheon meat', 'Opened package or deli sliced', '3 to 5 days', '1 to 2 months'],
  ['', 'Unopened package', '2 weeks', '1 to 2 months'],
  ['Bacon', 'Bacon', '1 week', '1 month'],
  ['Sausage', 'Raw, from chicken, turkey, pork, or beef', '1 to 2 days', '1 to 2 months'],
  ['Ground meats', 'Hamburger, ground beef, turkey, chicken, other poultry, veal, pork, lamb, and mixtures', '1 to 2 days', '3 to 4 months'],
  ['Fresh beef, veal, lamb, pork', 'Steaks, chops, roasts', '3 to 5 days', '4 to 12 months'],
  ['Ham', 'Fresh, uncured, uncooked', '3 to 5 days', '6 months'],
  ['', 'Cooked, store-wrapped, whole', '1 week', '1 to 2 months'],
  ['Fresh poultry', 'Chicken or turkey, whole', '1 to 2 days', '1 year'],
  ['', 'Chicken or turkey, pieces', '1 to 2 days', '9 months'],
  ['Fish and shellfish', 'Fatty fish (salmon, tuna, mackerel, etc.)', '1 to 3 days', '2 to 3 months'],
  ['', 'Shrimp, crayfish', '3 to 5 days', '6 to 18 months'],
  ['Eggs', 'Raw eggs in shell', '3 to 5 weeks', 'Do not freeze in shell'],
  ['', 'Hard-cooked eggs', '1 week', 'Do not freeze'],
  ['Soups and stews', 'Vegetable or meat added', '3 to 4 days', '2 to 3 months'],
  ['Leftovers', 'Cooked meat or poultry', '3 to 4 days', '2 to 6 months'],
  ['', 'Chicken nuggets or patties', '3 to 4 days', '1 to 3 months'],
  ['', 'Pizza', '3 to 4 days', '1 to 2 months'],
];

function leaf(doc, x, y, size) {
  const k = size / 48;
  doc.save().translate(x, y).scale(k);
  doc.roundedRect(0, 0, 48, 48, 12).fill(GREEN);
  doc.path('M13 34 C13 20 21.5 13 35.5 13 C35.5 27.5 27 34.5 13 34 Z').fill('#FFFFFF');
  doc.path('M15.5 31.5 L29.5 18.5').lineWidth(2.4).lineCap('round').stroke(GREEN);
  doc.path('M21 26 L20.5 21.5 M25 22.5 L29.5 23').lineWidth(1.8).lineCap('round').stroke(GREEN);
  doc.restore();
}

function header(doc, title, subtitle) {
  leaf(doc, M, M - 4, 34);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(20).text(title, M + 46, M - 3, { width: W - 46, lineBreak: false });
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text(subtitle, M + 46, M + 22, { width: W - 46, lineBreak: false });
  const y = M + 46;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.5).strokeColor(GREEN).stroke();
  return y + 10;
}

function footer(doc, lines) {
  const y = 792 - M - lines.length * 10 - 14;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.5).strokeColor(LINE).stroke();
  doc.fillColor(MUTED).font('Helvetica').fontSize(7.5);
  lines.forEach((l, i) => doc.text(l, M, y + 6 + i * 10, { width: W, lineBreak: false }));
}

function makeDoc(file, meta) {
  const doc = new PDFDocument({ size: 'LETTER', margin: M, info: { Title: meta.title, Author: 'TossLess', Subject: meta.subject, Creator: 'tosslessapp.com' } });
  doc.pipe(createWriteStream(OUT + file));
  return doc;
}

function storageChart() {
  const doc = makeDoc('fridge-freezer-storage-chart.pdf', {
    title: 'Fridge and freezer storage chart',
    subject: 'How long common foods keep in the fridge and freezer, from the official FoodSafety.gov chart',
  });
  let y = header(doc, 'Fridge and freezer storage chart', 'How long common foods keep. Selected foods from the official chart.');

  doc.fillColor(INK).font('Helvetica').fontSize(9.5);
  const intro =
    'Fridge times keep food from spoiling or becoming dangerous to eat. Freezer times are for quality only: food kept continuously at 0°F (-18°C) or below can be kept indefinitely.';
  doc.text(intro, M, y, { width: W });
  y = doc.y + 8;

  const cols = [112, 194, 108, 118];
  const heads = ['Food', 'Type', 'Fridge\n40°F (4°C) or below', 'Freezer\n0°F (-18°C) or below'];
  const pad = 5;
  const x = (i) => M + cols.slice(0, i).reduce((a, b) => a + b, 0);

  // header row
  doc.rect(M, y, W, 32).fill(GREEN);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.8);
  heads.forEach((h, i) => doc.text(h, x(i) + pad, y + 6, { width: cols[i] - pad * 2 }));
  y += 32;

  doc.fontSize(9.5);
  chart.forEach((row, r) => {
    doc.font('Helvetica');
    const h = Math.max(...row.map((c, i) => doc.heightOfString(c || ' ', { width: cols[i] - pad * 2 }))) + 10.5;
    if (r % 2 === 0) doc.rect(M, y, W, h).fill(TINT);
    row.forEach((c, i) => {
      doc.fillColor(i === 0 ? GREEN : INK).font(i === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(c, x(i) + pad, y + 5.2, { width: cols[i] - pad * 2 });
    });
    y += h;
  });
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.5).strokeColor(LINE).stroke();

  footer(doc, [
    `Source: ${SOURCE.name} (last reviewed ${SOURCE.reviewed}). Selected rows; see the full chart for more foods:`,
    SOURCE.url,
    'These are guidelines. Check food for signs of spoilage before you eat it.   TossLess  ·  tosslessapp.com',
  ]);
  doc.end();
}

function inventory({ file, title, subtitle, location, dateLabel, note, rows }) {
  const doc = makeDoc(file, { title, subject: subtitle });
  let y = header(doc, title, subtitle);
  doc.fillColor(INK).font('Helvetica').fontSize(9).text(note, M, y, { width: W });
  y = doc.y + 10;

  const cols = [196, 92, 40, 82, 82, 40];
  const heads = ['Item', location, 'Qty', dateLabel, 'Use by', 'Done'];
  const x = (i) => M + cols.slice(0, i).reduce((a, b) => a + b, 0);
  doc.rect(M, y, W, 22).fill(GREEN);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
  heads.forEach((h, i) => doc.text(h, x(i) + 6, y + 7, { width: cols[i] - 8, lineBreak: false }));
  y += 22;

  const top = y;
  const rowH = (792 - M - 70 - y) / rows;
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 1) doc.rect(M, y, W, rowH).fill('#F4F8F4');
    doc.moveTo(M, y + rowH).lineTo(M + W, y + rowH).lineWidth(0.5).strokeColor(LINE).stroke();
    // empty checkbox
    doc.roundedRect(x(5) + 14, y + rowH / 2 - 5, 10, 10, 2).lineWidth(0.8).strokeColor(MUTED).stroke();
    y += rowH;
  }
  for (let i = 1; i < cols.length; i++) {
    doc.moveTo(x(i), top).lineTo(x(i), y).lineWidth(0.5).strokeColor(LINE).stroke();
  }
  footer(doc, ['Free printable from TossLess  ·  tosslessapp.com/printables/']);
  doc.end();
}

await mkdir(OUT, { recursive: true });
storageChart();
inventory({
  file: 'freezer-inventory-template.pdf',
  title: 'Freezer inventory',
  subtitle: 'Write down what goes in and when, so nothing gets forgotten.',
  location: 'Shelf / drawer',
  dateLabel: 'Date frozen',
  note: 'Write the date on each item when you freeze it. Put the oldest items at the front and tick them off when they are used.',
  rows: 24,
});
inventory({
  file: 'fridge-inventory-template.pdf',
  title: 'Fridge inventory',
  subtitle: 'See what you have and what to use first.',
  location: 'Shelf / drawer',
  dateLabel: 'Opened / bought',
  note: 'Fill this in after shopping. Put the foods with the soonest dates at the front and tick them off when they are eaten.',
  rows: 24,
});
console.log('Generated 3 PDFs in public/printables/');
