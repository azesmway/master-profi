import { useEffect, useRef, useState } from 'react'
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { usePWAContext } from '@/context/PWAContext'
import { useAuthStore } from '@/store/authStore'

export function PWABanner() {
  const { pushPermission, requestPushPermission } = usePWAContext()
  const { accessToken } = useAuthStore()

  const [shown, setShown] = useState<'install' | 'install_ios' | 'push' | 'update' | null>(null)
  const [installEvent, setInstallEvent] = useState<any>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const pushAskedKey = 'pwa_push_asked'

  // Android — перехватываем beforeinstallprompt
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handler = (e: any) => {
      e.preventDefault()
      setInstallEvent(e)

      // Показываем баннер установки только если ещё не установлено
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!isStandalone && !sessionStorage.getItem('install_dismissed')) {
        setTimeout(() => show('install'), 1500)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // iOS + push
  useEffect(() => {
    if (!accessToken || Platform.OS !== 'web') return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (isIOS && !isStandalone) {
      const dismissed = sessionStorage.getItem('ios_install_dismissed')
      if (!dismissed) {
        const t = setTimeout(() => show('install_ios'), 2000)
        return () => clearTimeout(t)
      }
      return
    }

    if (pushPermission === 'default' && !localStorage.getItem(pushAskedKey)) {
      const t = setTimeout(() => show('push'), 3000)
      return () => clearTimeout(t)
    }
  }, [accessToken, pushPermission])

  function show(type: typeof shown) {
    setShown(type)
    Animated.spring(opacity, { toValue: 1, useNativeDriver: true }).start()
  }

  function hide() {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShown(null)
    })
  }

  async function handleAndroidInstall() {
    if (!installEvent) return
    hide()
    installEvent.prompt()
    const result = await installEvent.userChoice
    if (result.outcome === 'accepted') {
      sessionStorage.setItem('install_dismissed', '1')
    }
  }

  if (Platform.OS !== 'web') return null
  if (!shown) return null

  return (
    <Animated.View style={[s.container, { opacity }]}>
      {/* Android install */}
      {shown === 'install' && (
        <View style={s.banner}>
          <Text style={s.icon}>📲</Text>
          <View style={s.text}>
            <Text style={s.title}>Установить приложение</Text>
            <Text style={s.sub}>Работает быстрее и без адресной строки</Text>
          </View>
          <View style={s.actions}>
            <Pressable style={s.btnPrimary} onPress={handleAndroidInstall}>
              <Text style={s.btnPrimaryText}>Установить</Text>
            </Pressable>
            <Pressable
              style={s.btnGhost}
              onPress={() => {
                sessionStorage.setItem('install_dismissed', '1')
                hide()
              }}>
              <Text style={s.btnGhostText}>Не сейчас</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* iOS install */}
      {shown === 'install_ios' && (
        <View style={s.banner}>
          <Text style={s.icon}>📲</Text>
          <View style={s.text}>
            <Text style={s.title}>Добавьте на главный экран</Text>
            <Text style={s.sub}>Нажмите Поделиться → «На экран Домой»</Text>
          </View>
          <Pressable
            style={s.btnGhost}
            onPress={() => {
              sessionStorage.setItem('ios_install_dismissed', '1')
              hide()
            }}>
            <Text style={s.btnGhostText}>Понятно</Text>
          </Pressable>
        </View>
      )}

      {/* Push */}
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
                await new Promise(r => setTimeout(r, 300))
                await requestPushPermission()
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

      {/* Update */}
      {shown === 'update' && (
        <View style={s.banner}>
          <Text style={s.icon}>⚡</Text>
          <View style={s.text}>
            <Text style={s.title}>Доступно обновление</Text>
            <Text style={s.sub}>Новая версия приложения готова</Text>
          </View>
          <View style={s.actions}>
            <Pressable style={s.btnPrimary} onPress={() => window.location.reload()}>
              <Text style={s.btnPrimaryText}>Обновить</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  )
}

export function usePWALocation() {
  return {
    location: null,
    locationError: null,
    requestLocation: async () => null,
    startTracking: () => {},
    stopTracking: () => {}
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
  icon: { fontSize: 28, marginTop: 2 },
  text: { flex: 1, gap: 4 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700' as any },
  sub: { color: '#999', fontSize: 12, lineHeight: 16 },
  actions: { flexDirection: 'column' as any, gap: 6, alignItems: 'flex-end' as any },
  btnPrimary: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '600' as any },
  btnGhost: { paddingHorizontal: 8, paddingVertical: 4 },
  btnGhostText: { color: '#666', fontSize: 12 }
})
