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

  // Toiminnot: vieritä kartalle ja kutsu sivuston omaa toimintoa.
  // CODEX: yhdistä nämä kartan olemassa oleviin funktioihin (Näytä lähelläni / Vinkkaa paikka).
  hero.querySelectorAll('[data-tu-action]').forEach((el) => {
    el.addEventListener('click', () => {
      const action = el.dataset.tuAction;
      setTimeout(() => document.dispatchEvent(new CustomEvent('tu-hero:' + action)), 400);
    });
  });

  // Video vain kun siitä on hyötyä: iso näyttö, ei säästötilaa, ei liikkeen vähennystä
  const video = hero.querySelector('video');
  const pauseBtn = hero.querySelector('.tu-hero__pause');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const wide = window.matchMedia('(min-width: 768px)').matches;
  if (!video || reduced || saveData || !wide || !HERO_VIDEOS.length) return;

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
  video.load();
  video.play().then(() => {
    video.classList.add('is-playing');
    pauseBtn.hidden = false;
  }).catch(() => { /* jää kansikuvaan */ });

  pauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      pauseBtn.setAttribute('aria-label', 'Pysäytä taustavideo');
      pauseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" fill="currentColor"/></svg>';
    } else {
      video.pause();
      pauseBtn.setAttribute('aria-label', 'Toista taustavideo');
      pauseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>';
    }
  });
})();
