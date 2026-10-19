/* One review renderer across main-map, municipality and regional cards. */
(() => {
  'use strict';
  const preview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('dippaajatPreview') === '1';
  const entries = window.TWDippaajatData?.entries || [];
  const key = p => p?.id ? 'id:' + p.id : p?.lipas_id ? 'lipas:' + p.lipas_id : '';
  function create(props) {
    const review = entries.find(r => r.key === (props?.reviewKey || key(props)) && (r.approved === true || preview));
    if (!review) return null;
    let url;
    try { url = new URL(review.url); } catch { return null; }
    if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com' || url.username || url.password || !/^\/(?:dippaajat\/)?(?:p|reel)\/[a-zA-Z0-9_-]+\/$/.test(url.pathname)) return null;
    const block = document.createElement('div'); block.className = 'dippaajat-review';
    const link = document.createElement('a'); link.className = 'dippaajat-badge';
    link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Lue Dippaajien kokemus: ' + review.name + ' (Instagram, uusi välilehti)');
    const logo = document.createElement('img'); logo.src = '/assets/images/dippaajat-suosittelee.webp';
    logo.alt = 'Dippaajat suosittelee'; logo.width = 88; logo.height = 89; logo.loading = 'lazy';
    link.append(logo);
    const note = document.createElement('span'); note.className = 'dippaajat-note'; note.textContent = 'Lue kokemus Instagramissa ↗';
    block.append(link, note); return block;
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
  window.TWDippaajat = Object.freeze({create, mount, key});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountStatic, {once:true});
  else mountStatic();
})();
