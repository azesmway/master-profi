import Screen from '@components/ui/Screen'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Image, Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

import { APP_NAME } from '@/constants'

const FEATURES = [
  { icon: '🤖', text: 'AI подберёт лучших специалистов по описанию задачи' },
  { icon: '🎬', text: 'Видео-портфолио — смотрите работы до выбора' },
  { icon: '🔒', text: 'Эскроу: деньги только после выполнения' },
  { icon: '✅', text: 'Отклики для специалистов — бесплатно' }
] as const

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <Screen style={{ padding: 20 }}>
      <StatusBar style="light" />

      {/* Logo area */}
      <Animated.View entering={FadeInDown.delay(100).springify()} className="flex-1 items-center justify-center gap-4">
        <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-2">
          <Text className="text-4xl">🔧</Text>
        </View>
        <Text className="text-dark dark:text-white text-4xl font-extrabold tracking-tight">{APP_NAME}</Text>
        <Text className="text-text-muted dark:text-text-secondary text-lg text-center leading-relaxed">Найдите специалиста на любую задачу — быстро и безопасно</Text>
      </Animated.View>

      {/* Features */}
      <Animated.View entering={FadeInDown.delay(300).springify()} className="gap-4 mb-8">
        {FEATURES.map((f, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(350 + i * 80).springify()} className="flex-row items-center gap-4 bg-light-card dark:bg-dark-card p-4 rounded-2xl">
            <Text className="text-2xl">{f.icon}</Text>
            <Text className="text-dark dark:text-white text-sm flex-1 leading-5">{f.text}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View entering={FadeInUp.delay(700).springify()} className="pb-10 gap-3">
        <Pressable onPress={() => router.push('/(auth)/phone')} className="bg-primary py-4 rounded-2xl items-center active:opacity-80">
          <Text className="text-dark dark:text-white text-base font-bold">Найти специалиста</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/phone')} className="border border-light-border dark:border-dark-border py-4 rounded-2xl items-center active:opacity-70">
          <Text className="text-dark dark:text-white text-base font-medium">Я специалист — предлагать услуги</Text>
        </Pressable>

        <Text className="text-text-muted dark:text-text-secondary text-xs text-center mt-2 leading-5">
          Регистрируясь, вы соглашаетесь с <Text className="text-primary">условиями использования</Text> и <Text className="text-primary">политикой конфиденциальности</Text>
        </Text>
      </Animated.View>
    </Screen>
  )
}
