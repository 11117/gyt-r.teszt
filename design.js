/* design.js – Gondviselés „2.0” mozgásréteg (függőségmentes, teljesen helyi).
   Csak megjelenést és mozgást ad; funkciót, tartalmat nem módosít.
   Hiba esetén az oldal ugyanúgy működik, csak mozgás nélkül. */
(function () {
  'use strict';
  var D = document, W = window;
  /* Csak az iOS-es Google app (GSA) beépített böngészőjében: egyszerűsített sütipanel-megjelenés.
     Ott a blur/animáció elrontja a megjelenítést; máshol semmi nem változik. */
  var GSA = false;
  try { GSA = /GSA\//.test(navigator.userAgent) && /iPhone|iPad|iPod/.test(navigator.userAgent); } catch (e) {}
  if (GSA) {
    D.documentElement.classList.add('gsa');
    // amíg a sütipanelre nem válaszolt a látogató, az oldal nem görgethető a panelen kívül
    D.addEventListener('touchmove', function (e) {
      if (!D.documentElement.classList.contains('gyszt-lock')) return;
      var t = e.target;
      if (t && t.closest && t.closest('#gyszt-notice, #gyszt-settings-panel')) return;
      e.preventDefault();
    }, { passive: false });
  }
  var reduce = false;
  try { reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function ready(fn) {
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', fn); else fn();
  }

  ready(function () {
    try { init(); } catch (err) { try { console.warn('design.js:', err); } catch (e) {} }
  });

  function init() {
    var nav = D.querySelector('nav');
    var heroes = Array.prototype.slice.call(D.querySelectorAll('.hero'));

    /* ---------- 1. Görgetésvezérelt elemek: haladás-sáv, fejléc, hero ---------- */
    var ticking = false;
    function update() {
      ticking = false;
      var y = W.pageYOffset || D.documentElement.scrollTop || 0;
      if (nav) {
        var max = Math.max(1, D.documentElement.scrollHeight - W.innerHeight);
        nav.style.setProperty('--sp', Math.min(1, y / max).toFixed(4));
        if (y > 8) nav.classList.add('dg-scrolled'); else nav.classList.remove('dg-scrolled');
      }
      if (!reduce && !D.documentElement.classList.contains('dz-on')) {   // a főoldali ajtó-animáció alatt a nyitókép mozgatását az az animáció végzi
        for (var i = 0; i < heroes.length; i++) {
          var h = heroes[i], hh = h.offsetHeight;
          if (hh > 0) {
            var p = Math.min(1, Math.max(0, y / (hh * 0.8)));
            h.style.setProperty('--hp', p.toFixed(3));
          } else if (h.style.getPropertyValue('--hp')) {
            h.style.removeProperty('--hp');
          }
        }
      }
    }
    function onScroll() { if (!ticking) { ticking = true; W.requestAnimationFrame(update); } }
    W.addEventListener('scroll', onScroll, { passive: true });
    W.addEventListener('resize', onScroll);
    W.addEventListener('hashchange', function () { setTimeout(update, 60); });
    update();

    /* ---------- 2. „Következő” jelzés a főoldali szekciók végén ---------- */
    var order = [
      ['akciok-szekcio', 'Akciók'], ['szolgaltatasok', 'Szolgáltatások'], ['nyitvatartas', 'Nyitvatartás'],
      ['terkep-szekcio', 'Térkép'], ['kapcsolat', 'Kapcsolat']
    ];
    var chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    for (var i = 0; i < order.length; i++) {
      var sec = D.getElementById(order[i][0]);
      if (!sec || sec.querySelector('.dg-next-wrap')) continue;
      var wrap = D.createElement('div');
      wrap.className = 'dg-next-wrap';
      var next = order[i + 1];
      if (next && D.getElementById(next[0])) {
        var a = D.createElement('a');
        a.className = 'dg-next';
        a.href = '#' + next[0];
        a.innerHTML = '<span>Következő: ' + next[1] + '</span>' + chev;
        wrap.appendChild(a);
      } else {
        var b = D.createElement('button');
        b.type = 'button';
        b.className = 'dg-next dg-top';
        b.innerHTML = '<span>Vissza a tetejére</span>' + chev;
        b.addEventListener('click', function () { W.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
        wrap.appendChild(b);
      }
      sec.appendChild(wrap);
    }

    /* ---------- 3. Megjelenés görgetésre (csak ami még nem látszik) ---------- */
    if (reduce || !('IntersectionObserver' in W)) return;
    var SEL = '.section-title,.services-info,.reviews-card,.status-card,.opening-hours,.szimp-stage,' +
      '.map-address,.map-container,.contact-item,.card,.history-teaser,.blog-post,.recipe-card,' +
      '.topic-tile,.thumb-card,.promo-card,.doc-item,.doctor-item,.text-card,.eeszt-card,.news-card,.dg-next-wrap';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('rv-in');
        var done = false;
        function clean() {
          if (done) return; done = true;
          el.classList.remove('rv', 'rv-in');
          el.style.removeProperty('--rv-d');
        }
        el.addEventListener('transitionend', function (e) { if (e.target === el && e.propertyName === 'transform') clean(); });
        setTimeout(clean, 1800);
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

    var groups = new Map();
    Array.prototype.forEach.call(D.querySelectorAll(SEL), function (el) {
      if (el.closest('nav, .pwa-pill-nav, #gyszt-notice, #gyszt-settings-panel, .modal-box, .rules-box')) return;
      var hidden = el.offsetParent === null && getComputedStyle(el).position !== 'fixed';
      if (!hidden) {
        var r = el.getBoundingClientRect();
        if (r.top < W.innerHeight * 0.98) return;   // már látszik (vagy fölötte van): nem animáljuk
      }
      var idx = groups.get(el.parentNode) || 0;
      groups.set(el.parentNode, idx + 1);
      el.style.setProperty('--rv-d', Math.min(idx, 5) * 70 + 'ms');
      el.classList.add('rv');
      io.observe(el);
    });
  }
})();

/* ===== Hirdetéspanel („FIGYELMÉBE AJÁNLJUK”) a kezdőlapon – adatbázis nélkül =====
   A kép- és linkkezelésről: hirdetes-utmutato.md. A panel a kezdőlap nyitóképébe kerül (a cím és a „Görgessen a részletekért” közé),
   ha nincs hirdetés-kép, egyáltalán nem jelenik meg. Minden, ami hozzá kell, ebben a fájlban van. */
(function () {
  'use strict';
  var CFG = {
    forras: 'fajlok',               // 'fajlok' = AD-képek a tárhelyen | 'json' = külső forrás (adatbázis, másik admin oldal)
    jsonUrl: '',                    // 'json' esetén: a hirdetéslista címe (pl. https://admin.pelda.hu/api/hirdetesek.json)
    mappak: ['hirdetesek/', ''],     // hol keresse a képeket: előbb a hirdetesek/ mappában, ha ott nincs, az oldal fő mappájában
    elotag: 'AD',
    kiterjesztesek: ['jpg', 'png', 'jpeg', 'webp'],   // kisbetűs kiterjesztések (a tárhely megkülönbözteti a kis- és nagybetűt)
    max: 20,                        // legfeljebb ennyi hirdetés
    hezag: 1,                       // ennyi hiányzó szám után hagyja abba a keresést (pl. AD2 hiányzik, AD3 megvan)
    valtasMs: 4500                  // automatikus lapozás ideje (ugyanannyi, mint a véleményeknél)
  };

  var D = document, W = window;
  /* Ellenőrző sáv: csak akkor jelenik meg, ha az oldal címe végén #adteszt áll (a látogatók nem látják) */
  var DIAG = W.location.hash === '#adteszt';
  function diag(msg, ok) {
    if (!DIAG || !D.body) return;
    var b = D.getElementById('ad-diag');
    if (!b) { b = D.createElement('div'); b.id = 'ad-diag'; b.style.cssText = 'position:fixed;left:10px;right:10px;bottom:10px;z-index:2147483000;padding:12px 14px;border-radius:12px;font:600 15px/1.4 system-ui,Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35)'; D.body.appendChild(b); }
    b.style.background = ok ? '#e6f4ea' : '#fde8e8'; b.style.color = '#111'; b.textContent = msg;
  }
  var CSS = '.gy-ad-panel[hidden]{display:none!important}' +
    '.gy-ad-panel{display:block;position:relative;z-index:3;box-sizing:border-box;width:100%;max-width:480px;flex:0 0 auto;margin:auto auto 0;border-radius:18px;overflow:hidden;background:#e9ecef;box-shadow:0 14px 34px rgba(0,0,0,.38);text-align:center;color:#222}' +
    '.gy-ad-head{display:block;background:#6b7176;color:#fff;font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:7px 14px;line-height:1.2;text-shadow:none}' +
    '.gy-ad-stage{position:relative;display:block;width:100%;height:0;padding-top:41.6667%;background:#e9ecef;overflow:hidden;touch-action:pan-y}' +
    '.gy-ad-slide{position:absolute;left:0;top:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .5s ease;pointer-events:none;color:inherit;-webkit-tap-highlight-color:transparent}' +
    '.gy-ad-slide.active{opacity:1;pointer-events:auto}' +
    '.gy-ad-slide img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none}' +
    '.gy-ad-dots{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;gap:6px;pointer-events:none}.gy-ad-dots:empty{display:none}' +
    '.gy-ad-dot{pointer-events:auto;width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.65);box-shadow:0 0 0 1px rgba(0,0,0,.25);cursor:pointer}' +
    '.gy-ad-dot.active{background:#fff;width:20px;border-radius:5px}' +
    'div.hero.gy-has-ad>h1{margin-top:auto}' +
    'html.dz-on div.hero>.gy-ad-panel{pointer-events:auto;opacity:calc(1 - var(--dzp,0) * 1.4);transform:translate3d(0,calc(var(--dzp,0) * -36px),0)}' +
    '@media (prefers-reduced-motion:reduce){.gy-ad-slide{transition:none}}';
  function inject() {                                                  // a panel beépítése a nyitókép címe és a „Görgessen…” jelzés közé
    var hero = D.querySelector('#view-index div.hero') || D.querySelector('div.hero');
    if (!hero || !D.getElementById('akciok-szekcio')) return null;     // csak a főoldalon
    var p = D.getElementById('gy-ad-panel');
    if (p && p.parentNode) return p;
    var oldP = D.getElementById('ad' + '-panel'), oldS = D.getElementById('ad' + '-css');   // régebbi változatok maradványai
    if (oldP && oldP.parentNode) oldP.parentNode.removeChild(oldP);
    if (oldS && oldS.parentNode) oldS.parentNode.removeChild(oldS);
    var st = D.createElement('style'); st.id = 'gy-ad-css'; st.textContent = CSS; D.head.appendChild(st);
    p = D.createElement('div'); p.id = 'gy-ad-panel'; p.className = 'gy-ad-panel'; p.hidden = true;
    p.setAttribute('role', 'region'); p.setAttribute('aria-label', 'Figyelmébe ajánljuk');
    p.innerHTML = '<div class="gy-ad-head">Figyelmébe ajánljuk:</div><div class="gy-ad-stage"></div><div class="gy-ad-dots"></div>';
    var ref = hero.querySelector('.scroll-down');
    hero.insertBefore(p, ref && ref.parentNode === hero ? ref : null);
    return p;
  }
  var panel = null;
  var reduce = false;
  try { reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function inRange(a) { var t = today(); return !(a.from && t < a.from) && !(a.to && t > a.to); }
  function okSrc(u) { return typeof u === 'string' && /^(https?:\/\/|[A-Za-z0-9_\-.\/ %]+$)/.test(u) && !/^\s*(javascript|data):/i.test(u); }
  function okHref(u) { return typeof u === 'string' && /^(https?:\/\/|mailto:|tel:|[A-Za-z0-9_\-.\/#?=&%]+$)/i.test(u.trim()) && !/^\s*javascript:/i.test(u); }

  /* ---------- forrás 1: fájlnevek (AD1.jpg, AD2.png, …) + linkek.js ---------- */
  function loadImg(url) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im.naturalWidth > 0 ? url : null); };
      im.onerror = function () { res(null); };
      im.src = url;
    });
  }
  function findNumber(dir, n) {                                        // az n. hirdetés képe, a kiterjesztések sorrendjében
    return Promise.all(CFG.kiterjesztesek.map(function (x) { return loadImg(dir + CFG.elotag + n + '.' + x); }))
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
  function loadLinks(dir) {                                            // linkek.js: <script>-ként töltődik be, ezért helyben (file://) is működik
    return new Promise(function (res) {
      var done = false, s = D.createElement('script');
      function fin(v) { if (done) return; done = true; res(v); }
      W.HIRDETES_LINKEK = undefined;
      s.onload = function () { fin(parseLinks(W.HIRDETES_LINKEK)); };
      s.onerror = function () { fin({}); };
      s.src = dir + 'linkek.js?t=' + Date.now();
      D.head.appendChild(s);
      setTimeout(function () { fin({}); }, 2500);
    });
  }
  function fromDir(dir) {
    var links = loadLinks(dir);
    var found = [];
    function next(n, miss) {
      if (n > CFG.max || miss > CFG.hezag) return Promise.resolve();
      return findNumber(dir, n).then(function (u) {
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
  function fromFiles() {                                               // az első olyan helyen áll meg, ahol van hirdetés
    var i = 0;
    function step() {
      if (i >= CFG.mappak.length) return Promise.resolve([]);
      return fromDir(CFG.mappak[i++]).then(function (r) { return r.length ? r : step(); });
    }
    return step();
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
    if (!items.length) { diag('A hirdetéskezelő működik, de nem találtam hirdetés-képet (az AD1.png az index.html mellett kell legyen).', false); return; }   // nincs hirdetés: a panel nem jelenik meg
    var stage = panel.querySelector('.gy-ad-stage'), dotsWrap = panel.querySelector('.gy-ad-dots');
    stage.innerHTML = '';
    var slides = items.map(function (a, i) {
      var link = a.href && okHref(a.href);
      var el = D.createElement(link ? 'a' : 'div');
      el.className = 'gy-ad-slide' + (i === 0 ? ' active' : '');
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
      dotsWrap.innerHTML = slides.map(function (_, i) { return '<button type="button" class="gy-ad-dot' + (i === 0 ? ' active' : '') + '" data-i="' + i + '" aria-label="' + (i + 1) + '. ajánló"></button>'; }).join('');
      dotsWrap.addEventListener('click', function (e) { var b = e.target.closest('.gy-ad-dot'); if (b) { show(Number(b.getAttribute('data-i'))); restart(); } });
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
    var hero0 = panel.parentNode ? panel.parentNode.offsetHeight : 0;
    panel.hidden = false;
    panel.style.setProperty('display', 'block', 'important');
    if (!panel.parentNode || !D.documentElement.contains(panel)) { var hh = D.querySelector('div.hero'); if (hh) hh.insertBefore(panel, null); }
    var r = panel.getBoundingClientRect(), cs = W.getComputedStyle(panel);
    diag('Minden rendben: ' + items.length + ' hirdetés. Panel: ' + Math.round(r.width) + '×' + Math.round(r.height) + ' px, y=' + Math.round(r.top) + ', display=' + cs.display + ', opacity=' + cs.opacity + ', látható=' + cs.visibility + ', oldalban=' + D.documentElement.contains(panel) + ', szülő=' + (panel.parentNode ? panel.parentNode.className : '-') + '. Ablak: ' + W.innerWidth + '×' + W.innerHeight + '.', r.width > 50 && r.height > 50);
    var hero = panel.parentNode;                                         // a panel közvetlenül a „Görgessen a részletekért” jelzés fölé kerül, a cím a fölötte lévő helyen középre
    function place() {
      if (!hero || !hero.classList) return;
      hero.classList.add('gy-has-ad');
      var sd = hero.querySelector('.scroll-down');
      var gap = sd && sd.offsetParent === hero ? hero.clientHeight - sd.offsetTop : 90;
      var padB = parseFloat(W.getComputedStyle(hero).paddingBottom) || 0;
      panel.style.marginBottom = Math.max(8, Math.round(gap + 14 - padB)) + 'px';
    }
    place();
    W.addEventListener('resize', place);
    W.addEventListener('load', place);
    var hero1 = panel.parentNode ? panel.parentNode.offsetHeight : 0;
    if (Math.abs(hero1 - hero0) > 2) { try { W.dispatchEvent(new Event('resize')); } catch (e) {} }   // csak ha a nyitókép magassága tényleg megváltozott: az animáció újramér
  }

  function start() {
    panel = inject();
    if (!panel) return;
    (CFG.forras === 'json' ? fromJson() : fromFiles()).then(build).catch(function () { diag('Hiba történt a hirdetések betöltésekor.', false); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
