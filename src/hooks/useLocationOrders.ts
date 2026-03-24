import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { useEffect, useRef } from 'react'

import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000 // каждые 5 минут
const ORDERS_CHECK_INTERVAL = 3 * 60 * 1000 // проверка заказов каждые 3 минуты
const NEARBY_RADIUS_KM = 10 // радиус поиска заказов

export function useLocationOrders() {
  const user = useAuthStore(s => s.user)
  const isSpecialist = user?.role === 'specialist'

  const locationTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const ordersTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const notifiedOrderIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isSpecialist) return

    startTracking()

    return () => {
      if (locationTimer.current) clearInterval(locationTimer.current)
      if (ordersTimer.current) clearInterval(ordersTimer.current)
    }
  }, [isSpecialist])

  async function startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return

    // Сразу получаем локацию
    await updateLocation()
    await checkNearbyOrders()

    // Периодически обновляем
    locationTimer.current = setInterval(updateLocation, LOCATION_UPDATE_INTERVAL)
    ordersTimer.current = setInterval(checkNearbyOrders, ORDERS_CHECK_INTERVAL)
  }

  async function updateLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      const { latitude: lat, longitude: lng } = location.coords
      lastLocationRef.current = { lat, lng }

      // Отправляем на сервер
      await api.patch('/specialists/me/location', { lat, lng })
    } catch (e) {
      console.warn('[Location] Ошибка обновления локации:', e)
    }
  }

  async function checkNearbyOrders() {
    if (!lastLocationRef.current) return

    try {
      const { lat, lng } = lastLocationRef.current
      const res = await api.get('/orders/nearby', {
        params: { lat, lng, radius: NEARBY_RADIUS_KM, limit: 5 }
      })

      const orders: any[] = res.data?.data ?? []

      for (const order of orders) {
        // Не уведомляли раньше об этом заказе
        if (notifiedOrderIds.current.has(order.id)) continue

        notifiedOrderIds.current.add(order.id)

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📍 Новый заказ рядом с вами',
            body: `${order.title} · ${order.distanceKm?.toFixed(1) ?? '?'} км от вас`,
            data: { type: 'nearby_order', orderId: order.id },
            sound: true
          },
          trigger: null // сразу
        })
      }
    } catch (e) {
      console.warn('[Location] Ошибка проверки заказов рядом:', e)
    }
  }
}
