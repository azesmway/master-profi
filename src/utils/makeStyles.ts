import { StyleSheet } from 'react-native';
import { COLORS } from '@/hooks/useTheme';

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
      backgroundColor: colors.bg,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius:    16,
      borderWidth:     1,
      borderColor:     colors.border,
      padding:         16,
    },
    elevated: {
      backgroundColor: colors.elevated,
      borderRadius:    12,
      borderWidth:     1,
      borderColor:     colors.border,
    },
    row: {
      flexDirection:  'row',
      alignItems:     'center',
    },
    separator: {
      height:          1,
      backgroundColor: colors.border,
    },

    // ─── Текст ────────────────────────────────────────────────────
    textPrimary: {
      color:    colors.text,
      fontSize: 16,
    },
    textSecondary: {
      color:    colors.textSecondary,
      fontSize: 14,
    },
    textMuted: {
      color:    colors.textMuted,
      fontSize: 12,
    },
    textTitle: {
      color:      colors.text,
      fontSize:   20,
      fontWeight: '700',
    },
    textLabel: {
      color:      colors.text,
      fontSize:   14,
      fontWeight: '600',
    },

    // ─── Инпуты ───────────────────────────────────────────────────
    input: {
      backgroundColor: colors.card,
      borderWidth:     1,
      borderColor:     colors.border,
      borderRadius:    16,
      paddingHorizontal: 16,
      paddingVertical:   14,
      color:           colors.text,
      fontSize:        14,
    },

    // ─── Кнопки ───────────────────────────────────────────────────
    buttonPrimary: {
      backgroundColor: '#FF6B35',
      borderRadius:    16,
      paddingVertical: 16,
      alignItems:      'center' as const,
    },
    buttonOutline: {
      borderWidth:     1,
      borderColor:     colors.border,
      borderRadius:    16,
      paddingVertical: 16,
      alignItems:      'center' as const,
    },
    buttonText: {
      color:      '#FFFFFF',
      fontSize:   16,
      fontWeight: '700' as const,
    },

    // ─── Навигация ────────────────────────────────────────────────
    tabBar: {
      flexDirection:   'row' as const,
      backgroundColor: colors.card,
      borderTopWidth:  1,
      borderTopColor:  colors.border,
      paddingHorizontal: 8,
      paddingTop:        8,
    },
    header: {
      backgroundColor: colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical:   12,
      flexDirection:     'row' as const,
      alignItems:        'center' as const,
    },
  });
}
