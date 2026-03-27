import Screen from '@components/ui/Screen'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { CATEGORIES, KZ_CITIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

export default function BarterCreateOrderScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const user = useAuthStore(ss => ss.user)
  // @ts-ignore
  const isPartner = user?.role === 'partner'

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    city: user?.city ?? 'Алматы',
    barterClientOffer: '',
    // Для партнёра
    clientName: '',
    clientPhone: '',
    commissionPercent: 10
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Введите название'
    if (!form.categoryId) e.categoryId = 'Выберите категорию'
    if (!form.description.trim()) e.description = 'Опишите задачу'
    if (!form.barterClientOffer.trim()) e.barterClientOffer = 'Опишите что вы предлагаете мастеру'
    if (isPartner && !form.clientName.trim()) e.clientName = 'Укажите имя клиента'
    setErrors(e)
    return !Object.keys(e).length
  }

  const mutation = useMutation({
    mutationFn: () =>
      ordersService.create({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || undefined,
        city: form.city,
        type: 'barter',
        barterClientOffer: form.barterClientOffer,
        ...(isPartner
          ? {
              partnerId: user?.id,
              partnerCommissionPercent: form.commissionPercent,
              partnerClientName: form.clientName,
              partnerClientPhone: form.clientPhone
            }
          : {})
      } as any),
    onSuccess: () => {
      if (isPartner) {
        // @ts-ignore
        router.replace('/(partner)/orders')
      } else {
        router.replace('/(client)/orders')
      }
    }
  })

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: '#FF6B35', fontSize: 16 }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[s.textTitle, { fontSize: 18 }]}>Бартер-заказ</Text>
            <Text style={[s.textMuted, { fontSize: 12 }]}>Обмен без денег</Text>
          </View>
          {/* Бартер badge */}
          <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#8B5CF640' }}>
            <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 12 }}>🔄 Бартер</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 20 }} keyboardShouldPersistTaps="handled">
          {/* Info banner */}
          <Animated.View
            entering={FadeInDown.springify()}
            style={{
              backgroundColor: '#8B5CF615',
              borderWidth: 1,
              borderColor: '#8B5CF630',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              gap: 10,
              alignItems: 'flex-start'
            }}>
            <Text style={{ fontSize: 20 }}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#8B5CF6', fontWeight: '700', marginBottom: 4 }}>Что такое бартер?</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                Вы предлагаете мастеру что-то взамен его услуг — товар, другую услугу или что-то ценное. Стоимость не указывается.
              </Text>
            </View>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Категория *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.slice(0, 11).map(cat => {
                  const active = form.categoryId === cat.id
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => update('categoryId', cat.id)}
                      style={{
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        backgroundColor: active ? '#8B5CF615' : colors.card,
                        borderColor: active ? '#8B5CF6' : colors.border
                      }}>
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</Text>
                      <Text style={{ fontSize: 10, color: active ? '#8B5CF6' : colors.textMuted, textAlign: 'center' }}>{cat.name}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
            {errors.categoryId && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.categoryId}</Text>}
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Что нужно сделать? *</Text>
            <TextInput
              value={form.title}
              onChangeText={t => update('title', t)}
              placeholder="Например: Ремонт сантехники"
              placeholderTextColor={colors.textMuted}
              style={[s.input, { outlineStyle: 'none' }]}
            />
            {errors.title && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.title}</Text>}
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Подробное описание *</Text>
            <TextInput
              value={form.description}
              onChangeText={t => update('description', t)}
              placeholder="Опишите подробно что нужно сделать..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, { height: 90, textAlignVertical: 'top', paddingTop: 12, outlineStyle: 'none' }]}
            />
            {errors.description && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.description}</Text>}
          </Animated.View>

          {/* Barter offer — ключевое поле */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Что вы предлагаете мастеру взамен? *</Text>
            <TextInput
              value={form.barterClientOffer}
              onChangeText={t => update('barterClientOffer', t)}
              placeholder="Например: Профессиональная фотосессия, 2 часа. Или: Копирайтинг 10 статей. Или: Продукты питания — мёд, 5 кг..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, { height: 110, textAlignVertical: 'top', paddingTop: 12, borderColor: '#8B5CF640', borderWidth: 1.5, outlineStyle: 'none' }]}
            />
            {errors.barterClientOffer && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.barterClientOffer}</Text>}
          </Animated.View>

          {/* City */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Text style={[s.textMuted, { marginBottom: 8 }]}>Город</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {KZ_CITIES.slice(0, 6).map(c => (
                  <Pressable
                    key={c}
                    onPress={() => update('city', c)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor: form.city === c ? '#8B5CF6' : colors.card,
                      borderColor: form.city === c ? '#8B5CF6' : colors.border
                    }}>
                    <Text style={{ fontSize: 13, color: form.city === c ? '#fff' : colors.textMuted }}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Для партнёра — доп. поля */}
          {isPartner && (
            <Animated.View entering={FadeInDown.delay(300).springify()} style={[s.card, { gap: 16 }]}>
              <Text style={s.textLabel}>Данные клиента (для партнёра)</Text>
              <View>
                <Text style={[s.textMuted, { marginBottom: 6 }]}>Имя клиента *</Text>
                <TextInput
                  value={form.clientName}
                  onChangeText={t => update('clientName', t)}
                  placeholder="Алия Иванова"
                  placeholderTextColor={colors.textMuted}
                  style={[s.input, { outlineStyle: 'none' }]}
                />
                {errors.clientName && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.clientName}</Text>}
              </View>
              <View>
                <Text style={[s.textMuted, { marginBottom: 6 }]}>Телефон клиента</Text>
                <TextInput
                  value={form.clientPhone}
                  onChangeText={t => update('clientPhone', t)}
                  placeholder="+7 700 000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[s.input, { outlineStyle: 'none' }]}
                />
              </View>
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Комиссия ({form.commissionPercent}%)</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[5, 10, 15, 20].map(pct => (
                    <Pressable
                      key={pct}
                      onPress={() => update('commissionPercent', pct)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        alignItems: 'center',
                        backgroundColor: form.commissionPercent === pct ? '#FF6B35' : colors.elevated,
                        borderColor: form.commissionPercent === pct ? '#FF6B35' : colors.border
                      }}>
                      <Text style={{ color: form.commissionPercent === pct ? '#fff' : colors.textMuted, fontWeight: '700' }}>{pct}%</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Pressable
              onPress={() => validate() && mutation.mutate()}
              disabled={mutation.isPending}
              style={[
                {
                  backgroundColor: '#8B5CF6',
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  opacity: mutation.isPending ? 0.6 : 1
                }
              ]}>
              {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>🔄 Опубликовать бартер</Text>}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
