import { useTheme } from '@hooks/useTheme'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Switch, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { APP_VERSION } from '@/constants'
import { useAuthStore } from '@/store/authStore'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const { user, logout } = useAuthStore()
  const [notificationsOn, setNotificationsOn] = useState(true)
  const isSpecialist = user?.role === 'specialist'
  const initials =
    user?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'МА'

  const sections = [
    {
      title: 'Аккаунт',
      items: [
        { icon: '✏️', label: 'Редактировать профиль', onPress: () => {} },
        { icon: '🔒', label: 'Безопасность', onPress: () => {} }
      ]
    },
    ...(isSpecialist
      ? [
          {
            title: 'Специалист',
            items: [
              { icon: '🎬', label: 'Видео-портфолио', onPress: () => {} },
              { icon: '📊', label: 'Аналитика', onPress: () => {}, badge: 'NEW' },
              { icon: '💳', label: 'Реквизиты для выплат', onPress: () => {} }
            ]
          }
        ]
      : []),
    {
      title: 'Оплата',
      items: [
        { icon: '💳', label: 'Способы оплаты', onPress: () => {} },
        { icon: '📋', label: 'История транзакций', onPress: () => {} }
      ]
    },
    {
      title: 'Поддержка',
      items: [
        { icon: '❓', label: 'Помощь и FAQ', onPress: () => {} },
        { icon: '⭐', label: 'Оценить приложение', onPress: () => {} }
      ]
    },
    {
      title: '',
      items: [
        {
          icon: '🚪',
          label: 'Выйти',
          onPress: () => {
            logout()
            router.replace('/(auth)/welcome')
          },
          danger: true
        }
      ]
    }
  ] as Array<{ title: string; items: Array<{ icon: string; label: string; onPress: () => void; badge?: string; danger?: boolean }> }>

  return (
    <View className="flex-1 bg-light dark:bg-dark" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-dark dark:text-white text-2xl font-bold">Профиль</Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          className="mx-5 mt-2 mb-5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center">
            <Text className="text-primary font-bold text-xl">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark dark:text-white text-lg font-bold">{user?.name ?? 'Профиль'}</Text>
            <Text className="text-text-muted dark:text-text-secondary text-sm mt-0.5">{user?.phone}</Text>
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <View className="bg-primary/10 px-2 py-0.5 rounded-md">
                <Text className="text-primary text-xs font-medium">{isSpecialist ? '🛠️ Специалист' : '🔍 Клиент'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {isSpecialist && (
          <Animated.View entering={FadeInDown.delay(140).springify()} className="mx-5 mb-5 flex-row gap-3">
            {[
              { icon: '📋', label: 'Заказов', value: '0' },
              { icon: '★', label: 'Рейтинг', value: '—' },
              { icon: '💰', label: 'Доход', value: '0 ₸' }
            ].map((s, i) => (
              <View key={i} className="flex-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl py-3 items-center gap-0.5">
                <Text className="text-base">{s.icon}</Text>
                <Text className="text-dark dark:text-white font-bold text-sm">{s.value}</Text>
                <Text className="text-text-muted dark:text-text-secondary text-xs">{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          className="mx-5 mb-5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">🔔</Text>
            <Text className="text-dark dark:text-white font-medium text-sm">Push-уведомления</Text>
          </View>
          <Switch value={notificationsOn} onValueChange={setNotificationsOn} trackColor={{ false: '#2E2E2E', true: '#FF6B35' }} thumbColor="white" />
        </Animated.View>

        {sections.map((section, si) => (
          <Animated.View key={si} entering={FadeInDown.delay(220 + si * 60).springify()} className="mx-5 mb-4">
            {section.title ? <Text className="text-text-muted dark:text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 ml-1">{section.title}</Text> : null}
            <View className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
              {section.items.map((item, ii) => (
                <Pressable
                  key={ii}
                  onPress={item.onPress}
                  className={[
                    'flex-row items-center px-4 py-4 active:bg-light-elevated dark:bg-dark-elevated',
                    ii < section.items.length - 1 ? 'border-b border-light-border dark:border-dark-border' : ''
                  ].join(' ')}>
                  <Text className="text-xl mr-3">{item.icon}</Text>
                  <Text style={{ color: colors.text }}>{item.label}</Text>
                  {item.badge && (
                    <View className="bg-primary px-2 py-0.5 rounded-full mr-2">
                      <Text className="text-dark dark:text-white text-xs font-bold">{item.badge}</Text>
                    </View>
                  )}
                  {!item.danger && <Text className="text-text-muted dark:text-text-secondary text-sm">›</Text>}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}
        <Text className="text-text-muted dark:text-text-secondary text-xs text-center mt-2 mb-8">Мастер v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  )
}
