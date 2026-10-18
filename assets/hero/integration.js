/* Adapt the supplied hero to the existing map without replacing its controls. */
(() => {
  const hero = document.querySelector('.tu-hero');
  const mapSection = document.getElementById('kartta');
  if (!hero || !mapSection) return;
  const nav = hero.querySelector('.tu-hero__nav');
  const menu = hero.querySelector('.tu-hero__menu-btn');
  const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); };
  hero.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  hero.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
  });
  new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) document.dispatchEvent(new Event('tu-hero:map-visible'));
  }, {threshold:[0,.5,1]}).observe(mapSection);
  let frame;
  const checkSize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => document.dispatchEvent(new Event('tu-hero:map-visible'))); };
  new ResizeObserver(checkSize).observe(mapSection);
})();
