import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

import styles from './responses.styles'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Ожидает', color: '#F59E0B', bg: '#F59E0B20' },
  accepted: { label: 'Принят', color: '#22C55E', bg: '#22C55E20' },
  rejected: { label: 'Отклонён', color: '#EF4444', bg: '#EF444420' }
}

const ORDER_STATUS: Record<string, string> = {
  published: 'Открыт',
  in_progress: 'В работе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  pending_review: 'На проверке'
}

// ─── Response Card ────────────────────────────────────────────────────────────

function ResponseCard({ item, onPress }: { item: any; onPress: () => void }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const order = item.order
  const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending
  const catName = CATEGORIES.find(c => c.id === String(order?.categoryId))?.name ?? ''

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Pressable onPress={onPress} style={[s.card, { gap: vs(12) }]}>
        {/* Header: title + status badge */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {order?.title ?? 'Заказ'}
            </Text>
            {catName ? <Text style={[styles.cardCatName, { color: colors.textMuted }]}>{catName}</Text> : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {/* Offer box */}
        <View style={[styles.offerBox, { backgroundColor: colors.elevated }]}>
          <View>
            <Text style={[styles.offerLabel, { color: colors.textMuted }]}>Моё предложение</Text>
            <Text style={[styles.offerPrice, { fontWeight: '700' }]}>{item.price ? `${Number(item.price).toLocaleString()} ₸` : 'Договорная'}</Text>
          </View>
          {item.deliveryTime && (
            <View style={styles.deliveryWrap}>
              <Text style={[styles.deliveryLabel, { color: colors.textMuted }]}>Срок</Text>
              <Text style={[styles.deliveryValue, { color: colors.textSecondary }]}>{item.deliveryTime}</Text>
            </View>
          )}
        </View>

        {/* Comment */}
        {item.comment && (
          <Text style={[styles.comment, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.comment}
          </Text>
        )}

        {/* Footer: budget + date */}
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            {order?.budgetFrom && (
              <Text style={[styles.budgetText, { color: colors.textMuted }]}>
                💰 Бюджет: {Number(order.budgetFrom).toLocaleString()}
                {order.budgetTo ? `–${Number(order.budgetTo).toLocaleString()}` : ''} ₸
              </Text>
            )}
          </View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
        </View>

        {/* Order status */}
        {order?.status && (
          <View style={[styles.orderStatusRow, { borderTopColor: colors.border }]}>
            <View style={[styles.orderStatusDot, { backgroundColor: order.status === 'in_progress' ? '#22C55E' : order.status === 'completed' ? '#3B82F6' : colors.border }]} />
            <Text style={[styles.orderStatusText, { color: colors.textMuted }]}>Статус заказа: {ORDER_STATUS[order.status] ?? order.status}</Text>
            {item.status === 'accepted' && <Text style={styles.chatLink}>Перейти к чату →</Text>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SpecialistResponsesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'my-responses'],
    queryFn: () => api.get('/orders/responses/my').then((r: any) => r.data?.data ?? []),
    staleTime: 1000 * 30
  })

  const responses = data ?? []
  const pending = responses.filter((r: any) => r.status === 'pending').length
  const accepted = responses.filter((r: any) => r.status === 'accepted').length

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Мои отклики</Text>
        {responses.length > 0 && (
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              Всего: <Text style={[styles.statValue, { color: colors.text }]}>{responses.length}</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              Ожидают: <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pending}</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.textMuted }]}>
              Принято: <Text style={[styles.statValue, { color: '#22C55E' }]}>{accepted}</Text>
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : responses.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет откликов</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Откликайтесь на заказы клиентов во вкладке "Заказы"</Text>
          <Pressable onPress={() => router.push('/(specialist)/orders')} style={[s.buttonPrimary, { marginTop: vs(24), paddingHorizontal: sm(32) }]}>
            <Text style={s.buttonText}>Найти заказы</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: sm(16), gap: vs(12) }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF6B35" />}
          renderItem={({ item }) => (
            <ResponseCard
              item={item}
              onPress={() => {
                if (item.status === 'accepted' && item.order?.chatRoomId) {
                  router.push(`/chat/${item.order.chatRoomId}`)
                } else {
                  router.push(`/order/${item.orderId}`)
                }
              }}
            />
          )}
        />
      )}
    </Screen>
  )
}
