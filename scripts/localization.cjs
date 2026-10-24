// Translate UI markup only; venue records, identifiers and form keys are unchanged.
const copy=require('./en-copy.json');
const slugs=['lapland','north-ostrobothnia-and-kainuu','eastern-finland','central-finland-and-tampere-region','west-coast-and-ostrobothnia','southern-finland-and-archipelago'];
const routes={'/':'/en/','/kunnat.html':'/en/regions/','/analytiikan-tietosuoja.html':'/en/analytics-privacy/'};
require('./regions.cjs').forEach((a,i)=>routes['/alueet/'+a.slug+'/']='/en/regions/'+slugs[i]+'/');
const escape=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function text(s){
 const trimmed=s.trim();if(copy[trimmed])return s.replace(trimmed,copy[trimmed]);
 let result=s;
 for(const [fi,en] of Object.entries(copy).sort((a,b)=>b[0].length-a[0].length)){
  const i=result.indexOf(fi);if(i>=0 && /^[📍↩︎＋★💡📌\s]*$/u.test(result.slice(0,i)) && result.trimEnd().endsWith(fi))result=result.slice(0,i)+en;
 }
 return result.replace(/Tutustu (\d+) talviuintipaikkaan kartalla ja listassa\./g,'Browse $1 winter swimming spots on the map.').replace(/(\d+) talviuintipaikkaa\b/g,(_,n)=>`${n} winter swimming ${Number(n)===1?'spot':'spots'}`).replace(/(\d+) kohdetta/g,(_,n)=>`${n} swimming ${Number(n)===1?'spot':'spots'}`).replace(/(\d+) paikkakuntaa/g,'$1 towns and cities').replace(/6 aluetta/g,'6 regions').replace(/Koko alue · /g,'All locations · ').replace(/Talviuintipaikkojen kartta: /g,'Winter swimming map: ').replace(/Talviuintipaikat – /g,'Winter swimming spots – ').replace(/Tutustu (\d+) talviuintipaikkaan kartalla ja listassa\./g,'Explore $1 winter swimming spots on the map and in the list.');
}
function route(url){const m=url.match(/^([^?#]*)(.*)$/);return (routes[m[1]]||m[1])+m[2];}
function markup(html){return html.split(/(<article class="place-card"[\s\S]*?<\/article>|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->)/gi).map(part=>{
 if(part.startsWith('<article class="place-card"'))return part.replace('>Reittiohjeet ↗<','>Directions ↗<').replace('>Kohteen lisätiedot ↗<','>More about this spot ↗<');
 if(/^<(script|style|!--)/i.test(part))return part;
 return part.replace(/>([^<>]+)</g,(_,s)=>'>'+escape(text(s.replace(/&amp;/g,'&')))+'<').replace(/\b(aria-label|title|alt|placeholder|content)="([^"]*)"/g,(_,a,s)=>a+'="'+escape(text(s.replace(/&amp;/g,'&')))+'"').replace(/href="(\/[^" ]*)"/g,(_,url)=>'href="'+route(url)+'"');
}).join('');}
function alternates(fi){return `<link rel="alternate" hreflang="fi" href="https://talviuintipaikat.fi${fi}"><link rel="alternate" hreflang="en" href="https://talviuintipaikat.fi${routes[fi]}">`;}
function switcher(fi,en,lang){return `<nav class="language-switch" aria-label="${lang==='en'?'Language':'Kieli'}"><a href="${fi}" lang="fi"${lang==='fi'?' aria-current="page"':''}>FI</a><a href="${en}" lang="en"${lang==='en'?' aria-current="page"':''}>EN</a></nav>`;}
module.exports={copy,text,markup,route,routes,alternates,switcher};
