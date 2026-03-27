import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { s as sm, vs } from 'react-native-size-matters'

import SpecialistCard from '@/components/client/SpecialistCard'
import VoiceInputButton from '@/components/ui/VoiceInputButton'
import { CATEGORIES } from '@/constants'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useTheme } from '@/hooks/useTheme'
import { specialistsService } from '@/services/specialistsService'
import { useAuthStore } from '@/store/authStore'
import type { Specialist } from '@/types'
import { makeStyles } from '@/utils/makeStyles'

import styles from './home.styles'

const WHISPER_URL = process.env.EXPO_PUBLIC_WHISPER_URL ?? 'https://api.it-trend.dev/whisper'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const [refreshing, setRefreshing] = useState(false)

  const recorder = useAudioRecorder({
    whisperUrl: WHISPER_URL,
    language: 'ru',
    onTranscript: text => {
      if (text) {
        // @ts-ignore
        router.push({ pathname: '/ai-chat', params: { initialMessage: text } })
      }
    },
    onError: err => console.warn('[Voice Home]', err)
  })

  const { data: specsData, refetch } = useQuery({
    queryKey: ['specialists', 'home'],
    queryFn: () => specialistsService.findAll({ sortBy: 'rating', page: 1, limit: 6 }).then((r: any) => r.data?.data ?? []),
    staleTime: 1000 * 60
  })
  const specialists = specsData ?? []

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    refetch().finally(() => setRefreshing(false))
  }, [refetch])

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF6B35" />}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Добрый день,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name?.split(' ')[0] ?? 'Гость'} 👋</Text>
          </View>
          <Pressable onPress={() => router.push('/(client)/profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{(user?.name?.[0] ?? 'М').toUpperCase()}</Text>
          </Pressable>
        </View>

        {/* AI Search */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: sm(20), marginTop: vs(8), gap: vs(8) }}>
          <Pressable
            // @ts-ignore
            onPress={() => router.push('/ai-chat')}
            style={[s.card, { flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden', borderRadius: sm(20) }]}>
            <Text style={{ fontSize: sm(20), paddingHorizontal: sm(16) }}>✨</Text>
            <Text style={{ flex: 1, color: colors.textMuted, fontSize: sm(14), paddingVertical: vs(16) }}>Опишите задачу — AI найдёт мастера</Text>
            <View style={{ paddingRight: sm(12) }}>
              <Text style={{ fontSize: sm(18) }}>›</Text>
            </View>
          </Pressable>

          {recorder.state !== 'idle' && <VoiceInputButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} onCancel={recorder.cancel} />}
          {recorder.state === 'idle' && (
            <Pressable onPress={recorder.start} style={{ flexDirection: 'row', alignItems: 'center', gap: sm(8), paddingVertical: vs(8), paddingHorizontal: sm(4) }}>
              <Text style={{ fontSize: sm(16) }}>🎤</Text>
              <Text style={[s.textMuted, { fontSize: sm(13) }]}>Или надиктуйте голосом</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: vs(24) }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Категории</Text>
            <Pressable onPress={() => router.push('/(client)/search')}>
              <Text style={styles.sectionLink}>Все</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.slice(0, 8).map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => router.push({ pathname: '/(client)/search', params: { categoryId: cat.id } })}
                style={[s.card, { padding: sm(12), width: sm(76), alignItems: 'center' }]}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catName, { color: colors.textMuted }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Create order CTA */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ paddingHorizontal: sm(20), marginTop: vs(20) }}>
          <Pressable
            onPress={() => router.push('/create-order')}
            style={{ backgroundColor: '#FF6B3515', borderWidth: 1, borderColor: '#FF6B3540', borderRadius: sm(20), padding: sm(20), flexDirection: 'row', alignItems: 'center', gap: sm(16) }}>
            <View style={{ width: sm(48), height: sm(48), borderRadius: sm(14), backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: sm(24) }}>📝</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: sm(16) }}>Создать заказ</Text>
              <Text style={[s.textSecondary, { marginTop: vs(2) }]}>Специалисты откликнутся сами</Text>
            </View>
            <Text style={{ color: '#FF6B35', fontSize: sm(20) }}>→</Text>
          </Pressable>
        </Animated.View>

        {/* Top specialists */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: vs(24), marginBottom: vs(16) }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Топ специалисты</Text>
            <Pressable onPress={() => router.push('/(client)/search')}>
              <Text style={styles.sectionLink}>Смотреть всех</Text>
            </Pressable>
          </View>
          <View style={styles.specialistList}>
            {specialists.map((specialist: Specialist, i: number) => (
              <Animated.View key={specialist.id} entering={FadeInDown.delay(450 + i * 80).springify()}>
                <SpecialistCard specialist={specialist} onPress={() => router.push(`/specialist/${specialist.id}`)} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}
