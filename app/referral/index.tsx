import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, Share, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { vs } from 'react-native-size-matters'

import { useTheme } from '@/hooks/useTheme'
import { promoService } from '@/services/promoService'
import { makeStyles } from '@/utils/makeStyles'

import styles from './index.styles'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  registered: { label: 'Зарегистрирован', color: '#F59E0B', bg: '#F59E0B20' },
  first_order: { label: 'Первый заказ', color: '#3B82F6', bg: '#3B82F620' },
  paid: { label: 'Бонус начислен', color: '#22C55E', bg: '#22C55E20' }
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.registered
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

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
      /* ignore */
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
        contentContainerStyle={{ paddingBottom: insets.bottom + vs(20) }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.backBtn}>←</Text>
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Пригласи друга</Text>
            </View>

            {/* Hero */}
            <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.heroWrap}>
              <View style={styles.heroBanner}>
                <Text style={styles.heroIcon}>🎁</Text>
                <Text style={styles.heroTitle}>500 ₸ за каждого друга</Text>
                <Text style={styles.heroSubtitle}>Вы получаете 500 ₸ когда друг сделает первый заказ. Друг получает скидку 500 ₸ на первый заказ.</Text>
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
              <View style={[s.card, styles.statCard]}>
                <Text style={styles.statValueOrange}>{data?.totalReferrals ?? 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Приглашено</Text>
              </View>
              <View style={[s.card, styles.statCard]}>
                <Text style={styles.statValueGreen}>{(data?.earnedBonus ?? 0).toLocaleString()} ₸</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Заработано</Text>
              </View>
              <View style={[s.card, styles.statCard]}>
                <Text style={styles.statValueYellow}>{(data?.pendingBonus ?? 0).toLocaleString()} ₸</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ожидается</Text>
              </View>
            </Animated.View>

            {/* Referral code */}
            <Animated.View entering={FadeInDown.delay(150).springify()} style={[s.card, styles.codeCard]}>
              <Text style={[s.textLabel, { color: colors.text }]}>Ваш реферальный код</Text>
              <Pressable onPress={handleCopy} style={[styles.codeBox, { backgroundColor: colors.elevated }]}>
                <Text style={styles.codeText}>{data?.referralCode ?? '---'}</Text>
                <Text style={[styles.copyText, { color: colors.textMuted }]}>📋 Копировать</Text>
              </Pressable>
              <Pressable onPress={handleShare} style={s.buttonPrimary}>
                <Text style={s.buttonText}>🔗 Поделиться ссылкой</Text>
              </Pressable>
            </Animated.View>

            {/* How it works */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={[s.card, styles.howCard]}>
              <Text style={[s.textLabel, { color: colors.text }]}>Как это работает</Text>
              {[
                { icon: '1️⃣', text: 'Поделитесь своим кодом или ссылкой с другом' },
                { icon: '2️⃣', text: 'Друг регистрируется по вашей ссылке' },
                { icon: '3️⃣', text: 'Друг делает первый заказ — вы оба получаете по 500 ₸' }
              ].map(step => (
                <View key={step.icon} style={styles.howStep}>
                  <Text style={styles.howStepIcon}>{step.icon}</Text>
                  <Text style={[styles.howStepText, { color: colors.textSecondary }]}>{step.text}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Referrals list title */}
            {(data?.referrals?.length ?? 0) > 0 && <Text style={[styles.listTitle, { color: colors.text }]}>Приглашённые ({data?.referrals.length})</Text>}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Пока нет приглашённых друзей</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={[s.card, styles.referralItem]}>
            <View style={styles.referralRow}>
              <View style={styles.referralLeft}>
                <View style={styles.referralAvatar}>
                  <Text style={styles.referralAvatarText}>{item.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View>
                  <Text style={[styles.referralName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.referralDate, { color: colors.textMuted }]}>{new Date(item.joinedAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </View>
              <View style={styles.referralRight}>
                <StatusBadge status={item.status} />
                {item.bonus > 0 && <Text style={styles.referralBonus}>+{item.bonus.toLocaleString()} ₸</Text>}
              </View>
            </View>
          </Animated.View>
        )}
      />
    </Screen>
  )
}
