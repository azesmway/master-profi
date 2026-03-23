import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

// Как показывать уведомления когда приложение открыто
Notifications.setNotificationHandler({
  // @ts-ignore
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true })
})

export function usePushNotifications() {
  const router = useRouter()
  const isAuthenticated = useAuthStore(s => s.accessToken)
  const notifListener = useRef<any>(null)
  const responseListener = useRef<any>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    registerForPushNotifications()

    // Уведомление получено пока приложение открыто
    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Получено:', notification.request.content)
    })

    // Пользователь нажал на уведомление
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any
      console.log('[Push] Нажато:', data)

      if (data?.type === 'new_message' && data?.roomId) {
        router.push(`/chat/${data.roomId}`)
      } else if (data?.type === 'new_response' && data?.orderId) {
        router.push(`/order/${data.orderId}`)
      } else if (data?.type === 'response_accepted' && data?.roomId) {
        router.push(`/chat/${data.roomId}`)
      }
    })

    return () => {
      notifListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [isAuthenticated])
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('[Push] Только на реальном устройстве')
    return
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Разрешение не получено')
    return
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250]
    })
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID
    })

    console.log('[Push] Токен:', token.data)

    // Отправляем на сервер
    await api.post('/notifications/token', { token: token.data })
  } catch (e) {
    console.warn('[Push] Ошибка получения токена:', e)
  }
}
