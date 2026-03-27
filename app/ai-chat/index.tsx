import Screen from '@components/ui/Screen'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { vs } from 'react-native-size-matters'

import SpecialistCard from '@/components/client/SpecialistCard'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

import styles from './index.styles'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  specialists?: any[]
  loading?: boolean
}

const SUGGESTIONS = ['Нужен сантехник, течёт кран', 'Ищу репетитора по математике', 'Сколько стоит уборка квартиры?', 'Найди электрика в Алматы']

export default function AiChatScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const s = makeStyles(colors)
  const flatRef = useRef<FlatList>(null)

  const params = useLocalSearchParams<{ initialMessage?: string }>()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Привет! Я AI-помощник маркетплейса Мастер 👋\n\nОпишите задачу — найду специалистов или отвечу на вопрос.'
    }
  ])
  const [input, setInput] = useState(params.initialMessage ?? '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (params.initialMessage) send(params.initialMessage)
  }, [])

  const send = async (text: string) => {
    const t = text.trim()
    if (!t || isLoading) return

    setInput('')

    const aiId = `a${Date.now()}`
    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text: t }
    const aiMsg: Message = { id: aiId, role: 'assistant', text: '', loading: true }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setIsLoading(true)
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)

    const history = messages
      .filter(m => !m.loading && m.id !== 'welcome' && m.text.trim().length > 0)
      .slice(-4)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.text.trim() }))

    try {
      const res = await api.post('/ai/chat', { message: t, history })
      const data = res.data as { text: string; specialists?: any[] }
      setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, text: data.text, specialists: data.specialists, loading: false } : m)))
    } catch {
      setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, text: 'Извините, произошла ошибка. Попробуйте ещё раз.', loading: false } : m)))
    } finally {
      setIsLoading(false)
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  const chatBg = isDark ? '#0D1117' : '#F5F5F5'
  const headerBg = isDark ? '#17212B' : '#FFFFFF'
  const inputBg = isDark ? '#17212B' : '#FFFFFF'
  const fieldBg = isDark ? '#242F3D' : '#F0F0F0'
  const aiBubbleBg = isDark ? '#1E2733' : '#FFFFFF'

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerIcon}>✨</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Помощник</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Мастер AI · qwen2.5</Text>
        </View>
        <Pressable onPress={() => setMessages([{ id: 'w2', role: 'assistant', text: 'Начнём сначала! Опишите задачу.' }])} style={styles.clearBtn}>
          <Text style={[styles.clearText, { color: colors.textMuted }]}>Очистить</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            messages.length === 1 ? (
              <View style={styles.suggestionsWrap}>
                <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>Попробуйте:</Text>
                <View style={styles.suggestionsRow}>
                  {SUGGESTIONS.map(sg => (
                    <Pressable key={sg} onPress={() => send(sg)} style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{sg}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown.delay(50).springify()}>
              {item.role === 'user' ? (
                /* User bubble */
                <View style={styles.userBubbleWrap}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{item.text}</Text>
                  </View>
                </View>
              ) : (
                /* AI bubble */
                <View style={styles.aiBubbleWrap}>
                  <View style={styles.aiBubbleRow}>
                    <View style={styles.aiAvatar}>
                      <Text style={styles.aiAvatarIcon}>✨</Text>
                    </View>
                    <View style={[styles.aiBubble, { backgroundColor: aiBubbleBg }]}>
                      {item.loading ? (
                        <View style={styles.aiLoadingRow}>
                          <ActivityIndicator size="small" color="#FF6B35" />
                          <Text style={[styles.aiLoadingText, { color: colors.textMuted }]}>Думаю... (~20 сек)</Text>
                        </View>
                      ) : (
                        <Text style={[styles.aiBubbleText, { color: colors.text }]}>{item.text}</Text>
                      )}
                    </View>
                  </View>

                  {/* Specialist cards */}
                  {item.specialists && item.specialists.length > 0 && (
                    <View style={styles.specialistsWrap}>
                      <Text style={[styles.specialistsLabel, { color: colors.textMuted }]}>Найденные специалисты:</Text>
                      {item.specialists.slice(0, 3).map((spec: any) => (
                        <SpecialistCard key={spec.id} specialist={spec} onPress={() => router.push(`/specialist/${spec.id}`)} compact />
                      ))}
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          )}
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: inputBg,
              paddingBottom: insets.bottom + vs(8),
              borderTopColor: colors.border
            }
          ]}>
          <View style={[styles.fieldWrap, { backgroundColor: fieldBg }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Спросите что-нибудь..."
              placeholderTextColor={colors.textMuted}
              style={[styles.field, { color: colors.text, outlineStyle: 'none' } as any]}
              multiline
              editable={!isLoading}
              onSubmitEditing={() => send(input)}
            />
          </View>
          <Pressable onPress={() => send(input)} disabled={!input.trim() || isLoading} style={[styles.sendBtn, { backgroundColor: input.trim() && !isLoading ? '#FF6B35' : fieldBg }]}>
            {isLoading ? <ActivityIndicator size="small" color="#FF6B35" /> : <Text style={[styles.sendIcon, { color: input.trim() ? '#fff' : colors.textMuted }]}>➤</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
