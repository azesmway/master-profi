import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { chatService } from '@/services/chatService'
import { makeStyles } from '@/utils/makeStyles'

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  orders: { label: 'Заказы', icon: '📋' },
  responses: { label: 'Отклики', icon: '📨' },
  chats: { label: 'Чаты', icon: '💬' },
  earnings: { label: 'Доход', icon: '💰' },
  profile: { label: 'Профиль', icon: '👤' }
}

function SpecialistTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  const { data: rooms } = useQuery({
    queryKey: [QUERY_KEYS.CHAT_ROOMS],
    queryFn: () => chatService.getRooms().then(r => r.data.data),
    staleTime: 1000 * 30
  })
  const unreadCount = (rooms ?? []).reduce((sum: number, r: any) => sum + (r.unreadCount ?? 0), 0)

  return (
    <View style={[makeStyles(colors).tabBar, { paddingBottom: insets.bottom + 4 }]}>
      {state.routes.map(route => {
        const isFocused = state.index === state.routes.indexOf(route)
        const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: '●' }

        return (
          <Pressable key={route.key} onPress={() => !isFocused && navigation.navigate(route.name)} style={{ flex: 1, alignItems: 'center', paddingTop: 4 }}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22, marginBottom: 2 }}>{config.icon}</Text>
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
              {config.label}
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

export default function SpecialistLayout() {
  return (
    <Tabs tabBar={props => <SpecialistTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="responses" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="earnings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
