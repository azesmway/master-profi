import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native'

import type { RecorderState } from '@/hooks/useAudioRecorder'
import { useTheme } from '@/hooks/useTheme'

interface VoiceInputButtonProps {
  state: RecorderState
  duration: number
  onStart: () => void
  onStop: () => void
  onCancel: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VoiceInputButton({ state, duration, onStart, onStop, onCancel }: VoiceInputButtonProps) {
  const { colors } = useTheme()
  const pulseAnim = useRef(new Animated.Value(1)).current
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (state === 'recording') {
      animRef.current = Animated.loop(
        Animated.sequence([Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }), Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true })])
      )
      animRef.current.start()
      return () => {
        animRef.current?.stop()
        animRef.current = null
        pulseAnim.setValue(1)
      }
    } else {
      pulseAnim.setValue(1)
    }
  }, [state])

  // ── Idle: маленькая кнопка микрофона ──────────────────────────────────────
  if (state === 'idle') {
    return (
      <Pressable onPress={onStart} style={[styles.micBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
        <Text style={{ fontSize: 18 }}>🎤</Text>
      </Pressable>
    )
  }

  // ── Запись: таймер + кнопки в одну строку ─────────────────────────────────
  if (state === 'recording') {
    return (
      <View style={[styles.recordingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Пульсирующая точка + таймер */}
        <View style={styles.timerBlock}>
          <Animated.View style={[styles.recDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={[styles.timerText, { color: colors.text }]}>{formatDuration(duration)}</Text>
        </View>

        {/* Разделитель */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Отмена */}
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>✕ Отмена</Text>
        </Pressable>

        {/* Готово */}
        <Pressable onPress={onStop} style={styles.doneBtn}>
          <View style={styles.stopSquare} />
          <Text style={styles.doneText}>Готово</Text>
        </Pressable>
      </View>
    )
  }

  // ── Обработка ─────────────────────────────────────────────────────────────
  if (state === 'transcribing') {
    return (
      <View style={[styles.statusRow, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color="#FF6B35" />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>Распознаём речь...</Text>
      </View>
    )
  }

  // ── Готово ────────────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <View style={[styles.statusRow, { backgroundColor: '#22C55E15', borderColor: '#22C55E30' }]}>
        <Text style={{ fontSize: 16 }}>✅</Text>
        <Text style={[styles.statusText, { color: '#22C55E' }]}>Текст добавлен!</Text>
      </View>
    )
  }

  // ── Ошибка ────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <View style={[styles.statusRow, { backgroundColor: '#EF444415', borderColor: '#EF444430' }]}>
        <Text style={{ fontSize: 16 }}>⚠️</Text>
        <Text style={[styles.statusText, { color: '#EF4444' }]}>Ошибка распознавания</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    height: 52
  },
  timerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    flex: 1
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444'
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums']
  },
  divider: {
    width: 1,
    height: '60%'
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500'
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FF6B35'
  },
  stopSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#fff'
  },
  doneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500'
  }
})
