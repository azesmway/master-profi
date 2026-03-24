import Screen from '@components/ui/Screen'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { ActivityIndicator, FlatList, Pressable, Share, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { promoService } from '@/services/promoService'
import { makeStyles } from '@/utils/makeStyles'

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    registered: { label: 'Зарегистрирован', color: '#F59E0B', bg: '#F59E0B20' },
    first_order: { label: 'Первый заказ', color: '#3B82F6', bg: '#3B82F620' },
    paid: { label: 'Бонус начислен', color: '#22C55E', bg: '#22C55E20' }
  }
  const c = config[status] ?? config.registered
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: c.color, fontSize: 11, fontWeight: '700' }}>{c.label}</Text>
    </View>
  )
}

export default function ReferralScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const { data, isLoading } = useQuery({
    queryKey: ['referral'],
    queryFn: () => promoService.getReferralInfo()
  })

  async function handleShare() {
    if (!data?.referralLink) return
    try {
      await Share.share({
        message: `Попробуй Мастер — лучший способ найти специалиста в Казахстане! 🔨\nРегистрируйся по моей ссылке и получи скидку на первый заказ:\n${data.referralLink}`,
        url: data.referralLink
      })
    } catch {
      // error catch
    }
  }

  async function handleCopy() {
    if (!data?.referralCode) return
    await Clipboard.setStringAsync(data.referralCode)
  }

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <FlatList
        data={data?.referrals ?? []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => router.back()}>
                <Text style={{ color: '#FF6B35', fontSize: 16 }}>←</Text>
              </Pressable>
              <Text style={[s.textTitle, { fontSize: 22 }]}>Пригласи друга</Text>
            </View>

            {/* Hero */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={{ marginHorizontal: 20, marginVertical: 12 }}>
              <View
                style={{
                  backgroundColor: '#FF6B35',
                  borderRadius: 24,
                  padding: 24,
                  alignItems: 'center'
                }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>🎁</Text>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>500 ₸ за каждого друга</Text>
                <Text style={{ color: '#ffffff99', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                  Вы получаете 500 ₸ когда друг сделает первый заказ. Друг получает скидку 500 ₸ на первый заказ.
                </Text>
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 }}>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 16 }]}>
                <Text style={{ color: '#FF6B35', fontWeight: '800', fontSize: 24 }}>{data?.totalReferrals ?? 0}</Text>
                <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>Приглашено</Text>
              </View>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 16 }]}>
                <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 24 }}>{(data?.earnedBonus ?? 0).toLocaleString()} ₸</Text>
                <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>Заработано</Text>
              </View>
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 16 }]}>
                <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 24 }}>{(data?.pendingBonus ?? 0).toLocaleString()} ₸</Text>
                <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>Ожидается</Text>
              </View>
            </Animated.View>

            {/* Referral code */}
            <Animated.View entering={FadeInDown.delay(150).springify()} style={[s.card, { marginHorizontal: 20, marginBottom: 12, gap: 12 }]}>
              <Text style={s.textLabel}>Ваш реферальный код</Text>
              <Pressable
                onPress={handleCopy}
                style={{
                  backgroundColor: colors.elevated,
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                <Text style={{ color: '#FF6B35', fontWeight: '800', fontSize: 20, letterSpacing: 3 }}>{data?.referralCode ?? '---'}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>📋 Копировать</Text>
              </Pressable>

              <Pressable onPress={handleShare} style={s.buttonPrimary}>
                <Text style={s.buttonText}>🔗 Поделиться ссылкой</Text>
              </Pressable>
            </Animated.View>

            {/* How it works */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={[s.card, { marginHorizontal: 20, marginBottom: 20, gap: 14 }]}>
              <Text style={s.textLabel}>Как это работает</Text>
              {[
                { icon: '1️⃣', text: 'Поделитесь своим кодом или ссылкой с другом' },
                { icon: '2️⃣', text: 'Друг регистрируется по вашей ссылке' },
                { icon: '3️⃣', text: 'Друг делает первый заказ — вы оба получаете по 500 ₸' }
              ].map(step => (
                <View key={step.icon} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 18 }}>{step.icon}</Text>
                  <Text style={[s.textSecondary, { flex: 1, lineHeight: 20 }]}>{step.text}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Referrals list header */}
            {(data?.referrals?.length ?? 0) > 0 && <Text style={[s.textTitle, { fontSize: 18, paddingHorizontal: 20, marginBottom: 12 }]}>Приглашённые ({data?.referrals.length})</Text>}
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>👥</Text>
            <Text style={[s.textMuted, { textAlign: 'center' }]}>Пока нет приглашённых друзей</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={[s.card, { marginHorizontal: 20, marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#FF6B3520',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <Text style={{ color: '#FF6B35', fontWeight: '700' }}>{item.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View>
                  <Text style={s.textLabel}>{item.name}</Text>
                  <Text style={[s.textMuted, { fontSize: 12 }]}>{new Date(item.joinedAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={item.status} />
                {item.bonus > 0 && <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '600' }}>+{item.bonus.toLocaleString()} ₸</Text>}
              </View>
            </View>
          </Animated.View>
        )}
      />
    </Screen>
  )
}
