import Screen from '@components/ui/Screen'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { s as sm, vs } from 'react-native-size-matters'

import { CATEGORIES, KZ_CITIES } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { useAuthStore } from '@/store/authStore'
import { makeStyles } from '@/utils/makeStyles'

import styles from './create-order.styles'

const COMMISSION_OPTIONS = [5, 10, 15, 20, 25, 30]

export default function PartnerCreateOrderScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const s = makeStyles(colors)
  const user = useAuthStore(ss => ss.user)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    budgetFrom: '',
    city: user?.city ?? 'Алматы',
    address: '',
    commissionPercent: 10,
    clientName: '',
    clientPhone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Введите название'
    if (!form.categoryId) e.categoryId = 'Выберите категорию'
    if (!form.description.trim()) e.description = 'Опишите задачу'
    setErrors(e)
    return !Object.keys(e).length
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!form.budgetFrom) e.budgetFrom = 'Укажите бюджет'
    if (!form.clientName.trim()) e.clientName = 'Укажите имя клиента'
    if (!form.clientPhone.trim()) e.clientPhone = 'Укажите телефон клиента'
    setErrors(e)
    return !Object.keys(e).length
  }

  const mutation = useMutation({
    mutationFn: () =>
      ordersService.create({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || undefined,
        budgetFrom: form.budgetFrom ? parseInt(form.budgetFrom) : undefined,
        budgetCurrency: 'KZT',
        budgetUnit: 'project',
        city: form.city,
        address: form.address,
        type: 'standard',
        partnerId: user?.id,
        partnerCommissionPercent: form.commissionPercent,
        partnerClientName: form.clientName,
        partnerClientPhone: form.clientPhone
      } as any),
    onSuccess: () => {
      // @ts-ignore
      router.replace('/(partner)/orders')
    }
  })

  const budget = form.budgetFrom ? parseInt(form.budgetFrom) : 0
  const partnerEarns = Math.floor((budget * form.commissionPercent) / 100)
  const platformCut = Math.floor(partnerEarns * 0.1)
  const partnerNet = partnerEarns - platformCut

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => (step > 1 ? setStep(ss => (ss - 1) as any) : router.back())}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Заказ от партнёра</Text>
          <Text style={[styles.headerStep, { color: colors.textMuted }]}>{step}/3</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` as any }]} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: sm(20), paddingBottom: vs(32), gap: vs(20) }} keyboardShouldPersistTaps="handled">
          {/* ── Step 1: Задача ── */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Что нужно сделать?</Text>

              {/* Category */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Категория *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: sm(8) }}>
                    {CATEGORIES.slice(0, 11).map(cat => {
                      const active = form.categoryId === cat.id
                      return (
                        <Pressable
                          key={cat.id}
                          onPress={() => update('categoryId', cat.id)}
                          style={[
                            styles.catChip,
                            {
                              backgroundColor: active ? '#FF6B3515' : colors.card,
                              borderColor: active ? '#FF6B35' : colors.border
                            }
                          ]}>
                          <Text style={styles.catChipIcon}>{cat.icon}</Text>
                          <Text style={[styles.catChipText, { color: active ? '#FF6B35' : colors.textMuted }]}>{cat.name}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>
                {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
              </View>

              {/* Title */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Название задачи *</Text>
                <TextInput
                  value={form.title}
                  onChangeText={t => update('title', t)}
                  placeholder="Например: Ремонт ванной комнаты"
                  placeholderTextColor={colors.textMuted}
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Description */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Описание задачи *</Text>
                <TextInput
                  value={form.description}
                  onChangeText={t => update('description', t)}
                  placeholder="Опишите подробно что нужно сделать..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  style={[s.input, { height: vs(100), textAlignVertical: 'top', paddingTop: vs(12), outlineStyle: 'none' } as any]}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              {/* City */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Город</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: sm(8) }}>
                    {KZ_CITIES.slice(0, 6).map(c => (
                      <Pressable
                        key={c}
                        onPress={() => update('city', c)}
                        style={[
                          styles.cityChip,
                          {
                            backgroundColor: form.city === c ? '#FF6B35' : colors.card,
                            borderColor: form.city === c ? '#FF6B35' : colors.border
                          }
                        ]}>
                        <Text style={[styles.cityChipText, { color: form.city === c ? '#fff' : colors.textMuted }]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Pressable onPress={() => validateStep1() && setStep(2)} style={[s.buttonPrimary, styles.nextBtn]}>
                <Text style={s.buttonText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 2: Бюджет и клиент ── */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Бюджет и клиент</Text>

              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Бюджет клиента (₸) *</Text>
                <TextInput
                  value={form.budgetFrom}
                  onChangeText={t => update('budgetFrom', t)}
                  placeholder="50000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
                {errors.budgetFrom && <Text style={styles.errorText}>{errors.budgetFrom}</Text>}
              </View>

              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Имя клиента *</Text>
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
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Телефон клиента *</Text>
                <TextInput
                  value={form.clientPhone}
                  onChangeText={t => update('clientPhone', t)}
                  placeholder="+7 700 000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
                {errors.clientPhone && <Text style={styles.errorText}>{errors.clientPhone}</Text>}
              </View>

              <Pressable onPress={() => validateStep2() && setStep(3)} style={[s.buttonPrimary, styles.nextBtn]}>
                <Text style={s.buttonText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 3: Комиссия ── */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Ваша комиссия</Text>
              <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Выберите процент от суммы заказа, который вы хотите получить. Мы возьмём 10% от вашей комиссии.</Text>

              {/* Commission selector */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Ваша комиссия *</Text>
                <View style={styles.commissionGrid}>
                  {COMMISSION_OPTIONS.map(pct => {
                    const active = form.commissionPercent === pct
                    const net = Math.floor((budget * pct) / 100) - Math.floor(Math.floor((budget * pct) / 100) * 0.1)
                    return (
                      <Pressable
                        key={pct}
                        onPress={() => update('commissionPercent', pct)}
                        style={[
                          styles.commissionBtn,
                          {
                            backgroundColor: active ? '#FF6B35' : colors.card,
                            borderColor: active ? '#FF6B35' : colors.border
                          }
                        ]}>
                        <Text style={[styles.commissionBtnValue, { color: active ? '#fff' : colors.text }]}>{pct}%</Text>
                        {budget > 0 && <Text style={[styles.commissionBtnNet, { color: active ? 'rgba(255,255,255,0.8)' : colors.textMuted }]}>{net.toLocaleString()} ₸</Text>}
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              {/* Commission breakdown */}
              {budget > 0 && (
                <Animated.View entering={FadeInDown.springify()} style={[s.card, styles.breakdownCard]}>
                  <Text style={[s.textLabel, { color: colors.text }]}>Расчёт комиссии</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={s.textSecondary}>Сумма заказа</Text>
                    <Text style={s.textLabel}>{budget.toLocaleString()} ₸</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={s.textSecondary}>Ваша комиссия ({form.commissionPercent}%)</Text>
                    <Text style={s.textLabel}>{partnerEarns.toLocaleString()} ₸</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={s.textSecondary}>Комиссия платформы (10%)</Text>
                    <Text style={styles.breakdownCut}>− {platformCut.toLocaleString()} ₸</Text>
                  </View>
                  <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownTotalLabel}>Вы получите</Text>
                    <Text style={styles.breakdownTotalValue}>{partnerNet.toLocaleString()} ₸</Text>
                  </View>
                </Animated.View>
              )}

              <Pressable onPress={() => mutation.mutate()} disabled={mutation.isPending} style={[s.buttonPrimary, styles.submitBtn, { opacity: mutation.isPending ? 0.6 : 1 }]}>
                {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>✓ Опубликовать заказ</Text>}
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
