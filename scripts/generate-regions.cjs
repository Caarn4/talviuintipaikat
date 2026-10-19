const fs=require('node:fs'),path=require('node:path');
const areas=require('./regions.cjs');
const root=path.resolve(__dirname,'..');
const mapping=require('./data/municipality-regions-2026.json').municipalities;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const aliases={'Kittilä':['Levi'],'Kolari':['Ylläs'],'Inari':['Saariselkä'],'Kuusamo':['Ruka'],'Sotkamo':['Vuokatti'],'Pelkosenniemi':['Pyhä'],'Sodankylä':['Luosto'],'Savonlinna':[],'Puumala':[],'Lappeenranta':[],'Imatra':[]};
const brand='<header class="site-header"><a class="brand" href="/"><img src="/assets/images/logo-v1-mobile.png" width="72" height="86" alt=""><span><strong>Talviuintipaikat.fi</strong><small>Suomen kattavin avantokarttapalvelu</small></span></a><a class="button" href="/#kartta">Pääkartalle ↗</a></header>';
function shell(title,description,url,body,map=false){return `<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Talviuintipaikat.fi</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://talviuintipaikat.fi${url}"><link rel="stylesheet" href="/assets/regions.css"><link rel="stylesheet" href="/assets/analytics.css"><script defer src="/assets/analytics.js"></script>${map?'<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script defer src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>':''}<script defer src="/assets/regions.js"></script></head><body><main>${brand}${body}<footer><a href="/kunnat.html">Tutustu alueisiin</a><a href="/analytiikan-tietosuoja.html">Analytiikan tietosuoja</a></footer></main></body></html>`;}
function safeUrl(v){try {let u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}}
module.exports=function(out,cities){
 const features=JSON.parse(fs.readFileSync(path.join(root,'talviuintipaikat_enriched.geojson'))).features;
 const memberships=new Map();
 for(const f of features){const city=f.properties.kunta;const matches=areas.filter(a=>a.regions.includes(mapping[city]));if(matches.length!==1)throw Error('Region missing/ambiguous: '+city);memberships.set(f,matches[0].slug);}
 const publicCities=new Map(cities.filter(c=>c.published).map(c=>[c.name,c]));
 const summary=areas.map(a=>({...a,features:features.filter(f=>memberships.get(f)===a.slug)}));
 const outline=require('./data/finland-outline.json');
 const visitPartners=require('./data/visit-partners.json');
 const project=([lon,lat])=>[ ((lon-19)*6+8).toFixed(1), ((71-lat)*10+4).toFixed(1) ];
 const silhouette=outline.rings.map(r=>r.map((p,i)=>(i?'L':'M')+project(p).join(',')).join(' ')+'Z').join(' ');
 function miniMap(area){
  const dots=features.slice().sort((a,b)=>(memberships.get(a)===area.slug)-(memberships.get(b)===area.slug)).map(f=>{const [x,y]=project(f.geometry.coordinates);const active=memberships.get(f)===area.slug;return `<circle cx="${x}" cy="${y}" r="${active?'1.8':'0.9'}" class="${active?'area-dot':'other-dot'}"/>`;}).join('');
  return `<svg class="area-map" viewBox="0 0 100 135" aria-hidden="true"><path class="finland-outline" d="${silhouette}"/>${dots}</svg>`;
 }
 function partnerLogos(area){
  const partners=(visitPartners[area.slug]||[]).filter(p=>p.approved===true);
  if(!partners.length)return '';
  return `<div class="visit-partners"><span class="visit-label">Näkyvyysyhteistyössä</span><div class="visit-logos">${partners.map(p=>{
   if(!p.name||!p.scope||!/^\/assets\/images\/[a-zA-Z0-9_/-]+\.(svg|png|webp)$/.test(p.logo)||!fs.existsSync(path.join(root,p.logo)))throw Error('Invalid approved Visit partner: '+area.slug);
   return `<span class="visit-partner"><img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy"><small>${esc(p.scope)}</small></span>`;
  }).join('')}</div></div>`;
 }
 const cards=summary.map(a=>`<a class="area-card" href="/alueet/${a.slug}/">${miniMap(a)}<div class="area-copy"><h2>${esc(a.name)}</h2><span class="area-count">${a.features.length} talviuintipaikkaa</span><p>${esc(a.intro)}</p><span class="discover">Tutustu alueeseen →</span>${partnerLogos(a)}</div></a>`).join('');
 const searchItems=summary.map(a=>({label:a.name,aliases:a.slug==='ita-suomi'?['Saimaa']:[],area:`Koko alue · ${a.features.length} kohdetta`,url:`/alueet/${a.slug}/`}));
 for(const a of summary){const names=[...new Set(a.features.map(f=>f.properties.kunta))].sort((a,b)=>a.localeCompare(b,'fi'));for(const name of names){const city=publicCities.get(name);searchItems.push({label:name,aliases:aliases[name]||[],area:a.name,url:city?`/${city.route}/`:`/alueet/${a.slug}/?kunta=${encodeURIComponent(name)}`});}}
 searchItems.push({label:'Ylläs / Kolari',aliases:['Ylläs'],area:'Ei vielä kohteita aineistossa – selaa Lapin muita kohteita',url:'/alueet/lappi/'});
 // Preserve the large-city collection as an explicit disabled feature, not a visible competing hierarchy.
 const showLargeCities=false;
 const largeCities=cities.filter(c=>c.published&&['Helsinki','Espoo','Tampere','Vantaa','Oulu','Turku','Jyväskylä','Kuopio','Lahti','Pori'].includes(c.name));
 const large=showLargeCities?`<section><h2>Suuret kaupungit</h2>${largeCities.map(c=>`<a href="/${c.route}/">${esc(c.name)}</a>`).join(' ')}</section>`:'';
 const body=`<section class="intro"><span class="eyebrow">Löydä oma pulahduspaikkasi</span><h1>Minne olet menossa?</h1><p>Selaa talviuintipaikkoja alueittain tai etsi tuttu kaupunki ja matkailukohde.</p><div class="search-box"><label for="destination">Etsi kaupunki tai matkailukohde</label><input id="destination" type="search" placeholder="Esimerkiksi Helsinki, Levi tai Saimaa" autocomplete="off" aria-controls="destinations"><p id="search-status" role="status" hidden></p><ul id="destinations" hidden></ul><noscript><p>Nimihaku tarvitsee JavaScriptin. Voit selata alueita alla.</p></noscript></div></section><section aria-label="Selaa alueittain"><div class="section-heading"><h2>Tutustu alueisiin</h2><span>${features.length} kohdetta · 6 aluetta</span></div><div class="area-grid">${cards}</div><p class="note">Turkoosit pisteet ovat alueen talviuintipaikkoja. Harmaat pisteet ovat palvelun muita kohteita. Kohdemäärät perustuvat nykyiseen aineistoomme.</p></section>${large}<script type="application/json" id="destination-data">${JSON.stringify(searchItems).replace(/</g,'\\u003c')}</script>`;
 fs.writeFileSync(path.join(out,'kunnat.html'),shell('Tutustu alueisiin', 'Löydä talviuintipaikat Lapista, Itä-Suomesta ja muualta Suomesta. Hae kaupunkia tai matkailukohdetta ja tutustu alueiden karttoihin.','/kunnat.html',body));
 for(const a of summary){
 const names=[...new Set(a.features.map(f=>f.properties.kunta))].sort((a,b)=>a.localeCompare(b,'fi'));
 const citylinks=names.map(n=>publicCities.has(n)?`<a href="/${publicCities.get(n).route}/">${esc(n)}</a>`:`<a href="?kunta=${encodeURIComponent(n)}#kohteet">${esc(n)}</a>`).join('');
 const list=a.features.slice().sort((x,y)=>x.properties.kunta.localeCompare(y.properties.kunta,'fi')||x.properties.nimi.localeCompare(y.properties.nimi,'fi')).map((f,i)=>{const p=f.properties;const [lon,lat]=f.geometry.coordinates;const website=safeUrl(p.website||p.url||p.lipas_url);return `<article class="place-card" id="kohde-${i}" data-city="${esc(p.kunta)}" data-lat="${lat}" data-lon="${lon}"><span class="eyebrow">${esc(p.kunta)}</span><h3>${esc(p.nimi||p.name)}</h3>${p.address?`<p>${esc(p.address)}</p>`:''}<div class="actions"><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" rel="noopener noreferrer">Reittiohjeet ↗</a>${website?`<a href="${esc(website)}" target="_blank" rel="noopener noreferrer">Kohteen lisätiedot ↗</a>`:''}</div></article>`;}).join('');
 const body=`<nav class="breadcrumb" aria-label="Murupolku"><a href="/kunnat.html">Alueet</a><span> / ${esc(a.name)}</span></nav><section class="intro"><span class="eyebrow">${a.features.length} talviuintipaikkaa · ${names.length} paikkakuntaa</span><h1>Talviuintipaikat – ${esc(a.name)}</h1><p>${esc(a.intro)}</p><details class="coverage"><summary>Mitä alueeseen kuuluu?</summary><p>${esc(a.regions.join(', '))}. Kartta ja lista sisältävät kaikki tämän alueen kohteet palvelun aineistosta, myös kunnista, joilla ei vielä ole omaa esittelysivua.</p></details></section><section aria-label="Alueen kartta"><div id="region-map" role="region" aria-label="Talviuintipaikkojen kartta: ${esc(a.name)}"></div><p id="map-status" class="note" role="status">Kohteet löytyvät myös alla olevasta listasta.</p></section><section id="kohteet"><div class="section-heading"><h2>Alueen talviuintipaikat</h2><span id="place-count" role="status">${a.features.length} kohdetta</span></div><div class="filter-row" hidden><label for="city-filter">Rajaa paikkakuntaan</label><select id="city-filter"><option value="">Kaikki paikkakunnat</option>${names.map(n=>`<option>${esc(n)}</option>`).join('')}</select><button id="clear-filter" type="button">Näytä kaikki</button></div><div class="places-grid">${list}</div></section><section><h2>Paikkakunnat alueella</h2><div class="city-links">${citylinks}</div></section>`;
 const dir=path.join(out,'alueet',a.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),shell(`Talviuintipaikat – ${a.name}`,`${a.intro} Tutustu ${a.features.length} talviuintipaikkaan kartalla ja listassa.`,`/alueet/${a.slug}/`,body,true));
 }
 console.log('Areas: '+summary.map(a=>a.name+' '+a.features.length).join('; '));
};
