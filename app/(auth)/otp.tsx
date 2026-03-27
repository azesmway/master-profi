import { useMutation } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated'

import Screen from '@/components/ui/Screen'
import { useTheme } from '@/hooks/useTheme'
import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const CODE_LENGTH = 6
const RESEND_SECONDS = 60

export default function OtpScreen() {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const { colors } = useTheme()
  const setAuth = useAuthStore(s => s.setAuth)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const verifyMutation = useMutation({
    mutationFn: () => authService.verifyOtp({ phone: phone!, code: Platform.OS === 'android' ? code + '6' : code }),
    onSuccess: response => {
      const data = response?.data
      if (!data) {
        setError('Пустой ответ от сервера')
        return
      }
      if (!data.user?.name) {
        router.replace({ pathname: '/(auth)/register', params: { phone } })
        return
      }
      if (!data.accessToken) {
        setError('Не получен токен от сервера')
        return
      }
      setAuth(data.user, data.accessToken, data.refreshToken)
      switch (data.user.role) {
        case 'specialist':
          router.replace('/(specialist)/orders')
          break
        case 'admin':
          router.replace('/(admin)/dashboard')
          break
        case 'partner':
          // @ts-ignore
          router.replace('/(partner)/orders')
          break
        default:
          router.replace('/(client)/home')
          break
      }
    },
    onError: err => {
      setError(getApiError(err))
      setCode('')
      inputRef.current?.focus()
    }
  })

  const resendMutation = useMutation({
    mutationFn: () => authService.sendOtp({ phone: phone! }),
    onSuccess: () => {
      setCountdown(RESEND_SECONDS)
      setError('')
    },
    onError: err => setError(getApiError(err))
  })

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(cleaned)
    setError('')
    if (cleaned.length === CODE_LENGTH) verifyMutation.mutate()
  }

  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => ({
    char: code[i] ?? '',
    active: i === code.length && !verifyMutation.isPending,
    filled: i < code.length
  }))

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Назад</Text>
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[styles.title, { color: colors.text }]}>Код подтверждения</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Отправили SMS на <Text style={[styles.phoneHighlight, { color: colors.text }]}>{phone}</Text>
            </Text>
          </Animated.View>

          {/* Code boxes */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.boxRow}>
            {boxes.map((box, i) => (
              <Pressable
                key={i}
                onPress={() => inputRef.current?.focus()}
                style={[
                  styles.box,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  box.active && { borderColor: '#FF6B35' },
                  box.filled && { backgroundColor: colors.elevated, borderColor: 'rgba(255,255,255,0.4)' }
                ]}>
                {box.filled ? (
                  <Animated.Text entering={ZoomIn.springify()} style={[styles.boxChar, { color: colors.text }]}>
                    {box.char}
                  </Animated.Text>
                ) : null}
                {box.active ? <View style={styles.cursor} /> : null}
              </Pressable>
            ))}
          </Animated.View>

          <TextInput ref={inputRef} value={code} onChangeText={handleChange} keyboardType="number-pad" maxLength={CODE_LENGTH} autoFocus style={styles.hiddenInput} />

          {verifyMutation.isPending && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FF6B35" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Проверяем код...</Text>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                Отправить снова через <Text style={[styles.countdownNum, { color: colors.text }]}>{countdown}с</Text>
              </Text>
            ) : (
              <Pressable onPress={() => resendMutation.mutate()} disabled={resendMutation.isPending} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.resendText}>{resendMutation.isPending ? 'Отправляем...' : 'Отправить код снова'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 64 },
  backBtn: { marginBottom: 32 },
  backText: { color: '#FF6B35', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  phoneHighlight: { fontWeight: '600' },
  boxRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 40,
    marginBottom: 16,
    justifyContent: 'center'
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  boxChar: { fontSize: 22, fontWeight: '700' },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 1
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16
  },
  loadingText: { fontSize: 14 },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  },
  resendRow: { alignItems: 'center', marginTop: 32 },
  countdownText: { fontSize: 14 },
  countdownNum: { fontWeight: '600' },
  resendText: { color: '#FF6B35', fontWeight: '500', fontSize: 14 },
  pressed: { opacity: 0.6 }
})
