import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import SpecialistCard from '@/components/client/SpecialistCard'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/services/api'
import { makeStyles } from '@/utils/makeStyles'

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

  // Автоматически отправляем если пришёл текст из голосового ввода
  useEffect(() => {
    if (params.initialMessage) {
      send(params.initialMessage)
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: chatBg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: headerBg,
          paddingTop: insets.top,
          paddingBottom: 10,
          paddingHorizontal: 4,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border
        }}>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text style={{ color: '#FF6B35', fontSize: 26 }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20 }}>✨</Text>
            <Text style={[s.textTitle, { fontSize: 17 }]}>AI Помощник</Text>
          </View>
          <Text style={[s.textMuted, { fontSize: 11 }]}>Мастер AI · qwen2.5</Text>
        </View>
        <Pressable onPress={() => setMessages([{ id: 'w2', role: 'assistant', text: 'Начнём сначала! Опишите задачу.' }])} style={{ padding: 10 }}>
          <Text style={[s.textMuted, { fontSize: 13 }]}>Очистить</Text>
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
              <View style={{ marginTop: 16, gap: 8 }}>
                <Text style={[s.textMuted, { fontSize: 12, textAlign: 'center' }]}>Попробуйте:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {SUGGESTIONS.map(sg => (
                    <Pressable
                      key={sg}
                      onPress={() => send(sg)}
                      style={{
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 8
                      }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{sg}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown.delay(50).springify()}>
              {item.role === 'user' ? (
                /* Сообщение пользователя */
                <View style={{ alignItems: 'flex-end' }}>
                  <View
                    style={{
                      backgroundColor: '#FF6B35',
                      borderRadius: 18,
                      borderBottomRightRadius: 4,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      maxWidth: '80%'
                    }}>
                    <Text style={{ color: '#fff', fontSize: 15, lineHeight: 21 }}>{item.text}</Text>
                  </View>
                </View>
              ) : (
                /* Ответ AI */
                <View style={{ alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#FF6B3520',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2
                      }}>
                      <Text style={{ fontSize: 16 }}>✨</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isDark ? '#1E2733' : '#FFFFFF',
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingHorizontal: 14,
                        paddingVertical: 10
                      }}>
                      {item.loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <ActivityIndicator size="small" color="#FF6B35" />
                          <Text style={[s.textMuted, { fontSize: 13 }]}>Думаю... (~20 сек)</Text>
                        </View>
                      ) : (
                        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{item.text}</Text>
                      )}
                    </View>
                  </View>

                  {/* Карточки специалистов */}
                  {item.specialists && item.specialists.length > 0 && (
                    <View style={{ width: '100%', paddingLeft: 40, gap: 8 }}>
                      <Text style={[s.textMuted, { fontSize: 12 }]}>Найденные специалисты:</Text>
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
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 6,
            paddingHorizontal: 8,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            borderTopWidth: 0.5,
            borderTopColor: colors.border,
            backgroundColor: inputBg
          }}>
          <View
            style={{
              flex: 1,
              borderRadius: 22,
              backgroundColor: fieldBg,
              paddingHorizontal: 14,
              paddingVertical: 8,
              maxHeight: 120
            }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Спросите что-нибудь..."
              placeholderTextColor={colors.textMuted}
              style={{ fontSize: 15, lineHeight: 20, color: colors.text, padding: 0 }}
              multiline
              editable={!isLoading}
              onSubmitEditing={() => send(input)}
            />
          </View>
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || isLoading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginBottom: 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: input.trim() && !isLoading ? '#FF6B35' : fieldBg
            }}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: 2,
                  color: input.trim() ? '#fff' : colors.textMuted
                }}>
                ➤
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
