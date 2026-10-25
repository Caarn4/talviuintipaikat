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
 menu.innerHTML=en ? '<a id="navigationMap" href="#kartta">Map</a><a href="/regions/">Regions</a><details class="ws-more"><summary>Learn more <span aria-hidden="true">⌄</span></summary><div><a href="/find/">Find</a><a href="/learn/">Learn</a><a href="/experience/">Experience</a></div></details>' : '<a id="navigationMap" href="#kartta">Avantokartta</a><a href="/kunnat.html">Alueet</a>';
 menu.insertAdjacentHTML('beforeend','<a href="#kartta" data-map-suggest class="ws-suggest">'+(en?'Suggest a missing swimming spot':'Vinkkaa puuttuva paikka')+'</a><a class="ws-suggest" href="'+(en?'/analytics-privacy/':'/analytiikan-tietosuoja.html')+'">'+(en?'Privacy':'Tietosuoja')+'</a><a href="'+(en?'https://talviuintipaikat.fi/':'https://winterswim.fi/')+'">'+(en?'Suomeksi':'English')+'</a>');
 let opener=heroButton;
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('.tu-hero__menu-btn,#mToggleControls');
  if(!trigger)return;
  e.preventDefault();e.stopImmediatePropagation();opener=trigger;
  nav.classList.remove('is-open');dialog.showModal();trigger.setAttribute('aria-expanded','true');
 },true);
 dialog.addEventListener('close',()=>{heroButton.setAttribute('aria-expanded','false');mapButton.setAttribute('aria-expanded','false');requestAnimationFrame(()=>opener.focus());});
 const intro=document.querySelector('.map-introduction');
 const open=intro.querySelector('.map-preview-link');
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
