import Screen from '@components/ui/Screen'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { s, vs } from 'react-native-size-matters'

import { APP_NAME } from '@/constants'
import { useTheme } from '@/hooks/useTheme'

const FEATURES = [
  { icon: '🤖', text: 'AI подберёт лучших специалистов по описанию задачи' },
  { icon: '🎬', text: 'Видео-портфолио — смотрите работы до выбора' },
  { icon: '🔒', text: 'Эскроу: деньги только после выполнения' },
  { icon: '✅', text: 'Отклики для специалистов — бесплатно' }
] as const

export default function WelcomeScreen() {
  const router = useRouter()
  const { colors } = useTheme()

  return (
    <Screen style={styles.screen}>
      <StatusBar style="auto" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🔧</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>{APP_NAME}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Найдите специалиста на любую задачу — быстро и безопасно</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(350 + i * 80).springify()} style={[styles.featureItem, { backgroundColor: colors.card }]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>{f.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.cta}>
          <Pressable onPress={() => router.push('/(auth)/phone')} style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
            <Text style={styles.btnPrimaryText}>Найти специалиста</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/phone')} style={({ pressed }) => [styles.btnOutline, { borderColor: colors.border }, pressed && styles.pressed]}>
            <Text style={[styles.btnOutlineText, { color: colors.text }]}>Я специалист — предлагать услуги</Text>
          </Pressable>

          <Text style={[styles.terms, { color: colors.textMuted }]}>
            Регистрируясь, вы соглашаетесь с <Text style={styles.link}>условиями использования</Text> и <Text style={styles.link}>политикой конфиденциальности</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { padding: s(20) },
  logoArea: {
    marginVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  logoBox: {
    width: s(80),
    height: vs(80),
    borderRadius: s(24),
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8)
  },
  logoEmoji: { fontSize: s(40) },
  appName: { fontSize: s(36), fontWeight: '800', letterSpacing: -0.5 },
  tagline: {
    fontSize: s(17),
    textAlign: 'center',
    lineHeight: s(26),
    paddingHorizontal: s(16)
  },
  features: { gap: 12, marginBottom: vs(32) },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: s(16),
    borderRadius: s(16)
  },
  featureIcon: { fontSize: s(24) },
  featureText: { flex: 1, fontSize: s(14), lineHeight: s(20) },
  cta: { paddingBottom: vs(40), gap: 12 },
  btnPrimary: {
    backgroundColor: '#FF6B35',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontSize: s(16), fontWeight: '700' },
  btnOutline: {
    borderWidth: 1,
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  btnOutlineText: { fontSize: s(16), fontWeight: '500' },
  pressed: { opacity: 0.75 },
  terms: { fontSize: s(12), textAlign: 'center', lineHeight: s(18), marginTop: 8 },
  link: { color: '#FF6B35' }
})
