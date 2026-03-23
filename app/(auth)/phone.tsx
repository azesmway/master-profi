import Screen from '@components/ui/Screen'
import { useTheme } from '@hooks/useTheme'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'

const COUNTRY_CODES = [
  { code: '+7', flag: '🇰🇿', name: 'KZ' },
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
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: `${country.code}${phone}` }
      })
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
        {/* Header */}
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => router.back()} className="mb-8">
            <Text className="text-primary text-base">← Назад</Text>
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-dark dark:text-white text-3xl font-bold mb-2">Ваш номер телефона</Text>
            <Text className="text-text-muted dark:text-text-secondary text-base">Отправим код подтверждения по SMS</Text>
          </Animated.View>
        </View>

        {/* Input */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mt-4">
          <View className="flex-row items-center bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
            {/* Country picker */}
            <Pressable onPress={() => setCountryIdx(i => (i + 1) % COUNTRY_CODES.length)} className="flex-row items-center gap-2 px-4 py-5 border-r border-light-border dark:border-dark-border">
              <Text className="text-xl">{country.flag}</Text>
              <Text className="text-dark dark:text-white font-medium">{country.code}</Text>
            </Pressable>

            {/* Phone input */}
            <TextInput
              ref={inputRef}
              value={phone}
              onChangeText={t => {
                setPhone(formatPhone(t))
                setError('')
              }}
              keyboardType="phone-pad"
              placeholder="700 000 0000"
              placeholderTextColor="#555"
              style={{ color: colors.text }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {error ? <Text className="text-error text-sm mt-2 ml-1">{error}</Text> : null}
        </Animated.View>

        {/* Submit */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 mt-6">
          <Pressable onPress={handleSubmit} disabled={mutation.isPending || phone.length < 10} className="bg-primary py-4 rounded-2xl items-center active:opacity-80 disabled:opacity-40">
            {mutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-dark dark:text-white text-base font-bold">Получить код</Text>}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
