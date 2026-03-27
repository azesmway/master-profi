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

import { partnerOrdersStyles as pos } from './orders.styles'

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
      <View style={pos.cardTopRow}>
        <View style={pos.cardTitleWrap}>
          <Text style={[pos.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {catName ? <Text style={[pos.cardCatName, { color: colors.textMuted }]}>{catName}</Text> : null}
        </View>
        <View style={[pos.statusBadge, { backgroundColor: st.bg }]}>
          <Text style={[pos.statusBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Financials */}
      <View style={[pos.financialsBox, { backgroundColor: colors.elevated }]}>
        <View style={pos.finRow}>
          <Text style={s.textMuted}>Сумма заказа</Text>
          <Text style={s.textLabel}>{budget.toLocaleString()} ₸</Text>
        </View>
        <View style={pos.finRow}>
          <Text style={s.textMuted}>Моя комиссия ({item.partnerCommissionPercent}%)</Text>
          <Text style={pos.finCommission}>{partnerEarns.toLocaleString()} ₸</Text>
        </View>
        <View style={pos.finRow}>
          <Text style={s.textMuted}>Комиссия платформы</Text>
          <Text style={pos.finPlatformCut}>− {platformCut.toLocaleString()} ₸</Text>
        </View>
        <View style={[pos.finDivider, { backgroundColor: colors.border }]} />
        <View style={pos.finTotalRow}>
          <Text style={pos.finTotalLabel}>{item.partnerPaid ? '✓ Выплачено' : 'К выплате'}</Text>
          <Text style={pos.finTotalValue}>{partnerNet.toLocaleString()} ₸</Text>
        </View>
      </View>

      {/* Client info */}
      {item.partnerClientName && (
        <View style={pos.clientRow}>
          <Text style={[pos.clientText, { color: colors.textMuted }]}>👤 {item.partnerClientName}</Text>
          {item.partnerClientPhone && <Text style={[pos.clientText, { color: colors.textMuted }]}>📞 {item.partnerClientPhone}</Text>}
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
            <View style={pos.listHeader}>
              <Text style={[pos.listHeaderTitle, { color: colors.text }]}>Мои заказы</Text>
              <Pressable
                // @ts-ignore
                onPress={() => router.push('/partner/create-order')}
                style={pos.createBtn}>
                <Text style={pos.createBtnText}>+ Создать</Text>
              </Pressable>
            </View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={pos.statsRow}>
              <View style={[s.card, pos.statCard]}>
                <Text style={[pos.statValue, { color: '#FF6B35' }]}>{orders.length}</Text>
                <Text style={[pos.statLabel, { color: colors.textMuted }]}>Заказов</Text>
              </View>
              <View style={[s.card, pos.statCard]}>
                <Text style={[pos.statValue, { color: '#22C55E' }]}>{totalEarned.toLocaleString()} ₸</Text>
                <Text style={[pos.statLabel, { color: colors.textMuted }]}>Получено</Text>
              </View>
              <View style={[s.card, pos.statCard]}>
                <Text style={[pos.statValue, { color: '#F59E0B' }]}>{totalPending.toLocaleString()} ₸</Text>
                <Text style={[pos.statLabel, { color: colors.textMuted }]}>Ожидается</Text>
              </View>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={pos.emptyWrap}>
              <Text style={pos.emptyIcon}>🤝</Text>
              <Text style={[pos.emptyTitle, s.textTitle]}>Нет заказов</Text>
              <Text style={[pos.emptySubtitle, s.textMuted]}>Создайте первый заказ от клиента</Text>
              <Pressable
                // @ts-ignore
                onPress={() => router.push('/partner/create-order')}
                style={s.buttonPrimary}>
                <Text style={s.buttonText}>Создать заказ</Text>
              </Pressable>
            </View>
          ) : (
            <View style={pos.emptyWrap}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={pos.cardItem}>
            <PartnerOrderCard item={item} onPress={() => router.push(`/order/${item.id}`)} />
          </Animated.View>
        )}
      />
    </Screen>
  )
}
