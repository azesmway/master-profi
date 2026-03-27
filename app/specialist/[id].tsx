import Screen from '@components/ui/Screen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { CURRENCIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { specialistsService } from '@/services/specialistsService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import styles from './id.styles'

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: sm(2) }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>
          {'★'}
        </Text>
      ))}
    </View>
  )
}

// ─── Rating bars ──────────────────────────────────────────────────────────────

function RatingBars({ stats, colors }: any) {
  const total = stats?.total ?? 0
  return (
    <View style={styles.ratingBarsWrap}>
      {[5, 4, 3, 2, 1].map(star => {
        const count = stats?.distribution?.[star] ?? 0
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <View key={star} style={styles.ratingBarRow}>
            <Text style={[styles.ratingBarNum, { color: colors.textMuted }]}>{star}</Text>
            <Text style={styles.ratingBarStar}>★</Text>
            <View style={[styles.ratingBarTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.ratingBarFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={[styles.ratingBarCount, { color: colors.textMuted }]}>{count}</Text>
          </View>
        )
      })}
    </View>
  )
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review, colors, s }: any) {
  const initials = (review.author?.name ?? 'А')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <View style={[s.card, styles.reviewCard]}>
      <View style={styles.reviewAuthorRow}>
        <View style={styles.reviewAvatar}>
          {review.author?.avatar ? <Image source={{ uri: review.author.avatar }} style={styles.reviewAvatarImg} contentFit="cover" /> : <Text style={styles.reviewAvatarText}>{initials}</Text>}
        </View>
        <View style={styles.reviewAuthorInfo}>
          <Text style={[styles.reviewAuthorName, { color: colors.text }]}>{review.author?.name ?? 'Аноним'}</Text>
          <Text style={[styles.reviewDate, { color: colors.textMuted }]}>{new Date(review.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Stars rating={review.rating} size={sm(13)} />
          {review.isVerified && <Text style={styles.reviewVerified}>✓ проверенный</Text>}
        </View>
      </View>

      <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.text}</Text>

      {review.reply && (
        <View style={[styles.reviewReply, { backgroundColor: colors.elevated }]}>
          <Text style={[styles.reviewReplyLabel, { color: colors.textMuted }]}>Ответ специалиста:</Text>
          <Text style={[styles.reviewReplyText, { color: colors.textSecondary }]}>{review.reply}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SpecialistScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  const { data: specialist, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SPECIALISTS, id],
    queryFn: () => specialistsService.findOne(id ?? '').then((r: any) => r.data),
    enabled: !!id
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/specialist/${id}`).then((r: any) => r.data),
    enabled: !!id
  })

  const reviews = reviewsData?.data ?? []
  const stats = reviewsData?.stats

  const reviewMutation = useMutation({
    mutationFn: () => api.post(`/reviews/specialist/${id}`, { rating: reviewRating, text: reviewText }),
    onSuccess: () => {
      setShowReviewModal(false)
      setReviewText('')
      setReviewRating(5)
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, id] })
    }
  })

  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  if (!specialist) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.textTitle}>Специалист не найден</Text>
      </View>
    )
  }

  const initials = (specialist.user?.name ?? 'М')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  // @ts-ignore
  const currency = specialist.priceCurrency ? (CURRENCIES[specialist.priceCurrency]?.symbol ?? '₸') : '₸'
  const isOwnProfile = user?.id === specialist.userId

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Профиль специалиста</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, styles.heroCard]}>
            <View style={styles.avatarWrap}>
              {specialist.user?.avatar ? (
                <Image source={{ uri: specialist.user.avatar }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              {specialist.isOnline && <View style={[styles.onlineDot, { borderColor: colors.card }]} />}
            </View>

            <View style={styles.nameRow}>
              <Text style={[styles.heroName, { color: colors.text }]}>{specialist.user?.name}</Text>
              {specialist.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>

            <Text style={[styles.heroStatus, { color: colors.textMuted }]}>{specialist.isOnline ? '🟢 онлайн' : '⚪ ' + (specialist.responseTime ?? 'оффлайн')}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statRating}>★ {Number(specialist.rating).toFixed(1)}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{specialist.reviewCount} отзывов</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{specialist.completedOrders}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>заказов</Text>
              </View>
              {specialist.priceFrom && (
                <View style={styles.statItem}>
                  <Text style={styles.statPrice}>
                    {specialist.priceFrom.toLocaleString()}
                    {currency}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>от / час</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Bio */}
          {specialist.bio && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={s.card}>
              <Text style={[s.textLabel, { marginBottom: vs(8), color: colors.text }]}>О себе</Text>
              <Text style={[s.textSecondary, { lineHeight: sm(22) }]}>{specialist.bio}</Text>
            </Animated.View>
          )}

          {/* Portfolio */}
          {specialist.portfolio?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: vs(12) }]}>Портфолио</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: sm(10) }}>
                {specialist.portfolio.map((item: any) => (
                  <View key={item.id} style={styles.portfolioItem}>
                    <Image source={{ uri: item.url }} style={styles.portfolioImg} contentFit="cover" />
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Reviews */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Отзывы {stats?.total > 0 ? `(${stats.total})` : ''}</Text>
              {!isOwnProfile && (
                <Pressable onPress={() => setShowReviewModal(true)} style={styles.addReviewBtn}>
                  <Text style={styles.addReviewText}>+ Отзыв</Text>
                </Pressable>
              )}
            </View>

            {stats?.total > 0 && (
              <View style={[s.card, styles.ratingSummary, { marginBottom: vs(12) }]}>
                <View style={styles.ratingAvgWrap}>
                  <Text style={[styles.ratingAvgNum, { color: colors.text }]}>{stats.avg.toFixed(1)}</Text>
                  <Stars rating={Math.round(stats.avg)} size={sm(16)} />
                  <Text style={[styles.ratingAvgCount, { color: colors.textMuted }]}>{stats.total} отзывов</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <RatingBars stats={stats} colors={colors} />
                </View>
              </View>
            )}

            {reviews.length === 0 ? (
              <View style={[s.card, styles.noReviewsCard]}>
                <Text style={styles.noReviewsIcon}>💬</Text>
                <Text style={[s.textLabel, { color: colors.text }]}>Пока нет отзывов</Text>
                <Text style={[styles.noReviewsText, { color: colors.textMuted }]}>Будьте первым кто оставит отзыв</Text>
              </View>
            ) : (
              <View style={styles.reviewsGap}>
                {reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} colors={colors} s={s} />
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* CTA */}
      {!isOwnProfile && (
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + vs(12), borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <Pressable onPress={() => router.push({ pathname: '/create-order', params: { specialistId: id } })} style={s.buttonPrimary}>
            <Text style={s.buttonText}>Создать заказ для специалиста</Text>
          </Pressable>
        </View>
      )}

      {/* Review modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReviewModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Оставить отзыв</Text>

            <View style={{ alignItems: 'center' }}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable key={star} onPress={() => setReviewRating(star)}>
                    <Text style={[styles.starBtn, { color: star <= reviewRating ? '#F59E0B' : colors.border }]}>★</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Расскажите о своём опыте работы со специалистом..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, styles.reviewInput, { outlineStyle: 'none' } as any]}
            />

            <View style={styles.modalBtnRow}>
              <Pressable onPress={() => setShowReviewModal(false)} style={[s.buttonOutline, { flex: 1 }]}>
                <Text style={[s.textLabel, { color: colors.textSecondary }]}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={() => reviewMutation.mutate()}
                disabled={!reviewText.trim() || reviewMutation.isPending}
                style={[s.buttonPrimary, { flex: 2, opacity: !reviewText.trim() ? 0.5 : 1 }]}>
                {reviewMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.buttonText}>Опубликовать</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  )
}
