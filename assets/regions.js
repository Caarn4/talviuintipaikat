(() => {
 'use strict';
 const norm=s=>s.toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 const search=document.getElementById('destination');
 if(search){
  const data=JSON.parse(document.getElementById('destination-data').textContent),list=document.getElementById('destinations'),status=document.getElementById('search-status');
  search.addEventListener('input',()=>{
   const q=norm(search.value);list.replaceChildren();list.hidden=!q;status.hidden=!q;if(!q)return;
   const matches=data.filter(d=>[d.label,...d.aliases].some(s=>norm(s).includes(q)));
   status.textContent=matches.length?`${matches.length} hakutulosta löytyi`:'Ei osumia. Kokeile paikkakunnan nimeä tai selaa alueita alta.';
   for(const d of matches){const li=document.createElement('li'),a=document.createElement('a'),name=document.createElement('strong'),area=document.createElement('small');a.href=d.url;name.textContent=d.label+(d.aliases.length?' · '+d.aliases.join(', '):'');area.textContent=d.area;a.append(name,area);li.append(a);list.append(li);}
  });
 }
 const host=document.getElementById('region-map');if(!host)return;
 const cards=[...document.querySelectorAll('.place-card')],filter=document.getElementById('city-filter'),count=document.getElementById('place-count'),status=document.getElementById('map-status');
 document.querySelector('.filter-row').hidden=false;
 const requested=new URLSearchParams(location.search).get('kunta');if([...filter.options].some(o=>o.value===requested))filter.value=requested;
 let map,layer;
 try{if(!window.L)throw Error('Karttakirjasto ei latautunut');map=L.map(host,{scrollWheelZoom:false,dragging:!L.Browser.mobile}).setView([64.5,26],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);layer=L.layerGroup().addTo(map);status.textContent='Zoomaa +/−-painikkeilla tai nipistämällä. Kohteet löytyvät myös listasta.';}catch{status.textContent='Karttaa ei voitu ladata. Voit silti selata kaikkia kohteita alla.';}
 function update(){let visible=0,points=[];layer?.clearLayers();for(const card of cards){card.hidden=!!filter.value&&card.dataset.city!==filter.value;if(card.hidden)continue;visible++;const lat=Number(card.dataset.lat),lon=Number(card.dataset.lon);if(map&&Number.isFinite(lat)&&Number.isFinite(lon)){const popup=card.cloneNode(true);popup.removeAttribute('id');popup.classList.add('tw-place-card');popup.hidden=false;L.circleMarker([lat,lon],{radius:7,color:'#fff',weight:1,fillColor:'#2377a0',fillOpacity:.95}).addTo(layer).bindPopup(popup);points.push([lat,lon]);}}count.textContent=`${visible} kohdetta${filter.value?' · '+filter.value:''}`;if(map&&points.length)map.fitBounds(points,{padding:[24,24],maxZoom:12});}
 filter.addEventListener('change',()=>{const url=new URL(location.href);if(filter.value)url.searchParams.set('kunta',filter.value);else url.searchParams.delete('kunta');history.replaceState(null,'',url);update();});document.getElementById('clear-filter').addEventListener('click',()=>{filter.value='';filter.dispatchEvent(new Event('change'));});update();
})();
