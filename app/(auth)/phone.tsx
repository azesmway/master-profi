import Screen from '@components/ui/Screen'
import { useTheme } from '@hooks/useTheme'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'

import styles from './phone.styles'

const COUNTRY_CODES = [
  { code: '+7', flag: '🇷🇺', name: 'RU' },
  { code: '+996', flag: '🇰🇬', name: 'KG' }
] as const

export default function PhoneScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const inputRef = useRef<TextInput>(null)

  const [countryIdx, setCountryIdx] = useState(0)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const country = COUNTRY_CODES[countryIdx]!

  const formatPhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10)

  const mutation = useMutation({
    mutationFn: () => authService.sendOtp({ phone: `${country.code}${phone}` }),
    onSuccess: () => {
      router.push({ pathname: '/(auth)/otp', params: { phone: `${country.code}${phone}` } })
    },
    onError: err => setError(getApiError(err))
  })

  const handleSubmit = () => {
    setError('')
    if (phone.length < 10) {
      setError('Введите номер полностью')
      return
    }
    mutation.mutate()
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Назад</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Войти или зарегистрироваться</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Введите номер телефона</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputArea}>
          <View style={[styles.phoneRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => setCountryIdx(i => (i + 1) % COUNTRY_CODES.length)} style={[styles.countryPicker, { borderRightColor: colors.border }]}>
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={[styles.code, { color: colors.text }]}>{country.code}</Text>
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={phone}
              onChangeText={raw => setPhone(formatPhone(raw))}
              placeholder="000 000 0000"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={[styles.phoneInput, { color: colors.text }]}
              autoFocus
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.submitArea}>
          <Pressable
            onPress={handleSubmit}
            disabled={mutation.isPending || phone.length < 10}
            style={({ pressed }) => [styles.submitBtn, (mutation.isPending || phone.length < 10) && styles.disabledBtn, pressed && styles.pressed]}>
            {mutation.isPending ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Получить код</Text>}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
