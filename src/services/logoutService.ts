import { Platform } from 'react-native'

import { useAuthStore } from '@/store/authStore'

import { authService } from './authService'

export async function performLogout(queryClient: { clear: () => void }): Promise<void> {
  try {
    const refreshToken = useAuthStore.getState().refreshToken
    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

      // iOS Safari — .ready зависает, используем getRegistration
      const reg = isIOS
        ? await navigator.serviceWorker.getRegistration('/').catch(() => null)
        : await Promise.race([navigator.serviceWorker.ready, new Promise<null>(r => setTimeout(() => r(null), 3000))])

      if (reg) {
        const sub = await reg.pushManager?.getSubscription().catch(() => null)
        if (sub) await sub.unsubscribe().catch(() => null)
      }
    }
  } catch (e) {
    // не критично
  }

  queryClient.clear()
  useAuthStore.getState().logout()
}
