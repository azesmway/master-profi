import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { API_BASE_URL } from '@/constants'
import { useAuthStore } from '@/store/authStore'

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_KEY ?? ''

const PWAContext = createContext<any>(null)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  const swRef = useRef<ServiceWorkerRegistration | null>(null)
  const [swReady, setSwReady] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)

  // ── Регистрируем SW один раз ──────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then(reg => {
      swRef.current = reg
      setSwReady(true)
      setPushPermission(Notification.permission)
      // Восстанавливаем существующую подписку
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setPushSubscription(sub)
      })
    })
  }, [])

  // ── Синхронизируем токен при появлении accessToken ────────────────
  useEffect(() => {
    if (!accessToken || !pushSubscription) return
    fetch(`${API_BASE_URL}/notifications/web-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ subscription: pushSubscription.toJSON() })
    }).catch(e => console.warn('[PWA] sync error:', e))
  }, [accessToken, pushSubscription])

  // ── Автоподписка если разрешение уже granted но подписки нет ─────
  useEffect(() => {
    if (!swReady || !accessToken) return
    if (Notification.permission !== 'granted') return
    if (pushSubscription) return

    swRef.current?.pushManager.getSubscription().then(async sub => {
      if (sub) {
        setPushSubscription(sub)
        return
      }
      // Нет подписки — создаём
      const newSub = await subscribePush()
      if (newSub) setPushSubscription(newSub)
    })
  }, [swReady, accessToken])

  const subscribePush = async (): Promise<PushSubscription | null> => {
    if (!swRef.current || !VAPID_PUBLIC_KEY) return null
    try {
      // Сначала отписываемся от старой (на случай несовпадения ключей)
      const existing = await swRef.current.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      const sub = await swRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        // @ts-ignore
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      return sub
    } catch (e: any) {
      console.warn('[PWA] subscribe error:', e.message)
      return null
    }
  }

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    const permission = await Notification.requestPermission()
    setPushPermission(permission)
    if (permission !== 'granted') return false

    const sub = await subscribePush()
    if (sub) {
      setPushSubscription(sub)
      return true
    }
    return false
  }, [swReady, accessToken])

  if (Platform.OS !== 'web') return <>{children}</>

  return <PWAContext.Provider value={{ swReady, pushPermission, pushSubscription, requestPushPermission }}>{children}</PWAContext.Provider>
}

export function usePWAContext() {
  return useContext(PWAContext) ?? {}
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}
