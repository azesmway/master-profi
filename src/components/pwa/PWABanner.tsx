/**
 * PWABanner — показывает:
 *  1. Кнопку "Установить приложение" (A2HS)
 *  2. Запрос разрешения на push-уведомления
 *  3. Запрос геолокации
 *  4. Баннер об обновлении SW
 *
 * Использование в _layout.tsx:
 *   import { PWABanner } from '@/components/pwa/PWABanner'
 *   // внутри провайдеров:
 *   <PWABanner />
 */

import { useEffect, useRef, useState } from 'react'
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { API_BASE_URL } from '@/constants'
import { usePWAContext } from '@/context/PWAContext'
import { usePWA } from '@/hooks/usePWA'
import { useAuthStore } from '@/store/authStore'

export function PWABanner() {
  const { pushPermission, requestPushPermission } = usePWAContext()
  const { accessToken } = useAuthStore()
  const pwa = usePWA(API_BASE_URL, accessToken)

  const [shown, setShown] = useState<'install' | 'push' | 'update' | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const pushAskedKey = 'pwa_push_asked'

  useEffect(() => {
    if (!accessToken) return
    if (pushPermission === 'default' && !localStorage.getItem(pushAskedKey)) {
      setTimeout(() => show('push'), 3000)
    }
  }, [accessToken, pushPermission])

  // Определяем что показать
  useEffect(() => {
    if (pwa.updateAvailable) {
      show('update')
      return
    }
    if (pwa.isInstallable && !pwa.isInstalled) {
      const dismissed = sessionStorage.getItem('pwa_install_dismissed')
      if (!dismissed) {
        show('install')
        return
      }
    }
    if (accessToken && pwa.pushSupported && pwa.pushPermission === 'default' && !localStorage.getItem(pushAskedKey)) {
      // Небольшая задержка — не спрашиваем сразу при входе
      const t = setTimeout(() => show('push'), 3000)
      return () => clearTimeout(t)
    }
  }, [pwa.updateAvailable, pwa.isInstallable, pwa.pushPermission, accessToken])

  function show(type: typeof shown) {
    setShown(type)
    Animated.spring(opacity, { toValue: 1, useNativeDriver: true }).start()
  }

  function hide() {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShown(null)
    })
  }

  if (Platform.OS !== 'web') return null
  if (!shown) return null

  return (
    <Animated.View style={[s.container, { opacity }]}>
      {shown === 'install' && (
        <View style={s.banner}>
          <Text style={s.icon}>📱</Text>
          <View style={s.text}>
            <Text style={s.title}>Установить приложение</Text>
            <Text style={s.sub}>Работает без интернета, быстрее браузера</Text>
          </View>
          <View style={s.actions}>
            <Pressable
              style={s.btnPrimary}
              onPress={async () => {
                hide()
                await pwa.installPWA()
              }}>
              <Text style={s.btnPrimaryText}>Установить</Text>
            </Pressable>
            <Pressable
              style={s.btnGhost}
              onPress={() => {
                sessionStorage.setItem('pwa_install_dismissed', '1')
                hide()
              }}>
              <Text style={s.btnGhostText}>Позже</Text>
            </Pressable>
          </View>
        </View>
      )}

      {shown === 'push' && (
        <View style={s.banner}>
          <Text style={s.icon}>🔔</Text>
          <View style={s.text}>
            <Text style={s.title}>Включить уведомления</Text>
            <Text style={s.sub}>Узнавайте о новых заказах и сообщениях</Text>
          </View>
          <View style={s.actions}>
            <Pressable
              style={s.btnPrimary}
              onPress={async () => {
                hide()
                localStorage.setItem(pushAskedKey, '1')
                await pwa.requestPushPermission()
              }}>
              <Text style={s.btnPrimaryText}>Включить</Text>
            </Pressable>
            <Pressable
              style={s.btnGhost}
              onPress={() => {
                localStorage.setItem(pushAskedKey, '1')
                hide()
              }}>
              <Text style={s.btnGhostText}>Не сейчас</Text>
            </Pressable>
          </View>
        </View>
      )}

      {shown === 'update' && (
        <View style={s.banner}>
          <Text style={s.icon}>⚡</Text>
          <View style={s.text}>
            <Text style={s.title}>Доступно обновление</Text>
            <Text style={s.sub}>Новая версия приложения готова к установке</Text>
          </View>
          <View style={s.actions}>
            <Pressable style={s.btnPrimary} onPress={pwa.applyUpdate}>
              <Text style={s.btnPrimaryText}>Обновить</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  )
}

// ─── Хук геолокации (для экранов где нужна позиция) ─────────────────────────

export function usePWALocation() {
  const { accessToken } = useAuthStore()
  const pwa = usePWA(API_BASE_URL, accessToken)
  return {
    location: pwa.location,
    locationError: pwa.locationError,
    requestLocation: pwa.requestLocation,
    startTracking: pwa.startLocationTracking,
    stopTracking: pwa.stopLocationTracking
  }
}

const s = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    bottom: 90,
    left: 12,
    right: 12,
    zIndex: 9999
  },
  banner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    padding: 16,
    flexDirection: 'row' as any,
    alignItems: 'flex-start' as any,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  icon: {
    fontSize: 28,
    marginTop: 2
  },
  text: {
    flex: 1,
    gap: 4
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as any
  },
  sub: {
    color: '#999',
    fontSize: 12,
    lineHeight: 16
  },
  actions: {
    flexDirection: 'column' as any,
    gap: 6,
    alignItems: 'flex-end' as any
  },
  btnPrimary: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as any
  },
  btnGhost: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  btnGhostText: {
    color: '#666',
    fontSize: 12
  }
})
