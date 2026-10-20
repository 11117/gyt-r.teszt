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
      if (!reduce) {
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
