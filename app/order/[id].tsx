import Screen from '@components/ui/Screen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import PaymentBlock from '@/components/client/PaymentBlock'
import { CATEGORIES, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import styles from './id.styles'

// ─── Standard Response Modal ──────────────────────────────────────────────────

function ResponseModal({ visible, onClose, onSubmit, isLoading }: { visible: boolean; onClose: () => void; onSubmit: (data: { message: string; price: number }) => void; isLoading: boolean }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [message, setMessage] = useState('')
  const [price, setPrice] = useState('')

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Ваш отклик</Text>

          <View>
            <Text style={[styles.modalFieldLabel, { color: colors.textMuted }]}>Сообщение клиенту *</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Расскажите о своём опыте, когда можете приехать..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, { height: vs(100), textAlignVertical: 'top', paddingTop: vs(12), outlineStyle: 'none' } as any]}
            />
          </View>

          <View>
            <Text style={[styles.modalFieldLabel, { color: colors.textMuted }]}>Ваша цена (₸) *</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder="8000" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={[s.input, { outlineStyle: 'none' } as any]} />
          </View>

          <View style={styles.modalBtnRow}>
            <Pressable onPress={onClose} style={[s.buttonOutline, { flex: 1 }]}>
              <Text style={[s.textLabel, { color: colors.textSecondary }]}>Отмена</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!message.trim() || !price) return
                onSubmit({ message: message.trim(), price: parseInt(price) })
              }}
              disabled={!message.trim() || !price || isLoading}
              style={[s.buttonPrimary, { flex: 2, opacity: !message.trim() || !price ? 0.5 : 1 }]}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Откликнуться</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── Barter Response Modal ────────────────────────────────────────────────────

function BarterResponseModal({
  visible,
  order,
  onClose,
  onSubmit,
  isLoading
}: {
  visible: boolean
  order: any
  onClose: () => void
  onSubmit: (data: { message: string; barterSpecialistWant: string; barterPlatformFee: number }) => void
  isLoading: boolean
}) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [message, setMessage] = useState('')
  const [want, setWant] = useState('')
  const [fee, setFee] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!message.trim()) e.message = 'Напишите сообщение'
    if (!want.trim()) e.want = 'Опишите что хотите получить'
    if (!fee || parseInt(fee) <= 0) e.fee = 'Укажите сумму комиссии'
    setErrors(e)
    return !Object.keys(e).length
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalHeaderIcon}>🔄</Text>
            <View style={styles.modalHeaderInfo}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Отклик на бартер</Text>
              <Text style={[styles.modalHeaderSub, { color: colors.textMuted }]} numberOfLines={1}>
                {order?.title}
              </Text>
            </View>
          </View>

          {order?.barterClientOffer && (
            <View style={styles.barterClientOffer}>
              <Text style={styles.barterOfferLabel}>💼 Клиент предлагает взамен:</Text>
              <Text style={[styles.barterOfferText, { color: colors.text }]}>{order.barterClientOffer}</Text>
            </View>
          )}

          <View>
            <Text style={[styles.modalFieldLabelSm, { color: colors.textMuted }]}>Сообщение клиенту *</Text>
            <TextInput
              value={message}
              onChangeText={t => {
                setMessage(t)
                setErrors(e => ({ ...e, message: '' }))
              }}
              placeholder="Расскажите о своём опыте..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, { height: vs(80), textAlignVertical: 'top', paddingTop: vs(12), outlineStyle: 'none' } as any]}
            />
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
          </View>

          <View>
            <Text style={[styles.modalFieldLabelSm, { color: colors.textMuted }]}>Что вы хотите получить взамен? *</Text>
            <TextInput
              value={want}
              onChangeText={t => {
                setWant(t)
                setErrors(e => ({ ...e, want: '' }))
              }}
              placeholder="Например: Ремонт велосипеда, юридическая консультация..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, { height: vs(80), textAlignVertical: 'top', paddingTop: vs(12), outlineStyle: 'none' } as any]}
            />
            {errors.want && <Text style={styles.errorText}>{errors.want}</Text>}
          </View>

          <View>
            <Text style={[styles.modalFieldLabelSm, { color: colors.textMuted }]}>Комиссия платформе (₸) *</Text>
            <TextInput
              value={fee}
              onChangeText={t => {
                setFee(t)
                setErrors(e => ({ ...e, fee: '' }))
              }}
              placeholder="500"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[s.input, { outlineStyle: 'none' } as any]}
            />
            {errors.fee && <Text style={styles.errorText}>{errors.fee}</Text>}
            <Text style={[styles.feeHint, { color: colors.textMuted }]}>Минимальная комиссия платформе за проведение бартера</Text>
          </View>

          <View style={styles.modalBtnRow}>
            <Pressable onPress={onClose} style={[s.buttonOutline, { flex: 1 }]}>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Отмена</Text>
            </Pressable>
            <Pressable
              onPress={() => validate() && onSubmit({ message, barterSpecialistWant: want, barterPlatformFee: parseInt(fee) })}
              disabled={isLoading}
              style={[{ flex: 2, backgroundColor: '#8B5CF6', borderRadius: sm(16), paddingVertical: vs(16), alignItems: 'center' }]}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: sm(15) }}>Предложить условия</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, id],
    queryFn: () => ordersService.findOne(id ?? '').then((r: any) => r.data),
    enabled: !!id
  })

  const isBarter = order?.type === 'barter'
  const isClient = user?.id === order?.clientId
  const isSpecialist = user?.role === 'specialist'
  // @ts-ignore
  const isPartner = user?.role === 'partner'
  const statusColor = ORDER_STATUS_COLOR[order?.status] ?? '#6B7280'
  const catName = CATEGORIES.find(c => c.id === String(order?.categoryId))?.name ?? ''

  const responseMutation = useMutation({
    mutationFn: (data: { message: string; price: number }) => ordersService.createResponse(id ?? '', data),
    onSuccess: () => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, id] })
    }
  })

  const barterResponseMutation = useMutation({
    mutationFn: (data: { message: string; barterSpecialistWant: string; barterPlatformFee: number }) =>
      api.post(`/orders/${id}/responses`, { message: data.message, price: 0 }).then(async (r: any) => {
        await api.patch(`/orders/responses/${r.data.id}/barter`, {
          barterSpecialistWant: data.barterSpecialistWant,
          barterPlatformFee: data.barterPlatformFee
        })
        return r
      }),
    onSuccess: () => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, id] })
    }
  })

  const acceptMutation = useMutation({
    mutationFn: (responseId: string) => ordersService.acceptResponse(responseId),
    onSuccess: (res: any) => {
      const roomId = res.data.roomId
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_ROOMS] })
      router.push(`/chat/${roomId}`)
    }
  })

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={s.textTitle}>Заказ не найден</Text>
      </View>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {/* Header: back + badges + title */}
          <Animated.View entering={FadeInDown.springify()}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Назад</Text>
            </Pressable>

            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Text>
              </View>
              {isBarter && (
                <View style={styles.barterBadge}>
                  <Text style={styles.barterBadgeText}>🔄 Бартер</Text>
                </View>
              )}
              {order.partnerId && (
                <View style={styles.partnerBadge}>
                  <Text style={styles.partnerBadgeText}>🤝 Партнёрский</Text>
                </View>
              )}
              {catName ? (
                <View style={[styles.catBadge, { backgroundColor: colors.elevated }]}>
                  <Text style={[styles.catBadgeText, { color: colors.textMuted }]}>{catName}</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.orderTitle, { color: colors.text }]}>{order.title}</Text>
            <Text style={[styles.orderDesc, { color: colors.textSecondary }]}>{order.description}</Text>
          </Animated.View>

          {/* Barter block */}
          {isBarter && (
            <Animated.View entering={FadeInDown.delay(50).springify()} style={{ gap: vs(12) }}>
              <View style={styles.barterClientBlock}>
                <Text style={styles.barterClientLabel}>💼 Клиент предлагает взамен:</Text>
                <Text style={[styles.barterClientText, { color: colors.text }]}>{order.barterClientOffer ?? '—'}</Text>
              </View>

              {order.barterSpecialistWant ? (
                <View style={styles.barterSpecialistBlock}>
                  <Text style={styles.barterSpecialistLabel}>🛠️ Мастер хочет получить:</Text>
                  <Text style={[styles.barterSpecialistText, { color: colors.text }]}>{order.barterSpecialistWant}</Text>
                  {order.barterPlatformFee > 0 && <Text style={[styles.barterFeeText, { color: colors.textMuted }]}>Комиссия платформе: {order.barterPlatformFee.toLocaleString()} ₸</Text>}
                </View>
              ) : isSpecialist && order.status === 'published' ? (
                <View style={[styles.barterNoOffers, { backgroundColor: colors.elevated }]}>
                  <Text style={[styles.barterNoOffersText, { color: colors.textMuted }]}>Ещё никто не предложил условия. Станьте первым!</Text>
                </View>
              ) : null}
            </Animated.View>
          )}

          {/* Order details */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[s.card, styles.detailsCard]}>
            {!isBarter && order.budgetFrom && (
              <View style={styles.detailRow}>
                <Text style={s.textMuted}>💰 Бюджет</Text>
                <Text style={[s.textLabel, { color: '#FF6B35' }]}>
                  {order.budgetFrom.toLocaleString()}
                  {order.budgetTo ? `–${order.budgetTo.toLocaleString()}` : ''} ₸
                </Text>
              </View>
            )}
            {order.city && (
              <View style={styles.detailRow}>
                <Text style={s.textMuted}>📍 Город</Text>
                <Text style={s.textLabel}>{order.city}</Text>
              </View>
            )}
            {order.responseCount > 0 && (
              <View style={styles.detailRow}>
                <Text style={s.textMuted}>📨 Откликов</Text>
                <Text style={s.textLabel}>{order.responseCount}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={s.textMuted}>📅 Создан</Text>
              <Text style={s.textLabel}>{new Date(order.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</Text>
            </View>
          </Animated.View>

          {/* Partner info */}
          {order.partnerId && (isClient || isPartner) && (
            <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.partnerBlock}>
              <Text style={styles.partnerBlockTitle}>🤝 Партнёрский заказ</Text>
              {order.partnerClientName && (
                <View style={styles.detailRow}>
                  <Text style={s.textMuted}>Клиент</Text>
                  <Text style={s.textLabel}>{order.partnerClientName}</Text>
                </View>
              )}
              {order.partnerClientPhone && (
                <View style={styles.detailRow}>
                  <Text style={s.textMuted}>Телефон</Text>
                  <Text style={s.textLabel}>{order.partnerClientPhone}</Text>
                </View>
              )}
              {order.partnerCommissionPercent > 0 && (
                <View style={styles.detailRow}>
                  <Text style={s.textMuted}>Комиссия партнёра</Text>
                  <Text style={styles.partnerCommission}>{order.partnerCommissionPercent}%</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Responses */}
          {isClient && order.responses?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text style={[styles.responsesTitle, { color: colors.text }]}>Отклики ({order.responses.length})</Text>
              <View style={styles.responsesGap}>
                {order.responses.map((resp: any, index: number) => (
                  <Animated.View key={resp.id} entering={FadeInDown.delay(200 + index * 60).springify()} style={[s.card, { gap: vs(12) }]}>
                    <View style={styles.respSpecialistRow}>
                      <View style={styles.respAvatar}>
                        <Text style={styles.respAvatarText}>{resp.specialist?.user?.name?.[0] ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.respName, { color: colors.text }]}>{resp.specialist?.user?.name ?? 'Специалист'}</Text>
                        <Text style={[styles.respMeta, { color: colors.textMuted }]}>
                          ⭐ {Number(resp.specialist?.rating ?? 0).toFixed(1)} · {resp.specialist?.completedOrders ?? 0} заказов
                        </Text>
                      </View>
                    </View>

                    {resp.message && <Text style={[styles.respMessage, { color: colors.textSecondary }]}>{resp.message}</Text>}

                    <View style={styles.respPriceRow}>
                      <Text style={styles.respPrice}>{Number(resp.price).toLocaleString()} ₸</Text>
                      <Text style={[styles.respDate, { color: colors.textMuted }]}>{new Date(resp.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</Text>
                    </View>

                    {resp.status === 'pending' && order.status === 'published' && (
                      <View style={{ flexDirection: 'row', gap: sm(12) }}>
                        <Pressable onPress={() => acceptMutation.mutate(resp.id)} disabled={acceptMutation.isPending} style={[s.buttonPrimary, { flex: 1 }]}>
                          {acceptMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.buttonText}>✓ Принять → Чат</Text>}
                        </Pressable>
                      </View>
                    )}

                    {resp.status === 'accepted' && (
                      <View style={styles.acceptedBadge}>
                        <Text style={styles.acceptedText}>✓ Принят</Text>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* No responses */}
          {isClient && (!order.responses || order.responses.length === 0) && (
            <View style={[s.card, styles.noRespCard]}>
              <Text style={styles.noRespIcon}>📭</Text>
              <Text style={[s.textLabel, { color: colors.text }]}>Пока нет откликов</Text>
              <Text style={[styles.noRespText, { color: colors.textMuted }]}>{isBarter ? 'Мастера увидят ваш бартер и предложат условия' : 'Специалисты увидят ваш заказ и откликнутся'}</Text>
            </View>
          )}

          {/* Payment block */}
          {!isBarter && order?.status === 'in_progress' && order?.budgetFrom && <PaymentBlock orderId={order.id} amount={order.budgetFrom} isClient={isClient} />}
        </View>
      </ScrollView>

      {/* CTA — specialist */}
      {isSpecialist && order.status === 'published' && (
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + vs(12), borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <Pressable onPress={() => setShowModal(true)} style={[s.buttonPrimary, isBarter && { backgroundColor: '#8B5CF6' }]}>
            <Text style={s.buttonText}>{isBarter ? '🔄 Предложить условия бартера' : '📨 Откликнуться на заказ'}</Text>
          </Pressable>
        </View>
      )}

      {isBarter ? (
        <BarterResponseModal
          visible={showModal}
          order={order}
          onClose={() => setShowModal(false)}
          onSubmit={data => barterResponseMutation.mutate(data)}
          isLoading={barterResponseMutation.isPending}
        />
      ) : (
        <ResponseModal visible={showModal} onClose={() => setShowModal(false)} onSubmit={data => responseMutation.mutate(data)} isLoading={responseMutation.isPending} />
      )}
    </Screen>
  )
}
