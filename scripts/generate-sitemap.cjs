// Run from any directory: node scripts/generate-sitemap.cjs
// Explicit metadata slugs override automatic Finnish-name normalization.
// Unsafe or ambiguous slugs stop generation before any output is written.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'talviuintipaikat_enriched.geojson'), 'utf8'));
const metadata = vm.runInNewContext(fs.readFileSync(path.join(root, 'municipalities.js'), 'utf8') + '\nMUNICIPALITY_METADATA;', {}, { timeout: 1000 });
const normalize = s => String(s ?? '').trim().normalize('NFC').toLocaleLowerCase('fi');
const fallbackSlug = s => normalize(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cities = new Map();
for (const feature of data.features) {
  const props = feature.properties || {};
  const name = String(props.kunta || props.paikkakunta || props.municipality || props.city || '').trim();
  if (!name) throw new Error('Feature without municipality');
  cities.set(normalize(name), name);
}
const slugs = new Map();
for (const [key, name] of cities) {
  const matches = metadata.filter(m => normalize(m.name_fi) === key);
  if (matches.length > 1) throw new Error('Duplicate metadata: ' + name);
  slugs.set(key, matches[0]?.slug || fallbackSlug(name));
}
const included = [];
let automatic = 0;
for (const [key, name] of cities) {
  const meta = metadata.find(m => normalize(m.name_fi) === key);
  const slug = slugs.get(key);
  if (!meta?.slug) automatic++;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || ['assets', 'municipality', 'index'].includes(slug)) throw new Error('Unsafe slug: ' + name);
  if ([...slugs.values()].filter(s => s === slug).length !== 1) throw new Error('Ambiguous slug: ' + slug);
  included.push(slug);
}
included.sort();
const urls = ['https://talviuintipaikat.fi/', ...included.map(s => `https://talviuintipaikat.fi/${s}/`)];
if (new Set(urls).size !== urls.length) throw new Error('Duplicate sitemap URLs');
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(root, 'sitemap-missing-municipalities.txt'), `Municipalities in GeoJSON: ${cities.size}\nMunicipality URLs in sitemap: ${included.length}\nAutomatically generated slugs: ${automatic}\nExplicit metadata slugs: ${cities.size - automatic}\nMunicipalities without safe slug: 0\nSlug duplicates: 0\n`);
console.log(`${included.length}/${cities.size} municipality URLs; ${automatic} automatic slugs; 0 missing safe slugs; homepage included.`);
