// Custom Service Worker for Push Notifications
// Uses vite-plugin-pwa injectManifest strategy

// Precache injected by vite-plugin-pwa
// eslint-disable-next-line no-undef
const PRECACHE_MANIFEST = self.__WB_MANIFEST || []

// Simple precaching without workbox-precaching import
const CACHE_NAME = 'cps-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = PRECACHE_MANIFEST.map((entry) =>
        typeof entry === 'string' ? entry : entry.url
      )
      return cache.addAll(urls).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push notification handler
self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body || 'Você tem uma nova notificação!',
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Casados Para Sempre',
        options
      )
    )
  } catch (err) {
    console.error('[SW] Error parsing push data:', err)
  }
})

// Notification click handler
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const urlToOpen = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (windowClients) {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if ('focus' in client) {
            client.navigate(urlToOpen)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
