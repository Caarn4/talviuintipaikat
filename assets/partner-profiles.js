/* Shared partner content, cards and profile pages. */
(() => {
 'use strict';
 const storeKey='tw-partner-origin';
 const en=document.documentElement.lang==='en';
 const t=(fi,english)=>en?english:fi;
 function get(id){const p=window.TWPartnerProfiles?.[id];return p?(en?{...p,...p.en}:p):null;}
 function profilePath(p){return (en?'/venues/':'/kohteet/')+p.slug+'/';}
 function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function photo(profile,compact=false){
  const n=el('div',null,compact?'tw-partner-photo':'photo');
  const track=el('div',null,'tw-photo-track');track.setAttribute('aria-label',t('Kohteen kuvat','Venue photos'));
  profile.images.forEach((item,index)=>{const slide=el('div',null,'tw-photo-slide');const img=el('img');img.src=item.src;img.alt=item.alt;img.loading=index?'lazy':'eager';img.draggable=false;
   if(!compact){const button=el('button',null,'gallery-main');button.type='button';button.dataset.gallerySrc=item.src;button.dataset.galleryAlt=item.alt;button.setAttribute('aria-label',t('Suurenna kuva: ','Enlarge photo: ')+item.alt);button.append(img);slide.append(button);}else slide.append(img);track.append(slide);});
  n.append(track);n.dataset.carousel=profile.slug;
  let active=0;const dots=el('div',null,'tw-carousel-dots');
  function mark(i){active=i;[...dots.children].forEach((d,j)=>d.setAttribute('aria-pressed',String(j===i)));}
  function go(i){i=(i+profile.images.length)%profile.images.length;const slide=track.children[i];track.scrollTo({left:slide.offsetLeft-(track.clientWidth-slide.clientWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});mark(i);}
  profile.images.forEach((_,i)=>{const dot=el('button');dot.type='button';dot.setAttribute('aria-label',t('Kuva ','Photo ')+(i+1));dot.setAttribute('aria-pressed',String(i===0));dot.addEventListener('click',e=>{e.stopPropagation();go(i);});dots.append(dot);});
  const controls=el('div',null,'tw-carousel-controls');for(const [label,step,glyph] of [[t('Edellinen kuva','Previous photo'),-1,'‹'],[t('Seuraava kuva','Next photo'),1,'›']]){const b=el('button',glyph);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',e=>{e.stopPropagation();go(active+step);});controls.append(b);}
  track.addEventListener('scroll',()=>{const center=track.scrollLeft+track.clientWidth/2;let best=0,dist=Infinity;[...track.children].forEach((slide,i)=>{const d=Math.abs(slide.offsetLeft+slide.clientWidth/2-center);if(d<dist){best=i;dist=d;}});mark(best);},{passive:true});
  track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();go(active+(e.key==='ArrowRight'?1:-1));}});
  track.tabIndex=0;if(profile.images.length>1)n.append(controls,dots);return n;
 }
 function mount(host,id){if(!host)return;host.querySelectorAll('.tw-partner-summary,.tw-partner-heading-label').forEach(n=>n.remove());const p=get(id);host.querySelectorAll('.detailActions a,.sheetActions a').forEach(a=>{if(a.textContent==='Kohteen verkkosivut ↗')a.textContent='Kohteen lisätiedot ↗';});if(!p)return;const box=el('section',null,'tw-partner-summary');const badge=el('div',t('★ KUMPPANIKOHDE','★ PARTNER VENUE'),'tw-partner-label tw-partner-heading-label');host.prepend(badge);box.append(photo(p,true),el('p',p.summary),el('p',p.services.slice(0,3).join(' · '),'tw-partner-services'),el('small',t('Talviuinti tulossa','Winter swimming coming soon')));
 const link=el('a',t('Tutustu kohteeseen →','Explore this venue →'),'tw-partner-link');link.href=profilePath(p);link.dataset.partnerId=id;box.append(el('br'),link);const actions=host.querySelector('.detailActions,.sheetActions,.actions');if(actions)actions.before(box);else host.append(box);if(actions)actions.querySelectorAll('a').forEach(a=>{if(a.textContent==='Kohteen lisätiedot ↗')a.textContent='Kohteen verkkosivut ↗';});}
 function mountRegions(){const cards=[...document.querySelectorAll('.place-card[data-place-id]')];cards.forEach(n=>{mount(n,n.dataset.placeId);if(get(n.dataset.placeId)){n.classList.add('tw-partner-list-card');const intro=n.querySelector('.tw-partner-summary>p');if(intro)intro.textContent=get(n.dataset.placeId).listingIntro||get(n.dataset.placeId).summary;const photo=n.querySelector('.tw-partner-photo');if(photo)n.prepend(photo);}});const partners=cards.filter(n=>get(n.dataset.placeId));for(const card of partners.reverse()){const first=card.parentElement.querySelector('.place-card');if(first&&first!==card)first.before(card);}}
 function readOrigin(){try{return JSON.parse(sessionStorage.getItem(storeKey));}catch{return null;}}
 document.addEventListener('click',event=>{const link=event.target.closest('a[data-partner-id]');if(!link)return;
 const state={url:location.pathname+location.search+location.hash,y:scrollY,id:link.dataset.partnerId,map:location.hash==='#kartta',at:Date.now()};
 document.dispatchEvent(new CustomEvent('tw-partner:save',{detail:state}));
 try{sessionStorage.setItem(storeKey,JSON.stringify(state));}catch{}
 });
 let lightbox,opener;
 function enlarge(src,alt){
  if(!lightbox){
   lightbox=el('dialog',null,'image-lightbox');lightbox.setAttribute('aria-label',t('Suurennettu kuva','Enlarged photo'));
   const close=el('button','×','image-lightbox-close');close.type='button';close.setAttribute('aria-label',t('Sulje kuva','Close photo'));
   const image=el('img');lightbox.append(close,image);document.body.append(lightbox);
   close.addEventListener('click',()=>lightbox.close());
   lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
   lightbox.addEventListener('close',()=>{document.body.classList.remove('image-lightbox-open');opener?.focus({preventScroll:true});});
  }
  lightbox.querySelector('img').src=src;lightbox.querySelector('img').alt=alt;
  document.body.classList.add('image-lightbox-open');lightbox.showModal();
 }
 document.addEventListener('click',e=>{const trigger=e.target.closest('[data-gallery-src]');if(!trigger)return;e.preventDefault();opener=trigger;enlarge(trigger.dataset.gallerySrc,trigger.dataset.galleryAlt);});
 async function renderProfile(){const host=document.getElementById('partner-profile');if(!host)return;
 const id=host.dataset.partnerId,p=get(id);if(!p){host.textContent=t('Kohdetietoja ei löytynyt.','Venue details were not found.');return;}
 try{
 const response=await fetch('/talviuintipaikat_enriched.geojson');if(!response.ok)throw Error('Data');const data=await response.json();const feature=data.features.find(f=>f.properties.id===id);if(!feature)throw Error('Kohde');const venue=feature.properties;
 const back=document.getElementById('profile-back'),origin=readOrigin();
 const safe=origin&&typeof origin.url==='string'&&origin.url.startsWith('/')&&!origin.url.startsWith('//')&&Date.now()-origin.at<86400000;
 back.href=safe?origin.url:'/#kartta';back.textContent=safe&&!origin.map?t('← Takaisin alueen kohteisiin','← Back to the places'):t('← Takaisin kartalle','← Back to the map');
 back.addEventListener('click',e=>{if(safe&&document.referrer&&new URL(document.referrer).origin===location.origin&&new URL(document.referrer).pathname===new URL(origin.url,location.origin).pathname){e.preventDefault();history.back();}});
 const heading=el('div',null,'heading'),titles=el('div');titles.append(el('p',t('★ KUMPPANIKOHDE · ','★ PARTNER VENUE · ')+venue.kunta.toLocaleUpperCase('fi'),'eyebrow'),el('h1',venue.nimi),el('p',venue.address,'address'));heading.append(titles);
 if(p.logo){const img=el('img');img.src=p.logo;img.alt=venue.nimi;img.width=78;heading.append(img);}// Logo is shown only once supplied.

 const content=el('div',null,'content'),images=el('div');images.append(photo(p));const thumbs=el('div',null,'thumbs');for(const image of p.images.slice(1)){const link=el('a',null,'gallery-thumb');link.href=image.src;link.dataset.gallerySrc=image.src;link.dataset.galleryAlt=image.alt;link.setAttribute('aria-label',image.alt+t(' – suurenna kuva',' – enlarge photo'));const img=el('img');img.src=image.src;img.alt=image.alt;img.loading='lazy';link.append(img);thumbs.append(link);}images.append(thumbs);
 const copy=el('div',null,'copy');copy.append(el('h2',p.heading));p.paragraphs.forEach(text=>copy.append(el('p',text)));const services=el('ul',null,'services');p.services.forEach(text=>services.append(el('li',text)));copy.append(services);
 const notice=el('div',null,'opening');notice.append(el('strong',t('Talviuinti tulossa','Winter swimming coming soon')),document.createTextNode(p.notice));copy.append(notice);
 const actions=el('div',null,'actions');for(const [label,url] of [[t('Saunavuorot ja varaukset ↗','Sauna sessions and bookings ↗'),venue.website||venue.url],[t('Reittiohjeet ↗','Directions ↗'),'https://www.google.com/maps?q='+feature.geometry.coordinates.slice().reverse().join(',')]]){const link=el('a',label);link.href=url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}copy.append(actions);content.append(images,copy);host.replaceChildren(heading,content);
 }catch{host.textContent=t('Kohdetietoja ei voitu ladata. Päivitä sivu ja yritä uudelleen.','Unable to load venue details. Please refresh the page.');}
 }
 function restoreList(){const state=readOrigin();if(state&&!state.map&&state.url===location.pathname+location.search+location.hash&&Date.now()-state.at<86400000)requestAnimationFrame(()=>window.scrollTo(0,state.y));}
 function markerIcon(){return L.divIcon({className:'tw-partner-marker',iconSize:[32,46],iconAnchor:[16,46],popupAnchor:[0,-42],html:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="46" viewBox="0 0 32 46" aria-hidden="true"><path d="M16 45C12 35 1 24 1 16a15 15 0 0 1 30 0c0 8-11 19-15 29Z" fill="#2c86b5" stroke="#185575" stroke-width="2"/><path d="m16 6 2.8 6 6.7.8-5 4.6 1.4 6.6-5.9-3.4-5.9 3.4 1.4-6.6-5-4.6 6.7-.8Z" fill="#ffd35b"/></svg>'});}
 window.TWPartners={get,mount,mountRegions,readOrigin,markerIcon};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{renderProfile();restoreList();});else{renderProfile();restoreList();}
})();
