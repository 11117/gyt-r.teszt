// Gondviselés Gyógyszertár – egyszerű service worker
// Csak a telepíthetőséghez és egy alapszintű offline app-shell gyorsítótárhoz szükséges.
const CACHE_NAME = 'gondviseles-gyogyszertar-v1';
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
      return cache.addAll(APP_SHELL).catch(function () {
        // Ha valamelyik fájl épp nem elérhető telepítéskor, ne akadjon el a teljes SW telepítés.
      });
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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const req = event.request;

  // Csak a saját (same-origin) GET kéréseket kezeljük; a külső beágyazásokat
  // (pl. szimpatika.hu, Google Térkép) érintetlenül hagyjuk.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
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
