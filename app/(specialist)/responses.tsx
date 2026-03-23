import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

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

function ResponseCard({ item, onPress }: { item: any; onPress: () => void }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const order = item.order
  const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending

  const catName = CATEGORIES.find(c => c.id === String(order?.categoryId))?.name ?? ''

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Pressable onPress={onPress} style={[s.card, { gap: 12 }]}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[s.textLabel, { fontSize: 15 }]} numberOfLines={2}>
              {order?.title ?? 'Заказ'}
            </Text>
            {catName ? <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>{catName}</Text> : null}
          </View>
          <View style={{ backgroundColor: st.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: st.color, fontSize: 11, fontWeight: '700' }}>{st.label}</Text>
          </View>
        </View>

        {/* Моё предложение */}
        <View
          style={{
            backgroundColor: colors.elevated,
            borderRadius: 10,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <View>
            <Text style={[s.textMuted, { fontSize: 11 }]}>Моё предложение</Text>
            <Text style={[s.textTitle, { fontSize: 18, color: '#FF6B35' }]}>{item.price ? `${Number(item.price).toLocaleString()} ₸` : 'Договорная'}</Text>
          </View>
          {item.deliveryTime && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.textMuted, { fontSize: 11 }]}>Срок</Text>
              <Text style={[s.textSecondary, { fontSize: 13 }]}>{item.deliveryTime}</Text>
            </View>
          )}
        </View>

        {/* Комментарий */}
        {item.comment && (
          <Text style={[s.textSecondary, { fontSize: 13 }]} numberOfLines={2}>
            {item.comment}
          </Text>
        )}

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {order?.budgetFrom && (
              <Text style={[s.textMuted, { fontSize: 12 }]}>
                💰 Бюджет: {Number(order.budgetFrom).toLocaleString()}
                {order.budgetTo ? `–${Number(order.budgetTo).toLocaleString()}` : ''} ₸
              </Text>
            )}
          </View>
          <Text style={[s.textMuted, { fontSize: 11 }]}>
            {new Date(item.createdAt).toLocaleDateString('ru', {
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>

        {/* Статус заказа */}
        {order?.status && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: order.status === 'in_progress' ? '#22C55E' : order.status === 'completed' ? '#3B82F6' : colors.border
              }}
            />
            <Text style={[s.textMuted, { fontSize: 12 }]}>Статус заказа: {ORDER_STATUS[order.status] ?? order.status}</Text>
            {item.status === 'accepted' && <Text style={{ color: '#FF6B35', fontSize: 12, marginLeft: 'auto' }}>Перейти к чату →</Text>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

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
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
        <Text style={[s.textTitle, { fontSize: 24 }]}>Мои отклики</Text>
        {responses.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
            <Text style={[s.textMuted, { fontSize: 13 }]}>
              Всего: <Text style={{ color: colors.text, fontWeight: '600' }}>{responses.length}</Text>
            </Text>
            <Text style={[s.textMuted, { fontSize: 13 }]}>
              Ожидают: <Text style={{ color: '#F59E0B', fontWeight: '600' }}>{pending}</Text>
            </Text>
            <Text style={[s.textMuted, { fontSize: 13 }]}>
              Принято: <Text style={{ color: '#22C55E', fontWeight: '600' }}>{accepted}</Text>
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : responses.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📭</Text>
          <Text style={[s.textTitle, { fontSize: 20, textAlign: 'center' }]}>Нет откликов</Text>
          <Text style={[s.textMuted, { textAlign: 'center', marginTop: 8, lineHeight: 22 }]}>Откликайтесь на заказы клиентов во вкладке "Заказы"</Text>
          <Pressable onPress={() => router.push('/(specialist)/orders')} style={[s.buttonPrimary, { marginTop: 24, paddingHorizontal: 32 }]}>
            <Text style={s.buttonText}>Найти заказы</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
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
