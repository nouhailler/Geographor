// Service worker — Géographie de France
// App shell caching : la coquille (HTML/JS/données/icônes) est mise en cache pour un chargement
// hors-ligne quasi instantané. Les tuiles de fond de carte (OSM/CARTO/IGN/Esri) sont mises en cache
// à la volée (stale-while-revalidate) mais ne sont jamais pré-téléchargées — un usage hors-ligne
// complet nécessiterait de télécharger les tuiles visitées au préalable en ligne.

const CACHE_VERSION = 'geo-fr-v1';
const APP_SHELL = [
  './',
  './Géographie de France.dc.html',
  './data.js',
  './manifest.json',
  './regions-version-simplifiee.geojson',
  './departements-version-simplifiee.geojson',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isTile = /tile|basemaps|arcgisonline|opentopomap/.test(url.hostname + url.pathname);

  if (isTile) {
    // Tuiles de carte : stale-while-revalidate (affiche le cache, rafraîchit en tâche de fond).
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Coquille applicative : cache d'abord, réseau en repli, mise à jour silencieuse du cache.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
