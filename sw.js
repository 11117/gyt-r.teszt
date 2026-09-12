// Gondviselés Gyógyszertár – service worker
// v2: network-first stratégia a HTML oldalakhoz, hogy a telepített PWA-k
// mindig a legfrissebb verziót kapják amint van internetkapcsolat, és csak
// offline esetén essenek vissza a gyorsítótárazott változatra.
const CACHE_NAME = 'gondviseles-gyogyszertar-v3';
const APP_SHELL = [
  './',
  'index.html',
  'web-gyogyszeresz.html',
  'receptek.html',
  'tunetek-kereso.html',
  'dokumentumtar.html',
  'szinezok.html',
  'blog-tortenelem.html',
  'tortenelmunk-galeria.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isHTMLRequest(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
}

self.addEventListener('fetch', function (event) {
  const req = event.request;

  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  if (isHTMLRequest(req)) {
    event.respondWith(
      fetch(req).then(function (response) {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, clone); });
        }
        return response;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match('index.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (response) {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, clone); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
