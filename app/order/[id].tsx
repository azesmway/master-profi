import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import PaymentBlock from '@/components/client/PaymentBlock'
import { CATEGORIES, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

// ─── Response Form Modal ──────────────────────────────────────────────────────

function ResponseModal({ visible, onClose, onSubmit, isLoading }: { visible: boolean; onClose: () => void; onSubmit: (data: { message: string; price: number }) => void; isLoading: boolean }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [message, setMessage] = useState('')
  const [price, setPrice] = useState('')

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            gap: 16
          }}>
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

  // Загружаем заказ
  const { data: order, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, id],
    queryFn: () => ordersService.findOne(id ?? '').then((r: any) => r.data),
    enabled: !!id
  })

  // Откликнуться (специалист)
  const responseMutation = useMutation({
    mutationFn: (data: { message: string; price: number }) => ordersService.createResponse(id ?? '', data),
    onSuccess: () => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, id] })
    }
  })

  // Принять отклик (клиент) → создаёт чат
  const acceptMutation = useMutation({
    mutationFn: (responseId: string) => ordersService.acceptResponse(responseId),
    onSuccess: (res: any) => {
      const roomId = res.data.roomId
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_ROOMS] })
      // Переходим в чат
      router.push(`/chat/${roomId}`)
    }
  })

  const isClient = user?.id === order?.clientId
  const isSpecialist = user?.role === 'specialist'
  const statusColor = ORDER_STATUS_COLOR[order?.status] ?? '#6B7280'
  const category = CATEGORIES.find(c => c.id === order?.categoryId)

  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.textTitle}>Заказ не найден</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#FF6B35' }}>← Назад</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#FF6B35', fontSize: 24 }}>‹</Text>
        </Pressable>
        <Text style={[s.textTitle, { flex: 1, fontSize: 18 }]} numberOfLines={1}>
          {order.title}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, gap: 16 }}>
          {/* Status + category */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: statusColor + '20',
                borderWidth: 1,
                borderColor: statusColor + '40'
              }}>
              <Text style={{ color: statusColor, fontWeight: '600', fontSize: 13 }}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Text>
            </View>
            {category && (
              <View style={[s.elevated, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }]}>
                <Text style={[s.textSecondary, { fontSize: 13 }]}>
                  {category.icon} {category.name}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={s.card}>
            <Text style={[s.textLabel, { marginBottom: 8 }]}>Описание</Text>
            <Text style={[s.textSecondary, { lineHeight: 22 }]}>{order.description}</Text>
          </Animated.View>

          {/* Details */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={s.card}>
            <Text style={[s.textLabel, { marginBottom: 12 }]}>Детали</Text>
            <View style={{ gap: 10 }}>
              {order.city && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.textMuted}>📍 Город</Text>
                  <Text style={s.textLabel}>{order.city}</Text>
                </View>
              )}
              {order.budgetFrom && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.textMuted}>💰 Бюджет</Text>
                  <Text style={s.textLabel}>
                    от {order.budgetFrom?.toLocaleString()} {order.budgetCurrency ?? '₸'}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.textMuted}>📅 Создан</Text>
                <Text style={s.textLabel}>
                  {new Date(order.createdAt).toLocaleDateString('ru', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Responses — видит клиент */}
          {isClient && order.responses?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text style={[s.textTitle, { fontSize: 18, marginBottom: 12 }]}>Отклики ({order.responses.length})</Text>
              <View style={{ gap: 12 }}>
                {order.responses.map((resp: any, index: number) => (
                  <Animated.View key={resp.id} entering={FadeInDown.delay(250 + index * 60).springify()} style={[s.card, { gap: 12 }]}>
                    {/* Specialist info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#FF6B3520',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <Text style={{ color: '#FF6B35', fontWeight: '700' }}>{resp.specialist?.user?.name?.[0] ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.textLabel}>{resp.specialist?.user?.name ?? 'Специалист'}</Text>
                        <Text style={[s.textMuted, { fontSize: 12 }]}>
                          ⭐ {Number(resp.specialist?.rating ?? 0).toFixed(1) ?? '0.0'} · {resp.specialist?.completedOrders ?? 0} заказов
                        </Text>
                      </View>
                      <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 16 }}>{resp.price?.toLocaleString()} ₸</Text>
                    </View>

                    {/* Message */}
                    <Text style={[s.textSecondary, { lineHeight: 20 }]}>{resp.message}</Text>

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
                      <View
                        style={{
                          backgroundColor: '#22C55E20',
                          borderRadius: 10,
                          padding: 10,
                          alignItems: 'center'
                        }}>
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
              <Text style={[s.textMuted, { textAlign: 'center', marginTop: 4 }]}>Специалисты увидят ваш заказ и откликнутся</Text>
            </View>
          )}
        </View>
        {/* Оплата */}
        {order?.status === 'in_progress' && order?.budgetFrom && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <PaymentBlock orderId={order.id} amount={order.budgetFrom} isClient={user?.id === order.clientId} />
          </View>
        )}
      </ScrollView>

      {/* CTA — специалист откликается */}
      {isSpecialist && order.status === 'published' && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.bg
          }}>
          <Pressable onPress={() => setShowModal(true)} style={s.buttonPrimary}>
            <Text style={s.buttonText}>📨 Откликнуться на заказ</Text>
          </Pressable>
        </View>
      )}

      <ResponseModal visible={showModal} onClose={() => setShowModal(false)} onSubmit={data => responseMutation.mutate(data)} isLoading={responseMutation.isPending} />
    </View>
  )
}
