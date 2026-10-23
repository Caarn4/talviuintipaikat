/* Basic consent: no Google tag is loaded before explicit analytics consent. */
(() => {
  'use strict';
  const id = 'G-KEZE2P95XL';
  const key = 'tw-analytics-consent-v2';
  const lifetime = 180 * 86400000;
  const disabled = 'ga-disable-' + id;
  let started = false, expires = 0, expiryTimer;
  window[disabled] = true;
  function read() {
    try {
      if (document.cookie.split(';').some(v => v.trim() === 'tw-analytics-denied=1')) return { accepted: false, expires: Date.now() + lifetime };
      const c = JSON.parse(localStorage.getItem(key));
      if (typeof c?.accepted === 'boolean' && Number.isFinite(c.expires) && c.expires > Date.now() && c.expires <= Date.now() + lifetime) return c;
    } catch {}
    return null;
  }
  function clearCookies() {
    const domains = ['', location.hostname, '.' + location.hostname, '.talviuintipaikat.fi'];
    for (const part of document.cookie.split(';')) {
      const name = part.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
    }
  }
  function stop() {
    window[disabled] = true;
    clearTimeout(expiryTimer);
    clearCookies();
    // Reload disposes Google's timers and queue, and starts a tag-free document.
    if (started) location.reload();
  }
  function checkExpiry() {
    if (!started) return;
    if (Date.now() >= expires) stop();
    else expiryTimer = setTimeout(checkExpiry, Math.min(expires - Date.now(), 2147483647));
  }
  function start(until) {
    if (document.documentElement.dataset.preview === "true") return;
    expires = until;
    if (started) return;
    started = true;
    window[disabled] = false;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    let referrer = '';
    try { const r = new URL(document.referrer); referrer = r.origin + r.pathname; } catch {}
    // No search string, fragment, free text or form data in page URLs.
    gtag('config', id, {
      send_page_view: true,
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
      page_title: document.documentElement.dataset.site === 'winterswim' ? (location.pathname === '/' ? 'WinterSwim.fi' : 'WinterSwim.fi – region') : (location.pathname === '/' ? 'Talviuintipaikat.fi' : 'Talviuintipaikat.fi – aluesivu'),
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'none', cookie_expires: 15552000, cookie_update: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
    checkExpiry();
  }
  const settings = document.createElement('button');
  settings.type = 'button'; settings.id = 'analytics-settings'; settings.textContent = window.TWLocale?.text('Evästeasetukset') || 'Evästeasetukset';
  const dialog = document.createElement('section');
  dialog.id = 'analytics-dialog'; dialog.setAttribute('aria-labelledby', 'analytics-heading');
  dialog.innerHTML = '<h2 id="analytics-heading">Evästeasetukset</h2><p>Käytämme Google Analyticsin evästeitä kävijämittaukseen vain luvallasi. Käyttötietoja välitetään Googlelle. <a href="/analytiikan-tietosuoja.html">Lisätiedot</a></p><div class="analytics-actions"><button type="button" data-choice="no">Hylkää analytiikka</button><button type="button" data-choice="yes">Hyväksy analytiikka</button></div><p id="analytics-status" role="status"></p>';
  if (window.TWLocale?.en) dialog.innerHTML = '<h2 id="analytics-heading">Cookie settings</h2><p>We use Google Analytics cookies to measure visits only with your permission. Usage data is sent to Google. <a href="/en/analytics-privacy/">More information</a></p><div class="analytics-actions"><button type="button" data-choice="no">Reject analytics</button><button type="button" data-choice="yes">Accept analytics</button></div><p id="analytics-status" role="status"></p>';
  if(document.documentElement.dataset.site === 'winterswim') dialog.querySelector('a').href='/analytics-privacy/';
  dialog.hidden = true;
  const showPanel = () => { dialog.hidden = false; settings.hidden = true; };
  const hidePanel = () => { dialog.hidden = true; settings.hidden = false; };
  const status = dialog.querySelector('#analytics-status');
  settings.onclick = () => { showPanel(); dialog.querySelector('button').focus(); };
  dialog.querySelectorAll('[data-choice]').forEach(button => {
    button.onclick = () => {
      const accepted = button.dataset.choice === 'yes';
      const c = { accepted, expires: Date.now() + lifetime };
      // A first-party opt-out cookie also covers a failed storage write on withdrawal.
      document.cookie = 'tw-analytics-denied=' + (accepted ? '; Max-Age=0' : '1; Max-Age=15552000') + '; path=/; SameSite=Lax; Secure';
      try { localStorage.setItem(key, JSON.stringify(c)); }
      catch {
        // Preserve an opt-out even when the previous stored choice was accepted.
        document.cookie = 'tw-analytics-denied=1; Max-Age=15552000; path=/; SameSite=Lax; Secure';
        stop();
        status.textContent = window.TWLocale?.en ? 'Your choice could not be saved. Analytics remains off.' : 'Valintaa ei voitu tallentaa. Mittaus pysyy pois päältä.';
        return;
      }
      if (accepted) start(c.expires); else stop();
      hidePanel(); settings.focus();
    };
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    const c = read();
    if (c?.accepted) start(c.expires); else stop();
    if (c) hidePanel();
  });
  document.addEventListener('visibilitychange', checkExpiry);
  document.body.append(settings, dialog);
  const choice = read();
  if (choice?.accepted) start(choice.expires);
  else { clearCookies(); if (!choice) showPanel(); }
})();
