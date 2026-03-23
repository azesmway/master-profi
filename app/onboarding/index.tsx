import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { analytics } from '@/services/analytics'
import { useAuthStore } from '@/store/authStore'

const { width, height } = Dimensions.get('window')

// ─── Слайды ───────────────────────────────────────────────────────────────────

const CLIENT_SLIDES = [
  {
    id: '1',
    emoji: '🔍',
    title: 'Найдите мастера\nза минуту',
    subtitle: 'Опишите задачу голосом или текстом — AI подберёт лучших специалистов в вашем городе',
    bg: '#FF6B35',
    textColor: '#fff'
  },
  {
    id: '2',
    emoji: '💬',
    title: 'Общайтесь\nнапрямую',
    subtitle: 'Чат с мастером, обсуждение деталей, согласование цены — всё в одном приложении',
    bg: '#3B82F6',
    textColor: '#fff'
  },
  {
    id: '3',
    emoji: '✅',
    title: 'Платите\nтолько за результат',
    subtitle: 'Эскроу-защита: деньги заморожены до завершения работы. Ваши средства в безопасности',
    bg: '#22C55E',
    textColor: '#fff'
  },
  {
    id: '4',
    emoji: '⭐',
    title: 'Оценивайте\nи доверяйте',
    subtitle: 'Реальные отзывы, рейтинги и верифицированные специалисты. Только проверенные мастера',
    bg: '#8B5CF6',
    textColor: '#fff'
  }
]

const SPECIALIST_SLIDES = [
  {
    id: '1',
    emoji: '💼',
    title: 'Получайте заказы\nкаждый день',
    subtitle: 'Тысячи клиентов ищут специалистов прямо сейчас. Откликайтесь первыми и зарабатывайте',
    bg: '#FF6B35',
    textColor: '#fff'
  },
  {
    id: '2',
    emoji: '🆓',
    title: 'Бесплатные\nотклики',
    subtitle: 'Не платите за подписку. Откликайтесь на заказы бесплатно. Комиссия только с успешных сделок',
    bg: '#10B981',
    textColor: '#fff'
  },
  {
    id: '3',
    emoji: '📊',
    title: 'Растите\nсвой рейтинг',
    subtitle: 'Портфолио, отзывы, верификация — станьте топ-мастером и получайте больше заказов',
    bg: '#F59E0B',
    textColor: '#fff'
  },
  {
    id: '4',
    emoji: '💰',
    title: 'Стабильный\nдоход',
    subtitle: 'Статистика заработка, история выплат, прогнозы дохода — управляйте финансами легко',
    bg: '#6366F1',
    textColor: '#fff'
  }
]

// ─── Slide component ──────────────────────────────────────────────────────────

function Slide({ item }: { item: (typeof CLIENT_SLIDES)[0] }) {
  return (
    <View style={[s.slide, { backgroundColor: item.bg, width }]}>
      <Animated.Text entering={FadeInDown.delay(100).springify()} style={s.emoji}>
        {item.emoji}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).springify()} style={[s.title, { color: item.textColor }]}>
        {item.title}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).springify()} style={[s.subtitle, { color: item.textColor + 'ccc' }]}>
        {item.subtitle}
      </Animated.Text>
    </View>
  )
}

// ─── Dots ─────────────────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[s.dot, i === active ? s.dotActive : s.dotInactive]} />
      ))}
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const user = useAuthStore(state => state.user)
  const flatRef = useRef<FlatList>(null)

  const [current, setCurrent] = useState(0)

  // Трекаем старт онбординга
  useEffect(() => {
    analytics.track('onboarding_start')
  }, [])

  const slides = user?.role === 'specialist' ? SPECIALIST_SLIDES : CLIENT_SLIDES
  const isLast = current === slides.length - 1

  const finish = async () => {
    analytics.track(isLast ? 'onboarding_complete' : 'onboarding_skip')
    await AsyncStorage.setItem('onboarding_done', '1')
    if (user?.role === 'specialist') {
      router.replace('/(specialist)/orders')
    } else {
      router.replace('/(client)/home')
    }
  }

  const next = () => {
    if (isLast) {
      finish()
      return
    }
    const nextIndex = current + 1
    flatRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    setCurrent(nextIndex)
  }

  const skip = () => finish()

  return (
    <View style={[s.container, { paddingBottom: insets.bottom + 20 }]}>
      {/* Skip */}
      <Pressable onPress={skip} style={[s.skip, { top: insets.top + 12 }]}>
        <Text style={s.skipText}>Пропустить</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <Slide item={item} />}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrent(idx)
        }}
      />

      {/* Bottom */}
      <View style={s.bottom}>
        <Dots count={slides.length} active={current} />

        <Pressable onPress={next} style={s.btn}>
          <Text style={s.btnText}>{isLast ? 'Начать' : 'Далее'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  skip: { position: 'absolute', right: 20, zIndex: 10, padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  slide: { flex: 1, height, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', lineHeight: 44, marginBottom: 20 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 26 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32, gap: 24, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: '#fff' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
  btn: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center'
  },
  btnText: { fontSize: 18, fontWeight: '700', color: '#111' }
})
