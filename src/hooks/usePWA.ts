/**
 * usePWA — хук для Web Push, геолокации и установки PWA
 * Используется вместо expo-notifications и expo-location на web-платформе
 */

import Alert from '@blazejkustra/react-native-alert'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

// VAPID public key — генерируй через web-push: npx web-push generate-vapid-keys
// Заменить на реальный ключ из env
const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_KEY ?? ''

// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface GeolocationData {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  pushSupported: boolean
  pushPermission: NotificationPermission | 'unsupported'
  pushSubscription: PushSubscription | null
  location: GeolocationData | null
  locationError: string | null
  isOnline: boolean
  swRegistered: boolean
  updateAvailable: boolean
}

// ─── Хук ──────────────────────────────────────────────────────────────────────

export function usePWA(apiBaseUrl: string, accessToken?: string | null) {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    pushSupported: false,
    pushPermission: 'default',
    pushSubscription: null,
    location: null,
    locationError: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    swRegistered: false,
    updateAvailable: false
  })

  const swRef = useRef<ServiceWorkerRegistration | null>(null)
  const deferredPrompt = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)
  const newWorkerRef = useRef<ServiceWorker | null>(null)

  // Регистрация Service Worker
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        swRef.current = reg
        setState(s => ({ ...s, swRegistered: true }))

        // Проверяем обновление SW
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorkerRef.current = newWorker
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(s => ({ ...s, updateAvailable: true }))
            }
          })
        })

        // Обработка навигации из push-уведомления
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data?.type === 'NAVIGATE') {
            window.location.href = event.data.url
          }
        })

        // Инициализируем push после регистрации SW
        initPush(reg)
      })
      .catch(err => {
        console.warn('[PWA] SW registration failed:', err)
      })

    return () => {
      // Очистка watcher геолокации
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // Онлайн/оффлайн статус
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handleOnline = () => setState(s => ({ ...s, isOnline: true }))
    const handleOffline = () => setState(s => ({ ...s, isOnline: false }))
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // A2HS — кнопка "Установить приложение"
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handler = (e: any) => {
      e.preventDefault()
      deferredPrompt.current = e
      setState(s => ({ ...s, isInstallable: true }))
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Определяем standalone режим (уже установлено)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    setState(s => ({ ...s, isInstalled: isStandalone }))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ─── Push ──────────────────────────────────────────────────────────────────

  const initPush = async (reg: ServiceWorkerRegistration) => {
    if (!('PushManager' in window) || !('Notification' in window)) {
      setState(s => ({ ...s, pushSupported: false, pushPermission: 'unsupported' }))
      return
    }

    setState(s => ({
      ...s,
      pushSupported: true,
      pushPermission: Notification.permission
    }))

    // Если уже есть разрешение — пробуем получить/восстановить подписку
    if (Notification.permission === 'granted') {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        setState(s => ({ ...s, pushSubscription: sub }))
        // Синхронизируем токен с сервером
        await syncPushToken(sub)
      }
    }
  }

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web') return false
    if (!('Notification' in window) || !swRef.current) return false

    try {
      const permission = await Notification.requestPermission()
      setState(s => ({ ...s, pushPermission: permission }))

      if (permission !== 'granted') return false
      const sub = await subscribePush(swRef.current)
      if (sub) {
        setState(s => ({ ...s, pushSubscription: sub }))
        await syncPushToken(sub)
        return true
      }
      return false
    } catch (e) {
      console.warn('[PWA] Push permission error:', e)
      return false
    }
  }, [accessToken])

  const subscribePush = async (reg: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    Alert.alert('Start subscribePush')
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[PWA] VAPID_PUBLIC_KEY не задан')
      return null
    }

    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // @ts-ignore
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      return sub
    } catch (e) {
      // @ts-ignore
      console.warn('[PWA] Push subscribe error:', e)
      return null
    }
  }

  const syncPushToken = async (sub: PushSubscription) => {
    if (!accessToken || !apiBaseUrl) return
    try {
      await fetch(`${apiBaseUrl}/notifications/web-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ subscription: sub.toJSON() })
      })
    } catch (e) {
      console.warn('[PWA] Sync push token error:', e)
    }
  }

  const unsubscribePush = useCallback(async () => {
    const sub = state.pushSubscription
    if (!sub) return
    await sub.unsubscribe()
    setState(s => ({ ...s, pushSubscription: null }))
  }, [state.pushSubscription])

  // ─── Геолокация ──────────────────────────────────────────────────────────

  const requestLocation = useCallback((): Promise<GeolocationData | null> => {
    if (Platform.OS !== 'web') return Promise.resolve(null)
    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, locationError: 'Геолокация не поддерживается' }))
      return Promise.resolve(null)
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const data: GeolocationData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          }
          setState(s => ({ ...s, location: data, locationError: null }))
          resolve(data)
        },
        err => {
          const msg = err.code === 1 ? 'Доступ к геолокации запрещён' : err.code === 2 ? 'Местоположение недоступно' : 'Превышено время ожидания геолокации'
          setState(s => ({ ...s, locationError: msg }))
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      )
    })
  }, [])

  // Непрерывный трекинг (для специалистов — обновление позиции в реальном времени)
  const startLocationTracking = useCallback((onUpdate?: (data: GeolocationData) => void) => {
    if (Platform.OS !== 'web') return
    if (!('geolocation' in navigator)) return
    if (watchIdRef.current !== null) return // уже запущен

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const data: GeolocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }
        setState(s => ({ ...s, location: data, locationError: null }))
        onUpdate?.(data)
      },
      err => {
        console.warn('[PWA] Location watch error:', err)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    )
  }, [])

  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // ─── Установка PWA ────────────────────────────────────────────────────────

  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt.current) return false
    deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    deferredPrompt.current = null
    setState(s => ({ ...s, isInstallable: false, isInstalled: outcome === 'accepted' }))
    return outcome === 'accepted'
  }, [])

  // ─── Обновление SW ───────────────────────────────────────────────────────

  const applyUpdate = useCallback(() => {
    if (newWorkerRef.current) {
      newWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [])

  return {
    ...state,
    requestPushPermission,
    unsubscribePush,
    requestLocation,
    startLocationTracking,
    stopLocationTracking,
    installPWA,
    applyUpdate
  }
}

// ─── Утилиты ────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

// ─── Хелпер для геодистанции (Haversine) ────────────────────────────────────

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // км
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}
