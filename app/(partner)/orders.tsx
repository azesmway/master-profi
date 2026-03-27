import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { vs } from 'react-native-size-matters'

import { CATEGORIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

import styles from './orders.styles'

const STATUS_COLOR: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Опубликован', color: '#3B82F6', bg: '#3B82F620' },
  in_progress: { label: 'В работе', color: '#FF6B35', bg: '#FF6B3520' },
  completed: { label: 'Завершён', color: '#22C55E', bg: '#22C55E20' },
  cancelled: { label: 'Отменён', color: '#6B7280', bg: '#6B728020' },
  pending_review: { label: 'На проверке', color: '#F59E0B', bg: '#F59E0B20' }
}

// ─── Partner Order Card ───────────────────────────────────────────────────────

function PartnerOrderCard({ item, onPress }: { item: any; onPress: () => void }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const st = STATUS_COLOR[item.status] ?? STATUS_COLOR.published
  const catName = CATEGORIES.find(c => c.id === String(item.categoryId))?.name ?? ''
  const budget = item.budgetFrom ?? 0
  const partnerEarns = Math.floor((budget * (item.partnerCommissionPercent ?? 0)) / 100)
  const platformCut = Math.floor(partnerEarns * 0.1)
  const partnerNet = partnerEarns - platformCut

  return (
    <Pressable onPress={onPress} style={[s.card, { gap: vs(12) }]}>
      {/* Header: title + status */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {catName ? <Text style={[styles.cardCatName, { color: colors.textMuted }]}>{catName}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
          <Text style={[styles.statusBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Financials */}
      <View style={[styles.financialsBox, { backgroundColor: colors.elevated }]}>
        <View style={styles.finRow}>
          <Text style={s.textMuted}>Сумма заказа</Text>
          <Text style={s.textLabel}>{budget.toLocaleString()} ₸</Text>
        </View>
        <View style={styles.finRow}>
          <Text style={s.textMuted}>Моя комиссия ({item.partnerCommissionPercent}%)</Text>
          <Text style={styles.finCommission}>{partnerEarns.toLocaleString()} ₸</Text>
        </View>
        <View style={styles.finRow}>
          <Text style={s.textMuted}>Комиссия платформы</Text>
          <Text style={styles.finPlatformCut}>− {platformCut.toLocaleString()} ₸</Text>
        </View>
        <View style={[styles.finDivider, { backgroundColor: colors.border }]} />
        <View style={styles.finTotalRow}>
          <Text style={styles.finTotalLabel}>{item.partnerPaid ? '✓ Выплачено' : 'К выплате'}</Text>
          <Text style={styles.finTotalValue}>{partnerNet.toLocaleString()} ₸</Text>
        </View>
      </View>

      {/* Client info */}
      {item.partnerClientName && (
        <View style={styles.clientRow}>
          <Text style={[styles.clientText, { color: colors.textMuted }]}>👤 {item.partnerClientName}</Text>
          {item.partnerClientPhone && <Text style={[styles.clientText, { color: colors.textMuted }]}>📞 {item.partnerClientPhone}</Text>}
        </View>
      )}
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PartnerOrdersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['partner-orders'],
    queryFn: () => api.get('/orders/partner/my').then((r: any) => r.data),
    staleTime: 1000 * 30
  })

  const orders = data?.data ?? []

  const totalEarned = orders
    .filter((o: any) => o.partnerPaid)
    .reduce((sum: number, o: any) => {
      const e = Math.floor(((o.budgetFrom ?? 0) * (o.partnerCommissionPercent ?? 0)) / 100)
      return sum + e - Math.floor(e * 0.1)
    }, 0)

  const totalPending = orders
    .filter((o: any) => !o.partnerPaid && o.status === 'completed')
    .reduce((sum: number, o: any) => {
      const e = Math.floor(((o.budgetFrom ?? 0) * (o.partnerCommissionPercent ?? 0)) / 100)
      return sum + e - Math.floor(e * 0.1)
    }, 0)

  return (
    <Screen>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + vs(20) }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF6B35" />}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.listHeader}>
              <Text style={[styles.listHeaderTitle, { color: colors.text }]}>Мои заказы</Text>
              <Pressable
                // @ts-ignore
                onPress={() => router.push('/partner/create-order')}
                style={styles.createBtn}>
                <Text style={styles.createBtnText}>+ Создать</Text>
              </Pressable>
            </View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.statsRow}>
              <View style={[s.card, styles.statCard]}>
                <Text style={[styles.statValue, { color: '#FF6B35' }]}>{orders.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Заказов</Text>
              </View>
              <View style={[s.card, styles.statCard]}>
                <Text style={[styles.statValue, { color: '#22C55E' }]}>{totalEarned.toLocaleString()} ₸</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Получено</Text>
              </View>
              <View style={[s.card, styles.statCard]}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{totalPending.toLocaleString()} ₸</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ожидается</Text>
              </View>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🤝</Text>
              <Text style={[styles.emptyTitle, s.textTitle]}>Нет заказов</Text>
              <Text style={[styles.emptySubtitle, s.textMuted]}>Создайте первый заказ от клиента</Text>
              <Pressable
                // @ts-ignore
                onPress={() => router.push('/partner/create-order')}
                style={s.buttonPrimary}>
                <Text style={s.buttonText}>Создать заказ</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={styles.cardItem}>
            <PartnerOrderCard item={item} onPress={() => router.push(`/order/${item.id}`)} />
          </Animated.View>
        )}
      />
    </Screen>
  )
}
