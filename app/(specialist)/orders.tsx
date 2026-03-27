import Screen from '@components/ui/Screen'
import { ordersService } from '@services/ordersService'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { usePWALocation } from '@/components/pwa/PWABanner'
import { CATEGORIES, CURRENCIES, QUERY_KEYS } from '@/constants'
import { getDistance } from '@/hooks/usePWA'
import { useTheme } from '@/hooks/useTheme'
import type { Order } from '@/types'

import { ordersStyles as os } from './orders.styles'

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { colors } = useTheme()
  const { title, description, category, budget, location, createdAt, responseCount } = order
  const timeAgo = format(new Date(createdAt), 'dd MMM, HH:mm', { locale: ru })
  const currency = budget ? CURRENCIES[budget.currency].symbol : null
  const unitLabel = budget?.unit === 'hour' ? '/час' : budget?.unit === 'day' ? '/день' : ''

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [os.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
      {/* Top row: category + time */}
      <View style={os.cardTopRow}>
        <View style={os.cardCatRow}>
          <Text style={os.cardCatIcon}>{category?.icon ?? '🔑'}</Text>
          <Text style={[os.cardCatName, { color: colors.textSecondary }]}>{category?.name ?? 'Без названия'}</Text>
        </View>
        <Text style={[os.cardTime, { color: colors.textSecondary }]}>{timeAgo}</Text>
      </View>

      {/* Title */}
      <Text style={[os.cardTitle, { color: colors.text }]}>{title}</Text>

      {/* Description */}
      <Text style={[os.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>

      {/* Footer */}
      <View style={os.cardFooter}>
        <View style={os.cardFooterLeft}>
          <Text style={[os.cardCity, { color: colors.textSecondary }]}>📍 {location?.city ?? '- Нет -'}</Text>
          {responseCount > 0 && (
            <View style={os.cardResponseBadge}>
              <Text style={os.cardResponseText}>{responseCount} откликов</Text>
            </View>
          )}
        </View>
        {budget && (
          <Text style={[os.cardBudget, { color: colors.text }]}>
            {budget.from.toLocaleString()}–{budget.to?.toLocaleString() ?? '?'}
            {currency}
            <Text style={os.cardBudgetUnit}>{unitLabel}</Text>
          </Text>
        )}
      </View>
    </Pressable>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS = [{ id: null, name: 'Все', icon: null }, ...CATEGORIES.slice(0, 6)]

export default function SpecialistOrdersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const { location, requestLocation } = usePWALocation()

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'feed', activeCat],
    queryFn: () => ordersService.findAll({ categoryId: activeCat || undefined }).then((r: any) => r.data.data),
    staleTime: 1000 * 30
  })

  useEffect(() => {
    requestLocation()
  }, [])

  const filtered = data ?? []

  const sorted = filtered.sort((a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    if (!location || !location.lat || !location.lng) return 0
    const dA = getDistance(location.lat, location.lng, a.lat, a.lng)
    const dB = getDistance(location.lat, location.lng, b.lat, b.lng)
    return dA - dB
  })

  return (
    <Screen>
      {/* Header */}
      <View style={os.header}>
        <Text style={[os.headerTitle, { color: colors.text }]}>Лента заказов</Text>
        <View style={os.onlineRow}>
          <View style={os.onlineDot} />
          <Text style={os.onlineText}>Вы онлайн</Text>
        </View>
      </View>

      {/* Category filter */}
      <View style={os.filterWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS as any[]}
          keyExtractor={item => item.id ?? 'all'}
          contentContainerStyle={{ paddingHorizontal: sm(20), gap: sm(8) }}
          renderItem={({ item }) => {
            const isActive = item.id === activeCat
            return (
              <Pressable
                onPress={() => setActiveCat(item.id ?? null)}
                style={[
                  os.catChip,
                  {
                    backgroundColor: isActive ? '#FF6B35' : colors.card,
                    borderColor: isActive ? '#FF6B35' : colors.border
                  }
                ]}>
                {item.icon && <Text style={os.catChipIcon}>{item.icon}</Text>}
                <Text style={[os.catChipText, { color: isActive ? '#fff' : colors.textSecondary }]}>{item.name}</Text>
              </Pressable>
            )
          }}
        />
      </View>

      {/* Orders list */}
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: sm(20), paddingBottom: vs(20), gap: vs(12) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              setTimeout(() => setRefreshing(false), 800)
            }}
            tintColor="#FF6B35"
          />
        }
        ListHeaderComponent={<Text style={[os.listHeader, { color: colors.textSecondary }]}>{sorted.length} заказов в вашем городе</Text>}
        ListEmptyComponent={
          <View style={os.emptyWrap}>
            <Text style={os.emptyIcon}>📭</Text>
            <Text style={[os.emptyTitle, { color: colors.text }]}>Нет заказов</Text>
            <Text style={[os.emptySubtitle, { color: colors.textSecondary }]}>В этой категории пока нет активных заказов</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
            <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />
          </Animated.View>
        )}
      />
    </Screen>
  )
}
