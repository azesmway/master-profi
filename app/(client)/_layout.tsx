import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { chatService } from '@/services/chatService'
import { makeStyles } from '@/utils/makeStyles'

const TAB_ICONS: Record<string, string> = {
  home: '🏠',
  search: '🔍',
  orders: '📋',
  chats: '💬',
  profile: '👤'
}

const TAB_LABELS: Record<string, string> = {
  home: 'Главная',
  search: 'Поиск',
  orders: 'Заказы',
  chats: 'Чаты',
  profile: 'Профиль'
}

function ClientTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const visibleRoutes = state.routes.filter(r => TAB_ICONS[r.name])

  // Считаем непрочитанные сообщения
  const { data: rooms } = useQuery({
    queryKey: [QUERY_KEYS.CHAT_ROOMS],
    queryFn: () => chatService.getRooms().then(r => r.data.data),
    staleTime: 1000 * 30
  })
  const unreadCount = (rooms ?? []).reduce((sum: number, r: any) => sum + (r.unreadCount ?? 0), 0)

  return (
    <View style={[makeStyles(colors).tabBar, { paddingBottom: insets.bottom + 4 }]}>
      {visibleRoutes.map(route => {
        const isFocused = state.routes[state.index]?.name === route.name
        const icon = TAB_ICONS[route.name] ?? '●'
        const label = TAB_LABELS[route.name] ?? route.name

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true
              })
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name)
              }
            }}
            style={{ flex: 1, alignItems: 'center', paddingTop: 4 }}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22, marginBottom: 2 }}>{icon}</Text>
              {route.name === 'chats' && unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#FF6B35',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 3
                  }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                color: isFocused ? '#FF6B35' : colors.textMuted
              }}>
              {label}
            </Text>
            {isFocused && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 32,
                  height: 2,
                  backgroundColor: '#FF6B35',
                  borderRadius: 1
                }}
              />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

export default function ClientLayout() {
  return (
    <Tabs tabBar={props => <ClientTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
