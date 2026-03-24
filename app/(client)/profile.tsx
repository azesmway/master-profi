import Screen from '@components/ui/Screen'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

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
      formData.append('avatar', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as any)
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
        onPress: () => {
          logout()
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={[s.textTitle, { fontSize: 24 }]}>Профиль</Text>
            <Pressable onPress={() => setEditing(!editing)}>
              <Text style={{ color: '#FF6B35', fontWeight: '600' }}>{editing ? 'Отмена' : '✏️ Изменить'}</Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Pressable onPress={pickAvatar} style={{ position: 'relative' }}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} contentFit="cover" />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: '#FF6B35',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700' }}>{initials}</Text>
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.card,
                  borderWidth: 2,
                  borderColor: colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                {avatarMutation.isPending ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={{ fontSize: 14 }}>📷</Text>}
              </View>
            </Pressable>
            <Text style={[s.textTitle, { marginTop: 12, fontSize: 20 }]}>{user?.name}</Text>
            <Text style={[s.textMuted, { marginTop: 4 }]}>{user?.phone}</Text>
          </View>

          {/* Info */}
          <View style={[s.card, { gap: 16 }]}>
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Имя</Text>
              {editing ? (
                <TextInput value={name} onChangeText={setName} style={[s.input, { paddingVertical: 10 }]} placeholderTextColor={colors.textMuted} placeholder="Ваше имя" />
              ) : (
                <Text style={s.textLabel}>{user?.name ?? '—'}</Text>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Email</Text>
              {editing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[s.input, { paddingVertical: 10 }]}
                  placeholderTextColor={colors.textMuted}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={s.textLabel}>{user?.email ?? '—'}</Text>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Город</Text>
              {editing ? (
                <TextInput value={city} onChangeText={setCity} style={[s.input, { paddingVertical: 10 }]} placeholderTextColor={colors.textMuted} placeholder="Алматы" />
              ) : (
                <Text style={s.textLabel}>{user?.city ?? '—'}</Text>
              )}
            </View>
          </View>

          {/* Save button */}
          {editing && (
            <Pressable onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={[s.buttonPrimary, { marginTop: 16 }]}>
              {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Сохранить</Text>}
            </Pressable>
          )}

          {/* Stats */}
          <View style={[s.card, { flexDirection: 'row', marginTop: 16 }]}>
            {[
              { label: 'Заказов', value: '0' },
              { label: 'Чатов', value: '0' },
              { label: 'Отзывов', value: '0' }
            ].map((stat, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[s.textTitle, { fontSize: 22 }]}>{stat.value}</Text>
                <Text style={[s.textMuted, { fontSize: 12, marginTop: 2 }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Menu */}
          <View style={[s.card, { gap: 0, marginTop: 16 }]}>
            {[
              { icon: '📋', label: 'Мои заказы', onPress: () => router.push('/(client)/orders') },
              { icon: '💬', label: 'Мои чаты', onPress: () => router.push('/(client)/chats') },
              { icon: '🔔', label: 'Уведомления', onPress: () => {} },
              { icon: '🔒', label: 'Безопасность', onPress: () => {} }
            ].map((item, i, arr) => (
              <View key={i}>
                <Pressable onPress={item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 }}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  <Text style={[s.textLabel, { flex: 1 }]}>{item.label}</Text>
                  <Text style={[s.textMuted]}>›</Text>
                </Pressable>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: colors.border }} />}
              </View>
            ))}
          </View>

          {/* Referral */}
          <View style={[s.card, { gap: 0, marginTop: 16 }]}>
            <Pressable
              onPress={() => {
                // @ts-ignore
                router.push('/referral')
              }}>
              <Text>🎁 Пригласить друга — 500 ₸</Text>
            </Pressable>
          </View>

          {/* Logout */}
          <Pressable onPress={handleLogout} style={[s.buttonOutline, { marginTop: 24, borderColor: '#EF4444' }]}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Выйти из аккаунта</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}
