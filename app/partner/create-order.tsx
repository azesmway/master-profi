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

  // ── Расчёт комиссий ───────────────────────────────────────
  const budget = form.budgetFrom ? parseInt(form.budgetFrom) : 0
  const partnerEarns = Math.floor((budget * form.commissionPercent) / 100)
  const platformCut = Math.floor(partnerEarns * 0.1)
  const partnerNet = partnerEarns - platformCut

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => (step > 1 ? setStep(ss => (ss - 1) as any) : router.back())}>
            <Text style={{ color: '#FF6B35', fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={[s.textTitle, { flex: 1, fontSize: 18 }]}>Заказ от партнёра</Text>
          <Text style={s.textMuted}>{step}/3</Text>
        </View>

        {/* Progress */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
            <View style={{ height: 4, backgroundColor: '#FF6B35', borderRadius: 2, width: `${(step / 3) * 100}%` }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {/* ── Step 1: Задача ── */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: 20 }}>
              <Text style={[s.textTitle, { fontSize: 22 }]}>Что нужно сделать?</Text>

              {/* Category */}
              <View>
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
                            backgroundColor: active ? '#FF6B3515' : colors.card,
                            borderColor: active ? '#FF6B35' : colors.border
                          }}>
                          <Text style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</Text>
                          <Text style={{ fontSize: 10, color: active ? '#FF6B35' : colors.textMuted, textAlign: 'center' }}>{cat.name}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>
                {errors.categoryId && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.categoryId}</Text>}
              </View>

              {/* Title */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Название заказа *</Text>
                <TextInput
                  value={form.title}
                  onChangeText={t => update('title', t)}
                  placeholder="Например: Установка сантехники"
                  placeholderTextColor={colors.textMuted}
                  style={[s.input, { outlineStyle: 'none' }]}
                />
                {errors.title && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.title}</Text>}
              </View>

              {/* Description */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Описание *</Text>
                <TextInput
                  value={form.description}
                  onChangeText={t => update('description', t)}
                  placeholder="Подробно опишите задачу..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  style={[s.input, { height: 100, textAlignVertical: 'top', paddingTop: 12, outlineStyle: 'none' }]}
                />
                {errors.description && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.description}</Text>}
              </View>

              {/* City */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Город</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {KZ_CITIES.map(c => (
                      <Pressable
                        key={c}
                        onPress={() => update('city', c)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          backgroundColor: form.city === c ? '#FF6B35' : colors.card,
                          borderColor: form.city === c ? '#FF6B35' : colors.border
                        }}>
                        <Text style={{ fontSize: 13, color: form.city === c ? '#fff' : colors.textMuted }}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Pressable onPress={() => validateStep1() && setStep(2)} style={s.buttonPrimary}>
                <Text style={s.buttonText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 2: Бюджет и клиент ── */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: 20 }}>
              <Text style={[s.textTitle, { fontSize: 22 }]}>Бюджет и клиент</Text>

              {/* Budget */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Бюджет клиента (₸) *</Text>
                <TextInput value={form.budgetFrom} onChangeText={t => update('budgetFrom', t)} placeholder="50000" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={[s.input, { outlineStyle: 'none' }]} />
                {errors.budgetFrom && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.budgetFrom}</Text>}
              </View>

              {/* Client info */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Имя клиента *</Text>
                <TextInput value={form.clientName} onChangeText={t => update('clientName', t)} placeholder="Алия Иванова" placeholderTextColor={colors.textMuted} style={[s.input, { outlineStyle: 'none' }]} />
                {errors.clientName && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.clientName}</Text>}
              </View>

              <View>
                <Text style={[s.textMuted, { marginBottom: 8 }]}>Телефон клиента *</Text>
                <TextInput
                  value={form.clientPhone}
                  onChangeText={t => update('clientPhone', t)}
                  placeholder="+7 700 000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[s.input, { outlineStyle: 'none' }]}
                />
                {errors.clientPhone && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.clientPhone}</Text>}
              </View>

              <Pressable onPress={() => validateStep2() && setStep(3)} style={s.buttonPrimary}>
                <Text style={s.buttonText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 3: Комиссия ── */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: 20 }}>
              <Text style={[s.textTitle, { fontSize: 22 }]}>Ваша комиссия</Text>
              <Text style={[s.textSecondary, { lineHeight: 20 }]}>Выберите процент от суммы заказа, который вы хотите получить. Мы возьмём 10% от вашей комиссии.</Text>

              {/* Commission selector */}
              <View>
                <Text style={[s.textMuted, { marginBottom: 12 }]}>Ваша комиссия *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {COMMISSION_OPTIONS.map(pct => {
                    const active = form.commissionPercent === pct
                    return (
                      <Pressable
                        key={pct}
                        onPress={() => update('commissionPercent', pct)}
                        style={{
                          width: '30%',
                          paddingVertical: 14,
                          borderRadius: 14,
                          borderWidth: 2,
                          alignItems: 'center',
                          backgroundColor: active ? '#FF6B35' : colors.card,
                          borderColor: active ? '#FF6B35' : colors.border
                        }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: active ? '#fff' : colors.text }}>{pct}%</Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              {/* Commission breakdown */}
              {budget > 0 && (
                <Animated.View entering={FadeInDown.springify()} style={[s.card, { gap: 12 }]}>
                  <Text style={s.textLabel}>Расчёт комиссии</Text>
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={s.textSecondary}>Сумма заказа</Text>
                      <Text style={s.textLabel}>{budget.toLocaleString()} ₸</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={s.textSecondary}>Ваша комиссия ({form.commissionPercent}%)</Text>
                      <Text style={s.textLabel}>{partnerEarns.toLocaleString()} ₸</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={s.textSecondary}>Комиссия платформы (10%)</Text>
                      <Text style={{ color: '#EF4444', fontWeight: '600' }}>− {platformCut.toLocaleString()} ₸</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: colors.border }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#22C55E', fontWeight: '700' }}>Вы получите</Text>
                      <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 18 }}>{partnerNet.toLocaleString()} ₸</Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              <Pressable onPress={() => mutation.mutate()} disabled={mutation.isPending} style={[s.buttonPrimary, { opacity: mutation.isPending ? 0.6 : 1 }]}>
                {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>✓ Опубликовать заказ</Text>}
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
