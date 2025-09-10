self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || 'Хлопоты'
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      data: data.data || {},
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    const text = event.data ? event.data.text() : 'Уведомление'
    event.waitUntil(self.registration.showNotification('Хлопоты', { body: text }))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
      return undefined
    })
  )
})
self.__WB_DISABLE_DEV_LOGS = true
import { precacheAndRoute } from 'workbox-precaching'
// Injected by workbox at build time
precacheAndRoute(self.__WB_MANIFEST || [])
