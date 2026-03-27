import Screen from '@components/ui/Screen'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'

import { QUERY_KEYS } from '@/constants'
import { useSocket } from '@/hooks/useSocket'
import { useTheme } from '@/hooks/useTheme'
import { chatService } from '@/services/chatService'
import { useAuthStore } from '@/store/authStore'
import type { Message } from '@/types'

import styles from './id.styles'

const fmt = (iso: string) => new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function dayLabel(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'long' })
}

function TailOut({ color }: { color: string }) {
  return (
    <Svg width={10} height={15} style={{ position: 'absolute', bottom: 0, right: -9 }}>
      <Path d="M0 15 Q10 15 10 0 L0 0 Z" fill={color} />
    </Svg>
  )
}

function TailIn({ color }: { color: string }) {
  return (
    <Svg width={10} height={15} style={{ position: 'absolute', bottom: 0, left: -9 }}>
      <Path d="M10 15 Q0 15 0 0 L10 0 Z" fill={color} />
    </Svg>
  )
}

function Bubble({ msg, isMe, showTail }: { msg: Message; isMe: boolean; showTail: boolean }) {
  const { isDark } = useTheme()
  const OUT_COLOR = '#FF6B35'
  const IN_COLOR = isDark ? '#1E2733' : '#FFFFFF'
  const bg = isMe ? OUT_COLOR : IN_COLOR
  const textColor = isMe ? '#fff' : isDark ? '#fff' : '#000'
  const timeColor = isMe ? 'rgba(255,255,255,0.65)' : isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'

  return (
    <View style={[styles.row, isMe ? styles.rowOut : styles.rowIn]}>
      {!isMe && showTail && <TailIn color={IN_COLOR} />}
      <View style={[styles.bubble, { backgroundColor: bg }, isMe ? { borderRadius: 18, borderBottomRightRadius: showTail ? 4 : 18 } : { borderRadius: 18, borderBottomLeftRadius: showTail ? 4 : 18 }]}>
        {msg.type === 'image' && msg.mediaUrl ? (
          <Image source={{ uri: msg.mediaUrl }} style={styles.imgBubble} contentFit="cover" />
        ) : (
          <Text style={[styles.msgText, { color: textColor }]}>{msg.content}</Text>
        )}
        <View style={styles.meta}>
          <Text style={[styles.time, { color: timeColor }]}>{fmt(msg.createdAt)}</Text>
          {isMe && <Text style={[styles.ticks, { color: msg.isRead ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }]}>{msg.isRead ? ' ✓✓' : ' ✓'}</Text>}
        </View>
      </View>
      {isMe && showTail && <TailOut color={OUT_COLOR} />}
    </View>
  )
}

export default function ChatScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const myId = useAuthStore(ss => ss.user?.id) ?? 'me'
  const { isDark, colors } = useTheme()
  const queryClient = useQueryClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const flatRef = useRef<FlatList>(null)
  const typingTimer = useRef<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, id],
    queryFn: () => chatService.getMessages(id ?? '').then(r => r.data.data),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true
  })

  useEffect(() => {
    if (data) setMessages(data)
  }, [data])

  const { sendMessage, markRead, sendTyping } = useSocket({
    roomId: id,
    onMessage: (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      if (msg.senderId !== myId) {
        markRead(id ?? '')
        queryClient.invalidateQueries({ queryKey: ['chat_rooms'] })
      }
    },
    onTyping: (_data: any) => {
      if (_data.userId !== myId) setTyping(_data.isTyping)
    },
    onStatus: () => {}
  })

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100)
  }, [messages])

  useEffect(() => {
    if (id) {
      markRead(id)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chat_rooms'] })
      }, 500)
    }
  }, [id])

  const send = useCallback(() => {
    const t = text.trim()
    if (!t || !id) return
    sendMessage(id, t)
    setText('')
  }, [text, id, sendMessage])

  const handleTyping = (t: string) => {
    setText(t)
    if (!id) return
    sendTyping(id, true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(id, false), 1500)
  }

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (!r.canceled && r.assets[0] && id) {
      sendMessage(id, 'Фото', 'image', r.assets[0].uri)
    }
  }

  const chatBg = isDark ? '#0D1117' : '#DAD3CC'
  const headerBg = isDark ? '#17212B' : '#FFFFFF'
  const inputBg = isDark ? '#17212B' : '#FFFFFF'
  const fieldBg = isDark ? '#242F3D' : '#F0F0F0'

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, paddingTop: insets.top, borderBottomColor: isDark ? '#0D1117' : '#E0E0E0' }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#FF6B35', fontSize: 26, fontWeight: '300' }}>‹</Text>
        </Pressable>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>АС</Text>
          </View>
          <View style={[styles.onlineDot, { borderColor: headerBg }]} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.hName, { color: colors.text }]}>Собеседник</Text>
          <Text style={[styles.hSub, { color: '#22C55E' }]}>{typing ? 'печатает...' : 'онлайн'}</Text>
        </View>
        <Pressable style={styles.hAction}>
          <Text style={{ fontSize: 20 }}>📋</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 10, gap: 3 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item, index }) => {
              const isMe = item.senderId === myId
              const prev = messages[index - 1]
              const next = messages[index + 1]
              const showDate = !prev || !sameDay(item.createdAt, prev.createdAt)
              const isLast = !next || next.senderId !== item.senderId || !sameDay(item.createdAt, next.createdAt)

              return (
                <>
                  {showDate && (
                    <View style={styles.dateSep}>
                      <View style={[styles.datePill, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.2)' }]}>
                        <Text style={[styles.dateLabel, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>{dayLabel(item.createdAt)}</Text>
                      </View>
                    </View>
                  )}
                  <Bubble msg={item} isMe={isMe} showTail={isLast} />
                </>
              )
            }}
          />
        )}

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: inputBg, paddingBottom: insets.bottom + 6, borderTopColor: isDark ? '#0D1117' : '#E0E0E0' }]}>
          <Pressable onPress={pickImage} style={styles.attachBtn}>
            <Text style={{ fontSize: 22, color: colors.textMuted }}>📎</Text>
          </Pressable>
          <View style={[styles.fieldWrap, { backgroundColor: fieldBg }]}>
            <TextInput
              value={text}
              onChangeText={handleTyping}
              placeholder="Сообщение..."
              placeholderTextColor={colors.textMuted}
              style={[styles.field, { color: colors.text, outlineStyle: 'none' } as any]}
              multiline
            />
          </View>
          <Pressable onPress={send} disabled={!text.trim()} style={[styles.sendBtn, { backgroundColor: text.trim() ? '#FF6B35' : fieldBg }]}>
            <Text style={{ fontSize: 14, color: text.trim() ? '#fff' : colors.textMuted, marginLeft: 2 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
