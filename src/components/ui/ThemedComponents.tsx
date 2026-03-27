/**
 * Тематические компоненты — автоматически адаптируются к светлой/тёмной теме.
 * Используй вместо View/Text/TextInput с dark: классами.
 */
import { Pressable, type PressableProps, Text, TextInput, type TextInputProps, type TextProps, View, type ViewProps } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ style, ...props }: ViewProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border
        },
        style
      ]}
      {...props}
    />
  )
}

// ─── ThemedView ──────────────────────────────────────────────────────────────

export function ThemedView({ style, ...props }: ViewProps) {
  const { colors } = useTheme()
  return <View style={[{ backgroundColor: colors.bg }, style]} {...props} />
}

// ─── ElevatedView ────────────────────────────────────────────────────────────

export function ElevatedView({ style, ...props }: ViewProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.elevated,
          borderRadius: 12
        },
        style
      ]}
      {...props}
    />
  )
}

// ─── ThemedText ──────────────────────────────────────────────────────────────

export function ThemedText({ style, ...props }: TextProps) {
  const { colors } = useTheme()
  return <Text style={[{ color: colors.text, fontSize: 14 }, style]} {...props} />
}

export function MutedText({ style, ...props }: TextProps) {
  const { colors } = useTheme()
  return <Text style={[{ color: colors.textSecondary, fontSize: 13 }, style]} {...props} />
}

// ─── ThemedInput ─────────────────────────────────────────────────────────────

export function ThemedInput({ style, ...props }: TextInputProps) {
  const { colors } = useTheme()
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: colors.text,
          fontSize: 14,
          outlineStyle: 'none'
        },
        style
      ]}
      {...props}
    />
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider() {
  const { colors } = useTheme()
  return <View style={{ height: 1, backgroundColor: colors.border }} />
}

// ─── TabBar background ───────────────────────────────────────────────────────

export function TabBarContainer({ style, ...props }: ViewProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border
        },
        style
      ]}
      {...props}
    />
  )
}
