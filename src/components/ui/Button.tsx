import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, Text } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends PressableProps {
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: string
  fullWidth?: boolean
}

export default function Button({ label, variant = 'primary', size = 'md', loading = false, icon, fullWidth = false, disabled, style, ...props }: ButtonProps) {
  const { colors } = useTheme()

  const variantStyle = {
    primary: { backgroundColor: '#FF6B35', borderColor: '#FF6B35', borderWidth: 1 },
    secondary: { backgroundColor: colors.elevated, borderColor: colors.border, borderWidth: 1 },
    outline: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 1 },
    danger: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', borderWidth: 1 }
  }[variant]

  const textColor = {
    primary: '#FFFFFF',
    secondary: colors.text,
    outline: colors.text,
    ghost: colors.textMuted,
    danger: '#EF4444'
  }[variant]

  const sizeStyle = {
    sm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    md: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16 },
    lg: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 }
  }[size]

  const fontSize = size === 'sm' ? 14 : 16

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.base, variantStyle, sizeStyle, fullWidth && styles.fullWidth, (disabled || loading) && styles.disabled, pressed && styles.pressed, style as any]}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#FF6B35'} />
      ) : (
        <>
          {icon && <Text style={{ fontSize: fontSize }}>{icon}</Text>}
          <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.4
  },
  pressed: {
    opacity: 0.75
  },
  label: {
    fontWeight: '600'
  }
})
