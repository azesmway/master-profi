import Screen from '@components/ui/Screen'
import { PromoValidateResult } from '@services/promoService'
import { useMutation } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s as sm, vs } from 'react-native-size-matters'

import { PromoCodeInput } from '@/components/ui/PromoCodeInput'
import VoiceInputButton from '@/components/ui/VoiceInputButton'
import { CATEGORIES, CURRENCIES, KZ_CITIES } from '@/constants'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'
import { makeStyles } from '@/utils/makeStyles'

import styles from './index.styles'

const WHISPER_URL = process.env.EXPO_PUBLIC_WHISPER_URL ?? 'https://api.it-trend.dev/whisper'

interface OrderForm {
  title: string
  description: string
  categoryId: string
  budget: string
  currency: 'KZT' | 'RUB'
  city: string
  photos: string[]
  orderType: 'standard' | 'barter'
  barterOffer: string
}

export default function CreateOrderScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const s = makeStyles(colors)

  const [form, setForm] = useState<OrderForm>({
    title: '',
    description: '',
    categoryId: '',
    budget: '',
    currency: 'KZT',
    city: 'Алматы',
    photos: [],
    orderType: 'standard',
    barterOffer: ''
  })
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [errors, setErrors] = useState<Partial<OrderForm>>({})
  const [cityOpen, setCityOpen] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoValidateResult | null>(null)

  const recorder = useAudioRecorder({
    whisperUrl: WHISPER_URL,
    language: 'ru',
    onTranscript: (text, categoryId, title) => {
      if (text) update('description', form.description ? form.description + ' ' + text : text)
      if (title) update('title', form.title || title)
      if (categoryId) update('categoryId', form.categoryId || categoryId)
    },
    onError: err => console.warn('[Voice]', err)
  })

  const update = (field: keyof OrderForm, value: string | string[]) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5
    })
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri)
      update('photos', [...form.photos, ...uris].slice(0, 5))
    }
  }

  const validateStep1 = () => {
    const e: Partial<OrderForm> = {}
    if (!form.title.trim()) e.title = 'Введите название'
    if (!form.categoryId) e.categoryId = 'Выберите категорию'
    if (!form.description.trim()) e.description = 'Опишите задачу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () =>
      ordersService.create({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || undefined,
        budgetCurrency: form.currency,
        budgetUnit: 'project',
        city: form.city,
        photos: form.photos,
        // @ts-ignore
        type: form.orderType,
        barterClientOffer: form.orderType === 'barter' ? form.barterOffer : undefined,
        budgetFrom: form.orderType !== 'barter' && form.budget ? parseInt(form.budget) : undefined
      }),
    onSuccess: () => router.replace('/(client)/orders'),
    onError: (err: any) => console.error('[CreateOrder]', err?.response?.data ?? err.message)
  })

  const handleSubmit = () => {
    if (mutation.isPending) return
    mutation.mutate()
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => (step > 1 ? setStep(ss => (ss - 1) as 1 | 2 | 3) : router.back())}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Новый заказ</Text>
          <Text style={[styles.headerStep, { color: colors.textSecondary }]}>{step}/3</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` as any }]} />
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: sm(20) }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* ── Step 1 ── */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Что нужно сделать?</Text>

              {/* Order type */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Тип заказа</Text>
                <View style={styles.typeRow}>
                  <Pressable
                    onPress={() => update('orderType', 'standard')}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: form.orderType === 'standard' ? '#FF6B3515' : colors.card,
                        borderColor: form.orderType === 'standard' ? '#FF6B35' : colors.border
                      }
                    ]}>
                    <Text style={styles.typeBtnIcon}>💰</Text>
                    <Text style={[styles.typeBtnLabel, { color: form.orderType === 'standard' ? '#FF6B35' : colors.textMuted }]}>Обычный</Text>
                    <Text style={[styles.typeBtnSub, { color: colors.textMuted }]}>С оплатой</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => update('orderType', 'barter')}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: form.orderType === 'barter' ? '#8B5CF615' : colors.card,
                        borderColor: form.orderType === 'barter' ? '#8B5CF6' : colors.border
                      }
                    ]}>
                    <Text style={styles.typeBtnIcon}>🔄</Text>
                    <Text style={[styles.typeBtnLabel, { color: form.orderType === 'barter' ? '#8B5CF6' : colors.textMuted }]}>Бартер</Text>
                    <Text style={[styles.typeBtnSub, { color: colors.textMuted }]}>Обмен</Text>
                  </Pressable>
                </View>
              </View>

              {/* Category */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Категория *</Text>
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
                          <Text style={[styles.catChipText, { color: active ? '#FF6B35' : colors.textSecondary }]} numberOfLines={2}>
                            {cat.name.split(' ')[0]}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>
                {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
              </View>

              {/* Title */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Название *</Text>
                <TextInput
                  value={form.title}
                  onChangeText={t => update('title', t)}
                  placeholder="Например: Починить кран на кухне"
                  placeholderTextColor={colors.textMuted}
                  style={[s.input, { outlineStyle: 'none' } as any]}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Description + voice */}
              <View>
                {recorder.state === 'idle' && (
                  <View style={styles.descLabelRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Описание *</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: sm(6) }}>
                      <Text style={{ color: colors.textMuted, fontSize: sm(11) }}>или надиктуйте</Text>
                      <VoiceInputButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} onCancel={recorder.cancel} />
                    </View>
                  </View>
                )}
                {recorder.state !== 'idle' && (
                  <View style={{ marginBottom: vs(12) }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Описание *</Text>
                    <VoiceInputButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} onCancel={recorder.cancel} />
                  </View>
                )}
                <TextInput
                  value={form.description}
                  onChangeText={t => update('description', t)}
                  placeholder="Опишите задачу подробнее или нажмите 🎤 и надиктуйте..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[s.input, { minHeight: vs(100), outlineStyle: 'none' } as any]}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              <Pressable onPress={() => validateStep1() && setStep(2)} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Бюджет/Бартер и место</Text>

              {/* Budget */}
              {form.orderType !== 'barter' && (
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Бюджет (необязательно)</Text>
                  <View style={styles.budgetRow}>
                    <View style={[styles.budgetInputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <TextInput
                        value={form.budget}
                        onChangeText={t => update('budget', t.replace(/\D/g, ''))}
                        placeholder="10 000"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        style={[styles.budgetInput, { color: colors.text, outlineStyle: 'none' } as any]}
                      />
                    </View>
                    <Pressable onPress={() => update('currency', form.currency === 'KZT' ? 'RUB' : 'KZT')} style={[styles.currencyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.currencyText, { color: colors.text }]}>{CURRENCIES[form.currency].symbol}</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* City */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Город *</Text>
                <Pressable onPress={() => setCityOpen(!cityOpen)} style={[styles.cityPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.cityPickerText, { color: colors.text }]}>{form.city}</Text>
                  <Text style={[styles.cityPickerArrow, { color: colors.textMuted }]}>{cityOpen ? '▲' : '▼'}</Text>
                </Pressable>
                {cityOpen && (
                  <View style={[styles.cityDropdown, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                    <ScrollView>
                      {KZ_CITIES.map(c => (
                        <Pressable
                          key={c}
                          onPress={() => {
                            update('city', c)
                            setCityOpen(false)
                          }}
                          style={[styles.cityOption, { borderBottomColor: colors.border, backgroundColor: c === form.city ? '#FF6B3510' : 'transparent' }]}>
                          <Text style={[styles.cityOptionText, { color: c === form.city ? '#FF6B35' : colors.text, fontWeight: c === form.city ? '500' : '400' }]}>{c}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <Pressable onPress={() => setStep(3)} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: vs(20) }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Фото и публикация</Text>

              {/* Photos */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Фото (необязательно, до 5 шт.)</Text>
                <View style={styles.photoGrid}>
                  {form.photos.map((uri, i) => (
                    <View key={i} style={styles.photoWrap}>
                      <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
                      <Pressable
                        onPress={() =>
                          update(
                            'photos',
                            form.photos.filter((_, j) => j !== i)
                          )
                        }
                        style={styles.photoDeleteBtn}>
                        <Text style={styles.photoDeleteText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                  {form.photos.length < 5 && (
                    <Pressable onPress={pickImages} style={[styles.photoAddBtn, { borderColor: colors.border }]}>
                      <Text style={[styles.photoAddIcon, { color: colors.textMuted }]}>📷</Text>
                      <Text style={[styles.photoAddText, { color: colors.textMuted }]}>Добавить</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Barter offer */}
              {form.orderType === 'barter' && (
                <Animated.View entering={FadeInDown.springify()}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Что предлагаете мастеру взамен? *</Text>
                  <TextInput
                    value={form.barterOffer}
                    onChangeText={t => update('barterOffer', t)}
                    placeholder="Например: Профессиональная фотосессия 2 часа. Или: Уроки английского 5 занятий..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    style={[styles.barterInput, { backgroundColor: colors.card, color: colors.text, outlineStyle: 'none' } as any]}
                  />
                </Animated.View>
              )}

              {/* Promo code */}
              <PromoCodeInput onApplied={promo => setAppliedPromo(promo)} onRemoved={() => setAppliedPromo(null)} />

              <Pressable onPress={handleSubmit} disabled={mutation.isPending} style={[styles.submitBtn, { opacity: mutation.isPending ? 0.5 : 1 }]}>
                {mutation.isPending ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Опубликовать заказ 🚀</Text>}
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
