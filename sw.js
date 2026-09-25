// Gondviselés Gyógyszertár – service worker
// v2: network-first stratégia a HTML oldalakhoz, hogy a telepített PWA-k
// mindig a legfrissebb verziót kapják amint van internetkapcsolat, és csak
// offline esetén essenek vissza a gyorsítótárazott változatra.
const CACHE_NAME = 'gondviseles-gyogyszertar-v25';
// Azok a külső (más eredetű) domainek, amelyekről betöltött, ikonokhoz/betűtípusokhoz
// szükséges erőforrásokat (CSS, woff2 fájlok) a PWA offline használatához is
// gyorsítótárazzuk, hogy internet nélkül is helyesen jelenjenek meg az ikonok és
// a webes betűtípusok. Ezek verziózott, változatlan (immutable) fájlok, ezért
// "cache-first" stratégiával, egyszeri betöltés után tartósan tárolhatók.
const OFFLINE_ASSET_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];
const ASSET_CACHE_NAME = 'gondviseles-gyogyszertar-assets-v1';
const APP_SHELL = [
  './',
  'index.html',
  'web-gyogyszeresz.html',
  'receptek.html',
  'tunetek-kereso.html',
  'gyogyszer-labirintus.html',
  'dokumentumtar.html',
  'szinezok.html',
  'blog-tortenelem.html',
  'tortenelmunk-galeria.html',
  'impresszum.html',
  'adatkezeles.html',
  'manifest.json'
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
        keys.filter(function (key) { return key !== CACHE_NAME && key !== ASSET_CACHE_NAME; })
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
  if (req.method !== 'GET') return;

  const reqUrl = new URL(req.url);

  if (reqUrl.origin !== self.location.origin) {
    if (OFFLINE_ASSET_HOSTS.indexOf(reqUrl.hostname) === -1) return;
    // Cache-first: ha már megvan a gyorsítótárban (pl. egy korábbi online
    // látogatáskor lementődött), azonnal onnan szolgáljuk ki - offline is működik.
    // Ha még nincs meg, megpróbáljuk letölteni és elmenteni későbbre.
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req, { mode: 'cors' }).then(function (response) {
            if (response && (response.status === 200 || response.type === 'opaque')) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(function () {
            // Se gyorsítótár, se hálózat - az ikon/betűtípus egyszerűen nem jelenik
            // meg, de ez nem töri el az oldal működését.
            return new Response('', { status: 504, statusText: 'Offline és nincs gyorsítótárazva' });
          });
        });
      })
    );
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
