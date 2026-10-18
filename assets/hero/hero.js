/* ====== HEADERIN VIDEOT ======
   Lisää uusi video lisäämällä rivi. Jokaisella sivulatauksella valitaan yksi satunnaisesti.
   poster   = videon ensimmäinen ruutu (näkyy ennen videota)
   position = rajaus (object-position), esim. 'center 40%' tai 'right center'
*/
const HERO_VIDEOS = [
  { mp4: '/assets/hero/hero-1.mp4', poster: '/assets/hero/hero-1.jpg', position: 'center center' },
  // { mp4: 'assets/hero-2.mp4', webm: 'assets/hero-2.webm', poster: 'assets/hero-2.jpg', position: 'right center' },
];

(function () {
  const hero = document.querySelector('.tu-hero');
  if (!hero) return;

  // Mobiilivalikko
  const menuBtn = hero.querySelector('.tu-hero__menu-btn');
  const nav = hero.querySelector('.tu-hero__nav');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  // Dispatch only once the map occupies the viewport, never on a fixed timer.
  const mapSection = document.getElementById('kartta');
  let pendingAction = null;
  function runPendingAction() {
    if (!pendingAction || !mapSection) return;
    const rect = mapSection.getBoundingClientRect();
    if (Math.abs(rect.top) > 2 || rect.bottom < innerHeight - 2) return;
    const action = pendingAction;
    pendingAction = null;
    document.dispatchEvent(new CustomEvent('tu-hero:' + action));
  }
  if (mapSection) {
    new IntersectionObserver(runPendingAction, {threshold:[0,.5,.98,1]}).observe(mapSection);
    window.addEventListener('scroll', runPendingAction, {passive:true});
    document.addEventListener('scrollend', runPendingAction);
    const cancelPendingAction = () => { pendingAction = null; };
    window.addEventListener('wheel', cancelPendingAction, {passive:true});
    window.addEventListener('touchstart', cancelPendingAction, {passive:true});
    document.addEventListener('keydown', event => {
      if (['Escape','PageUp','PageDown','Home','End','ArrowUp','ArrowDown'].includes(event.key)) cancelPendingAction();
    });
  }
  hero.querySelectorAll('[data-tu-action]').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      if (!mapSection) return;
      pendingAction = el.dataset.tuAction;
      mapSection.scrollIntoView({block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      runPendingAction();
    });
  });

  // Video myös mobiilissa; kunnioita datansäästöä ja vähennettyä liikettä.
  const video = hero.querySelector('video');
  const pauseBtn = hero.querySelector('.tu-hero__pause');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (!video || reduced || saveData || !HERO_VIDEOS.length) return;

  const pick = HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
  const posterImg = hero.querySelector('.tu-hero__media img');
  if (pick.poster) posterImg.src = pick.poster;
  if (pick.position) { posterImg.style.objectPosition = pick.position; video.style.objectPosition = pick.position; }

  [['webm', pick.webm], ['mp4', pick.mp4]].forEach(([type, src]) => {
    if (!src) return;
    const s = document.createElement('source');
    s.src = src;
    s.type = 'video/' + type;
    video.appendChild(s);
  });
  video.muted = true;
  video.playsInline = true;
  video.load();
  video.play().then(() => {
    video.classList.add('is-playing');
    pauseBtn.hidden = false;
  }).catch(() => {
    // A user gesture can start video when mobile autoplay is blocked.
    if (!video.error) {
      pauseBtn.hidden = false;
      pauseBtn.setAttribute('aria-label', 'Toista taustavideo');
      pauseBtn.textContent = '▶';
    }
  });
  video.addEventListener('playing', () => video.classList.add('is-playing'));
  video.addEventListener('error', () => { video.classList.remove('is-playing'); pauseBtn.hidden = true; });

  pauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {
        pauseBtn.setAttribute('aria-label', 'Toista taustavideo');
        pauseBtn.textContent = '▶';
      });
      pauseBtn.setAttribute('aria-label', 'Pysäytä taustavideo');
      pauseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" fill="currentColor"/></svg>';
    } else {
      video.pause();
      pauseBtn.setAttribute('aria-label', 'Toista taustavideo');
      pauseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>';
    }
  });
})();
