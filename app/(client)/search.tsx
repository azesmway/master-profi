import Screen from '@components/ui/Screen'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { s as sm, vs } from 'react-native-size-matters'

import SpecialistCard from '@/components/client/SpecialistCard'
import { CATEGORIES, QUERY_KEYS } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { specialistsService } from '@/services/specialistsService'
import { makeStyles } from '@/utils/makeStyles'

import styles from './search.styles'

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
    <View style={styles.aiBadge}>
      <Text style={styles.aiBadgeIcon}>✨</Text>
      <Text style={styles.aiBadgeText}>AI анализирует задачу и подбирает специалистов...</Text>
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (params.q) {
      const t = setTimeout(() => setAiLoading(false), 2000)
      return () => clearTimeout(t)
    }
  }, [params.q])

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
        <View style={styles.searchBarWrap}>
          <View style={styles.searchRow}>
            <View style={[s.input, styles.searchInputWrap]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={t => {
                  setQuery(t)
                  setAiLoading(false)
                }}
                placeholder="Поиск специалиста или задачи..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' } as any]}
                returnKeyType="search"
                autoFocus={!!params.q}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} style={styles.searchClearBtn}>
                  <Text style={{ color: colors.textMuted }}>✕</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.searchCancelBtn}>Отмена</Text>
            </Pressable>
          </View>
        </View>

        {/* Results */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : isError ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Ошибка загрузки</Text>
            <Pressable onPress={() => refetch()} style={styles.errorBtn}>
              <Text style={styles.errorBtnText}>Повторить</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={specialists}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: sm(20), paddingBottom: vs(20), gap: vs(12) }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* Category chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0, marginHorizontal: -sm(20), marginBottom: vs(4) }}
                  contentContainerStyle={{ paddingHorizontal: sm(20), gap: sm(8), paddingBottom: vs(8), alignItems: 'center' }}>
                  {[{ id: null, name: 'Все', icon: '🔎' }, ...CATEGORIES.slice(0, 8)].map(item => {
                    const isActive = item.id === activeCategory
                    return (
                      <Pressable
                        key={item.id ?? 'all'}
                        onPress={() => setActiveCategory(item.id ?? null)}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isActive ? '#FF6B35' : colors.card,
                            borderColor: isActive ? '#FF6B35' : colors.textMuted + '30'
                          }
                        ]}>
                        <Text style={styles.catChipIcon}>{item.icon}</Text>
                        <Text style={[styles.catChipText, { color: isActive ? '#fff' : colors.textMuted }]}>{item.name}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>

                {/* Sort chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0, marginHorizontal: -sm(20), marginBottom: vs(12) }}
                  contentContainerStyle={{ paddingHorizontal: sm(20), gap: sm(8), paddingBottom: vs(4), alignItems: 'center' }}>
                  {SORT_OPTIONS.map(item => {
                    const isActive = sortBy === item.key
                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => setSortBy(item.key)}
                        style={[
                          styles.sortChip,
                          {
                            backgroundColor: isActive ? colors.elevated : 'transparent',
                            borderColor: isActive ? colors.textMuted + '60' : colors.textMuted + '30'
                          }
                        ]}>
                        <Text style={[styles.sortChipText, { fontWeight: isActive ? '600' : '400', color: isActive ? colors.text : colors.textMuted }]}>{item.label}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>

                {/* Status */}
                {aiLoading && <AiThinkingBadge />}
                {!aiLoading && <Text style={[styles.statusText, { color: colors.textMuted }]}>Найдено: {total} специалистов</Text>}
              </>
            }
            ListEmptyComponent={
              !aiLoading ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Ничего не найдено</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Попробуйте изменить запрос или создать заказ</Text>
                  <Pressable onPress={() => router.push('/create-order')} style={styles.emptyBtn}>
                    <Text style={styles.emptyBtnText}>Создать заказ</Text>
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
      </KeyboardAvoidingView>
    </Screen>
  )
}
