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
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
    }
  } catch (e) {
    // не критично
  }
  queryClient.clear()
  useAuthStore.getState().logout()
}
