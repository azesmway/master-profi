// ─── Master PWA Service Worker ──────────────────────────────────────────────
// Версия кэша — меняй при деплое
const CACHE_VERSION = 'master-v1.2.2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const API_CACHE = `${CACHE_VERSION}-api`

// Файлы для предкэширования (shell)
const PRECACHE_URLS = ['/', '/index.html', '/offline.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png']

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('master-') && key !== STATIC_CACHE && key !== API_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // JS/CSS бандлы Expo — НИКОГДА не кэшируем
  if (url.pathname.includes('/_expo/') || url.pathname.includes('/static/js/') || url.pathname.includes('/static/css/') || url.pathname.match(/\.(js|css|mjs)$/)) {
    event.respondWith(fetch(request))
    return
  }

  // API — network first
  if (url.pathname.startsWith('/v1/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // index.html — всегда с сервера
  if (request.destination === 'document' || url.pathname === '/') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')))
    return
  }

  // Иконки, шрифты — cache first
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/splash/')) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Всё остальное — просто fetch
  event.respondWith(fetch(request))
})

async function cacheFirstStrategy(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Оффлайн — возвращаем страницу оффлайн для навигации
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    return new Response('', { status: 503 })
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return (
      cached ||
      new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    )
  }
}

// ─── Push Notifications ──────────────────────────────────────────────────────

self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { title: 'Мастер', body: event.data?.text() ?? 'Новое уведомление' }
  }

  const title = data.title ?? 'Мастер'
  const options = {
    body: data.body ?? '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    image: data.image,
    vibrate: [100, 50, 100],
    data: data.data ?? {},
    tag: data.tag ?? 'master-notification',
    renotify: true,
    requireInteraction: data.requireInteraction ?? false,
    actions: buildActions(data.type)
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

function buildActions(type) {
  switch (type) {
    case 'new_response':
      return [
        { action: 'view', title: '👀 Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    case 'new_message':
      return [
        { action: 'reply', title: '💬 Ответить' },
        { action: 'view', title: 'Открыть чат' }
      ]
    case 'response_accepted':
      return [{ action: 'view', title: '✅ Открыть заказ' }]
    default:
      return [{ action: 'view', title: 'Открыть' }]
  }
}

// ─── Notification Click ──────────────────────────────────────────────────────

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const data = event.notification.data ?? {}
  const action = event.action

  let urlToOpen = '/'

  if (action === 'dismiss') return

  if (data.type === 'new_message' && data.roomId) {
    urlToOpen = `/chat/${data.roomId}`
  } else if (data.type === 'new_response' && data.orderId) {
    urlToOpen = `/order/${data.orderId}`
  } else if (data.type === 'response_accepted' && data.roomId) {
    urlToOpen = `/chat/${data.roomId}`
  } else if (data.type === 'nearby_order' && data.orderId) {
    urlToOpen = `/order/${data.orderId}`
  } else if (data.url) {
    urlToOpen = data.url
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Если приложение уже открыто — фокусируем и навигируем
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NAVIGATE', url: urlToOpen })
          return
        }
      }
      // Иначе открываем новое окно
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// ─── Background Sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages())
  }
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics())
  }
})

async function syncPendingMessages() {
  // Отправляем очередь сообщений из IndexedDB
  try {
    const db = await openDB()
    const pending = await getAll(db, 'pending_messages')
    for (const msg of pending) {
      await fetch('/v1/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${msg.token}` },
        body: JSON.stringify(msg.payload)
      })
      await deleteItem(db, 'pending_messages', msg.id)
    }
  } catch (e) {
    console.warn('[SW] Sync failed:', e)
  }
}

async function syncAnalytics() {
  try {
    const db = await openDB()
    const events = await getAll(db, 'analytics_queue')
    if (!events.length) return
    await fetch('/v1/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    })
    await clearStore(db, 'analytics_queue')
  } catch {}
}

// ─── IndexedDB helpers ───────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('master-pwa', 1)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('pending_messages')) {
        db.createObjectStore('pending_messages', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('analytics_queue')) {
        db.createObjectStore('analytics_queue', { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

function getAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

function deleteItem(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = e => reject(e.target.error)
  })
}

function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).clear()
    req.onsuccess = () => resolve()
    req.onerror = e => reject(e.target.error)
  })
}

// ─── Message from client ─────────────────────────────────────────────────────

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
