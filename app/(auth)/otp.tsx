import { useMutation } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated'

import Screen from '@/components/ui/Screen'
import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const CODE_LENGTH = 6
const RESEND_SECONDS = 60

export default function OtpScreen() {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()

  const setAuth = useAuthStore(s => s.setAuth)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const inputRef = useRef<TextInput>(null)

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
        // Новый пользователь → регистрация
        router.replace({
          pathname: '/(auth)/register',
          params: { phone }
        })
        return
      }

      if (!data.accessToken) {
        setError('Не получен токен от сервера')
        return
      }

      // Атомарно сохраняем — AuthGuard сделает редирект
      setAuth(data.user, data.accessToken, data.refreshToken)

      // Явный редирект как запасной вариант
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
      console.log('[OTP] error:', getApiError(err))
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
    if (cleaned.length === CODE_LENGTH) {
      verifyMutation.mutate()
    }
  }

  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => ({
    char: code[i] ?? '',
    active: i === code.length && !verifyMutation.isPending,
    filled: i < code.length
  }))
// className="flex-row gap-3 mt-10 mb-4 justify-center"
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="px-6 pt-16">
          <Pressable onPress={() => router.back()} className="mb-8">
            <Text className="text-primary text-base">← Назад</Text>
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-dark dark:text-white text-3xl font-bold mb-2">Код подтверждения</Text>
            <Text className="text-text-muted dark:text-text-secondary text-base">
              Отправили SMS на <Text className="text-dark dark:text-white font-medium">{phone}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flexDirection: 'row', marginTop: 10, marginBottom: 4, justifyContent: 'center' }}>
            {boxes.map((box, i) => (
              <Pressable
                key={i}
                onPress={() => inputRef.current?.focus()}
                className={[
                  'w-12 h-14 rounded-xl items-center justify-center border-2',
                  box.active ? 'border-primary bg-light-card dark:bg-dark-card' : '',
                  box.filled ? 'border-white/40 bg-light-elevated dark:bg-dark-elevated' : '',
                  !box.active && !box.filled ? 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card' : ''
                ].join(' ')}>
                {box.filled ? (
                  <Animated.Text entering={ZoomIn.springify()} className="text-dark dark:text-white text-xl font-bold">
                    {box.char}
                  </Animated.Text>
                ) : null}
                {box.active ? <View className="w-0.5 h-6 bg-primary" /> : null}
              </Pressable>
            ))}
          </Animated.View>

          <TextInput ref={inputRef} value={code} onChangeText={handleChange} keyboardType="number-pad" maxLength={CODE_LENGTH} autoFocus className="absolute opacity-0 w-0 h-0" />

          {verifyMutation.isPending && (
            <View className="items-center mt-4">
              <ActivityIndicator color="#FF6B35" />
              <Text className="text-text-muted dark:text-text-secondary text-sm mt-2">Проверяем код...</Text>
            </View>
          )}

          {error ? <Text className="text-error text-sm text-center mt-2">{error}</Text> : null}

          <View className="items-center mt-8">
            {countdown > 0 ? (
              <Text className="text-text-muted dark:text-text-secondary text-sm">
                Отправить снова через <Text className="text-dark dark:text-white font-medium">{countdown}с</Text>
              </Text>
            ) : (
              <Pressable onPress={() => resendMutation.mutate()} disabled={resendMutation.isPending} className="active:opacity-60">
                <Text className="text-primary font-medium text-sm">{resendMutation.isPending ? 'Отправляем...' : 'Отправить код снова'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
