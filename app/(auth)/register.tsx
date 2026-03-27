import { useTheme } from '@hooks/useTheme'
import { useMutation } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import Screen from '@/components/ui/Screen'
import { KZ_CITIES } from '@/constants'
import { getApiError } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

import { styles } from './register.styles'

const ROLES: Array<{ role: UserRole; title: string; desc: string; icon: string }> = [
  { role: 'client', title: 'Ищу специалиста', desc: 'Создаю заказы, нахожу мастеров', icon: '🔍' },
  { role: 'specialist', title: 'Я специалист', desc: 'Принимаю заказы, предлагаю услуги', icon: '🛠️' },
  { role: 'partner', title: 'Я партнёр', desc: 'Привожу клиентов, получаю комиссию', icon: '🤝' }
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text style={[styles.title, { color: colors.text }]}>Создаём аккаунт</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Пару шагов — и вы в деле</Text>
            </Animated.View>

            {/* Name */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Ваше имя</Text>
              <TextInput
                value={name}
                onChangeText={t => {
                  setName(t)
                  setError('')
                }}
                placeholder="Ваше ФИО"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="done"
                autoFocus
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              />
            </Animated.View>

            {/* Role */}
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Кто вы?</Text>
              <View style={styles.roleList}>
                {ROLES.map(r => (
                  <Pressable
                    key={r.role}
                    onPress={() => setRole(r.role)}
                    style={[styles.roleItem, { backgroundColor: colors.card, borderColor: colors.border }, role === r.role && styles.roleItemActive]}>
                    <Text style={styles.roleIcon}>{r.icon}</Text>
                    <View style={styles.roleText}>
                      <Text style={[styles.roleTitle, { color: colors.text }]}>{r.title}</Text>
                      <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>{r.desc}</Text>
                    </View>
                    <View style={[styles.radioOuter, { borderColor: colors.border }, role === r.role && styles.radioOuterActive]}>{role === r.role && <View style={styles.radioInner} />}</View>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* City */}
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Ваш город</Text>
              <Pressable onPress={() => setCityOpen(!cityOpen)} style={[styles.cityPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cityText, { color: colors.text }]}>{city}</Text>
                <Text style={{ color: colors.textMuted }}>{cityOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {cityOpen && (
                <View style={[styles.cityDropdown, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                  {KZ_CITIES.map(c => (
                    <Pressable
                      key={c}
                      onPress={() => {
                        setCity(c)
                        setCityOpen(false)
                      }}
                      style={({ pressed }) => [styles.cityOption, { borderBottomColor: colors.border }, c === city && styles.cityOptionActive, pressed && { backgroundColor: colors.elevated }]}>
                      <Text style={[styles.cityOptionText, { color: c === city ? '#FF6B35' : colors.text }]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </Animated.View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={mutation.isPending || name.trim().length < 2}
              style={({ pressed }) => [styles.submitBtn, (mutation.isPending || name.trim().length < 2) && styles.disabledBtn, pressed && styles.pressed]}>
              {mutation.isPending ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Зарегистрироваться</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
