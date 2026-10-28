/* A separate mobile map state shares the existing map, data and venue cards. */
(()=>{
 const section=document.getElementById('kartta');
 if(!section)return;
 const en=document.documentElement.lang==='en', mobile=matchMedia('(max-width:920px)');
 const hero=document.querySelector('.tu-hero'), dialog=document.getElementById('mobileNavigation');
 const heroButton=hero.querySelector('.tu-hero__menu-btn'), mapButton=document.getElementById('mToggleControls');
 const nav=hero.querySelector('.tu-hero__nav');
 // Both entry points open exactly the same dialog. Preserve legacy IDs used by the map.
 const menu=dialog.querySelector('.navigationLinks');
 menu.innerHTML=en ? '<a id="navigationMap" href="#kartta">Map</a><a href="/regions/">Regions</a><details class="ws-more"><summary>Learn more <span aria-hidden="true">⌄</span></summary><div><a href="/find/">Find</a><a href="/learn/">Learn</a><a href="/experience/">Experience</a></div></details>' : '<a id="navigationMap" href="#kartta">Avantokartta</a><a href="/kunnat.html">Alueet</a><a href="/kumppaniksi/">Kumppaniksi?</a>';
 menu.insertAdjacentHTML('beforeend','<a href="#kartta" data-map-suggest class="ws-suggest">'+(en?'Suggest a missing swimming spot':'Vinkkaa puuttuva paikka')+'</a><a class="ws-suggest" href="'+(en?'/analytics-privacy/':'/analytiikan-tietosuoja.html')+'">'+(en?'Privacy':'Tietosuoja')+'</a><a href="'+(en?'https://talviuintipaikat.fi/':'https://winterswim.fi/')+'">'+(en?'Suomeksi':'English')+'</a>');
 let opener=heroButton;
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('.tu-hero__menu-btn,#mToggleControls');
  if(!trigger)return;
  e.preventDefault();e.stopImmediatePropagation();opener=trigger;
  nav.classList.remove('is-open');dialog.showModal();trigger.setAttribute('aria-expanded','true');
 },true);
 dialog.addEventListener('close',()=>{heroButton.setAttribute('aria-expanded','false');mapButton.setAttribute('aria-expanded','false');requestAnimationFrame(()=>opener.focus());});
 const intro=document.createElement('section');intro.className='map-introduction';
 intro.innerHTML='<div><h2>'+(en?'Find your winter swimming spot':'Löydä oma talviuintipaikkasi')+'</h2><p>'+(en?'Explore nearly 500 places across Finland. Search by name or town, find a spot near you, or browse the map from the southern coast to Lapland.':'Tutustu lähes 500 talviuintipaikkaan ympäri Suomen. Hae nimellä tai paikkakunnalla, löydä lähimmät avannot tai selaa karttaa etelärannikolta Lappiin.')+'</p></div><a class="map-preview-link" href="#kartta"><img src="/assets/content/map-clean.png" alt="'+(en?'Preview of the winter swimming map of Finland':'Esikatselu Suomen avantokartasta')+'" width="1200" height="800"><span>'+(en?'Explore the map →':'Tutustu avantokarttaan →')+'</span></a>';
 hero.after(intro);const open=intro.querySelector('a');
 const back=document.createElement('a');back.href='#';back.className='map-home';back.textContent=en?'← Home':'← Etusivu';
 menu.prepend(back);
 const desktopBack=back.cloneNode(true);document.querySelector('.sidebarHeader').prepend(desktopBack);
 function leave(e){e.preventDefault();if(dialog.open)dialog.close();history.replaceState(null,'',location.pathname+location.search);sync();}
 back.addEventListener('click',leave);desktopBack.addEventListener('click',leave);
 let savedY=0;
 function sync(){
  const active=location.hash==='#kartta';
  const was=document.body.classList.contains('map-mode');
  if(active&&!was)savedY=scrollY;
  document.body.classList.toggle('map-mode',active);
  hero.inert=active;intro.inert=active;section.inert=!active;
  if(was&&!active){window.scrollTo({top:savedY,behavior:'instant'});open.focus({preventScroll:true});}
  requestAnimationFrame(()=>document.dispatchEvent(new Event('tu-hero:map-visible')));
 }
 function enter(){if(location.hash!=='#kartta')location.hash='kartta';else sync();}
 document.addEventListener('click',e=>{
  const link=e.target.closest('a[href="#kartta"]');if(!link)return;
  e.preventDefault();e.stopImmediatePropagation();if(dialog.open)dialog.close();enter();
  if(link.hasAttribute('data-map-suggest')||link.dataset.tuAction==='suggest')requestAnimationFrame(()=>document.getElementById('mBtnAdd').click());
 },true);
 window.addEventListener('hashchange',sync);mobile.addEventListener('change',sync);sync();
})();
