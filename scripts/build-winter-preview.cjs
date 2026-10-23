// English-only deploy preview. Production continues to use build-site.cjs.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),out=path.join(root,'dist-preview');
execFileSync(process.execPath,[path.join(__dirname,'build-site.cjs')],{stdio:'inherit'});
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(path.join(dist,'en'),out,{recursive:true});
for(const name of ['assets','talviuintipaikat_enriched.geojson']) fs.cpSync(path.join(dist,name),path.join(out,name),{recursive:true});
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,f.name);if(f.isDirectory())walk(file);else if(f.name.endsWith('.html')){
 let html=fs.readFileSync(file,'utf8').replace('<html lang="en"','<html lang="en" data-preview="true"').replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
 html=html.replace(/<form name="talviuintipaikka-vinkki"[\s\S]*?<\/form>/,'');
 html=html.replace('<body>','<body><div style="padding:8px 16px;background:#102b3f;color:#fff;font:13px/1.4 system-ui;text-align:center">WinterSwim preview · Analytics and form submissions are disabled.</div>');
 fs.writeFileSync(file,html);
}}}
walk(out);
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n');
fs.writeFileSync(path.join(out,'_redirects'),'/en/* /:splat 301\n');
console.log('English-only preview ready: '+out);
