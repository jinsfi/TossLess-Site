// One entry per printable. The PDF lives at public/printables/<id>.pdf; until that file exists the
// card shows "Coming soon". An optional preview image goes at src/assets/printables/<id>.png (or .jpg/.webp).
// `articles` lists article slugs (src/content/blog/<slug>.md) that go with this printable. Only published
// articles are linked, and each of those articles links back to the printable once the PDF exists.
export interface Printable {
  id: string;
  title: string;
  description: string;
  articles: string[];
}

export const printables: Printable[] = [
  {
    id: 'fridge-freezer-storage-chart',
    title: 'Fridge and freezer storage chart',
    description: 'A one-page chart of how long common foods keep in the fridge and freezer.',
    articles: ['fridge-freezer-storage-chart'],
  },
  {
    id: 'freezer-inventory-template',
    title: 'Freezer inventory template',
    description: 'A sheet to track what is in your freezer and when it went in.',
    articles: ['freezer-inventory-template'],
  },
  {
    id: 'fridge-inventory-template',
    title: 'Fridge inventory template',
    description: 'A sheet to track what is in your fridge and what to use first.',
    articles: ['fridge-inventory-template'],
  },
];
