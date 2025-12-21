
const CACHE_NAME = 'legal-drafting-offline-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching shell assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Use a Stale-While-Revalidate strategy for internal assets
  // and Cache-First for external CDN assets like esm.sh and fonts
  const url = new URL(event.request.url);

  if (url.origin === location.origin || 
      url.href.includes('esm.sh') || 
      url.href.includes('gstatic.com') || 
      url.href.includes('tailwindcss.com')) {
    
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('http')) {
             if (networkResponse && networkResponse.status === 200) {
                 // Clone and cache for external assets
                 const responseToCache = networkResponse.clone();
                 caches.open(CACHE_NAME).then((cache) => {
                   cache.put(event.request, responseToCache);
                 });
             }
             return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // If network fails, return cached response if available
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
