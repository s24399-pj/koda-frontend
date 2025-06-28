const CACHE_NAME = 'koda-v1';
const API_CACHE = 'koda-api-v1';

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
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!['koda-v1', 'koda-api-v1'].includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  }
});

function isApiRequest(url) {
  console.log('SW checking URL:', url.href, 'pathname:', url.pathname);

  const isApi =
    url.pathname.includes('/api/v1/') ||
    (url.hostname === 'localhost' && url.port === '8137') ||
    url.hostname.includes('localhost:8137');

  console.log('SW isApiRequest result:', isApi);
  return isApi;
}

function isStaticAsset(request) {
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  return (
    request.method === 'GET' &&
    (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.url.includes('/manifest.json'))
  );
}

async function handleApiRequest(request) {
  console.log('SW handling API request:', request.url, 'method:', request.method);

  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Brak połączenia z internetem',
          offline: true,
          queued: true,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  try {
    console.log('SW trying network for:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok && networkResponse.status === 200) {
      console.log('SW network success, caching response for:', request.url);
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    } else {
      console.log('SW network response not OK:', networkResponse.status);
    }

    return networkResponse;
  } catch (error) {
    console.log('SW network failed, checking cache for:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('SW found in cache, returning:', request.url);
      return cachedResponse;
    }

    console.log('SW no cache found for:', request.url);
    console.log('SW creating offline response');

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
  console.log('SW handling static asset:', request.url, 'destination:', request.destination);

  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('SW found cached static asset:', request.url);
      return cachedResponse;
    }

    console.log('SW trying network for static asset:', request.url);
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      console.log('SW caching static asset:', request.url);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('SW static asset failed:', request.url, 'error:', error.message);

    if (request.destination === 'document') {
      console.log('SW document request failed, trying homepage fallback');
      const fallback = await caches.match('/');
      if (fallback) {
        console.log('SW serving homepage as fallback');
        return fallback;
      }

      console.log('SW no homepage in cache, serving app shell');
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Koda - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <div style="text-align: center; padding: 50px; font-family: Arial;">
              <h1>Koda</h1>
              <p>Aplikacja działa offline</p>
              <p><a href="/">Wróć do strony głównej</a></p>
            </div>
          </div>
          <script>window.location.href = '/';</script>
        </body>
        </html>
      `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    console.log('SW no fallback for:', request.url);
    return new Response('Offline - resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}
