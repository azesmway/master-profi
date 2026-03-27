import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={[styles.actionBtn, { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

// ─── ErrorView ────────────────────────────────────────────────────────────────

interface ErrorViewProps {
  message?: string
  onRetry?: () => void
}

export function ErrorView({ message = 'Что-то пошло не так', onRetry }: ErrorViewProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { color: colors.text }]}>Ошибка</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={[styles.actionBtn, { borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' }]}>
          <Text style={{ color: colors.text, fontWeight: '500' }}>Попробовать снова</Text>
        </Pressable>
      )}
    </View>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8 }: SkeletonProps) {
  const { colors } = useTheme()
  return <View style={{ width: width as any, height, borderRadius, backgroundColor: colors.elevated }} />
}

export function SpecialistCardSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={skeletonStyles.row}>
        <View style={[skeletonStyles.avatar, { backgroundColor: colors.elevated }]} />
        <View style={skeletonStyles.info}>
          <Skeleton width={128} height={14} />
          <Skeleton width={80} height={11} />
          <Skeleton width={160} height={11} />
        </View>
        <View style={skeletonStyles.priceCol}>
          <Skeleton width={64} height={14} />
          <Skeleton width={40} height={11} />
        </View>
      </View>
      <Skeleton height={12} />
      <Skeleton width="75%" height={12} />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32
  },
  icon: {
    fontSize: 48,
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  actionBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '600'
  }
})

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12
  },
  info: {
    flex: 1,
    gap: 8
  },
  priceCol: {
    gap: 4,
    alignItems: 'flex-end'
  }
})
