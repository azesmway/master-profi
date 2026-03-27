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

import styles from './profile.styles'

export default function PartnerProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const queryClient = useQueryClient()

  const user = useAuthStore(state => state.user)
  const setUser = useAuthStore(state => state.setUser)

  const [name, setName] = useState(user?.name ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [editing, setEditing] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () => api.patch('/users/me', { name, city }),
    onSuccess: (res: any) => {
      setUser(res.data)
      setEditing(false)
    }
  })

  const avatarMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fd = new FormData()
      fd.append('avatar', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any)
      return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res: any) => setUser(res.data)
  })

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })
    if (!r.canceled && r.assets[0]) avatarMutation.mutate(r.assets[0].uri)
  }

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены?', [
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

  const initials = (user?.name ?? 'П')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + vs(40) }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: sm(20), paddingTop: vs(16) }}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Профиль</Text>
            <Pressable onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Отмена' : '✏️ Изменить'}</Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={pickAvatar} style={styles.avatarOuter}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={[styles.cameraBtn, { backgroundColor: colors.card, borderColor: colors.bg }]}>
                {avatarMutation.isPending ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={styles.cameraIcon}>📷</Text>}
              </View>
            </Pressable>
            <Text style={[styles.avatarName, { color: colors.text }]}>{user?.name}</Text>
            <Text style={[styles.avatarPhone, { color: colors.textMuted }]}>{user?.phone}</Text>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>🤝 Партнёр</Text>
            </View>
          </View>

          {/* Info card */}
          <View style={[s.card, styles.infoCard]}>
            {/* Имя */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Имя</Text>
              {editing ? (
                <TextInput value={name} onChangeText={setName} style={[s.input, styles.fieldInput, { outlineStyle: 'none' } as any]} placeholderTextColor={colors.textMuted} placeholder="Ваше имя" />
              ) : (
                <Text style={[styles.fieldValue, { color: colors.text }]}>{user?.name ?? '—'}</Text>
              )}
            </View>

            {/* Город */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Город</Text>
              {editing ? (
                <TextInput value={city} onChangeText={setCity} style={[s.input, styles.fieldInput, { outlineStyle: 'none' } as any]} placeholderTextColor={colors.textMuted} placeholder="Алматы" />
              ) : (
                <Text style={[styles.fieldValue, { color: colors.text }]}>{user?.city ?? '—'}</Text>
              )}
            </View>

            {editing && (
              <Pressable onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={s.buttonPrimary}>
                {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Сохранить</Text>}
              </Pressable>
            )}
          </View>

          {/* Menu */}
          <View style={[s.card, styles.menuCard]}>
            {[
              // @ts-ignore
              { icon: '📋', label: 'Мои заказы', onPress: () => router.push('/(partner)/orders') },
              // @ts-ignore
              { icon: '💬', label: 'Чаты', onPress: () => router.push('/(partner)/chats') },
              // @ts-ignore
              { icon: '🎁', label: 'Пригласить партнёра — 500 ₸', onPress: () => router.push('/referral') }
            ].map((item, i, arr) => (
              <View key={i}>
                <Pressable onPress={item.onPress} style={styles.menuRow}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
                </Pressable>
                {i < arr.length - 1 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>

          {/* Logout */}
          <Pressable onPress={handleLogout} style={[s.buttonOutline, styles.logoutBtn]}>
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}
