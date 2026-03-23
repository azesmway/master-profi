import { useColorScheme } from 'react-native'

export const COLORS = {
  dark: {
    bg: '#0F0F0F',
    card: '#1A1A1A',
    elevated: '#222222',
    border: '#2E2E2E',
    text: '#FFFFFF',
    textSecondary: '#999999',
    textMuted: '#666666',
    inputBg: '#1A1A1A',
    inputBorder: '#2E2E2E'
  },
  light: {
    bg: '#FFFFFF',
    card: '#F5F5F5',
    elevated: '#EBEBEB',
    border: '#E0E0E0',
    text: '#0F0F0F',
    textSecondary: '#555555',
    textMuted: '#888888',
    inputBg: '#F0F0F0',
    inputBorder: '#D5D5D5'
  }
} as const

export function useTheme() {
  const scheme = useColorScheme() ?? 'light'
  const isDark = scheme === 'dark'
  const colors = COLORS[scheme]
  return { scheme, isDark, colors }
}
