// Build real HTML city routes from the same published GeoJSON used by the map.
// Usage: node scripts/generate-city-pages.cjs [output-directory]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||root);
const publicNames=vm.runInNewContext(fs.readFileSync(path.join(root,'city-publication.js'),'utf8')+';PUBLIC_CITY_NAMES');
const template=fs.readFileSync(path.join(root,'municipality.html'),'utf8');
const metadata=vm.runInNewContext(fs.readFileSync(path.join(root,'municipalities.js'),'utf8')+';MUNICIPALITY_METADATA');
const normalize=s=>String(s||'').trim().normalize('NFC').toLocaleLowerCase('fi');
const slug=s=>normalize(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=new Map();
for(const f of JSON.parse(fs.readFileSync(path.join(root,'talviuintipaikat_enriched.geojson'))).features){
 const p=f.properties||{},name=String(p.kunta||p.paikkakunta||p.municipality||p.city||'').trim();
 if(!name)throw Error('Missing municipality');
 const key=normalize(name);if(!groups.has(key))groups.set(key,{name,features:[]});groups.get(key).features.push(f);
}
const outputs=[],used=new Set();
for(const {name,features} of groups.values()){
 const meta=metadata.find(m=>normalize(m.name_fi)===normalize(name));const route=meta?.slug||slug(name);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route)||used.has(route)||['assets','scripts','index','municipality'].includes(route))throw Error('Invalid/duplicate route '+route);used.add(route);
 const heading=meta?.locative_fi?'Talviuintipaikat '+meta.locative_fi:'Talviuintipaikat – '+name;
 const description=`Löydä avantouinti- ja talviuintipaikat kartalta ja listasta: ${name}. Tutustu ${features.length} kohteeseen.`;
 const cards=features.sort((a,b)=>String(a.properties.nimi||a.properties.name).localeCompare(String(b.properties.nimi||b.properties.name),'fi')).map(f=>{
 const p=f.properties||{};return `<article class="location-card basic-card"><h3>${escape(p.nimi||p.name||'Nimetön paikka')}</h3>${typeof p.address==='string'&&p.address.trim()?'<p class="address">'+escape(p.address.trim())+'</p>':''}<p class="municipality">${escape(name)}</p></article>`;
 }).join('\n');
 let html=template.replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow">').replace('<title>Talviuintipaikat.fi</title>',`<title>${escape(heading)} | Talviuintipaikat.fi</title>`).replace('<meta name="description" content="">',`<meta name="description" content="${escape(description)}">\n  <link rel="canonical" href="https://talviuintipaikat.fi/${route}/">`);
 html=html.replace('data-text="back"></a>','data-text="back">← Takaisin pääkartalle</a>').replace('data-text="heading"></h1>',`data-text="heading">${escape(heading)}</h1>`).replace('data-text="intro"></p>',`data-text="intro">${escape(description)}</p>`).replace('data-text="loadingCount"></p>',`data-text="loadingCount">${features.length} talviuintipaikkaa</p>`).replace('<!-- STATIC_CITY_CONTENT -->',`<section id="static-city-content" aria-label="Kohdelista">${cards}</section>`);
 const published=publicNames.some(n=>normalize(n)===normalize(name));
 if(!published) html=html.replace('content="index,follow"','content="noindex,nofollow"');
 outputs.push({route,html,count:features.length,published,name});
}
// Validate every route before writing any output.
for(const {route,html}of outputs){const dir=path.join(out,route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);}
const hidden=outputs.filter(p=>!p.published);
const redirects=['# Generated publication gates; hidden city HTML remains preserved.', '/helsinki.html /helsinki/ 301', ...hidden.flatMap(p=>[`/${p.route} / 302!`, `/${p.route}/* / 302!`])];
fs.writeFileSync(path.join(out,'_redirects'),redirects.join('\n')+'\n');
console.log(JSON.stringify({published:outputs.filter(p=>p.published).length,hidden:hidden.length,waiting:publicNames.filter(n=>!outputs.some(p=>normalize(p.name)===normalize(n))),cities:outputs.length,places:outputs.reduce((n,p)=>n+p.count,0),output:out}));
