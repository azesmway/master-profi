import Screen from '@components/ui/Screen'
import { useTheme } from '@hooks/useTheme'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Назад</Text>
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[styles.title, { color: colors.text }]}>Ваш номер телефона</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Отправим код подтверждения по SMS</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputArea}>
          <View style={[styles.phoneRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable onPress={() => setCountryIdx(i => (i + 1) % COUNTRY_CODES.length)} style={[styles.countryPicker, { borderRightColor: colors.border }]}>
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={[styles.code, { color: colors.text }]}>{country.code}</Text>
            </Pressable>

            <TextInput
              ref={inputRef}
              value={phone}
              onChangeText={t => {
                setPhone(formatPhone(t))
                setError('')
              }}
              keyboardType="phone-pad"
              placeholder="700 000 0000"
              placeholderTextColor={colors.textMuted}
              // @ts-ignore
              style={[styles.phoneInput, { color: colors.text, outlineStyle: 'none' }]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
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

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 },
  backBtn: { marginBottom: 32 },
  backText: { color: '#FF6B35', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  inputArea: { paddingHorizontal: 24, marginTop: 16 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRightWidth: 1
  },
  flag: { fontSize: 20 },
  code: { fontWeight: '600', fontSize: 16 },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16
  },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 8, marginLeft: 4 },
  submitArea: { paddingHorizontal: 24, marginTop: 24 },
  submitBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  disabledBtn: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' }
})
