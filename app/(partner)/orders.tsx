import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

const STATUS_COLOR: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Опубликован', color: '#3B82F6', bg: '#3B82F620' },
  in_progress: { label: 'В работе', color: '#FF6B35', bg: '#FF6B3520' },
  completed: { label: 'Завершён', color: '#22C55E', bg: '#22C55E20' },
  cancelled: { label: 'Отменён', color: '#6B7280', bg: '#6B728020' },
  pending_review: { label: 'На проверке', color: '#F59E0B', bg: '#F59E0B20' }
}

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
    <Pressable onPress={onPress} style={[s.card, { gap: 12 }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[s.textLabel, { fontSize: 15 }]} numberOfLines={2}>
            {item.title}
          </Text>
          {catName ? <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>{catName}</Text> : null}
        </View>
        <View style={{ backgroundColor: st.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: st.color, fontSize: 11, fontWeight: '700' }}>{st.label}</Text>
        </View>
      </View>

      {/* Financials */}
      <View style={{ backgroundColor: colors.elevated, borderRadius: 12, padding: 12, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={s.textMuted}>Сумма заказа</Text>
          <Text style={s.textLabel}>{budget.toLocaleString()} ₸</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={s.textMuted}>Моя комиссия ({item.partnerCommissionPercent}%)</Text>
          <Text style={{ color: '#FF6B35', fontWeight: '600' }}>{partnerEarns.toLocaleString()} ₸</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={s.textMuted}>Комиссия платформы</Text>
          <Text style={{ color: '#EF4444' }}>− {platformCut.toLocaleString()} ₸</Text>
        </View>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#22C55E', fontWeight: '600' }}>{item.partnerPaid ? '✓ Выплачено' : 'К выплате'}</Text>
          <Text style={{ color: '#22C55E', fontWeight: '800' }}>{partnerNet.toLocaleString()} ₸</Text>
        </View>
      </View>

      {/* Client info */}
      {item.partnerClientName && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Text style={s.textMuted}>👤 {item.partnerClientName}</Text>
          {item.partnerClientPhone && <Text style={s.textMuted}>📞 {item.partnerClientPhone}</Text>}
        </View>
      )}
    </Pressable>
  )
}

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

  // Итоговая аналитика
  const totalBudget = orders.reduce((sum: number, o: any) => sum + (o.budgetFrom ?? 0), 0)
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF6B35" />}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[s.textTitle, { fontSize: 22 }]}>Мои заказы</Text>
              <Pressable
                onPress={() => {
                  // @ts-ignore
                  router.push('/partner/create-order')
                }}
                style={{ backgroundColor: '#FF6B35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>+ Создать</Text>
              </Pressable>
            </View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 }}>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 14 }]}>
                <Text style={{ color: '#FF6B35', fontWeight: '800', fontSize: 18 }}>{orders.length}</Text>
                <Text style={[s.textMuted, { fontSize: 11 }]}>Заказов</Text>
              </View>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 14 }]}>
                <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 18 }}>{totalEarned.toLocaleString()} ₸</Text>
                <Text style={[s.textMuted, { fontSize: 11 }]}>Получено</Text>
              </View>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 14 }]}>
                <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 18 }}>{totalPending.toLocaleString()} ₸</Text>
                <Text style={[s.textMuted, { fontSize: 11 }]}>Ожидается</Text>
              </View>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🤝</Text>
              <Text style={[s.textTitle, { fontSize: 18, marginBottom: 8 }]}>Нет заказов</Text>
              <Text style={[s.textMuted, { textAlign: 'center', marginBottom: 20 }]}>Создайте первый заказ от клиента</Text>
              <Pressable
                onPress={() => {
                  // @ts-ignore
                  router.push('/partner/create-order')
                }}
                style={s.buttonPrimary}>
                <Text style={s.buttonText}>Создать заказ</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <PartnerOrderCard item={item} onPress={() => router.push(`/order/${item.id}`)} />
          </Animated.View>
        )}
      />
    </Screen>
  )
}
