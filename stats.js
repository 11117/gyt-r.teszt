/* stats.js – névtelen, hozzájáruláshoz kötött látogatottságmérés (oldalmegtekintések és események).
   Elvek:
   - csak akkor küld bármit, ha a látogató a sütibeállításban a „Statisztika” célt bekapcsolta (stats === true);
   - nincs süti, nincs localStorage/sessionStorage írás, nincs azonosító, nincs ujjlenyomat-képzés, nincs IP-tárolás;
   - csak előre megadott értékek mennek ki (a szerver is fehérlistával érvényesít); nincs bevitt/választott tartalom;
   - nincs külső könyvtár; hiba esetén csendben leáll.
   A hozzájárulási döntést a meglévő sütikezelő tárolja; ez a szkript azt csak OLVASSA. */
(function () {
  'use strict';

  /* A Google Apps Script webalkalmazás URL-je (telepítés után kell beírni, lásd: telepitesi-utmutato.md).
     Üresen a mérés semmit nem küld. */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbx7eEgdMhOUJZYj8pGC5YnqfL7IfuVMsF8NWNlQ5G0nDyP3w0LV-bQG85aNogpUI4b7/exec';

  var CONSENT_KEY = 'gyogyszertar_cookie_v3';
  var DEDUP_MS = 1500;                                   // ugyanazt 1,5 másodpercen belül nem küldjük kétszer (csak memóriában)
  var W = window, D = document, N = navigator;

  // az oldalfájlok és az index.html nézetei (fehérlista; a szerver ugyanezt ismeri)
  var FILES = {
    'web-gyogyszeresz.html': 'web-gyogyszeresz', 'receptek.html': 'receptek', 'tunetek-kereso.html': 'tunetek-kereso',
    'gyogyszer-labirintus.html': 'gyogyszer-labirintus', 'dokumentumtar.html': 'dokumentumtar', 'szinezok.html': 'szinezok',
    'blog-tortenelem.html': 'blog-tortenelem', 'tortenelmunk-galeria.html': 'tortenelmunk-galeria',
    'adatkezeles.html': 'adatkezeles', 'impresszum.html': 'impresszum'
  };
  var VIEWS = { 'jatekok': 1, 'egeszsegugyi-kviz': 1, 'napi-kihivas': 1, 'gyogynoveny-teszt': 1 };
  var EVENTS = { game_start: 1, game_over: 1, quiz_start: 1, phone_open: 1, news_open: 1, install_click: 1 };
  var SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|startpage|yandex|seznam|qwant|brave)\./;
  var SOCIAL = /(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com|instagram\.com|t\.co|twitter\.com|x\.com|linkedin\.com|pinterest\.|youtube\.com|tiktok\.com|reddit\.com)$/;

  var enabled = false;
  var entry = true;            // az első oldalmegtekintés viszi a forrást és az UTM-et (belső lapozásnál nincs forrás)
  var lastPage = null;
  var seen = {};               // csak memóriában
  var info = null;

  function isBot() {
    try {
      if (N.webdriver) return true;
      return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|phantom|selenium|puppeteer|playwright|prerender|facebookexternalhit|embedly|preview/i.test(N.userAgent || '');
    } catch (e) { return true; }
  }

  /* Hozzájárulás: csak olvassuk. Bármi hiba esetén: nincs hozzájárulás. */
  function consentOk() {
    try {
      var d = JSON.parse(W.localStorage.getItem(CONSENT_KEY));
      return !!(d && d.stats === true && d.ts && (Date.now() - d.ts) <= 365 * 24 * 3600 * 1000);
    } catch (e) { return false; }
  }

  function pageId() {
    var f = (W.location.pathname.split('/').pop() || '').toLowerCase();
    if (f === '' || f === 'index.html' || f === 'index') {
      var h = (W.location.hash || '').replace('#', '');
      return Object.prototype.hasOwnProperty.call(VIEWS, h) ? h : 'fooldal';
    }
    return Object.prototype.hasOwnProperty.call(FILES, f) ? FILES[f] : null;      // ismeretlen oldalt nem mérünk
  }

  function device() {
    var ua = N.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Macintosh/.test(ua) && N.maxTouchPoints > 1) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
    if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobil';
    return 'asztali';
  }
  function system() {
    var ua = N.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && N.maxTouchPoints > 1)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
    return 'egyeb';
  }
  function display() {
    try {
      if (N.standalone === true) return 'telepitett_app';
      var a = ['standalone', 'fullscreen', 'minimal-ui'];
      for (var i = 0; i < a.length; i++) if (W.matchMedia('(display-mode: ' + a[i] + ')').matches) return 'telepitett_app';
    } catch (e) {}
    return 'bongeszo';
  }
  function lang() {
    var l = ((N.language || '') + '').slice(0, 2).toLowerCase();
    return (l === 'hu' || l === 'en' || l === 'de') ? l : 'egyeb';
  }
  /* Forrás: csak a típus és a hivatkozó oldal DOMAINJE, teljes URL soha. */
  function source() {
    var out = { forras: '', domain: '' };
    try {
      var ref = D.referrer;
      if (!ref) { out.forras = 'kozvetlen'; return out; }
      var host = new URL(ref).hostname.toLowerCase().replace(/^www\./, '');
      if (host === (W.location.hostname || '').toLowerCase().replace(/^www\./, '')) return out;   // belső navigáció: nincs forrás
      out.domain = host.slice(0, 60);
      out.forras = SEARCH.test(host) ? 'kereso' : (SOCIAL.test(host) ? 'kozossegi' : 'egyeb');
    } catch (e) { out.forras = 'egyeb'; }
    return out;
  }
  /* UTM: csak [a-z0-9_-], legfeljebb 40 karakter; más érték eldobva. */
  function utm(name) {
    try {
      var v = (new URLSearchParams(W.location.search).get(name) || '').toLowerCase();
      return /^[a-z0-9_-]{1,40}$/.test(v) ? v : '';
    } catch (e) { return ''; }
  }

  function post(obj) {
    try {
      W.fetch(ENDPOINT, {
        method: 'POST', mode: 'no-cors', keepalive: true, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(obj)
      }).catch(function () {});
    } catch (e) {}
  }

  function send(ev) {
    try {
      if (!enabled || !ENDPOINT) return;
      var page = pageId();
      if (!page) return;
      var key = ev + '|' + page, now = Date.now();
      if (seen[key] && now - seen[key] < DEDUP_MS) return;
      seen[key] = now;
      if (!info) info = { eszkoz: device(), rendszer: system(), megjelenites: display(), nyelv: lang() };
      var o = { v: 1, oldal: page, esemeny: ev, eszkoz: info.eszkoz, rendszer: info.rendszer, megjelenites: info.megjelenites, nyelv: info.nyelv };
      if (ev === 'pageview' && entry) {
        entry = false;
        var s = source();
        if (s.forras) o.forras = s.forras;
        if (s.domain) o.domain = s.domain;
        var a = utm('utm_source'), b = utm('utm_medium'), c = utm('utm_campaign');
        if (a) o.utm_source = a;
        if (b) o.utm_medium = b;
        if (c) o.utm_campaign = c;
      }
      post(o);
    } catch (e) {}
  }

  function viewNow() {
    var go = function () { lastPage = pageId(); send('pageview'); };
    if (D.visibilityState === 'hidden') {                  // háttérben megnyitott/előtöltött oldalt csak láthatóvá válva számolunk
      var onVis = function () { if (D.visibilityState === 'visible') { D.removeEventListener('visibilitychange', onVis); if (enabled) go(); } };
      D.addEventListener('visibilitychange', onVis);
    } else go();
  }

  /* A hozzájárulás változása: bekapcsoláskor induljon, kikapcsoláskor azonnal álljon le. */
  function refresh() {
    var was = enabled;
    enabled = !!(ENDPOINT && !isBot() && consentOk());
    if (!enabled) { seen = {}; }
    if (enabled && !was) viewNow();
  }

  /* Eseményt a meglévő oldalak hívhatják: window.gysztStat('game_start') – csak a fehérlistás nevek érvényesek. */
  W.gysztStat = function (name) {
    try { if (Object.prototype.hasOwnProperty.call(EVENTS, name)) send(name); } catch (e) {}
  };

  try {
    if (isBot()) return;

    W.addEventListener('cookieConsentDecided', refresh);
    W.addEventListener('storage', function (e) { if (e && e.key === CONSENT_KEY) refresh(); });   // másik lapon történt módosítás
    W.addEventListener('hashchange', function () {                                              // az index.html nézetváltásai
      var p = pageId();
      if (p && p !== lastPage) { lastPage = p; send('pageview'); }
    });

    /* Események – a meglévő gombokra figyelünk, így a funkciók kódjához nem kell nyúlni. */
    D.addEventListener('click', function (e) {
      if (!enabled) return;
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#quick-phone-button')) {
        setTimeout(function () {                           // csak a megnyitás számít, a bezárás nem
          var b = D.getElementById('quick-phone-button');
          if (b && b.getAttribute('aria-expanded') === 'true') send('phone_open');
        }, 0);
      } else if (t.closest('#news-menu-btn, #pwa-pill-news')) {
        setTimeout(function () {
          var m = D.getElementById('news-modal');
          if (m && m.style.display === 'block') send('news_open');
        }, 0);
      } else if (t.closest('.ig-pop .ig-btn, #pwa-menu-dl')) {
        send('install_click');
      }
    }, true);

    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', refresh); else refresh();
  } catch (e) { /* csendben leáll */ }
})();
