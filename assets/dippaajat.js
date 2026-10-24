/* One review renderer across main-map, municipality and regional cards. */
(() => {
  'use strict';
  const preview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('dippaajatPreview') === '1';
  const entries = window.TWDippaajatData?.entries || [];
  const key = p => p?.id ? 'id:' + p.id : p?.lipas_id ? 'lipas:' + p.lipas_id : '';
  function create(props) {
    if (document.documentElement.lang === "en") return null;
    const review = entries.find(r => r.key === (props?.reviewKey || key(props)) && (r.approved === true || preview));
    if (!review) return null;
    let url;
    try { url = new URL(review.url); } catch { return null; }
    if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com' || url.username || url.password || !/^\/(?:dippaajat\/)?(?:p|reel)\/[a-zA-Z0-9_-]+\/$/.test(url.pathname)) return null;
    const block = document.createElement('div'); block.className = 'dippaajat-review';
    const link = document.createElement('a'); link.className = 'dippaajat-badge';
    link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', window.TWLocale?.en ? 'See Finnish winter swimming duo Dippaajat’s visit to ' + review.name + ' on Instagram (opens in a new tab)' : 'Lue Dippaajien kokemus: ' + review.name + ' (Instagram, uusi välilehti)');
    const logo = document.createElement('img'); logo.src = '/assets/images/dippaajat-suosittelee.png';
    logo.alt = window.TWLocale.text('Dippaajat suosittelee'); logo.width = 44; logo.height = 44; logo.loading = 'lazy';
    link.append(logo);
    link.title = window.TWLocale.text('Lue Dippaajien kokemus Instagramissa');
    block.append(link); return block;
  }
  function mount(container, props) {
    if (!container) return;
    container.replaceChildren();
    const badge = create(props); container.hidden = !badge;
    if (badge) container.append(badge);
  }
  function mountStatic() {
    document.querySelectorAll('[data-dippaajat-key]').forEach(el => mount(el, {reviewKey: el.dataset.dippaajatKey}));
  }
  // Shared basic-card content: no internal notes, descriptions or stock photos.
  function card(props, coordinates) {
    const el = document.createElement('article'); el.className = 'tw-place-card';
    const add = (tag, value, cls) => { if (!value) return; const n=document.createElement(tag); n.textContent=value; if(cls)n.className=cls; el.append(n); };
    add('h3', props.nimi || props.name || window.TWLocale.text('Nimetön paikka'));
    add('p', props.address, 'location-address'); add('p', props.kunta || props.municipality, 'municipality');
    const badge=create(props); if(badge)el.append(badge);
    const actions=document.createElement('div');actions.className='actions';
    function link(label, href){try{const u=new URL(href);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return;const a=document.createElement('a');a.textContent=label;a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}catch{}}
    if(coordinates?.length===2)link(window.TWLocale.text('Reittiohjeet ↗'),'https://www.google.com/maps?q='+coordinates[1]+','+coordinates[0]);
    link(window.TWLocale.text('Kohteen lisätiedot ↗'),props.website||props.url||props.lipas_url);
    el.append(actions);return el;
  }
  window.TWPlaceCard = Object.freeze({create:card});
  // Keep the explicitly enabled local preview when navigating between views.
  if(preview)document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');if(!a)return;
    const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;
    u.searchParams.set('dippaajatPreview','1');a.href=u.href;
  });
  window.TWDippaajat = Object.freeze({create, mount, key});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountStatic, {once:true});
  else mountStatic();
})();
