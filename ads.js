/* ads.js – „FIGYELMÉBE AJÁNLJUK” lapozható hirdetéspanel a kezdőlapon (adatbázis nélkül).
   Működés: a hirdetesek/ mappába feltöltött AD1, AD2, AD3 … nevű képeket (jpg, jpeg, png, webp) a szám sorrendjében,
   automatikusan megjeleníti. Ha nincs kép, a panel nem jelenik meg. A linkek a hirdetesek/linkek.txt fájlban adhatók meg.
   Későbbi adatbázisos/adminisztrációs felülethez: forras:'json' és jsonUrl megadásával ugyanez a panel egy JSON-ból épül
   (mezők: src, href, alt, order, from, to, newTab), a kinézethez és a működéshez nem kell nyúlni. */
(function () {
  'use strict';
  var CFG = {
    forras: 'fajlok',               // 'fajlok' = AD-képek a tárhelyen | 'json' = külső forrás (adatbázis, másik admin oldal)
    jsonUrl: '',                    // 'json' esetén: a hirdetéslista címe (pl. https://admin.pelda.hu/api/hirdetesek.json)
    mappa: 'hirdetesek/',
    elotag: 'AD',
    kiterjesztesek: ['jpg', 'png', 'jpeg', 'webp'],   // kisbetűs kiterjesztések (a tárhely megkülönbözteti a kis- és nagybetűt)
    max: 20,                        // legfeljebb ennyi hirdetés
    hezag: 1,                       // ennyi hiányzó szám után hagyja abba a keresést (pl. AD2 hiányzik, AD3 megvan)
    valtasMs: 4500                  // automatikus lapozás ideje (ugyanannyi, mint a véleményeknél)
  };

  var D = document, W = window;
  var panel = D.getElementById('ad-panel');
  if (!panel) return;
  var reduce = false;
  try { reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function inRange(a) { var t = today(); return !(a.from && t < a.from) && !(a.to && t > a.to); }
  function okSrc(u) { return typeof u === 'string' && /^(https?:\/\/|[A-Za-z0-9_\-.\/ %]+$)/.test(u) && !/^\s*(javascript|data):/i.test(u); }
  function okHref(u) { return typeof u === 'string' && /^(https?:\/\/|mailto:|tel:|[A-Za-z0-9_\-.\/#?=&%]+$)/i.test(u.trim()) && !/^\s*javascript:/i.test(u); }

  /* ---------- forrás 1: fájlnevek (AD1.jpg, AD2.png, …) + linkek.txt ---------- */
  function loadImg(url) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im.naturalWidth > 0 ? url : null); };
      im.onerror = function () { res(null); };
      im.src = url;
    });
  }
  function findNumber(n) {                                             // az n. hirdetés képe, a kiterjesztések sorrendjében
    return Promise.all(CFG.kiterjesztesek.map(function (x) { return loadImg(CFG.mappa + CFG.elotag + n + '.' + x); }))
      .then(function (r) { for (var i = 0; i < r.length; i++) if (r[i]) return r[i]; return null; });
  }
  function parseLinks(txt) {
    var map = {};
    String(txt || '').split(/\r?\n/).forEach(function (line) {
      line = line.replace(/^\uFEFF/, '').trim();
      if (!line || line.charAt(0) === '#') return;
      var eq = line.indexOf('=');
      if (eq < 1) return;
      var m = /(\d+)\s*$/.exec(line.slice(0, eq).trim());
      if (!m) return;
      var p = line.slice(eq + 1).split('|').map(function (x) { return x.trim(); });
      map[Number(m[1])] = { href: p[0] && p[0] !== '-' ? p[0] : '', from: /^\d{4}-\d{2}-\d{2}$/.test(p[1] || '') ? p[1] : '', to: /^\d{4}-\d{2}-\d{2}$/.test(p[2] || '') ? p[2] : '', alt: p[3] || '' };
    });
    return map;
  }
  function fromFiles() {
    var links = W.fetch ? W.fetch(CFG.mappa + 'linkek.txt', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.text() : ''; }).then(parseLinks).catch(function () { return {}; }) : Promise.resolve({});
    var found = [];
    function next(n, miss) {
      if (n > CFG.max || miss > CFG.hezag) return Promise.resolve();
      return findNumber(n).then(function (u) {
        if (u) found.push({ n: n, src: u });
        return next(n + 1, u ? 0 : miss + 1);
      });
    }
    return Promise.all([next(1, 0), links]).then(function (r) {
      var map = r[1];
      return found.map(function (f) {
        var l = map[f.n] || {};
        return { order: f.n, src: f.src, href: l.href || '', alt: l.alt || '', from: l.from || '', to: l.to || '' };
      });
    });
  }

  /* ---------- forrás 2: JSON (adatbázis / másik admin oldal) ---------- */
  function fromJson() {
    if (!CFG.jsonUrl || !W.fetch) return Promise.resolve([]);
    return W.fetch(CFG.jsonUrl, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).then(function (a) {
      if (a && !Array.isArray(a) && Array.isArray(a.hirdetesek)) a = a.hirdetesek;
      if (!Array.isArray(a)) return [];
      return a.map(function (x, i) {
        return { order: Number(x.order != null ? x.order : x.sorrend != null ? x.sorrend : i + 1), src: x.src || x.kep || '', href: x.href || x.link || '',
                 alt: x.alt || '', from: x.from || x.tol || '', to: x.to || x.ig || '', newTab: !!(x.newTab || x.ujLap) };
      });
    }).catch(function () { return []; });
  }

  /* ---------- megjelenítés ---------- */
  function build(items) {
    items = items.filter(function (a) { return okSrc(a.src) && inRange(a); })
                 .sort(function (a, b) { return a.order - b.order; }).slice(0, CFG.max);
    if (!items.length) return;                                         // nincs hirdetés: a panel nem jelenik meg
    var stage = panel.querySelector('.ad-stage'), dotsWrap = panel.querySelector('.ad-dots');
    stage.innerHTML = '';
    var slides = items.map(function (a, i) {
      var link = a.href && okHref(a.href);
      var el = D.createElement(link ? 'a' : 'div');
      el.className = 'ad-slide' + (i === 0 ? ' active' : '');
      if (link) {
        el.href = a.href.trim();
        var ext = /^https?:\/\//i.test(a.href) && a.href.indexOf(W.location.origin) !== 0;
        if (ext || a.newTab) { el.target = '_blank'; el.rel = 'noopener'; }
      }
      var im = D.createElement('img');
      im.src = a.src; im.alt = a.alt || 'Figyelmébe ajánljuk'; im.decoding = 'async'; im.draggable = false;
      el.appendChild(im);
      if (i !== 0 && !link) el.setAttribute('aria-hidden', 'true');
      stage.appendChild(el);
      return el;
    });
    var cur = 0, timer = null, visible = true, hold = false, swiped = 0;
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); s.tabIndex = k === cur ? 0 : -1; });
      if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (d, k) { d.classList.toggle('active', k === cur); });
    }
    if (slides.length > 1 && dotsWrap) {
      dotsWrap.innerHTML = slides.map(function (_, i) { return '<button type="button" class="ad-dot' + (i === 0 ? ' active' : '') + '" data-i="' + i + '" aria-label="' + (i + 1) + '. ajánló"></button>'; }).join('');
      dotsWrap.addEventListener('click', function (e) { var b = e.target.closest('.ad-dot'); if (b) { show(Number(b.getAttribute('data-i'))); restart(); } });
    }
    show(0);
    function restart() { if (timer) clearInterval(timer); if (slides.length > 1 && !reduce) timer = setInterval(function () { if (!hold && visible && !D.hidden) show(cur + 1); }, CFG.valtasMs); }
    restart();
    /* húzás (swipe) és egérrel/érintéssel megállítás */
    var x0 = null, y0 = null;
    stage.addEventListener('touchstart', function (e) { hold = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      hold = false;
      if (x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2 && slides.length > 1) { swiped = Date.now(); show(cur + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    stage.addEventListener('touchcancel', function () { hold = false; x0 = null; }, { passive: true });
    stage.addEventListener('click', function (e) { if (Date.now() - swiped < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
    panel.addEventListener('mouseenter', function () { hold = true; });
    panel.addEventListener('mouseleave', function () { hold = false; });
    if ('IntersectionObserver' in W) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.2 }).observe(panel);
    panel.hidden = false;
    panel.classList.add('ad-in');
    try { W.dispatchEvent(new Event('resize')); } catch (e) {}          // a nyitókép magassága megváltozott: az animáció újramér
  }

  (CFG.forras === 'json' ? fromJson() : fromFiles()).then(build).catch(function () {});
})();
