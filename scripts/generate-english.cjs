const fs=require('node:fs'),path=require('node:path'),i18n=require('./localization.cjs');
const root=path.resolve(__dirname,'..');
module.exports=function(out){
 const locale='/* Generated shared UI catalog; venue data is not translated. */\n(()=>{const copy='+JSON.stringify(i18n.copy)+';const en=document.documentElement.lang==="en";window.TWLocale={en,text:s=>en?(copy[s]||s):s};})();\n';
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});fs.writeFileSync(path.join(out,'assets/locale.js'),locale);
 let html=i18n.markup(fs.readFileSync(path.join(root,'index.html'),'utf8')).replace('lang="fi"','lang="en"');
 html=html.replace('<a data-language-switch href="/en/" lang="en">English</a>','<a data-language-switch href="/" lang="fi">Suomeksi</a>');
 html=html.replace('<link rel="canonical" href="https://talviuintipaikat.fi/">','<link rel="canonical" href="https://talviuintipaikat.fi/en/">');
 html=html.replace('<a href="/en/" aria-current="true" lang="fi">FI</a> <a href="/en/" lang="en">EN</a>','<a href="/" lang="fi">FI</a> <a href="/en/" aria-current="true" lang="en">EN</a>');
 html=html.replace('</section>\n\n  <!-- helper', '<noscript><p><a href="/en/regions/">Browse winter swimming spots by region without JavaScript.</a></p></noscript></section>\n\n  <!-- helper');
 html=html.replace('$("btnAdd").addEventListener("click", openAddModal);','$("btnAdd").addEventListener("click", openAddModal);\n      if(new URLSearchParams(location.search).get("suggest")==="1") openAddModal();');
 const guideLinks='<a href="/find/">Find a place</a><a href="/learn/">Your first winter swim</a><a href="/experience/">Experience Finland</a>';
 html=html.replace(/(<nav class="navigationLinks"[^>]*>)/, '$1'+guideLinks);
 html=html.replace(/(<nav class="tu-hero__nav"[^>]*>\s*<ul>)/, '$1'+['Find','Learn','Experience'].map(label=>'<li><a href="/'+label.toLowerCase()+'/">'+label+'</a></li>').join(''));
 fs.mkdirSync(path.join(out,'en'),{recursive:true});fs.writeFileSync(path.join(out,'en/index.html'),html);
 let privacy=fs.readFileSync(path.join(root,'scripts/analytics-privacy-en.html'),'utf8');
 privacy=privacy.replace('</head>',i18n.alternates('/analytiikan-tietosuoja.html')+'</head>').replace('<body>','<body>'+i18n.switcher('/analytiikan-tietosuoja.html','/en/analytics-privacy/','en'));
 fs.mkdirSync(path.join(out,'en/analytics-privacy'),{recursive:true});fs.writeFileSync(path.join(out,'en/analytics-privacy/index.html'),privacy);
};
