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
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, outlineStyle: 'none' }]}
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

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16
  },
  roleList: { gap: 12 },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  roleItemActive: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderColor: '#FF6B35'
  },
  roleIcon: { fontSize: 28 },
  roleText: { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: '600' },
  roleDesc: { fontSize: 13, marginTop: 2 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterActive: { borderColor: '#FF6B35' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35'
  },
  cityPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  cityText: { fontSize: 16 },
  cityDropdown: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden'
  },
  cityOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  cityOptionActive: { backgroundColor: 'rgba(255,107,53,0.08)' },
  cityOptionText: { fontSize: 15 },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 16, marginLeft: 4 },
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
