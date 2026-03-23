import Screen from '@components/ui/Screen'
import { ordersService } from '@services/ordersService'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES, CURRENCIES, QUERY_KEYS } from '@/constants'
import type { Order } from '@/types'

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { title, description, category, budget, location, createdAt, responseCount } = order
  const timeAgo = format(new Date(createdAt), 'dd MMM, HH:mm', { locale: ru })
  const currency = budget ? CURRENCIES[budget.currency].symbol : null
  const unitLabel = budget?.unit === 'hour' ? '/час' : budget?.unit === 'day' ? '/день' : ''

  return (
    <Pressable onPress={onPress} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 active:opacity-80">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1 mr-3">
          <Text className="text-lg">{category && category.icon ? category.icon : '🔑'}</Text>
          <Text className="text-text-muted dark:text-text-secondary text-xs">{category && category.name ? category.name : 'Без названия'}</Text>
        </View>
        <Text className="text-text-muted dark:text-text-secondary text-xs">{timeAgo}</Text>
      </View>

      <Text className="text-dark dark:text-white font-semibold text-base mb-1">{title}</Text>
      <Text className="text-text-muted dark:text-text-secondary text-sm mb-3" numberOfLines={2}>
        {description}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-text-muted dark:text-text-secondary text-xs">📍 {location && location.city ? location.city : '- Нет -'}</Text>
          {responseCount > 0 && (
            <View className="bg-primary/10 px-2 py-0.5 rounded-md">
              <Text className="text-primary text-xs font-medium">{responseCount} откликов</Text>
            </View>
          )}
        </View>
        {budget && (
          <Text className="text-dark dark:text-white font-semibold text-sm">
            {budget.from.toLocaleString()}–{budget.to?.toLocaleString() ?? '?'}
            {currency}
            <Text className="text-text-muted dark:text-text-secondary text-xs font-normal">{unitLabel}</Text>
          </Text>
        )}
      </View>
    </Pressable>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS = [{ id: null, name: 'Все' }, ...CATEGORIES.slice(0, 6)]

export default function SpecialistOrdersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'feed', activeCat],
    queryFn: () =>
      ordersService
        .findAll({
          categoryId: activeCat || undefined
        })
        .then((r: any) => r.data.data),
    staleTime: 1000 * 30
  })

  const filtered = data ?? []

  return (
    <Screen>
      {/* Header */}
      <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
        <Text className="text-dark dark:text-white text-2xl font-bold">Лента заказов</Text>
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-success" />
          <Text className="text-success text-sm font-medium">Вы онлайн</Text>
        </View>
      </View>

      {/* Category filter */}
      <View className="mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS as any[]}
          keyExtractor={item => item.id ?? 'all'}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const isActive = item.id === activeCat
            return (
              <Pressable
                onPress={() => setActiveCat(item.id ?? null)}
                className={[
                  'flex-row items-center gap-1.5 px-3 py-2 rounded-xl border',
                  isActive ? 'bg-primary border-primary' : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border'
                ].join(' ')}>
                {item.icon && <Text className="text-sm">{item.icon}</Text>}
                <Text className={['text-sm font-medium', isActive ? 'text-white' : 'text-text-muted dark:text-text-secondary'].join(' ')}>{item.name}</Text>
              </Pressable>
            )
          }}
        />
      </View>

      {/* Orders list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
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
        ListHeaderComponent={<Text className="text-text-muted dark:text-text-secondary text-sm mb-1">{filtered.length} заказов в вашем городе</Text>}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">📭</Text>
            <Text className="text-dark dark:text-white text-lg font-semibold mb-2">Нет заказов</Text>
            <Text className="text-text-muted dark:text-text-secondary text-sm text-center">В этой категории пока нет активных заказов</Text>
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
