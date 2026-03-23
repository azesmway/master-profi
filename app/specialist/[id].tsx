import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CURRENCIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { specialistsService } from '@/services/specialistsService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

// ─── Stars component ──────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>
          ★
        </Text>
      ))}
    </View>
  )
}

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({ review, colors, s }: any) {
  const initials = (review.author?.name ?? 'А')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <View style={[s.card, { gap: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FF6B3520',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {review.author?.avatar ? (
            <Image source={{ uri: review.author.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
          ) : (
            <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 12 }}>{initials}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.textLabel, { fontSize: 14 }]}>{review.author?.name ?? 'Аноним'}</Text>
          <Text style={[s.textMuted, { fontSize: 11 }]}>{new Date(review.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Stars rating={review.rating} size={13} />
          {review.isVerified && <Text style={{ color: '#22C55E', fontSize: 10, fontWeight: '600' }}>✓ проверенный</Text>}
        </View>
      </View>
      <Text style={[s.textSecondary, { lineHeight: 20 }]}>{review.text}</Text>
      {review.reply && (
        <View style={{ backgroundColor: colors.elevated, borderRadius: 10, padding: 10, marginTop: 4 }}>
          <Text style={[s.textMuted, { fontSize: 11, marginBottom: 4 }]}>Ответ специалиста:</Text>
          <Text style={[s.textSecondary, { fontSize: 13 }]}>{review.reply}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Rating bars ─────────────────────────────────────────────────────────────

function RatingBars({ stats, colors }: any) {
  const total = stats?.total ?? 0
  return (
    <View style={{ gap: 6 }}>
      {[5, 4, 3, 2, 1].map(star => {
        const count = stats?.distribution?.[star] ?? 0
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, width: 8 }}>{star}</Text>
            <Text style={{ fontSize: 11, color: '#F59E0B' }}>★</Text>
            <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
              <View style={{ width: `${pct}%`, height: 6, backgroundColor: '#FF6B35', borderRadius: 3 }} />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 11, width: 20 }}>{count}</Text>
          </View>
        )
      })}
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

  // Данные специалиста
  const { data: specialist, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SPECIALISTS, id],
    queryFn: () => specialistsService.findOne(id ?? '').then((r: any) => r.data),
    enabled: !!id
  })

  // Отзывы
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/specialist/${id}`).then((r: any) => r.data),
    enabled: !!id
  })

  const reviews = reviewsData?.data ?? []
  const stats = reviewsData?.stats

  // Оставить отзыв
  const reviewMutation = useMutation({
    mutationFn: () =>
      api.post(`/reviews/specialist/${id}`, {
        rating: reviewRating,
        text: reviewText
      }),
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
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#FF6B35', fontSize: 24 }}>‹</Text>
        </Pressable>
        <Text style={[s.textTitle, { flex: 1, fontSize: 18 }]}>Профиль специалиста</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, gap: 16 }}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
            <View style={{ position: 'relative', marginBottom: 12 }}>
              {specialist.user?.avatar ? (
                <Image source={{ uri: specialist.user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" />
              ) : (
                <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 32 }}>{initials}</Text>
                </View>
              )}
              {specialist.isOnline && (
                <View style={{ position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', borderWidth: 2, borderColor: colors.card }} />
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Text style={[s.textTitle, { fontSize: 20 }]}>{specialist.user?.name}</Text>
              {specialist.isVerified && (
                <View style={{ backgroundColor: '#3B82F620', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: '600' }}>✓</Text>
                </View>
              )}
            </View>

            <Text style={[s.textMuted, { marginBottom: 12 }]}>{specialist.isOnline ? '🟢 онлайн' : '⚪ ' + (specialist.responseTime ?? 'оффлайн')}</Text>

            <View style={{ flexDirection: 'row', gap: 24 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[s.textTitle, { fontSize: 20, color: '#F59E0B' }]}>★ {Number(specialist.rating).toFixed(1)}</Text>
                <Text style={[s.textMuted, { fontSize: 11 }]}>{specialist.reviewCount} отзывов</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[s.textTitle, { fontSize: 20 }]}>{specialist.completedOrders}</Text>
                <Text style={[s.textMuted, { fontSize: 11 }]}>заказов</Text>
              </View>
              {specialist.priceFrom && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[s.textTitle, { fontSize: 20, color: '#FF6B35' }]}>
                    {specialist.priceFrom.toLocaleString()}
                    {currency}
                  </Text>
                  <Text style={[s.textMuted, { fontSize: 11 }]}>от / час</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Bio */}
          {specialist.bio && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={s.card}>
              <Text style={[s.textLabel, { marginBottom: 8 }]}>О себе</Text>
              <Text style={[s.textSecondary, { lineHeight: 22 }]}>{specialist.bio}</Text>
            </Animated.View>
          )}

          {/* Portfolio */}
          {specialist.portfolio?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text style={[s.textTitle, { fontSize: 18, marginBottom: 12 }]}>Портфолио</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {specialist.portfolio.map((item: any) => (
                  <View key={item.id} style={{ width: 140, height: 140, borderRadius: 14, overflow: 'hidden' }}>
                    <Image source={{ uri: item.url }} style={{ width: 140, height: 140 }} contentFit="cover" />
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Reviews */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[s.textTitle, { fontSize: 18 }]}>Отзывы {stats?.total > 0 ? `(${stats.total})` : ''}</Text>
              {!isOwnProfile && (
                <Pressable
                  onPress={() => setShowReviewModal(true)}
                  style={{ backgroundColor: '#FF6B3515', borderWidth: 1, borderColor: '#FF6B3540', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '600' }}>+ Отзыв</Text>
                </Pressable>
              )}
            </View>

            {stats?.total > 0 && (
              <View style={[s.card, { flexDirection: 'row', gap: 16, marginBottom: 12 }]}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 40, fontWeight: '700', color: colors.text }}>{stats.avg.toFixed(1)}</Text>
                  <Stars rating={Math.round(stats.avg)} size={16} />
                  <Text style={[s.textMuted, { fontSize: 11, marginTop: 4 }]}>{stats.total} отзывов</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <RatingBars stats={stats} colors={colors} />
                </View>
              </View>
            )}

            {reviews.length === 0 ? (
              <View style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
                <Text style={s.textLabel}>Пока нет отзывов</Text>
                <Text style={[s.textMuted, { textAlign: 'center', marginTop: 4 }]}>Будьте первым кто оставит отзыв</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
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
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          <Pressable onPress={() => router.push({ pathname: '/create-order', params: { specialistId: id } })} style={s.buttonPrimary}>
            <Text style={s.buttonText}>Создать заказ для специалиста</Text>
          </Pressable>
        </View>
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setShowReviewModal(false)}>
          <Pressable style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
            <Text style={[s.textTitle, { fontSize: 20 }]}>Оставить отзыв</Text>

            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable key={star} onPress={() => setReviewRating(star)}>
                    <Text style={{ fontSize: 36, color: star <= reviewRating ? '#F59E0B' : colors.border }}>★</Text>
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
              style={[s.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
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
    </View>
  )
}
