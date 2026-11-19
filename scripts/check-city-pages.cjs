// Verify that every published municipality uses the shared modern renderer.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const names=vm.runInNewContext(fs.readFileSync('city-publication.js','utf8')+';PUBLIC_CITY_NAMES');
const metadata=vm.runInNewContext(fs.readFileSync('municipalities.js','utf8')+';MUNICIPALITY_METADATA');
const features=JSON.parse(fs.readFileSync('talviuintipaikat_enriched.geojson')).features;
const slug=s=>s.toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let checked=0;
for(const name of names){
 const expected=features.filter(f=>f.properties.kunta===name);if(!expected.length)continue;
 const route=metadata.find(m=>m.name_fi===name)?.slug||slug(name);
 const html=fs.readFileSync(`dist/${route}/index.html`,'utf8');
 assert(html.includes('id="region-map"'),route+' modern map');
 assert(!html.includes('id="static-city-content"'),route+' legacy renderer');
 const cities=[...html.matchAll(/class="place-card"[^>]*data-city="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(cities.length,expected.length,route+' count');assert(cities.every(c=>c===name),route+' wrong municipality');
 assert(html.includes(`rel="canonical" href="https://talviuintipaikat.fi/${route}/"`),route+' canonical');
 assert(!html.includes('undefined'),route+' invalid alternate');
 checked++;
}
const redirects=fs.readFileSync('dist/_redirects','utf8');
for(const city of ['Helsinki','Espoo','Vantaa'])assert(redirects.includes(`/kaupungit/helsingin-seutu/ kunta=${city} /${city.toLowerCase()}/ 301!`));
assert(!redirects.includes('/turku/ kunta=Turku'), 'no self redirect');
console.log(`PASS: ${checked} public municipality pages use the shared renderer, exact municipality data and short canonical URLs; group redirects have distinct targets.`);
