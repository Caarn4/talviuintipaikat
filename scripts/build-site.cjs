// One deployment, shared assets/data, two public domains. Build output is disposable.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const i18n=require('./localization.cjs'),FI='https://talviuintipaikat.fi',EN='https://winterswim.fi';
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const file of ['assets','index.html','municipality.html','analytiikan-tietosuoja.html','municipalities.js','city-publication.js','talviuintipaikat_enriched.geojson','robots.txt'])fs.cpSync(path.join(root,file),path.join(out,file),{recursive:true});
execFileSync(process.execPath,[path.join(root,'scripts/generate-city-pages.cjs'),out],{stdio:'inherit'});
execFileSync(process.execPath,[path.join(root,'scripts/generate-sitemap.cjs')],{stdio:'inherit'});
const contentRoutes=['/find/','/learn/','/experience/'];
for(const route of contentRoutes){
 const dir=path.join(out,'en',route.slice(1));fs.mkdirSync(dir,{recursive:true});
 fs.copyFileSync(path.join(root,'scripts/content-pages',route.split('/')[1]+'.html'),path.join(dir,'index.html'));
}
function convert(html,english){
 html=html.replaceAll(FI+'/en/',EN+'/');
 html=html.replace(/src="\/assets\/(?:images\/logo-v1-mobile.png|content\/logo.png)"/g,'src="/assets/images/winterswim-logo-v2.webp"');
  html=html.replace('</head>','<link rel="stylesheet" href="/assets/winterswim-brand.css"></head>');
 if(english){
  html=require('./content-navigation.cjs')(html);
  // Only language links go to the Finnish host. English navigation stays same-origin.
  html=html.replace(/<a\b[^>]*lang="fi"[^>]*>/g,tag=>tag.replace(/href="(\/[^" ]*)"/,(_,url)=>`href="${FI}${url}"`));
  html=html.replace(/(["'])\/en\//g,'$1/').replace('<html lang="en"','<html lang="en" data-site="winterswim"');
  html=html.replaceAll('>Talviuintipaikat.fi','>WinterSwim.fi').replaceAll(' | Talviuintipaikat.fi</title>',' | WinterSwim.fi</title>').replaceAll(' – Talviuintipaikat.fi</title>',' – WinterSwim.fi</title>');
  const guideNav=html.includes('class="article-layout"')||html.includes('class="find-grid"')?'':'<nav aria-label="Winter swimming guides" style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:12px"><a href="/find/">Find a place</a><a href="/learn/">Your first winter swim</a><a href="/experience/">Experience Finland</a></nav>';
  html=html.replace('</body>','<footer class="winter-brand-note" style="padding:16px;font:14px/1.5 system-ui">'+guideNav+'WinterSwim.fi is the English edition of <a href="'+FI+'/">Talviuintipaikat.fi</a>.</footer></body>');
 }else html=html.replace(/href="\/en\//g,'href="'+EN+'/');
 return html;
}
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,f.name);if(f.isDirectory()&&f.name!=='assets')walk(file);else if(f.isFile()&&f.name.endsWith('.html'))fs.writeFileSync(file,convert(fs.readFileSync(file,'utf8'),file.startsWith(path.join(out,'en')+path.sep)));}}
walk(out);
const enPaths=Object.values(i18n.routes).map(p=>p.slice(3)).concat(contentRoutes);
const xml=urls=>'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'  <url><loc>'+u+'</loc></url>').join('\n')+'\n</urlset>\n';
const fiUrls=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]).filter(u=>!u.startsWith(FI+'/en/'));
fiUrls.push(FI+'/analytiikan-tietosuoja.html');
fs.writeFileSync(path.join(out,'sitemap.xml'),xml([...new Set(fiUrls)]));
fs.writeFileSync(path.join(out,'en/sitemap.xml'),xml(enPaths.map(p=>EN+p)));
fs.writeFileSync(path.join(out,'en/robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+EN+'/sitemap.xml\n');
fs.writeFileSync(path.join(out,'en/404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | WinterSwim.fi</title><body><h1>Page not found</h1><p><a href="/">Find winter swimming spots</a> or <a href="/regions/">browse by region</a>.</p></body></html>');
const rules=['# WinterSwim domain routing. Specific rules precede Finnish publication gates.'];
for(const protocol of ['https','http']){
 rules.push(`${protocol}://www.winterswim.fi/* ${EN}/:splat 301!`);
 for(const host of ['talviuintipaikat.fi','www.talviuintipaikat.fi']){
  rules.push(`${protocol}://${host}/en ${EN}/ 301!`,`${protocol}://${host}/en/* ${EN}/:splat 301!`);
 }
}
rules.push(`http://winterswim.fi/* ${EN}/:splat 301!`);
// Legacy /en paths also collapse on the English host.
rules.push(`${EN}/en ${EN}/ 301!`,`${EN}/en/* ${EN}/:splat 301!`);
for(const p of enPaths){
 const target='/en'+p+'index.html';
 rules.push(`${EN}${p} ${target} 200!`);
 if(p!=='/')rules.push(`${EN}${p.slice(0,-1)} ${target} 200!`);
 rules.push(`${EN}${p}index.html ${EN}${p} 301!`);
}
rules.push(`${EN}/robots.txt /en/robots.txt 200!`,`${EN}/sitemap.xml /en/sitemap.xml 200!`);
// Shared resources are served before the domain-specific 404, with no Finnish HTML fallback.
rules.push(`${EN}/assets/* /assets/:splat 200!`,`${EN}/talviuintipaikat_enriched.geojson /talviuintipaikat_enriched.geojson 200!`,`${EN}/* /en/404.html 404!`);
fs.writeFileSync(path.join(out,'_redirects'),rules.join('\n')+'\n'+fs.readFileSync(path.join(out,'_redirects'),'utf8'));
console.log('Dual domain build ready: '+out);
