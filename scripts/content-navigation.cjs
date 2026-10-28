// Shared English navigation: the map and regions are the primary product actions.
module.exports=function(html){
 const hero=html.includes('class="tu-hero"');
 const secondary='<a class="ws-main-link" href="'+(hero?'#kartta':'/#kartta')+'">Map</a><a class="ws-main-link" href="/regions/">Regions</a><details class="ws-more"><summary>Learn more <span aria-hidden="true">⌄</span></summary><div><a href="/find/">Find</a><a href="/learn/">Learn</a><a href="/experience/">Experience</a></div></details><a class="ws-suggest" href="'+(hero?'#kartta':'/?suggest=1#kartta')+'" '+(hero?'data-tu-action="suggest"':'')+'>Suggest a missing swimming spot</a><a class="ws-suggest" href="/partners/">Partner with us</a>';
 if(hero){
  html=html.replace('class="tu-hero__bar"','class="tu-hero__bar ws-header"');
  html=html.replace(/(<button class="tu-hero__menu-btn"[^>]*>).*?(<\/button>)/,'$1<span aria-hidden="true">☰</span> Menu$2');
  html=html.replace(/(<nav class="tu-hero__nav"[^>]*>)[\s\S]*?(<div class="tu-hero__lang">)/,'$1'+secondary+'$2');
 }else{
  html=html.replace(/<header class="(wrap|site-header)">([\s\S]*?)<\/header>/,(_,cls,body)=>{
   const brand=body.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0];if(!brand)return _;
   return '<header class="'+cls+' ws-header">'+brand+'<button class="ws-toggle" aria-label="Menu" aria-expanded="false" aria-controls="ws-secondary">☰ <span class="ws-sr">Menu</span></button><nav id="ws-secondary" class="ws-secondary" aria-label="Main navigation">'+secondary+'</nav></header>';
  });
 }
 return html.replace('</head>','<link rel="stylesheet" href="/assets/content-navigation.css"><script defer src="/assets/content-navigation.js"></script></head>');
};
