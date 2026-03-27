import Screen from '@components/ui/Screen'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { vs } from 'react-native-size-matters'

import { CATEGORIES, KZ_CITIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import styles from './create-order.styles'

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
      // @ts-ignore
      if (isPartner) router.replace('/(partner)/orders')
      else router.replace('/(client)/orders')
    }
  })

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Бартер-заказ</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Обмен без денег</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🔄 Бартер</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: vs(32), gap: vs(20) }} keyboardShouldPersistTaps="handled">
          {/* Info banner */}
          <Animated.View entering={FadeInDown.springify()} style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBannerTitle}>Что такое бартер?</Text>
              <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
                Вы предлагаете мастеру что-то взамен его услуг — товар, другую услугу или что-то ценное. Стоимость не указывается.
              </Text>
            </View>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Категория *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.slice(0, 11).map(cat => {
                  const active = form.categoryId === cat.id
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => update('categoryId', cat.id)}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: active ? '#8B5CF615' : colors.card,
                          borderColor: active ? '#8B5CF6' : colors.border
                        }
                      ]}>
                      <Text style={styles.catChipIcon}>{cat.icon}</Text>
                      <Text style={[styles.catChipText, { color: active ? '#8B5CF6' : colors.textMuted }]}>{cat.name}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
            {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Что нужно сделать? *</Text>
            <TextInput
              value={form.title}
              onChangeText={t => update('title', t)}
              placeholder="Например: Ремонт сантехники"
              placeholderTextColor={colors.textMuted}
              style={[s.input, { outlineStyle: 'none' } as any]}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Подробное описание *</Text>
            <TextInput
              value={form.description}
              onChangeText={t => update('description', t)}
              placeholder="Опишите подробно что нужно сделать..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, styles.descInput, { outlineStyle: 'none' } as any]}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </Animated.View>

          {/* Barter offer */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Что вы предлагаете мастеру взамен? *</Text>
            <TextInput
              value={form.barterClientOffer}
              onChangeText={t => update('barterClientOffer', t)}
              placeholder="Например: Профессиональная фотосессия, 2 часа. Или: Копирайтинг 10 статей. Или: Продукты питания — мёд, 5 кг..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, styles.barterInput, { outlineStyle: 'none' } as any]}
            />
            {errors.barterClientOffer && <Text style={styles.errorText}>{errors.barterClientOffer}</Text>}
          </Animated.View>

          {/* City */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Город</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {KZ_CITIES.slice(0, 6).map(c => (
                  <Pressable
                    key={c}
                    onPress={() => update('city', c)}
                    style={[
                      styles.cityChip,
                      {
                        backgroundColor: form.city === c ? '#8B5CF6' : colors.card,
                        borderColor: form.city === c ? '#8B5CF6' : colors.border
                      }
                    ]}>
                    <Text style={[styles.cityChipText, { color: form.city === c ? '#fff' : colors.textMuted }]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Partner fields */}
          {isPartner && (
            <Animated.View entering={FadeInDown.delay(300).springify()} style={[s.card, { gap: vs(16) }]}>
              <Text style={[styles.partnerSectionTitle, { color: colors.text }]}>Данные клиента (для партнёра)</Text>

              <View>
                <Text style={[styles.fieldLabelSm, { color: colors.textMuted }]}>Имя клиента *</Text>
                <TextInput
                  value={form.clientName}
                  onChangeText={t => update('clientName', t)}
                  placeholder="Алия Иванова"
                  placeholderTextColor={colors.textMuted}
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
                {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
              </View>

              <View>
                <Text style={[styles.fieldLabelSm, { color: colors.textMuted }]}>Телефон клиента</Text>
                <TextInput
                  value={form.clientPhone}
                  onChangeText={t => update('clientPhone', t)}
                  placeholder="+7 700 000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
              </View>

              <View>
                <Text style={[styles.fieldLabelSm, { color: colors.textMuted }]}>Комиссия ({form.commissionPercent}%)</Text>
                <View style={styles.commissionRow}>
                  {[5, 10, 15, 20].map(pct => (
                    <Pressable
                      key={pct}
                      onPress={() => update('commissionPercent', pct)}
                      style={[
                        styles.commissionBtn,
                        {
                          backgroundColor: form.commissionPercent === pct ? '#FF6B35' : colors.elevated,
                          borderColor: form.commissionPercent === pct ? '#FF6B35' : colors.border
                        }
                      ]}>
                      <Text style={[styles.commissionBtnText, { color: form.commissionPercent === pct ? '#fff' : colors.textMuted }]}>{pct}%</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Pressable onPress={() => validate() && mutation.mutate()} disabled={mutation.isPending} style={[styles.submitBtn, { opacity: mutation.isPending ? 0.6 : 1 }]}>
              {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>🔄 Опубликовать бартер</Text>}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
