import { useCallback, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

import { useAuthStore } from '@/store/authStore'

const WS_URL = (process.env.EXPO_PUBLIC_WS_URL ?? 'wss://api.it-trend.dev').replace('wss://', 'https://').replace('ws://', 'http://')

interface UseSocketOptions {
  roomId?: string
  onMessage?: (msg: any) => void
  onRead?: (data: any) => void
  onTyping?: (data: any) => void
  onStatus?: (data: any) => void
}

export function useSocket({ roomId, onMessage, onRead, onTyping, onStatus }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)
  const accessToken = useAuthStore(s => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const socket = io(`${WS_URL}/chat`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      // Вступаем в комнату после подключения
      if (roomId) {
        socket.emit('join_room', { roomId })
      }
    })

    socket.on('connect_error', err => {
      console.error('[Socket] ❌ Ошибка подключения:', err.message)
    })

    socket.on('disconnect', reason => {
      console.log('[Socket] Отключён:', reason)
    })

    socket.on('new_message', (msg: any) => {
      onMessage?.(msg)
    })

    if (onRead) socket.on('messages_read', onRead)
    if (onTyping) socket.on('user_typing', onTyping)
    if (onStatus) socket.on('user_status', onStatus)

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, roomId])

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const sendMessage = useCallback((roomId: string, content: string, type = 'text', mediaUrl?: string) => {
    if (!socketRef.current?.connected) {
      return
    }
    socketRef.current.emit('send_message', { roomId, content, type, mediaUrl })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const markRead = useCallback((roomId: string) => {
    socketRef.current?.emit('mark_read', { roomId })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { roomId, isTyping })
  }, [])

  return { sendMessage, markRead, sendTyping }
}
