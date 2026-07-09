import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA : manifest + service worker généré (Workbox).
// - App shell (HTML/JS/GeoJSON/icônes) : precache.
// - Tuiles de carte (CARTO/OpenTopoMap/Esri) : runtime cache StaleWhileRevalidate.
// - Appels d'API (geo.api.gouv.fr, Wikidata, Wikipédia) : NetworkFirst avec repli cache.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'geo/regions.geojson', 'geo/departements.geojson'],
      manifest: {
        name: 'Géographie de France',
        short_name: 'Géo France',
        description:
          'Atlas interactif de la géographie de France : régions, départements, communes, fiches détaillées et cartes thématiques.',
        start_url: '.',
        scope: '.',
        id: '/geographie-de-france',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f5f4f0',
        theme_color: '#2f5d8a',
        lang: 'fr',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,geojson,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /basemaps\.cartocdn\.com|tile\.opentopomap\.org|server\.arcgisonline\.com/.test(url.hostname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              /geo\.api\.gouv\.fr|query\.wikidata\.org|wikipedia\.org|wikimedia\.org/.test(url.hostname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'geo-apis',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
