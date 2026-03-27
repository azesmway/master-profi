import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

import { earningsStyles as es } from './earnings.styles'

const { width } = Dimensions.get('window')
const COMMISSION = 0.08

// ─── Mini chart ───────────────────────────────────────────────────────────────

function MiniChart({ data, colors }: { data: { date: string; amount: number }[]; colors: any }) {
  if (!data?.length) return null

  const maxVal = Math.max(...data.map(d => d.amount), 1)
  const barW = Math.floor((width - 80) / Math.max(data.length, 1))

  return (
    <View>
      <View style={es.chartBarsRow}>
        {data.slice(-20).map((d, i) => (
          <View
            key={i}
            style={{
              width: Math.max(barW - 3, 4),
              height: Math.max((d.amount / maxVal) * vs(80), 4),
              borderRadius: sm(3),
              backgroundColor: d.amount > 0 ? '#FF6B35' : colors.border
            }}
          />
        ))}
      </View>
      <View style={es.chartDatesRow}>
        <Text style={[es.chartDateText, { color: colors.textMuted }]}>{data[0]?.date?.slice(5) ?? ''}</Text>
        <Text style={[es.chartDateText, { color: colors.textMuted }]}>{data[data.length - 1]?.date?.slice(5) ?? ''}</Text>
      </View>
    </View>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, colors, s }: any) {
  return (
    <View style={[s.card, es.statCardInner]}>
      <Text style={[es.statValue, { color: color ?? '#FF6B35' }]}>{value}</Text>
      <Text style={[es.statLabel, { color: colors.textMuted }]}>{label}</Text>
      {sub && <Text style={[es.statSub, { color: colors.textMuted }]}>{sub}</Text>}
    </View>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ item, colors, s }: any) {
  const isPositive = item.type !== 'refund'
  return (
    <View style={[es.txRow, { borderBottomColor: colors.border }]}>
      <View style={[es.txIconWrap, { backgroundColor: isPositive ? '#22C55E20' : '#EF444420' }]}>
        <Text style={es.txIconText}>{item.type === 'order' ? '✅' : item.type === 'bonus' ? '🎁' : '↩️'}</Text>
      </View>
      <View style={es.txInfo}>
        <Text style={[es.txDesc, { color: colors.text }]}>{item.description ?? 'Заказ'}</Text>
        <Text style={[es.txDate, { color: colors.textMuted }]}>
          {new Date(item.createdAt).toLocaleDateString('ru', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <View style={es.txAmountCol}>
        <Text style={[es.txAmount, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
          {isPositive ? '+' : '-'}
          {Number(item.net).toLocaleString()} ₸
        </Text>
        <Text style={[es.txCommission, { color: colors.textMuted }]}>комиссия {Number(item.commission).toLocaleString()} ₸</Text>
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
      <View style={[es.header, { borderBottomColor: colors.border }]}>
        <Text style={[es.title, { color: colors.text }]}>Заработок</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: sm(20), gap: vs(16) }}>
            {/* Баланс */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={es.balanceCard}>
              <Text style={es.balanceLabel}>Доступно к выводу</Text>
              <Text style={es.balanceAmount}>{Number(bal?.available ?? 0).toLocaleString()} ₸</Text>
              <Text style={es.balancePending}>Ожидает: {Number(bal?.pending ?? 0).toLocaleString()} ₸</Text>
              <View style={es.balanceBtnRow}>
                <Pressable style={es.balanceBtn}>
                  <Text style={es.balanceBtnText}>💳 Вывести</Text>
                </Pressable>
                <Pressable style={es.balanceBtn}>
                  <Text style={es.balanceBtnText}>📊 История</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Быстрая статистика */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={es.quickRow}>
              <StatCard label="За месяц" colors={colors} s={s} color="#22C55E" value={`${Number(bal?.thisMonth ?? 0).toLocaleString()} ₸`} />
              <StatCard label="За неделю" colors={colors} s={s} color="#3B82F6" value={`${Number(bal?.thisWeek ?? 0).toLocaleString()} ₸`} />
            </Animated.View>

            {/* Метрики */}
            <Animated.View entering={FadeInDown.delay(150).springify()} style={es.metricsRow}>
              <StatCard label="Заказов" colors={colors} s={s} value={st?.completedOrders ?? 0} sub="выполнено" />
              <StatCard label="Рейтинг" colors={colors} s={s} color="#F59E0B" value={`★ ${Number(st?.rating ?? 0).toFixed(1)}`} sub={`${st?.reviewCount ?? 0} отзывов`} />
              <StatCard label="Комиссия" colors={colors} s={s} color="#8B5CF6" value={`${(COMMISSION * 100).toFixed(0)}%`} sub="платформы" />
            </Animated.View>

            {/* График */}
            {stats?.chart?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).springify()} style={s.card}>
                <Text style={[s.textLabel, { marginBottom: vs(16) }]}>Заработок за 30 дней</Text>
                <MiniChart data={stats.chart} colors={colors} />
              </Animated.View>
            )}

            {/* Прогноз */}
            {forecast && (
              <Animated.View entering={FadeInDown.delay(250).springify()} style={s.card}>
                <Text style={[s.textLabel, { marginBottom: vs(12) }]}>📈 Прогноз</Text>
                <View style={es.forecastRow}>
                  <View style={[s.elevated, es.forecastItem]}>
                    <Text style={[es.forecastAmount, { color: '#FF6B35' }]}>{Number(forecast.monthlyAvg).toLocaleString()} ₸</Text>
                    <Text style={[es.forecastPeriod, { color: colors.textMuted }]}>в месяц</Text>
                  </View>
                  <View style={[s.elevated, es.forecastItem]}>
                    <Text style={[es.forecastAmount, { color: '#22C55E' }]}>{Number(forecast.yearlyForecast).toLocaleString()} ₸</Text>
                    <Text style={[es.forecastPeriod, { color: colors.textMuted }]}>в год</Text>
                  </View>
                </View>
                {forecast.tips?.map((tip: string, i: number) => (
                  <View key={i} style={es.tipRow}>
                    <Text style={{ color: '#FF6B35', fontSize: sm(14) }}>💡</Text>
                    <Text style={[es.tipText, { color: colors.textSecondary }]}>{tip}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* История транзакций */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={[es.sectionTitle, { color: colors.text }]}>История транзакций</Text>
              {stats?.history?.length === 0 ? (
                <View style={[s.card, es.emptyCard]}>
                  <Text style={es.emptyIcon}>💸</Text>
                  <Text style={[s.textLabel, { color: colors.text }]}>Пока нет транзакций</Text>
                  <Text style={[s.textMuted, es.emptyText, { color: colors.textMuted }]}>Выполните первый заказ чтобы увидеть заработок</Text>
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
