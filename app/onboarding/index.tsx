import Screen from '@components/ui/Screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { vs } from 'react-native-size-matters'

import { analytics } from '@/services/analytics'
import { useAuthStore } from '@/store/authStore'

import styles from './index.styles'

const { width } = Dimensions.get('window')

// ─── Slides data ──────────────────────────────────────────────────────────────

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
] as const

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
] as const

// ─── Slide component ──────────────────────────────────────────────────────────

function Slide({ item }: { item: { emoji: string; title: string; subtitle: string; bg: string; textColor: string } }) {
  return (
    <View style={[styles.slide, { backgroundColor: item.bg, width }]}>
      <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.emoji}>
        {item.emoji}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).springify()} style={[styles.title, { color: item.textColor }]}>
        {item.title}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).springify()} style={[styles.subtitle, { color: item.textColor + 'cc' }]}>
        {item.subtitle}
      </Animated.Text>
    </View>
  )
}

// ─── Dots component ───────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
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

  return (
    <Screen>
      <View style={{ paddingBottom: insets.bottom + vs(20) }}>
        {/* Skip */}
        <Pressable onPress={finish} style={[styles.skip, { top: insets.top + vs(12) }]}>
          <Text style={styles.skipText}>Пропустить</Text>
        </Pressable>

        {/* Slides */}
        <FlatList
          ref={flatRef}
          data={slides as any}
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

        {/* Bottom: dots + button */}
        <View style={styles.bottom}>
          <Dots count={slides.length} active={current} />
          <Pressable onPress={next} style={styles.btn}>
            <Text style={styles.btnText}>{isLast ? 'Начать' : 'Далее'}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}
