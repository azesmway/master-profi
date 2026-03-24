import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import { promoService, type PromoValidateResult } from '@/services/promoService'
import { makeStyles } from '@/utils/makeStyles'

interface Props {
  onApplied: (promo: PromoValidateResult) => void
  onRemoved: () => void
}

export function PromoCodeInput({ onApplied, onRemoved }: Props) {
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<PromoValidateResult | null>(null)

  async function handleApply() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await promoService.validate(code.trim().toUpperCase())
      if (result.valid) {
        setApplied(result)
        onApplied(result)
      } else {
        setError('Промокод недействителен')
      }
    } catch {
      setError('Промокод не найден или истёк')
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    setApplied(null)
    setCode('')
    setError(null)
    onRemoved()
  }

  if (applied) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#22C55E15',
          borderWidth: 1,
          borderColor: '#22C55E40',
          borderRadius: 14,
          padding: 12,
          gap: 10
        }}>
        <Text style={{ fontSize: 20 }}>🎉</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 14 }}>Промокод применён: {applied.code}</Text>
          <Text style={{ color: '#22C55E', fontSize: 12, marginTop: 2, opacity: 0.8 }}>{applied.description}</Text>
        </View>
        <Pressable onPress={handleRemove} style={{ padding: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={code}
          onChangeText={t => {
            setCode(t.toUpperCase())
            setError(null)
          }}
          placeholder="Промокод"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={[s.input, { flex: 1, fontSize: 14, letterSpacing: 1 }]}
        />
        <Pressable
          onPress={handleApply}
          disabled={!code.trim() || loading}
          style={{
            backgroundColor: code.trim() ? '#FF6B35' : colors.elevated,
            borderRadius: 14,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: code.trim() ? 1 : 0.5
          }}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: code.trim() ? '#fff' : colors.textMuted, fontWeight: '600', fontSize: 14 }}>Применить</Text>}
        </Pressable>
      </View>
      {error && <Text style={{ color: '#EF4444', fontSize: 12, marginLeft: 4 }}>⚠️ {error}</Text>}
    </View>
  )
}
