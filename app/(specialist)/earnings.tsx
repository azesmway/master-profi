import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

const { width } = Dimensions.get('window')
const COMMISSION = 0.08

// ─── Mini chart ───────────────────────────────────────────────────────────────

function MiniChart({ data, colors }: { data: { date: string; amount: number }[]; colors: any }) {
  if (!data?.length) return null

  const maxVal = Math.max(...data.map(d => d.amount), 1)
  const barW = Math.floor((width - 80) / Math.max(data.length, 1))

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3 }}>
        {data.slice(-20).map((d, i) => (
          <View
            key={i}
            style={{
              width: Math.max(barW - 3, 4),
              height: Math.max((d.amount / maxVal) * 80, 4),
              borderRadius: 3,
              backgroundColor: d.amount > 0 ? '#FF6B35' : colors.border
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{data[0]?.date?.slice(5) ?? ''}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{data[data.length - 1]?.date?.slice(5) ?? ''}</Text>
      </View>
    </View>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, colors, s }: any) {
  return (
    <View style={[s.card, { flex: 1, alignItems: 'center', paddingVertical: 16 }]}>
      <Text style={{ color: color ?? '#FF6B35', fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={[s.textMuted, { fontSize: 12, marginTop: 4, textAlign: 'center' }]}>{label}</Text>
      {sub && <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</Text>}
    </View>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ item, colors, s }: any) {
  const isPositive = item.type !== 'refund'
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isPositive ? '#22C55E20' : '#EF444420',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Text style={{ fontSize: 18 }}>{item.type === 'order' ? '✅' : item.type === 'bonus' ? '🎁' : '↩️'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.textLabel, { fontSize: 14 }]}>{item.description ?? 'Заказ'}</Text>
        <Text style={[s.textMuted, { fontSize: 12 }]}>
          {new Date(item.createdAt).toLocaleDateString('ru', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 15,
            color: isPositive ? '#22C55E' : '#EF4444'
          }}>
          {isPositive ? '+' : '-'}
          {Number(item.net).toLocaleString()} ₸
        </Text>
        <Text style={[s.textMuted, { fontSize: 11 }]}>комиссия {Number(item.commission).toLocaleString()} ₸</Text>
      </View>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsScreen() {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const [tab, setTab] = useState<'stats' | 'history'>('stats')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['earnings', 'stats'],
    queryFn: () => api.get('/earnings/stats').then((r: any) => r.data),
    staleTime: 1000 * 60
  })

  const { data: forecast } = useQuery({
    queryKey: ['earnings', 'forecast'],
    queryFn: () => api.get('/earnings/forecast').then((r: any) => r.data),
    staleTime: 1000 * 60 * 5
  })

  const bal = stats?.balance
  const st = stats?.stats

  return (
    <Screen>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={[s.textTitle, { fontSize: 24 }]}>Заработок</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, gap: 16 }}>
            {/* Баланс */}
            <Animated.View
              entering={FadeInDown.delay(50).springify()}
              style={[
                s.card,
                {
                  // @ts-ignore
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                  backgroundColor: '#FF6B35',
                  borderRadius: 20,
                  padding: 24
                }
              ]}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 }}>Доступно к выводу</Text>
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 4 }}>{Number(bal?.available ?? 0).toLocaleString()} ₸</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Ожидает: {Number(bal?.pending ?? 0).toLocaleString()} ₸</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>💳 Вывести</Text>
                </Pressable>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>📊 История</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Быстрая статистика */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard label="За месяц" colors={colors} s={s} color="#22C55E" value={`${Number(bal?.thisMonth ?? 0).toLocaleString()} ₸`} />
              <StatCard label="За неделю" colors={colors} s={s} color="#3B82F6" value={`${Number(bal?.thisWeek ?? 0).toLocaleString()} ₸`} />
            </Animated.View>

            {/* Метрики */}
            <Animated.View entering={FadeInDown.delay(150).springify()} style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard label="Заказов" colors={colors} s={s} value={st?.completedOrders ?? 0} sub="выполнено" />
              <StatCard label="Рейтинг" colors={colors} s={s} color="#F59E0B" value={`★ ${Number(st?.rating ?? 0).toFixed(1)}`} sub={`${st?.reviewCount ?? 0} отзывов`} />
              <StatCard label="Комиссия" colors={colors} s={s} color="#8B5CF6" value={`${(COMMISSION * 100).toFixed(0)}%`} sub="платформы" />
            </Animated.View>

            {/* График */}
            {stats?.chart?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).springify()} style={s.card}>
                <Text style={[s.textLabel, { marginBottom: 16 }]}>Заработок за 30 дней</Text>
                <MiniChart data={stats.chart} colors={colors} />
              </Animated.View>
            )}

            {/* Прогноз */}
            {forecast && (
              <Animated.View entering={FadeInDown.delay(250).springify()} style={s.card}>
                <Text style={[s.textLabel, { marginBottom: 12 }]}>📈 Прогноз</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={[s.elevated, { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' }]}>
                    <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 16 }}>{Number(forecast.monthlyAvg).toLocaleString()} ₸</Text>
                    <Text style={[s.textMuted, { fontSize: 11 }]}>в месяц</Text>
                  </View>
                  <View style={[s.elevated, { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' }]}>
                    <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 16 }}>{Number(forecast.yearlyForecast).toLocaleString()} ₸</Text>
                    <Text style={[s.textMuted, { fontSize: 11 }]}>в год</Text>
                  </View>
                </View>
                {forecast.tips?.map((tip: string, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                    <Text style={{ color: '#FF6B35' }}>💡</Text>
                    <Text style={[s.textSecondary, { flex: 1, fontSize: 13 }]}>{tip}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* История транзакций */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={[s.textTitle, { fontSize: 18, marginBottom: 12 }]}>История транзакций</Text>
              {stats?.history?.length === 0 ? (
                <View style={[s.card, { alignItems: 'center', paddingVertical: 32 }]}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>💸</Text>
                  <Text style={s.textLabel}>Пока нет транзакций</Text>
                  <Text style={[s.textMuted, { textAlign: 'center', marginTop: 4 }]}>Выполните первый заказ чтобы увидеть заработок</Text>
                </View>
              ) : (
                <View style={s.card}>
                  {stats?.history?.map((item: any) => (
                    <TxRow key={item.id} item={item} colors={colors} s={s} />
                  ))}
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}
