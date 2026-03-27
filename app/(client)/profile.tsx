import Alert from '@blazejkustra/react-native-alert'
import Screen from '@components/ui/Screen'
import { performLogout } from '@services/logoutService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import { profileStyles as ps } from './profile.styles'

export default function ClientProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const queryClient = useQueryClient()

  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const setUser = useAuthStore(state => state.setUser)

  const [name, setName] = useState(user?.name ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [editing, setEditing] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () => api.patch('/users/me', { name, city, email }),
    onSuccess: (res: any) => {
      setUser(res.data)
      setEditing(false)
    }
  })

  const avatarMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData()
      formData.append('avatar', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any)
      return api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: (res: any) => setUser(res.data)
  })

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })
    if (!result.canceled && result.assets[0]) {
      avatarMutation.mutate(result.assets[0].uri)
    }
  }

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await performLogout(queryClient)
          router.replace('/(auth)/welcome')
        }
      }
    ])
  }

  const initials = (user?.name ?? 'М')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: vs(40) }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: sm(20) }}>
          {/* Header */}
          <View style={ps.pageHeader}>
            <Text style={[ps.pageTitle, { color: colors.text }]}>Профиль</Text>
            <Pressable onPress={() => setEditing(!editing)}>
              <Text style={[ps.editBtn, { color: '#FF6B35' }]}>{editing ? 'Отмена' : '✏️ Изменить'}</Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={ps.avatarSection}>
            <Pressable onPress={pickAvatar} style={ps.avatarOuter}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={ps.avatar} contentFit="cover" />
              ) : (
                <View style={ps.avatarPlaceholder}>
                  <Text style={ps.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={[ps.cameraBtn, { backgroundColor: colors.card, borderColor: colors.bg }]}>
                {avatarMutation.isPending ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={ps.cameraIcon}>📷</Text>}
              </View>
            </Pressable>
            <Text style={[ps.avatarName, { color: colors.text }]}>{user?.name}</Text>
            <Text style={[ps.avatarPhone, { color: colors.textMuted }]}>{user?.phone}</Text>
          </View>

          {/* Info card */}
          <View style={[s.card, ps.infoCard]}>
            {/* Имя */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Имя</Text>
              {editing ? (
                <TextInput value={name} onChangeText={setName} style={[s.input, ps.fieldInput, { outlineStyle: 'none' } as any]} placeholderTextColor={colors.textMuted} placeholder="Ваше имя" />
              ) : (
                <Text style={[ps.fieldValue, { color: colors.text }]}>{user?.name ?? '—'}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Email</Text>
              {editing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[s.input, ps.fieldInput, { outlineStyle: 'none' } as any]}
                  placeholderTextColor={colors.textMuted}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={[ps.fieldValue, { color: colors.text }]}>{user?.email ?? '—'}</Text>
              )}
            </View>

            {/* Город */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Город</Text>
              {editing ? (
                <TextInput value={city} onChangeText={setCity} style={[s.input, ps.fieldInput, { outlineStyle: 'none' } as any]} placeholderTextColor={colors.textMuted} placeholder="Алматы" />
              ) : (
                <Text style={[ps.fieldValue, { color: colors.text }]}>{user?.city ?? '—'}</Text>
              )}
            </View>
          </View>

          {/* Save button */}
          {editing && (
            <Pressable onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={[s.buttonPrimary, ps.saveBtn]}>
              {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={ps.buttonText}>Сохранить</Text>}
            </Pressable>
          )}

          {/* Stats */}
          <View style={[s.card, ps.statsCard]}>
            {[
              { label: 'Заказов', value: '0' },
              { label: 'Чатов', value: '0' },
              { label: 'Отзывов', value: '0' }
            ].map((stat, i) => (
              <View key={i} style={ps.statItem}>
                <Text style={[ps.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[ps.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Menu */}
          <View style={[s.card, ps.menuCard]}>
            {[
              { icon: '📋', label: 'Мои заказы', onPress: () => router.push('/(client)/orders') },
              { icon: '💬', label: 'Мои чаты', onPress: () => router.push('/(client)/chats') },
              { icon: '🔔', label: 'Уведомления', onPress: () => {} },
              { icon: '🔒', label: 'Безопасность', onPress: () => {} }
            ].map((item, i, arr) => (
              <View key={i}>
                <Pressable onPress={item.onPress} style={ps.menuRow}>
                  <Text style={ps.menuIcon}>{item.icon}</Text>
                  <Text style={[ps.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[ps.menuArrow, { color: colors.textMuted }]}>›</Text>
                </Pressable>
                {i < arr.length - 1 && <View style={[ps.menuDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>

          {/* Referral */}
          <View style={[s.card, { marginTop: vs(16) }]}>
            <Pressable
              // @ts-ignore
              onPress={() => router.push('/referral')}>
              <Text style={{ color: colors.text, fontSize: sm(14) }}>🎁 Пригласить друга — 500 ₸</Text>
            </Pressable>
          </View>

          {/* Logout */}
          <Pressable onPress={handleLogout} style={[s.buttonOutline, ps.logoutBtn]}>
            <Text style={ps.logoutText}>Выйти из аккаунта</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}
