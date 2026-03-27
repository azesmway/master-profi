import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import SpecialistCard from '@/components/client/SpecialistCard'
import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { specialistsService } from '@/services/specialistsService'
import { makeStyles } from '@/utils/makeStyles'

const SORT_OPTIONS = [
  { key: 'rating', label: 'По рейтингу' },
  { key: 'reviews', label: 'По отзывам' },
  { key: 'price', label: 'По цене' },
  { key: 'online', label: 'Онлайн' },
  { key: 'distance', label: 'Дистанционно' }
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['key']

function AiThinkingBadge() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FF6B3515',
        borderWidth: 1,
        borderColor: '#FF6B3530',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12
      }}>
      <Text style={{ fontSize: 16 }}>✨</Text>
      <Text style={{ color: '#FF6B35', fontSize: 13, fontWeight: '500', flex: 1 }}>AI анализирует задачу и подбирает специалистов...</Text>
      <ActivityIndicator size="small" color="#FF6B35" />
    </View>
  )
}

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const [query, setQuery] = useState(params.q ?? '')
  const [activeCategory, setActiveCategory] = useState<string | null>(params.categoryId ?? null)
  const [sortBy, setSortBy] = useState<SortKey>('rating')
  const [aiLoading, setAiLoading] = useState(!!params.q)
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce поиска
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(t)
  }, [query])

  // Симуляция AI задержки
  useEffect(() => {
    if (params.q) {
      const t = setTimeout(() => setAiLoading(false), 2000)
      return () => clearTimeout(t)
    }
  }, [params.q])

  // Реальный запрос к API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.SPECIALISTS, debouncedQuery, activeCategory, sortBy],
    queryFn: () =>
      specialistsService
        .findAll({
          query: debouncedQuery || undefined,
          categoryId: activeCategory || undefined,
          sortBy,
          page: 1,
          limit: 20
        })
        .then(r => r.data),
    staleTime: 1000 * 60
  })

  const specialists = data?.data ?? []
  const total = data?.meta?.total ?? 0

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Search bar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={[
                s.input,
                {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 0,
                  paddingHorizontal: 0,
                  paddingVertical: 0
                }
              ]}>
              <Text style={{ fontSize: 16, paddingHorizontal: 12 }}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={t => {
                  setQuery(t)
                  setAiLoading(false)
                }}
                placeholder="Поиск специалиста или задачи..."
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, color: colors.text, fontSize: 14, paddingVertical: 14, outlineStyle: 'none' }}
                returnKeyType="search"
                autoFocus={!!params.q}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 12 }}>
                  <Text style={{ color: colors.textMuted }}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '500' }}>Отмена</Text>
            </Pressable>
          </View>
        </View>

        {/* Results */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : isError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Ошибка загрузки</Text>
            <Pressable onPress={() => refetch()} style={{ backgroundColor: '#FF6B35', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Повторить</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={specialists}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* Category chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0, marginHorizontal: -20, marginBottom: 4 }}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8, alignItems: 'center' }}>
                  {[{ id: null, name: 'Все', icon: '🔎' }, ...CATEGORIES.slice(0, 8)].map(item => {
                    const isActive = item.id === activeCategory
                    return (
                      <Pressable
                        key={item.id ?? 'all'}
                        onPress={() => setActiveCategory(item.id ?? null)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          backgroundColor: isActive ? '#FF6B35' : colors.card,
                          borderColor: isActive ? '#FF6B35' : colors.textMuted + '30'
                        }}>
                        <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: isActive ? '#fff' : colors.textMuted }}>{item.name}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>

                {/* Sort chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0, marginHorizontal: -20, marginBottom: 12 }}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4, alignItems: 'center' }}>
                  {SORT_OPTIONS.map(item => {
                    const isActive = sortBy === item.key
                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => setSortBy(item.key)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          backgroundColor: isActive ? colors.elevated : 'transparent',
                          borderColor: isActive ? colors.textMuted + '60' : colors.textMuted + '30'
                        }}>
                        <Text style={{ fontSize: 13, fontWeight: isActive ? '600' : '400', color: isActive ? colors.text : colors.textMuted }}>{item.label}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>

                {/* Status */}
                {aiLoading && <AiThinkingBadge />}
                {!aiLoading && <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Найдено: {total} специалистов</Text>}
              </>
            }
            ListEmptyComponent={
              !aiLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Ничего не найдено</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>Попробуйте изменить запрос или создать заказ</Text>
                  <Pressable onPress={() => router.push('/create-order')} style={{ marginTop: 16, backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Создать заказ</Text>
                  </Pressable>
                </View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
                <SpecialistCard specialist={item} onPress={() => router.push(`/specialist/${item.id}`)} />
              </Animated.View>
            )}
          />
        )}

        {/*{isLoading ? (*/}
        {/*  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>*/}
        {/*    <ActivityIndicator size="large" color="#FF6B35" />*/}
        {/*  </View>*/}
        {/*) : isError ? (*/}
        {/*  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>*/}
        {/*    <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>*/}
        {/*    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Ошибка загрузки</Text>*/}
        {/*    <Pressable onPress={() => refetch()} style={{ backgroundColor: '#FF6B35', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>*/}
        {/*      <Text style={{ color: '#fff', fontWeight: '600' }}>Повторить</Text>*/}
        {/*    </Pressable>*/}
        {/*  </View>*/}
        {/*) : (*/}
        {/*  <FlatList*/}
        {/*    data={specialists}*/}
        {/*    keyExtractor={item => item.id}*/}
        {/*    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}*/}
        {/*    showsVerticalScrollIndicator={false}*/}
        {/*    ListHeaderComponent={*/}
        {/*      <>*/}
        {/*        {aiLoading && <AiThinkingBadge />}*/}
        {/*        {!aiLoading && <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Найдено: {total} специалистов</Text>}*/}
        {/*      </>*/}
        {/*    }*/}
        {/*    ListEmptyComponent={*/}
        {/*      !aiLoading ? (*/}
        {/*        <View style={{ alignItems: 'center', paddingVertical: 48 }}>*/}
        {/*          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>*/}
        {/*          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Ничего не найдено</Text>*/}
        {/*          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>Попробуйте изменить запрос или создать заказ</Text>*/}
        {/*          <Pressable onPress={() => router.push('/create-order')} style={{ marginTop: 16, backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>*/}
        {/*            <Text style={{ color: '#fff', fontWeight: '600' }}>Создать заказ</Text>*/}
        {/*          </Pressable>*/}
        {/*        </View>*/}
        {/*      ) : null*/}
        {/*    }*/}
        {/*    renderItem={({ item, index }) => (*/}
        {/*      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>*/}
        {/*        <SpecialistCard specialist={item} onPress={() => router.push(`/specialist/${item.id}`)} />*/}
        {/*      </Animated.View>*/}
        {/*    )}*/}
        {/*  />*/}
        {/*)}*/}
      </KeyboardAvoidingView>
    </Screen>
  )
}
