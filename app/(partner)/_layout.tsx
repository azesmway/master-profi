import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { makeStyles } from '@/utils/makeStyles'

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  orders: { label: 'Заказы', icon: '📋' },
  chats: { label: 'Чаты', icon: '💬' },
  profile: { label: 'Профиль', icon: '👤' }
}

function PartnerTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  return (
    <View style={[makeStyles(colors).tabBar, { paddingBottom: insets.bottom + 4 }]}>
      {state.routes.map(route => {
        const isFocused = state.index === state.routes.indexOf(route)
        const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: '●' }

        return (
          <Pressable key={route.key} onPress={() => !isFocused && navigation.navigate(route.name)} style={{ flex: 1, alignItems: 'center', paddingTop: 4 }}>
            <Text style={{ fontSize: 22, marginBottom: 2 }}>{config.icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: isFocused ? '#FF6B35' : colors.textMuted }}>{config.label}</Text>
            {isFocused && <View style={{ position: 'absolute', top: 0, width: 32, height: 2, backgroundColor: '#FF6B35', borderRadius: 1 }} />}
          </Pressable>
        )
      })}
    </View>
  )
}

export default function PartnerLayout() {
  return (
    <Tabs tabBar={props => <PartnerTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
