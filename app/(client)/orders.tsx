import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { s as sm, vs } from 'react-native-size-matters'

import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { makeStyles } from '@/utils/makeStyles'

import styles from './orders.styles'

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Мои заказы</Text>
        <Pressable onPress={() => router.push('/create-order')} style={styles.createBtn}>
          <Text style={styles.createBtnText}>+ Создать</Text>
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
          contentContainerStyle={{ paddingHorizontal: sm(20), paddingBottom: vs(20), gap: vs(12) }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет заказов</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Создайте первый заказ и получите отклики специалистов</Text>
              <Pressable onPress={() => router.push('/create-order')} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Создать заказ</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }: any) => {
            const statusColor = ORDER_STATUS_COLOR[item.status] ?? '#6B7280'
            return (
              <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
                <Pressable onPress={() => router.push(`/order/${item.id}`)} style={[s.card, styles.cardGap]}>
                  {/* Top: status + date */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{ORDER_STATUS_LABEL[item.status] ?? item.status}</Text>
                    </View>
                    <Text style={[styles.cardDate, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
                  </View>

                  {/* Title + description */}
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Footer: city + responses + budget */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    {item.city && <Text style={[styles.cardCity, { color: colors.textMuted }]}>📍 {item.city}</Text>}
                    {item.responseCount > 0 && (
                      <View style={styles.responseBadge}>
                        <Text style={styles.responseBadgeText}>{item.responseCount} откликов</Text>
                      </View>
                    )}
                    {item.budgetFrom && <Text style={[styles.cardBudget, { color: colors.textMuted }]}>от {item.budgetFrom.toLocaleString()} ₸</Text>}
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
