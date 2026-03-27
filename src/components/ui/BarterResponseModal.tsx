import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import { makeStyles } from '@/utils/makeStyles'

interface Props {
  visible: boolean
  order: any
  onClose: () => void
  onSubmit: (data: { barterSpecialistWant: string; barterPlatformFee: number }) => void
  isLoading: boolean
}

export function BarterResponseModal({ visible, order, onClose, onSubmit, isLoading }: Props) {
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const [want, setWant] = useState('')
  const [fee, setFee] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!want.trim()) e.want = 'Опишите что вы хотите получить'
    if (!fee || parseInt(fee) <= 0) e.fee = 'Укажите сумму комиссии платформе'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handle = () => {
    if (!validate()) return
    onSubmit({ barterSpecialistWant: want.trim(), barterPlatformFee: parseInt(fee) })
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
              <Text style={[s.textMuted, { fontSize: 12 }]}>{order?.title}</Text>
            </View>
          </View>

          {/* Клиент предлагает */}
          {order?.barterClientOffer && (
            <View style={{ backgroundColor: '#8B5CF615', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#8B5CF630' }}>
              <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>💼 Клиент предлагает:</Text>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{order.barterClientOffer}</Text>
            </View>
          )}

          {/* Что хочет специалист */}
          <View>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Что вы хотите получить взамен? *</Text>
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
              style={[s.input, { height: 90, textAlignVertical: 'top', paddingTop: 12, outlineStyle: 'none' }]}
            />
            {errors.want && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.want}</Text>}
          </View>

          {/* Комиссия платформе */}
          <View>
            <Text style={[s.textMuted, { marginBottom: 4 }]}>Комиссия платформе (₸) *</Text>
            <Text style={[s.textMuted, { fontSize: 11, marginBottom: 8, lineHeight: 16 }]}>Укажите сумму, которую вы готовы заплатить платформе из стоимости ваших услуг</Text>
            <TextInput
              value={fee}
              onChangeText={t => {
                setFee(t)
                setErrors(e => ({ ...e, fee: '' }))
              }}
              placeholder="Например: 2000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={[s.input, { outlineStyle: 'none' }]}
            />
            {errors.fee && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.fee}</Text>}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={onClose} style={[s.buttonOutline, { flex: 1 }]}>
              <Text style={[s.textLabel, { color: colors.textSecondary }]}>Отмена</Text>
            </Pressable>
            <Pressable
              onPress={handle}
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
