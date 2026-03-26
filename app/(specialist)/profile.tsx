import Alert from '@blazejkustra/react-native-alert'
import Screen from '@components/ui/Screen'
import { performLogout } from '@services/logoutService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

// ─── Category picker modal ────────────────────────────────────────────────────

function CategoryModal({ visible, selected, onClose, onSave }: { visible: boolean; selected: string[]; onClose: () => void; onSave: (ids: string[]) => void }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [picked, setPicked] = useState<string[]>(selected)

  const toggle = (id: string) => {
    setPicked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
          <Text style={[s.textTitle, { fontSize: 20, marginBottom: 16 }]}>Категории услуг</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {CATEGORIES.filter(c => c.id !== '12').map(cat => {
                const isSelected = picked.includes(cat.id)
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggle(cat.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: isSelected ? '#FF6B35' : colors.elevated,
                      borderWidth: 1,
                      borderColor: isSelected ? '#FF6B35' : colors.border
                    }}>
                    <Text>{cat.icon}</Text>
                    <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 13 }}>{cat.name}</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={onClose} style={[s.buttonOutline, { flex: 1 }]}>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Отмена</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave(picked)
                onClose()
              }}
              style={[s.buttonPrimary, { flex: 2 }]}>
              <Text style={s.buttonText}>Сохранить</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Portfolio item ───────────────────────────────────────────────────────────

function PortfolioGrid({ items, onAdd, onDelete, isLoading }: { items: any[]; onAdd: () => void; onDelete: (id: string) => void; isLoading: boolean }) {
  const { colors } = useTheme()
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Портфолио ({items.length})</Text>
        <Pressable onPress={onAdd} style={{ backgroundColor: '#FF6B3515', borderWidth: 1, borderColor: '#FF6B3540', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
          {isLoading ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={{ color: '#FF6B35', fontWeight: '600', fontSize: 13 }}>+ Добавить фото</Text>}
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map(item => (
          <View key={item.id} style={{ position: 'relative' }}>
            <Image source={{ uri: item.url }} style={{ width: 100, height: 100, borderRadius: 12 }} contentFit="cover" />
            <Pressable
              onPress={() => onDelete(item.id)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(0,0,0,0.6)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>
        ))}
        {items.length === 0 && (
          <Pressable
            onPress={onAdd}
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}>
            <Text style={{ fontSize: 24, color: colors.textMuted }}>📷</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Добавить</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

// ─── Verification Section ─────────────────────────────────────────────────────

function VerificationSection({ specialistId, isVerified }: { specialistId?: string; isVerified?: boolean }) {
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

  const { data: verStatus } = useQuery({
    queryKey: ['verification', specialistId],
    queryFn: () => api.get('/verification/status').then((r: any) => r.data),
    enabled: !!specialistId,
    staleTime: 1000 * 60
  })

  const applyMutation = useMutation({
    mutationFn: async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true
      })
      if (result.canceled) return

      setUploading(true)
      const fd = new FormData()
      for (const asset of result.assets) {
        fd.append('documents', {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.name
        } as any)
      }
      return api.post('/verification/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: () => {
      setUploading(false)
      queryClient.invalidateQueries({ queryKey: ['verification', specialistId] })
    },
    onError: () => setUploading(false)
  })

  if (isVerified) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F620', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.textLabel, { color: '#3B82F6' }]}>Профиль верифицирован</Text>
          <Text style={[s.textMuted, { fontSize: 12 }]}>Клиенты видят значок ✓ на вашем профиле</Text>
        </View>
      </View>
    )
  }

  const status = verStatus?.verification?.status

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 20 }}>🔐</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.textLabel}>Верификация профиля</Text>
          <Text style={[s.textMuted, { fontSize: 12 }]}>Повышает доверие клиентов и рейтинг</Text>
        </View>
        {status === 'pending' && (
          <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '600' }}>На проверке</Text>
          </View>
        )}
        {status === 'rejected' && (
          <View style={{ backgroundColor: '#EF444420', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Отклонено</Text>
          </View>
        )}
      </View>

      {status === 'rejected' && verStatus?.verification?.comment && (
        <View style={{ backgroundColor: '#EF444410', borderRadius: 10, padding: 10 }}>
          <Text style={{ color: '#EF4444', fontSize: 13 }}>{verStatus.verification.comment}</Text>
        </View>
      )}

      {status !== 'pending' && (
        <Pressable onPress={() => applyMutation.mutate()} disabled={applyMutation.isPending || uploading} style={[s.buttonOutline, { borderColor: '#3B82F6' }]}>
          {applyMutation.isPending || uploading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={{ color: '#3B82F6', fontWeight: '600' }}>{status === 'rejected' ? '📎 Загрузить снова' : '📎 Загрузить документы'}</Text>
          )}
        </Pressable>
      )}
    </View>
  )
}

export default function SpecialistProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const setUser = useAuthStore(state => state.setUser)

  const [editing, setEditing] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)

  // Загружаем профиль специалиста
  const { data: specialist, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SPECIALISTS, 'me'],
    queryFn: () => api.get('/specialists/me').then((r: any) => r.data),
    retry: false
  })

  // Форма редактирования
  const [form, setForm] = useState({
    bio: specialist?.bio ?? '',
    city: specialist?.city ?? user?.city ?? '',
    priceFrom: String(specialist?.priceFrom ?? ''),
    priceTo: String(specialist?.priceTo ?? ''),
    priceCurrency: specialist?.priceCurrency ?? 'KZT',
    priceUnit: specialist?.priceUnit ?? 'hour',
    responseTime: specialist?.responseTime ?? '',
    isOnline: specialist?.isOnline ?? false,
    categoryIds: specialist?.categoryIds ? (typeof specialist.categoryIds === 'string' ? specialist.categoryIds.split(',').map((ss: string) => ss.trim()) : specialist.categoryIds) : ([] as string[])
  })

  // Обновляем форму когда загрузились данные
  const initForm = useCallback(
    (sp: any) => {
      if (!sp) return
      setForm({
        bio: sp.bio ?? '',
        city: sp.city ?? user?.city ?? '',
        priceFrom: String(sp.priceFrom ?? ''),
        priceTo: String(sp.priceTo ?? ''),
        priceCurrency: sp.priceCurrency ?? 'KZT',
        priceUnit: sp.priceUnit ?? 'hour',
        responseTime: sp.responseTime ?? '',
        isOnline: sp.isOnline ?? false,
        categoryIds: sp.categoryIds ? (typeof sp.categoryIds === 'string' ? sp.categoryIds.split(',').map((ss: string) => ss.trim()) : sp.categoryIds) : []
      })
    },
    [user?.city]
  )

  // Сохраняем профиль
  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch('/specialists/me', {
        ...form,
        priceFrom: form.priceFrom ? parseInt(form.priceFrom) : null,
        priceTo: form.priceTo ? parseInt(form.priceTo) : null
      }),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, 'me'] })
    }
  })

  // Загружаем аватар
  const avatarMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fd = new FormData()
      fd.append('avatar', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any)
      return api.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: (res: any) => setUser(res.data)
  })

  // Добавляем в портфолио
  const portfolioAddMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fd = new FormData()
      fd.append('photo', { uri, type: 'image/jpeg', name: `portfolio-${Date.now()}.jpg` } as any)
      return api.post('/specialists/me/portfolio', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, 'me'] })
  })

  // Удаляем из портфолио
  const portfolioDelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/specialists/me/portfolio/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, 'me'] })
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

  const pickPortfolio = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true
    })
    if (!r.canceled) {
      for (const asset of r.assets) {
        await portfolioAddMutation.mutateAsync(asset.uri)
      }
    }
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

  const name = user?.name ?? 'Специалист'
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const portfolio = specialist?.portfolio ?? []
  const catNames = form.categoryIds
    .map((id: string) => CATEGORIES.find(c => c.id === id)?.icon)
    .filter(Boolean)
    .join(' ')

  return (
    <Screen>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={[s.textTitle, { fontSize: 22 }]}>Мой профиль</Text>
        <Pressable
          onPress={() => {
            if (!editing) initForm(specialist)
            setEditing(!editing)
          }}>
          <Text style={{ color: '#FF6B35', fontWeight: '600' }}>{editing ? 'Отмена' : '✏️ Изменить'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Avatar + info */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <Pressable onPress={pickAvatar} style={{ position: 'relative', marginBottom: 12 }}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" />
            ) : (
              <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 32 }}>{initials}</Text>
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

          <Text style={[s.textTitle, { fontSize: 20 }]}>{name}</Text>
          <Text style={[s.textMuted, { marginTop: 4 }]}>{user?.phone}</Text>

          {catNames ? <Text style={{ fontSize: 20, marginTop: 8 }}>{catNames}</Text> : null}

          {/* Онлайн toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: form.isOnline ? '#22C55E' : colors.textMuted }} />
            <Text style={[s.textSecondary, { fontSize: 14 }]}>{form.isOnline ? 'Онлайн' : 'Оффлайн'}</Text>
            <Switch
              value={form.isOnline}
              onValueChange={v => {
                setForm(f => ({ ...f, isOnline: v }))
                api.patch('/specialists/me', { isOnline: v }).catch(() => {})
              }}
              trackColor={{ true: '#22C55E', false: colors.border }}
              thumbColor="#fff"
            />
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            {[
              { label: 'Рейтинг', value: `★ ${Number(specialist?.rating ?? 0).toFixed(1)}` },
              { label: 'Отзывов', value: String(specialist?.reviewCount ?? 0) },
              { label: 'Заказов', value: String(specialist?.completedOrders ?? 0) }
            ].map((stat, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={[s.textTitle, { fontSize: 18, color: '#FF6B35' }]}>{stat.value}</Text>
                <Text style={[s.textMuted, { fontSize: 12 }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Edit form */}
        {editing && (
          <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, { gap: 16 }]}>
            <Text style={[s.textTitle, { fontSize: 16, marginBottom: -4 }]}>Редактирование</Text>

            {/* Bio */}
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>О себе</Text>
              <TextInput
                value={form.bio}
                onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                placeholder="Расскажите о своём опыте..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[s.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
              />
            </View>

            {/* City */}
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Город</Text>
              <TextInput value={form.city} onChangeText={v => setForm(f => ({ ...f, city: v }))} placeholder="Алматы" placeholderTextColor={colors.textMuted} style={s.input} />
            </View>

            {/* Response time */}
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Время отклика</Text>
              <TextInput
                value={form.responseTime}
                onChangeText={v => setForm(f => ({ ...f, responseTime: v }))}
                placeholder="в течение 1 часа"
                placeholderTextColor={colors.textMuted}
                style={s.input}
              />
            </View>

            {/* Price */}
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Цена (₸)</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  value={form.priceFrom}
                  onChangeText={v => setForm(f => ({ ...f, priceFrom: v }))}
                  placeholder="от"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[s.input, { flex: 1 }]}
                />
                <TextInput
                  value={form.priceTo}
                  onChangeText={v => setForm(f => ({ ...f, priceTo: v }))}
                  placeholder="до"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[s.input, { flex: 1 }]}
                />
              </View>
              {/* Price unit */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {[
                  { key: 'hour', label: '/час' },
                  { key: 'day', label: '/день' },
                  { key: 'project', label: 'за проект' }
                ].map(u => (
                  <Pressable
                    key={u.key}
                    onPress={() => setForm(f => ({ ...f, priceUnit: u.key }))}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: form.priceUnit === u.key ? '#FF6B35' : colors.elevated
                    }}>
                    <Text style={{ color: form.priceUnit === u.key ? '#fff' : colors.textMuted, fontSize: 13 }}>{u.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View>
              <Text style={[s.textMuted, { fontSize: 12, marginBottom: 6 }]}>Категории услуг</Text>
              <Pressable onPress={() => setShowCatModal(true)} style={[s.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={{ color: form.categoryIds.length > 0 ? colors.text : colors.textMuted }}>
                  {form.categoryIds.length > 0
                    ? form.categoryIds
                        .map((id: string) => CATEGORIES.find(c => c.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Выбрать категории'}
                </Text>
                <Text style={{ color: colors.textMuted }}>›</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={s.buttonPrimary}>
              {saveMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Сохранить изменения</Text>}
            </Pressable>
          </Animated.View>
        )}

        {/* Portfolio */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={s.card}>
          <PortfolioGrid items={portfolio} onAdd={pickPortfolio} onDelete={id => portfolioDelMutation.mutate(id)} isLoading={portfolioAddMutation.isPending} />
        </Animated.View>

        {/* Верификация */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={s.card}>
          <VerificationSection specialistId={specialist?.id} isVerified={specialist?.isVerified} />
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[s.card, { gap: 0 }]}>
          {[
            { icon: '📋', label: 'Мои заказы', onPress: () => router.push('/(specialist)/orders') },
            { icon: '💰', label: 'Заработок', onPress: () => router.push('/(specialist)/earnings') },
            { icon: '💬', label: 'Мои чаты', onPress: () => router.push('/(specialist)/chats') },
            { icon: '⭐', label: 'Мои отзывы', onPress: () => {} },
            { icon: '🔔', label: 'Уведомления', onPress: () => {} }
          ].map((item, i, arr) => (
            <View key={i}>
              <Pressable onPress={item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={[s.textLabel, { flex: 1 }]}>{item.label}</Text>
                <Text style={s.textMuted}>›</Text>
              </Pressable>
              {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: colors.border }} />}
            </View>
          ))}
        </Animated.View>

        {/* Публичный профиль */}
        {specialist && (
          <Pressable onPress={() => router.push(`/specialist/${specialist.id}`)} style={[s.buttonOutline, { borderColor: '#FF6B35' }]}>
            <Text style={{ color: '#FF6B35', fontWeight: '600' }}>👁 Посмотреть мой профиль</Text>
          </Pressable>
        )}

        {/* Logout */}
        <Pressable onPress={handleLogout} style={[s.buttonOutline, { borderColor: '#EF4444' }]}>
          <Text style={{ color: '#EF4444', fontWeight: '600' }}>Выйти из аккаунта</Text>
        </Pressable>
      </ScrollView>

      <CategoryModal visible={showCatModal} selected={form.categoryIds} onClose={() => setShowCatModal(false)} onSave={ids => setForm(f => ({ ...f, categoryIds: ids }))} />
    </Screen>
  )
}
