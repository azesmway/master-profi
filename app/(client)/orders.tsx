import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { makeStyles } from '@/utils/makeStyles'

export default function ClientOrdersScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'my'],
    queryFn: () => ordersService.getMyOrders().then((r: any) => r.data.data),
    staleTime: 1000 * 30
  })

  const orders = data ?? []

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[s.textTitle, { fontSize: 24 }]}>Мои заказы</Text>
        <Pressable onPress={() => router.push('/create-order')} style={{ backgroundColor: '#FF6B35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>+ Создать</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={[s.textTitle, { marginBottom: 8 }]}>Нет заказов</Text>
              <Text style={[s.textSecondary, { textAlign: 'center', marginBottom: 20 }]}>Создайте первый заказ и получите отклики специалистов</Text>
              <Pressable onPress={() => router.push('/create-order')} style={{ backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Создать заказ</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }: any) => {
            const statusColor = ORDER_STATUS_COLOR[item.status] ?? '#6B7280'
            return (
              <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
                <Pressable onPress={() => router.push(`/order/${item.id}`)} style={[s.card, { gap: 0 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: statusColor + '20',
                        borderWidth: 1,
                        borderColor: statusColor + '40'
                      }}>
                      <Text style={{ color: statusColor, fontSize: 12, fontWeight: '600' }}>{ORDER_STATUS_LABEL[item.status] ?? item.status}</Text>
                    </View>
                    <Text style={[s.textMuted, { fontSize: 12 }]}>{new Date(item.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
                  </View>

                  <Text style={[s.textLabel, { fontSize: 16, marginBottom: 6 }]}>{item.title}</Text>
                  <Text style={[s.textSecondary, { fontSize: 13 }]} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                    {item.city && <Text style={[s.textMuted, { fontSize: 12 }]}>📍 {item.city}</Text>}
                    {item.responseCount > 0 && (
                      <View style={{ backgroundColor: '#FF6B3520', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '600' }}>{item.responseCount} откликов</Text>
                      </View>
                    )}
                    {item.budgetFrom && <Text style={[s.textMuted, { fontSize: 12, marginLeft: 'auto' }]}>от {item.budgetFrom.toLocaleString()} ₸</Text>}
                  </View>
                </Pressable>
              </Animated.View>
            )
          }}
        />
      )}
    </Screen>
  )
}
