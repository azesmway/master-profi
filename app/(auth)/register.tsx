import { useTheme } from '@hooks/useTheme'
import { useMutation } from '@tanstack/react-query'
import {useLocalSearchParams, useRouter} from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import Screen from '@/components/ui/Screen'
import { KZ_CITIES } from '@/constants'
import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

const ROLES: Array<{ role: UserRole; title: string; desc: string; icon: string }> = [
  {
    role: 'client',
    title: 'Ищу специалиста',
    desc: 'Создаю заказы, нахожу мастеров',
    icon: '🔍'
  },
  {
    role: 'specialist',
    title: 'Я специалист',
    desc: 'Принимаю заказы, предлагаю услуги',
    icon: '🛠️'
  },
  {
    role: 'partner',
    title: 'Я партнёр',
    desc: 'Привожу клиентов, получаю комиссию',
    icon: '🤝'
  }
]

export default function RegisterScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { setUser, setTokens, user } = useAuthStore()
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('client')
  const [city, setCity] = useState('Алматы')
  const [error, setError] = useState('')
  const [cityOpen, setCityOpen] = useState(false)

  const params = useLocalSearchParams<{ phone?: string }>()

  const mutation = useMutation({
    mutationFn: () =>
      authService.register({
        phone: params.phone ?? user?.phone ?? '',
        name: name.trim(),
        role,
        city
      }),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setTokens(data.accessToken, data.refreshToken)
    },
    onError: err => setError(getApiError(err))
  })

  const handleSubmit = () => {
    setError('')
    if (name.trim().length < 2) {
      setError('Введите ваше имя')
      return
    }
    mutation.mutate()
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-16">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text className="text-dark dark:text-white text-3xl font-bold mb-2">Создаём аккаунт</Text>
              <Text className="text-text-muted dark:text-text-secondary text-base mb-8">Пару шагов — и вы в деле</Text>
            </Animated.View>

            {/* Name */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
              <Text className="text-text-muted dark:text-text-secondary text-sm font-medium mb-2 ml-1">Ваше имя</Text>
              <TextInput
                value={name}
                onChangeText={t => {
                  setName(t)
                  setError('')
                }}
                placeholder="Ваше ФИО"
                placeholderTextColor="#c0c0c0"
                autoCapitalize="words"
                returnKeyType="done"
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-5 text-white text-base"
                style={{ color: colors.text }}
                autoFocus
              />
            </Animated.View>

            {/* Role */}
            <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
              <Text className="text-text-muted dark:text-text-secondary text-sm font-medium mb-2 ml-1">Кто вы?</Text>
              <View className="gap-3">
                {ROLES.map(r => (
                  <Pressable
                    key={r.role}
                    onPress={() => setRole(r.role)}
                    className={[
                      'flex-row items-center gap-4 p-4 rounded-2xl border',
                      role === r.role ? 'bg-primary/10 border-primary' : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border'
                    ].join(' ')}>
                    <Text className="text-3xl">{r.icon}</Text>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }}>{r.title}</Text>
                      <Text className="text-text-muted dark:text-text-secondary text-sm mt-0.5">{r.desc}</Text>
                    </View>
                    <View className={['w-5 h-5 rounded-full border-2', role === r.role ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'].join(' ')} />
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* City */}
            <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-8">
              <Text className="text-text-muted dark:text-text-secondary text-sm font-medium mb-2 ml-1">Ваш город</Text>
              <Pressable
                onPress={() => setCityOpen(!cityOpen)}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-5 flex-row justify-between items-center">
                <Text className="text-dark dark:text-white text-base">{city}</Text>
                <Text className="text-text-muted dark:text-text-secondary">{cityOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {cityOpen && (
                <View className="bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-2xl mt-2 overflow-hidden">
                  {KZ_CITIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => {
                        setCity(c)
                        setCityOpen(false)
                      }}
                      className={['px-4 py-3.5 border-b border-light-border dark:border-dark-border active:bg-dark-border', c === city ? 'bg-primary/10' : ''].join(' ')}>
                      <Text className={c === city ? 'text-primary font-medium' : 'text-white'} style={{ color: colors.text }}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>

            {error ? <Text className="text-error text-sm mb-4 ml-1">{error}</Text> : null}

            <Pressable onPress={handleSubmit} disabled={mutation.isPending || name.trim().length < 2} className="bg-primary py-4 rounded-2xl items-center active:opacity-80 disabled:opacity-40">
              {mutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-dark dark:text-white text-base font-bold">Зарегистрироваться</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
