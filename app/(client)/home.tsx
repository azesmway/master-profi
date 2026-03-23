import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import VoiceInputButton from '@/components/ui/VoiceInputButton'
import { CATEGORIES } from '@/constants'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { specialistsService } from '@/services/specialistsService'
import { useAuthStore } from '@/store/authStore'

const WHISPER_URL = process.env.EXPO_PUBLIC_WHISPER_URL ?? 'https://api.it-trend.dev/whisper'
import Screen from '@components/ui/Screen'

import SpecialistCard from '@/components/client/SpecialistCard'
import { useTheme } from '@/hooks/useTheme'
import { Specialist } from '@/types'
import { makeStyles } from '@/utils/makeStyles'

export default function HomeScreen() {
  const router = useRouter()
  const token = useAuthStore.getState().accessToken
  console.log('token', token)
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

  // Реальные данные с API
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
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[s.textSecondary, { fontSize: 13 }]}>Добрый день,</Text>
            <Text style={[s.textTitle, { fontSize: 22 }]}>{user?.name?.split(' ')[0] ?? 'Гость'} 👋</Text>
          </View>
          <Pressable onPress={() => router.push('/(client)/profile')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{(user?.name?.[0] ?? 'М').toUpperCase()}</Text>
          </Pressable>
        </View>

        {/* AI Search */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {/* Кнопка AI чата */}
          <Pressable
            // @ts-ignore
            onPress={() => router.push('/ai-chat')}
            style={[
              s.card,
              {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 0,
                overflow: 'hidden',
                borderRadius: 20
              }
            ]}>
            <Text style={{ fontSize: 20, paddingHorizontal: 16 }}>✨</Text>
            <Text style={{ flex: 1, color: colors.textMuted, fontSize: 14, paddingVertical: 16 }}>Опишите задачу — AI найдёт мастера</Text>
            <View style={{ paddingRight: 12 }}>
              <Text style={{ fontSize: 18 }}>›</Text>
            </View>
          </Pressable>

          {/* Голосовой ввод */}
          {recorder.state !== 'idle' && <VoiceInputButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} onCancel={recorder.cancel} />}
          {recorder.state === 'idle' && (
            <Pressable
              onPress={recorder.start}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 4
              }}>
              <Text style={{ fontSize: 16 }}>🎤</Text>
              <Text style={[s.textMuted, { fontSize: 13 }]}>Или надиктуйте голосом</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={s.textTitle}>Категории</Text>
            <Pressable onPress={() => router.push('/(client)/search')}>
              <Text style={{ color: '#FF6B35', fontSize: 14 }}>Все</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {CATEGORIES.slice(0, 8).map(cat => (
              <Pressable key={cat.id} onPress={() => router.push({ pathname: '/(client)/search', params: { categoryId: cat.id } })} style={[s.card, { padding: 12, width: 76, alignItems: 'center' }]}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</Text>
                <Text style={[s.textMuted, { fontSize: 11, textAlign: 'center', lineHeight: 14 }]} numberOfLines={2}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Create order CTA */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={() => router.push('/create-order')}
            style={{ backgroundColor: '#FF6B3515', borderWidth: 1, borderColor: '#FF6B3540', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24 }}>📝</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Создать заказ</Text>
              <Text style={[s.textSecondary, { marginTop: 2 }]}>Специалисты откликнутся сами</Text>
            </View>
            <Text style={{ color: '#FF6B35', fontSize: 20 }}>→</Text>
          </Pressable>
        </Animated.View>

        {/* Top specialists */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 24, marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={s.textTitle}>Топ специалисты</Text>
            <Pressable onPress={() => router.push('/(client)/search')}>
              <Text style={{ color: '#FF6B35', fontSize: 14 }}>Смотреть всех</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
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
