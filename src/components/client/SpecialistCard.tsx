import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'

import { CATEGORIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { makeStyles } from '@/utils/makeStyles'

interface Props {
  specialist: any // API может возвращать разные форматы
  onPress: () => void
  compact?: boolean
}

export default function SpecialistCard({ specialist, onPress, compact }: Props) {
  const { colors } = useTheme()
  const s = makeStyles(colors)

  // Поддерживаем оба формата: { name, avatar } и { user: { name, avatar } }
  const name = specialist.user?.name ?? specialist.name ?? 'Специалист'
  const avatar = specialist.user?.avatar ?? specialist.avatar ?? null
  const bio = specialist.bio ?? ''
  const rating = Number(specialist.rating ?? 0)
  const reviews = specialist.reviewCount ?? 0
  const orders = specialist.completedOrders ?? 0
  const isOnline = specialist.isOnline ?? false
  const verified = specialist.isVerified ?? false
  const respTime = specialist.responseTime ?? ''
  const city = specialist.city ?? specialist.user?.city ?? ''

  // Категории — резолвим название из константы
  const rawCatIds = specialist.categoryIds
  // simple-array хранится как строка "1,2,3" или массив
  const firstCatId = typeof rawCatIds === 'string' ? rawCatIds.split(',')[0]?.trim() : Array.isArray(rawCatIds) ? rawCatIds[0] : null
  const cats = specialist.categories as any[] | undefined
  const catName = cats?.[0]?.name ?? CATEGORIES.find(c => c.id === firstCatId)?.name ?? ''

  // Цена
  const priceFrom = specialist.priceFrom ?? specialist.price?.from
  const currency = specialist.priceCurrency ?? specialist.price?.currency ?? 'KZT'
  const unit = specialist.priceUnit ?? specialist.price?.unit ?? 'hour'
  const unitLabel = unit === 'hour' ? '/час' : unit === 'day' ? '/день' : ''
  const currSign = currency === 'KZT' ? '₸' : currency === 'RUB' ? '₽' : '$'

  const initials =
    name
      .split(' ')
      .map((w: string) => w?.[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'

  return (
    <Pressable onPress={onPress} style={[s.card, { gap: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <View style={{ position: 'relative', marginRight: 12 }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: '#FF6B3520',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 18 }}>{initials}</Text>
            </View>
          )}
          {isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#22C55E',
                borderWidth: 2,
                borderColor: colors.card
              }}
            />
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{name}</Text>
            {verified && (
              <View style={{ backgroundColor: '#3B82F620', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: '#3B82F6', fontSize: 11, fontWeight: '600' }}>✓</Text>
              </View>
            )}
          </View>

          {catName ? (
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {catName}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {rating > 0 && (
              <Text style={{ color: '#F59E0B', fontSize: 12 }}>
                ★ <Text style={{ color: colors.text, fontWeight: '600' }}>{rating.toFixed(1)}</Text>
              </Text>
            )}
            {reviews > 0 && <Text style={{ color: colors.textMuted, fontSize: 12 }}>({reviews})</Text>}
            {orders > 0 && (
              <>
                <Text style={{ color: colors.textMuted }}>·</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{orders} зак.</Text>
              </>
            )}
            <Text style={{ color: colors.textMuted }}>·</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isOnline ? '#22C55E' : colors.textMuted
                }}
              />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{isOnline ? 'онлайн' : respTime || 'оффлайн'}</Text>
            </View>
          </View>
        </View>

        {/* Price */}
        {priceFrom ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
              от {Number(priceFrom).toLocaleString()}
              {currSign}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{unitLabel}</Text>
          </View>
        ) : null}
      </View>

      {!compact && bio ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginTop: 12,
            lineHeight: 20
          }}
          numberOfLines={2}>
          {bio}
        </Text>
      ) : null}
    </Pressable>
  )
}
