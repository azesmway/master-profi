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
import { s as sm, vs } from 'react-native-size-matters'

import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import { profileStyles as ps } from './profile.styles'

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
      <View style={ps.modalOverlay}>
        <View style={[ps.modalSheet, { backgroundColor: colors.card }]}>
          <Text style={[ps.modalTitle, { color: colors.text }]}>Категории услуг</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={ps.modalCatGrid}>
              {CATEGORIES.filter(c => c.id !== '12').map(cat => {
                const isSelected = picked.includes(cat.id)
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggle(cat.id)}
                    style={[
                      ps.modalCatBtn,
                      {
                        backgroundColor: isSelected ? '#FF6B35' : colors.elevated,
                        borderColor: isSelected ? '#FF6B35' : colors.border
                      }
                    ]}>
                    <Text>{cat.icon}</Text>
                    <Text style={[ps.modalCatText, { color: isSelected ? '#fff' : colors.text }]}>{cat.name}</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
          <View style={ps.modalBtnRow}>
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

// ─── Portfolio grid ───────────────────────────────────────────────────────────

function PortfolioGrid({ items, onAdd, onDelete, isLoading }: { items: any[]; onAdd: () => void; onDelete: (id: string) => void; isLoading: boolean }) {
  const { colors } = useTheme()
  return (
    <View>
      <View style={ps.portfolioHeader}>
        <Text style={[ps.portfolioTitle, { color: colors.text }]}>Портфолио ({items.length})</Text>
        <Pressable onPress={onAdd} style={ps.portfolioAddBtn}>
          {isLoading ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={ps.portfolioAddText}>+ Добавить фото</Text>}
        </Pressable>
      </View>
      <View style={ps.portfolioGrid}>
        {items.map(item => (
          <View key={item.id} style={{ position: 'relative' }}>
            <Image source={{ uri: item.url }} style={ps.portfolioImage} contentFit="cover" />
            <Pressable onPress={() => onDelete(item.id)} style={ps.portfolioDeleteBtn}>
              <Text style={ps.portfolioDeleteText}>✕</Text>
            </Pressable>
          </View>
        ))}
        {items.length === 0 && (
          <Pressable onPress={onAdd} style={[ps.portfolioEmpty, { borderColor: colors.border }]}>
            <Text style={[ps.portfolioEmptyIcon, { color: colors.textMuted }]}>📷</Text>
            <Text style={[ps.portfolioEmptyText, { color: colors.textMuted }]}>Добавить</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

// ─── Verification section ─────────────────────────────────────────────────────

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
          type: asset.mimeType ?? 'application/octet-stream',
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

  const status = verStatus?.status
  const verified = isVerified || status === 'approved'

  return (
    <View>
      <View style={ps.verRow}>
        <Text style={ps.verIcon}>{verified ? '✅' : status === 'pending' ? '⏳' : status === 'rejected' ? '❌' : '🔐'}</Text>
        <View style={ps.verInfo}>
          <Text style={[ps.verTitle, { color: colors.text }]}>
            {verified ? 'Профиль верифицирован' : status === 'pending' ? 'Проверка документов' : status === 'rejected' ? 'Верификация отклонена' : 'Верификация профиля'}
          </Text>
          <Text style={[ps.verSubtitle, { color: colors.textSecondary }]}>
            {verified
              ? 'Вы получаете больше доверия клиентов'
              : status === 'pending'
                ? 'Ожидайте проверки (1-2 дня)'
                : status === 'rejected'
                  ? (verStatus?.reason ?? 'Загрузите документы повторно')
                  : 'Загрузите паспорт или диплом'}
          </Text>
        </View>
      </View>
      {!verified && status !== 'pending' && (
        <Pressable onPress={() => applyMutation.mutate()} disabled={applyMutation.isPending || uploading} style={ps.verBtn}>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SpecialistProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const setUser = useAuthStore(state => state.setUser)

  const [editing, setEditing] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)

  const { data: specialist, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SPECIALISTS, 'me'],
    queryFn: () => api.get('/specialists/me').then((r: any) => r.data),
    retry: false
  })

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

  const avatarMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fd = new FormData()
      fd.append('avatar', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any)
      return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res: any) => setUser(res.data)
  })

  const portfolioAddMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fd = new FormData()
      fd.append('photo', { uri, type: 'image/jpeg', name: `portfolio-${Date.now()}.jpg` } as any)
      return api.post('/specialists/me/portfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, 'me'] })
  })

  const portfolioDelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/specialists/me/portfolio/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPECIALISTS, 'me'] })
  })

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (!r.canceled && r.assets[0]) avatarMutation.mutate(r.assets[0].uri)
  }

  const pickPortfolio = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true })
    if (!r.canceled) {
      for (const asset of r.assets) await portfolioAddMutation.mutateAsync(asset.uri)
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
      <View style={[ps.header, { borderBottomColor: colors.border }]}>
        <Text style={[ps.headerTitle, { color: colors.text }]}>Мой профиль</Text>
        <Pressable
          onPress={() => {
            if (!editing) initForm(specialist)
            setEditing(!editing)
          }}>
          <Text style={ps.editBtn}>{editing ? 'Отмена' : '✏️ Изменить'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: sm(20), gap: vs(16) }}>
        {/* Avatar + info */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, ps.avatarCard]}>
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

          <Text style={[ps.avatarName, { color: colors.text }]}>{name}</Text>
          <Text style={[ps.avatarPhone, { color: colors.textMuted }]}>{user?.phone}</Text>
          {catNames ? <Text style={ps.avatarCats}>{catNames}</Text> : null}

          {/* Online toggle */}
          <View style={ps.onlineRow}>
            <View style={[ps.onlineDot, { backgroundColor: form.isOnline ? '#22C55E' : colors.textMuted }]} />
            <Text style={[ps.onlineText, { color: colors.textSecondary }]}>{form.isOnline ? 'Онлайн' : 'Оффлайн'}</Text>
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
          <View style={ps.statsRow}>
            {[
              { label: 'Рейтинг', value: `★ ${Number(specialist?.rating ?? 0).toFixed(1)}` },
              { label: 'Отзывов', value: String(specialist?.reviewCount ?? 0) },
              { label: 'Заказов', value: String(specialist?.completedOrders ?? 0) }
            ].map((stat, i) => (
              <View key={i} style={ps.statItem}>
                <Text style={ps.statValue}>{stat.value}</Text>
                <Text style={[ps.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Edit form */}
        {editing && (
          <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.card, { gap: vs(16) }]}>
            <Text style={[ps.formTitle, { color: colors.text }]}>Редактирование</Text>

            {/* Bio */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>О себе</Text>
              <TextInput
                value={form.bio}
                onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                placeholder="Расскажите о своём опыте..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[s.input, ps.bioInput, { outlineStyle: 'none' } as any]}
              />
            </View>

            {/* City */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Город</Text>
              <TextInput
                value={form.city}
                onChangeText={v => setForm(f => ({ ...f, city: v }))}
                placeholder="Алматы"
                placeholderTextColor={colors.textMuted}
                style={[s.input, { outlineStyle: 'none' } as any]}
              />
            </View>

            {/* Response time */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Время отклика</Text>
              <TextInput
                value={form.responseTime}
                onChangeText={v => setForm(f => ({ ...f, responseTime: v }))}
                placeholder="в течение 1 часа"
                placeholderTextColor={colors.textMuted}
                style={[s.input, { outlineStyle: 'none' } as any]}
              />
            </View>

            {/* Price */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Цена (₸)</Text>
              <View style={ps.priceRow}>
                <TextInput
                  value={form.priceFrom}
                  onChangeText={v => setForm(f => ({ ...f, priceFrom: v }))}
                  placeholder="от"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[s.input, { flex: 1, outlineStyle: 'none' } as any]}
                />
                <TextInput
                  value={form.priceTo}
                  onChangeText={v => setForm(f => ({ ...f, priceTo: v }))}
                  placeholder="до"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[s.input, { flex: 1, outlineStyle: 'none' } as any]}
                />
              </View>
              <View style={ps.priceUnitRow}>
                {[
                  { key: 'hour', label: '/час' },
                  { key: 'day', label: '/день' },
                  { key: 'project', label: 'за проект' }
                ].map(u => (
                  <Pressable
                    key={u.key}
                    onPress={() => setForm(f => ({ ...f, priceUnit: u.key }))}
                    style={[ps.priceUnitBtn, { backgroundColor: form.priceUnit === u.key ? '#FF6B35' : colors.elevated }]}>
                    <Text style={[ps.priceUnitText, { color: form.priceUnit === u.key ? '#fff' : colors.textMuted }]}>{u.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View>
              <Text style={[ps.fieldLabel, { color: colors.textMuted }]}>Категории услуг</Text>
              <Pressable onPress={() => setShowCatModal(true)} style={[s.input, ps.categoryPicker]}>
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
              <Pressable onPress={item.onPress} style={ps.menuRow}>
                <Text style={ps.menuIcon}>{item.icon}</Text>
                <Text style={[ps.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[ps.menuArrow, { color: colors.textMuted }]}>›</Text>
              </Pressable>
              {i < arr.length - 1 && <View style={[ps.menuDivider, { backgroundColor: colors.border }]} />}
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
