import type { ReactNode } from 'react'
import { isMobile } from 'react-device-detect'
import { Dimensions, View, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'

const { width } = Dimensions.get('window')

interface ScreenProps {
  children: ReactNode
  style?: ViewStyle
  safeTop?: boolean
  safeBottom?: boolean
}

/**
 * Базовая обёртка для экранов.
 * Автоматически применяет bg по системной теме.
 * Использование: замени <View className="flex-1 bg-..."> на <Screen>
 */
export default function Screen({ children, style, safeTop = true, safeBottom = false }: ScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        {
          flex: 1,
          width: isMobile ? width : width / 2,
          alignSelf: isMobile ? undefined : 'center',
          backgroundColor: colors.bg,
          paddingTop: safeTop ? insets.top : 0,
          paddingBottom: safeBottom ? insets.bottom : 0
        },
        style
      ]}>
      {children}
    </View>
  )
}
