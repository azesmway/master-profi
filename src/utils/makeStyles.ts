import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

import { COLORS } from '@/hooks/useTheme'

/**
 * Создаёт StyleSheet для конкретной темы.
 * Использование:
 *   const { colors } = useTheme();
 *   const s = makeStyles(colors);
 *   <View style={s.card}>
 */
export function makeStyles(colors: typeof COLORS.light | typeof COLORS.dark) {
  return StyleSheet.create({
    // ─── Контейнеры ───────────────────────────────────────────────
    screen: {
      flex: 1,
      backgroundColor: colors.bg
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: s(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: s(16)
    },
    elevated: {
      backgroundColor: colors.elevated,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: colors.border
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    separator: {
      height: 1,
      backgroundColor: colors.border
    },

    // ─── Текст ────────────────────────────────────────────────────
    textPrimary: {
      color: colors.text,
      fontSize: s(16)
    },
    textSecondary: {
      color: colors.textSecondary,
      fontSize: s(14)
    },
    textMuted: {
      color: colors.textMuted,
      fontSize: s(12)
    },
    textTitle: {
      color: colors.text,
      fontSize: s(20),
      fontWeight: '700'
    },
    textLabel: {
      color: colors.text,
      fontSize: s(14),
      fontWeight: '600'
    },

    // ─── Инпуты ───────────────────────────────────────────────────
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: s(16),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      color: colors.text,
      fontSize: s(14)
    },

    // ─── Кнопки ───────────────────────────────────────────────────
    buttonPrimary: {
      backgroundColor: '#FF6B35',
      borderRadius: s(16),
      paddingVertical: vs(16),
      alignItems: 'center' as const
    },
    buttonOutline: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: s(16),
      paddingVertical: vs(16),
      alignItems: 'center' as const
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: s(16),
      paddingHorizontal: s(20),
      fontWeight: '700' as const
    },

    // ─── Навигация ────────────────────────────────────────────────
    tabBar: {
      flexDirection: 'row' as const,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: s(8),
      paddingTop: vs(8)
    },
    header: {
      backgroundColor: colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: s(20),
      paddingVertical: vs(12),
      flexDirection: 'row' as const,
      alignItems: 'center' as const
    }
  })
}
