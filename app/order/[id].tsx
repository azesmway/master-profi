import Screen from '@components/ui/Screen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import PaymentBlock from '@/components/client/PaymentBlock'
import { CATEGORIES, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

// ─── Standard Response Modal ──────────────────────────────────────────────────

function ResponseModal({ visible, onClose, onSubmit, isLoading }: { visible: boolean; onClose: () => void; onSubmit: (data: { message: string; price: number }) => void; isLoading: boolean }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [message, setMessage] = useState('')
  const [price, setPrice] = useState('')

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
          <Text style={[s.textTitle, { fontSize: 20 }]}>Ваш отклик</Text>

          <View>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Сообщение клиенту *</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Расскажите о своём опыте, когда можете приехать..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
            />
          </View>

          <View>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Ваша цена (₸) *</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder="8000" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={s.input} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
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
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24 }}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.textTitle, { fontSize: 18 }]}>Отклик на бартер</Text>
              <Text style={[s.textMuted, { fontSize: 12 }]} numberOfLines={1}>
                {order?.title}
              </Text>
            </View>
          </View>

          {/* Что предлагает клиент */}
          {order?.barterClientOffer && (
            <View style={{ backgroundColor: '#8B5CF615', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#8B5CF630' }}>
              <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>💼 Клиент предлагает взамен:</Text>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{order.barterClientOffer}</Text>
            </View>
          )}

          {/* Сообщение */}
          <View>
            <Text style={[s.textMuted, { marginBottom: 6 }]}>Сообщение клиенту *</Text>
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
              style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            />
            {errors.message && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.message}</Text>}
          </View>

          {/* Что хочет мастер */}
          <View>
            <Text style={[s.textMuted, { marginBottom: 6 }]}>Что вы хотите получить взамен? *</Text>
            <TextInput
              value={want}
              onChangeText={t => {
                setWant(t)
                setErrors(e => ({ ...e, want: '' }))
              }}
              placeholder="Опишите желаемую оплату за ваши услуги..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            />
            {errors.want && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.want}</Text>}
          </View>

          {/* Комиссия платформе */}
          <View>
            <Text style={[s.textMuted, { marginBottom: 4 }]}>Комиссия платформе (₸) *</Text>
            <Text style={[s.textMuted, { fontSize: 11, marginBottom: 8, opacity: 0.7, lineHeight: 16 }]}>Сумма которую вы готовы заплатить платформе из стоимости ваших услуг</Text>
            <TextInput
              value={fee}
              onChangeText={t => {
                setFee(t)
                setErrors(e => ({ ...e, fee: '' }))
              }}
              placeholder="Например: 2000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={s.input}
            />
            {errors.fee && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.fee}</Text>}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={onClose} style={[s.buttonOutline, { flex: 1 }]}>
              <Text style={[s.textLabel, { color: colors.textSecondary }]}>Отмена</Text>
            </Pressable>
            <Pressable
              onPress={() => validate() && onSubmit({ message: message.trim(), barterSpecialistWant: want.trim(), barterPlatformFee: parseInt(fee) })}
              disabled={isLoading}
              style={[{ flex: 2, backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: isLoading ? 0.6 : 1 }]}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>🔄 Откликнуться</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

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

  // Стандартный отклик
  const responseMutation = useMutation({
    mutationFn: (data: { message: string; price: number }) => ordersService.createResponse(id ?? '', data),
    onSuccess: () => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, id] })
    }
  })

  // Бартер-отклик специалиста
  const barterResponseMutation = useMutation({
    mutationFn: (data: { message: string; barterSpecialistWant: string; barterPlatformFee: number }) =>
      api.post(`/orders/${id}/responses`, { message: data.message, price: 0 }).then(async (r: any) => {
        // После создания отклика — обновляем бартер-поля
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

  // Принять отклик
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
      <View style={[{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
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
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16, paddingBottom: 20 }}>
          {/* Header */}
          <Animated.View entering={FadeInDown.springify()}>
            <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
              <Text style={{ color: '#FF6B35', fontSize: 16 }}>← Назад</Text>
            </Pressable>

            {/* Badges */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: statusColor + '20', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ color: statusColor, fontSize: 12, fontWeight: '700' }}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Text>
              </View>
              {isBarter && (
                <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#8B5CF640' }}>
                  <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '700' }}>🔄 Бартер</Text>
                </View>
              )}
              {order.partnerId && (
                <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                  <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>🤝 Партнёрский</Text>
                </View>
              )}
              {catName ? (
                <View style={{ backgroundColor: colors.elevated, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                  <Text style={[s.textMuted, { fontSize: 12 }]}>{catName}</Text>
                </View>
              ) : null}
            </View>

            <Text style={[s.textTitle, { fontSize: 22, marginBottom: 8 }]}>{order.title}</Text>
            <Text style={[s.textSecondary, { lineHeight: 22 }]}>{order.description}</Text>
          </Animated.View>

          {/* Barter block — что предлагает клиент */}
          {isBarter && (
            <Animated.View entering={FadeInDown.delay(50).springify()} style={{ gap: 12 }}>
              {/* Предложение клиента */}
              <View style={{ backgroundColor: '#8B5CF615', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#8B5CF630' }}>
                <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 13, marginBottom: 8 }}>💼 Клиент предлагает взамен:</Text>
                <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{order.barterClientOffer ?? '—'}</Text>
              </View>

              {/* Условия мастера (если заполнены) */}
              {order.barterSpecialistWant ? (
                <View style={{ backgroundColor: '#FF6B3515', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FF6B3530' }}>
                  <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 13, marginBottom: 8 }}>🛠️ Мастер хочет получить:</Text>
                  <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{order.barterSpecialistWant}</Text>
                  {order.barterPlatformFee > 0 && <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>Комиссия платформе: {order.barterPlatformFee.toLocaleString()} ₸</Text>}
                </View>
              ) : isSpecialist && order.status === 'published' ? (
                <View style={{ backgroundColor: colors.elevated, borderRadius: 16, padding: 14 }}>
                  <Text style={[s.textMuted, { textAlign: 'center', fontSize: 13 }]}>Ещё никто не предложил условия. Станьте первым!</Text>
                </View>
              ) : null}
            </Animated.View>
          )}

          {/* Order details */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[s.card, { gap: 10 }]}>
            {!isBarter && order.budgetFrom && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.textMuted}>💰 Бюджет</Text>
                <Text style={[s.textLabel, { color: '#FF6B35' }]}>
                  {order.budgetFrom.toLocaleString()}
                  {order.budgetTo ? `–${order.budgetTo.toLocaleString()}` : ''} ₸
                </Text>
              </View>
            )}
            {order.city && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.textMuted}>📍 Город</Text>
                <Text style={s.textLabel}>{order.city}</Text>
              </View>
            )}
            {order.responseCount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.textMuted}>📨 Откликов</Text>
                <Text style={s.textLabel}>{order.responseCount}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.textMuted}>📅 Создан</Text>
              <Text style={s.textLabel}>{new Date(order.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</Text>
            </View>
          </Animated.View>

          {/* Partner info block (виден клиенту/партнёру) */}
          {order.partnerId && (isClient || isPartner) && (
            <Animated.View entering={FadeInDown.delay(120).springify()} style={{ backgroundColor: '#10B98115', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#10B98130', gap: 8 }}>
              <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>🤝 Партнёрский заказ</Text>
              {order.partnerClientName && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.textMuted}>Клиент</Text>
                  <Text style={s.textLabel}>{order.partnerClientName}</Text>
                </View>
              )}
              {order.partnerClientPhone && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.textMuted}>Телефон</Text>
                  <Text style={s.textLabel}>{order.partnerClientPhone}</Text>
                </View>
              )}
              {order.partnerCommissionPercent > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.textMuted}>Комиссия партнёра</Text>
                  <Text style={{ color: '#10B981', fontWeight: '700' }}>{order.partnerCommissionPercent}%</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Responses */}
          {isClient && order.responses?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text style={[s.textTitle, { fontSize: 18, marginBottom: 12 }]}>Отклики ({order.responses.length})</Text>
              <View style={{ gap: 12 }}>
                {order.responses.map((resp: any, index: number) => (
                  <Animated.View key={resp.id} entering={FadeInDown.delay(200 + index * 60).springify()} style={[s.card, { gap: 12 }]}>
                    {/* Specialist info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FF6B35', fontWeight: '700' }}>{resp.specialist?.user?.name?.[0] ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.textLabel}>{resp.specialist?.user?.name ?? 'Специалист'}</Text>
                        <Text style={[s.textMuted, { fontSize: 12 }]}>
                          ⭐ {Number(resp.specialist?.rating ?? 0).toFixed(1)} · {resp.specialist?.completedOrders ?? 0} заказов
                        </Text>
                      </View>
                      {!isBarter && <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 16 }}>{resp.price?.toLocaleString()} ₸</Text>}
                    </View>

                    {/* Message */}
                    <Text style={[s.textSecondary, { lineHeight: 20 }]}>{resp.message}</Text>

                    {/* Barter specialist conditions */}
                    {isBarter && order.barterSpecialistWant && resp.specialistId === order.responses?.find((r: any) => r.status === 'accepted')?.specialistId && (
                      <View style={{ backgroundColor: '#FF6B3510', borderRadius: 12, padding: 12 }}>
                        <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Условия мастера:</Text>
                        <Text style={[s.textSecondary, { fontSize: 13 }]}>{order.barterSpecialistWant}</Text>
                      </View>
                    )}

                    {/* Actions */}
                    {resp.status === 'pending' && order.status === 'published' && (
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable onPress={() => router.push(`/specialist/${resp.specialistId}`)} style={[s.buttonOutline, { flex: 1 }]}>
                          <Text style={[s.textLabel, { color: colors.textSecondary, fontSize: 13 }]}>Профиль</Text>
                        </Pressable>
                        <Pressable onPress={() => acceptMutation.mutate(resp.id)} disabled={acceptMutation.isPending} style={[s.buttonPrimary, { flex: 2 }]}>
                          {acceptMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.buttonText}>✓ Принять → Чат</Text>}
                        </Pressable>
                      </View>
                    )}

                    {resp.status === 'accepted' && (
                      <View style={{ backgroundColor: '#22C55E20', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#22C55E', fontWeight: '600' }}>✓ Принят</Text>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Нет откликов */}
          {isClient && (!order.responses || order.responses.length === 0) && (
            <View style={[s.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
              <Text style={s.textLabel}>Пока нет откликов</Text>
              <Text style={[s.textMuted, { textAlign: 'center', marginTop: 4 }]}>{isBarter ? 'Мастера увидят ваш бартер и предложат условия' : 'Специалисты увидят ваш заказ и откликнутся'}</Text>
            </View>
          )}

          {/* Payment block */}
          {!isBarter && order?.status === 'in_progress' && order?.budgetFrom && <PaymentBlock orderId={order.id} amount={order.budgetFrom} isClient={isClient} />}
        </View>
      </ScrollView>

      {/* CTA — специалист */}
      {isSpecialist && order.status === 'published' && (
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          <Pressable onPress={() => setShowModal(true)} style={[s.buttonPrimary, isBarter && { backgroundColor: '#8B5CF6' }]}>
            <Text style={s.buttonText}>{isBarter ? '🔄 Предложить условия бартера' : '📨 Откликнуться на заказ'}</Text>
          </Pressable>
        </View>
      )}

      {/* Modals */}
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
