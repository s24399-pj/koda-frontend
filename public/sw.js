const CACHE_NAME = 'koda-v1';
const API_CACHE = 'koda-api-v1';
const GEO_CACHE = 'koda-geo-v1';

const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (!['koda-v1', 'koda-api-v1', 'koda-geo-v1'].includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname === 'nominatim.openstreetmap.org') {
    event.respondWith(handleGeocodingRequest(event.request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(event.request));
  } else if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event.request));
  }
});

function isApiRequest(url) {
  return url.pathname.includes('/api/v1/') || (url.hostname === 'localhost' && url.port === '8137');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.origin === self.location.origin &&
    request.method === 'GET' &&
    (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.url.includes('/manifest.json'))
  );
}

async function handleGeocodingRequest(request) {
  if (request.method !== 'GET') return fetch(request);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(GEO_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleApiRequest(request) {
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Brak połączenia z internetem',
          offline: true,
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          empty: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    return new Response(
      JSON.stringify({
        error: 'Brak połączenia z internetem',
        offline: true,
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        empty: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.destination === 'document') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}
