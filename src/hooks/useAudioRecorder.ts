import { Audio } from 'expo-av'
import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderState = 'idle' | 'recording' | 'transcribing' | 'done' | 'error'

interface UseAudioRecorderOptions {
  whisperUrl: string
  language?: string
  onTranscript: (text: string, categoryId?: string, title?: string) => void
  onError?: (error: string) => void
}

export function useAudioRecorder({ whisperUrl, language = 'ru', onTranscript, onError }: UseAudioRecorderOptions) {
  const [state, setState] = useState<RecorderState>('idle')
  const [duration, setDuration] = useState(0)

  const recordingRef = useRef<Audio.Recording | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      recordingRef.current?.stopAndUnloadAsync().catch(() => {})
    }
  }, [])

  const start = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) {
        onError?.('Нет доступа к микрофону')
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // DO_NOT_MIX
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)

      recordingRef.current = recording
      durationRef.current = 0
      setDuration(0)
      setState('recording')

      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
      }, 1000)
    } catch (e) {
      console.error('[Recorder] start error:', e)
      setState('error')
      onError?.('Не удалось начать запись')
    }
  }, [onError])

  const stop = useCallback(async () => {
    if (state !== 'recording' || !recordingRef.current) return

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setState('transcribing')

      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false })

      console.log('[Whisper] URI:', uri)
      if (!uri) throw new Error('Нет файла записи')

      const formData = new FormData()
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      } as any)
      formData.append('language', language)

      const response = await fetch(`${whisperUrl}/transcribe-and-analyze`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errText}`)
      }

      const data = await response.json()
      console.log('[Whisper] Результат:', data)

      setState('done')
      onTranscript(data.text, data.categoryId, data.title)

      setTimeout(() => {
        setState('idle')
        setDuration(0)
      }, 2000)
    } catch (e: any) {
      console.error('[Whisper]', e)
      setState('error')
      onError?.(e?.message ?? 'Ошибка транскрипции')
      setTimeout(() => setState('idle'), 3000)
    }
  }, [state, whisperUrl, language, onTranscript, onError])

  const cancel = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    try {
      await recordingRef.current?.stopAndUnloadAsync()
      recordingRef.current = null
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
    } catch {}
    setState('idle')
    setDuration(0)
    durationRef.current = 0
  }, [])

  return {
    state,
    duration,
    start,
    stop,
    cancel,
    isRecording: state === 'recording',
    isProcessing: state === 'transcribing'
  }
}
