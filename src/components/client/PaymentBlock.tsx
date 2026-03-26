import Alert from '@blazejkustra/react-native-alert'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import { paymentsService } from '@/services/paymentsService'
import { makeStyles } from '@/utils/makeStyles'

interface Props {
  orderId: string
  amount: number
  isClient: boolean
}

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ Ожидает оплаты',
  held: '🔒 Деньги заморожены',
  released: '✅ Выплачено специалисту',
  refunded: '↩️ Возврат выполнен',
  failed: '❌ Ошибка оплаты'
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  held: '#3B82F6',
  released: '#22C55E',
  refunded: '#6B7280',
  failed: '#EF4444'
}

export default function PaymentBlock({ orderId, amount, isClient }: Props) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const qc = useQueryClient()

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentsService.getStatus(orderId),
    staleTime: 10000,
    retry: false
  })

  const payMutation = useMutation({
    mutationFn: () => paymentsService.createEscrow(orderId, amount),
    onSuccess: async data => {
      qc.invalidateQueries({ queryKey: ['payment', orderId] })
      // Открываем Kaspi
      if (data.kaspiDeeplink) {
        const supported = await Linking.canOpenURL(data.kaspiDeeplink)
        if (supported) {
          await Linking.openURL(data.kaspiDeeplink)
        } else {
          Alert.alert('Kaspi не установлен', 'Установите приложение Kaspi для оплаты', [{ text: 'OK' }])
        }
      }
    }
  })

  const releaseMutation = useMutation({
    mutationFn: () => paymentsService.release(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment', orderId] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  const confirmRelease = () => {
    Alert.alert('Подтвердить завершение', 'Деньги будут переведены специалисту. Вы уверены что работа выполнена?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Подтвердить', onPress: () => releaseMutation.mutate() }
    ])
  }

  if (isLoading) return null

  const status = payment?.status ?? 'none'

  return (
    <View style={[s.card, { gap: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 20 }}>💳</Text>
        <Text style={[s.textLabel, { fontSize: 16 }]}>Оплата</Text>
      </View>

      {/* Сумма */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: colors.elevated,
          borderRadius: 12,
          padding: 14
        }}>
        <View>
          <Text style={s.textMuted}>Сумма заказа</Text>
          <Text style={[s.textTitle, { fontSize: 22, color: '#FF6B35' }]}>{Number(amount).toLocaleString()} ₸</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.textMuted}>Комиссия сервиса</Text>
          <Text style={[s.textSecondary, { fontSize: 13 }]}>{Math.round(amount * 0.08).toLocaleString()} ₸ (8%)</Text>
        </View>
      </View>

      {/* Статус */}
      {status !== 'none' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: (STATUS_COLOR[status] ?? '#6B7280') + '15',
            borderRadius: 10,
            padding: 10
          }}>
          <Text style={{ color: STATUS_COLOR[status] ?? colors.text, fontWeight: '600' }}>{STATUS_LABEL[status] ?? status}</Text>
        </View>
      )}

      {/* Эскроу инфо */}
      {status === 'held' && (
        <View style={{ gap: 6 }}>
          <Text style={[s.textMuted, { fontSize: 12, textAlign: 'center' }]}>🔒 Деньги заморожены до подтверждения работы</Text>
          {isClient && (
            <Pressable onPress={confirmRelease} disabled={releaseMutation.isPending} style={[s.buttonPrimary, { backgroundColor: '#22C55E' }]}>
              {releaseMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>✅ Работа выполнена — оплатить</Text>}
            </Pressable>
          )}
        </View>
      )}

      {/* Кнопка оплаты */}
      {(status === 'none' || status === 'failed') && isClient && (
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={() => payMutation.mutate()}
            disabled={payMutation.isPending}
            style={[
              s.buttonPrimary,
              {
                backgroundColor: '#FF0000',
                flexDirection: 'row',
                gap: 8
              }
            ]}>
            {payMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 18 }}>К</Text>
                <Text style={s.buttonText}>Оплатить через Kaspi</Text>
              </>
            )}
          </Pressable>
          <Text style={[s.textMuted, { fontSize: 11, textAlign: 'center' }]}>Деньги будут заморожены до завершения работы</Text>
        </View>
      )}

      {status === 'released' && <Text style={[s.textMuted, { fontSize: 12, textAlign: 'center' }]}>Заказ успешно оплачен и завершён</Text>}
    </View>
  )
}
