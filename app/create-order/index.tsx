import Screen from '@components/ui/Screen'
import { useMutation } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Image } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import VoiceInputButton from '@/components/ui/VoiceInputButton'
import { CATEGORIES, CURRENCIES, KZ_CITIES } from '@/constants'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useTheme } from '@/hooks/useTheme'
import { ordersService } from '@/services/ordersService'

const WHISPER_URL = process.env.EXPO_PUBLIC_WHISPER_URL ?? 'https://api.it-trend.dev/whisper'

interface OrderForm {
  title: string
  description: string
  categoryId: string
  budget: string
  currency: 'KZT' | 'RUB'
  city: string
  photos: string[]
}

export default function CreateOrderScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  const [form, setForm] = useState<OrderForm>({
    title: '',
    description: '',
    categoryId: '',
    budget: '',
    currency: 'KZT',
    city: 'Алматы',
    photos: []
  })
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [errors, setErrors] = useState<Partial<OrderForm>>({})
  const [cityOpen, setCityOpen] = useState(false)

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
        budgetFrom: form.budget ? parseInt(form.budget) : undefined,
        budgetCurrency: form.currency,
        budgetUnit: 'project',
        city: form.city,
        photos: form.photos
      }),
    onSuccess: () => {
      router.replace('/(client)/orders')
    },
    onError: (err: any) => {
      console.error('[CreateOrder]', err?.response?.data ?? err.message)
    }
  })

  const handleSubmit = () => {
    if (mutation.isPending) return
    mutation.mutate()
  }

  const selectedCategory = CATEGORIES.find(c => c.id === form.categoryId)

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center gap-3">
          <Pressable onPress={() => (step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : router.back())}>
            <Text className="text-primary text-base">←</Text>
          </Pressable>
          <Text className="text-dark dark:text-white text-lg font-bold flex-1">Новый заказ</Text>
          <Text className="text-text-muted dark:text-text-secondary text-sm">{step}/3</Text>
        </View>

        {/* Progress bar */}
        <View className="px-5 mb-5">
          <View className="h-1 bg-dark-border rounded-full overflow-hidden">
            <View className="h-full bg-primary rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
          </View>
        </View>

        <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Step 1: What & Where */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} className="gap-5">
              <Text className="text-dark dark:text-white text-2xl font-bold">Что нужно сделать?</Text>

              {/* Category */}
              <View>
                <Text className="text-text-muted dark:text-text-secondary text-sm mb-2 ml-1">Категория *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {CATEGORIES.slice(0, 11).map(cat => (
                      <Pressable
                        key={cat.id}
                        onPress={() => update('categoryId', cat.id)}
                        className={[
                          'items-center px-4 py-3 rounded-xl border min-w-16',
                          form.categoryId === cat.id ? 'bg-primary/10 border-primary' : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border'
                        ].join(' ')}>
                        <Text className="text-xl mb-1">{cat.icon}</Text>
                        <Text className={['text-xs text-center', form.categoryId === cat.id ? 'text-primary' : 'text-text-muted dark:text-text-secondary'].join(' ')} numberOfLines={2}>
                          {cat.name.split(' ')[0]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {errors.categoryId && <Text className="text-error text-xs mt-1 ml-1">{errors.categoryId}</Text>}
              </View>

              {/* Title */}
              <View>
                <Text className="text-text-muted dark:text-text-secondary text-sm mb-2 ml-1">Название *</Text>
                <TextInput
                  value={form.title}
                  onChangeText={t => update('title', t)}
                  placeholder="Например: Починить кран на кухне"
                  placeholderTextColor={colors.textMuted}
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14 }}
                />
                {errors.title && <Text className="text-error text-xs mt-1 ml-1">{errors.title}</Text>}
              </View>

              {/* Description + Voice input */}
              <View>
                {/* Заголовок + кнопка микрофона — только когда idle */}
                {recorder.state === 'idle' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginLeft: 4 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Описание *</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>или надиктуйте</Text>
                      <VoiceInputButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} onCancel={recorder.cancel} />
                    </View>
                  </View>
                )}

                {/* Развёрнутый блок записи — только когда активна запись/обработка */}
                {recorder.state !== 'idle' && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8, marginLeft: 4 }}>Описание *</Text>
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
                  style={{
                    minHeight: 100,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: colors.text,
                    fontSize: 14
                  }}
                />
                {errors.description && <Text className="text-error text-xs mt-1 ml-1">{errors.description}</Text>}
              </View>

              <Pressable onPress={() => validateStep1() && setStep(2)} className="bg-primary py-4 rounded-2xl items-center mb-8 active:opacity-80">
                <Text className="text-dark dark:text-white font-bold text-base">Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Step 2: Budget & Location */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} className="gap-5">
              <Text className="text-dark dark:text-white text-2xl font-bold">Бюджет и место</Text>

              {/* Budget */}
              <View>
                <Text className="text-text-muted dark:text-text-secondary text-sm mb-2 ml-1">Бюджет (необязательно)</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 flex-row items-center bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
                    <TextInput
                      value={form.budget}
                      onChangeText={t => update('budget', t.replace(/\D/g, ''))}
                      placeholder="10 000"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      style={{ flex: 1, color: colors.text, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14 }}
                    />
                  </View>
                  <Pressable
                    onPress={() => update('currency', form.currency === 'KZT' ? 'RUB' : 'KZT')}
                    className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 justify-center">
                    <Text className="text-dark dark:text-white font-medium">{CURRENCIES[form.currency].symbol}</Text>
                  </Pressable>
                </View>
              </View>

              {/* City */}
              <View>
                <Text className="text-text-muted dark:text-text-secondary text-sm mb-2 ml-1">Город *</Text>
                <Pressable
                  onPress={() => setCityOpen(!cityOpen)}
                  className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-4 flex-row justify-between">
                  <Text className="text-dark dark:text-white text-sm">{form.city}</Text>
                  <Text className="text-text-muted dark:text-text-secondary">{cityOpen ? '▲' : '▼'}</Text>
                </Pressable>
                {cityOpen && (
                  <View className="bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-2xl mt-2 max-h-48 overflow-hidden">
                    <ScrollView>
                      {KZ_CITIES.map(c => (
                        <Pressable
                          key={c}
                          onPress={() => {
                            update('city', c)
                            setCityOpen(false)
                          }}
                          className={['px-4 py-3 border-b border-light-border dark:border-dark-border', c === form.city ? 'bg-primary/10' : ''].join(' ')}>
                          <Text className={c === form.city ? 'text-primary font-medium' : 'text-dark dark:text-white text-sm'}>{c}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <Pressable onPress={() => setStep(3)} className="bg-primary py-4 rounded-2xl items-center mb-8 active:opacity-80">
                <Text className="text-dark dark:text-white font-bold text-base">Далее →</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Step 3: Photos & Review */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} className="gap-5">
              <Text className="text-dark dark:text-white text-2xl font-bold">Фото и публикация</Text>

              {/* Photos */}
              <View>
                <Text className="text-text-muted dark:text-text-secondary text-sm mb-2 ml-1">Фото (необязательно, до 5 шт.)</Text>
                <View className="flex-row flex-wrap gap-3">
                  {form.photos.map((uri, i) => (
                    <View key={i} className="relative">
                      <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="cover" />
                      <Pressable
                        onPress={() =>
                          update(
                            'photos',
                            form.photos.filter((_, j) => j !== i)
                          )
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full items-center justify-center">
                        <Text className="text-dark dark:text-white text-xs font-bold">✕</Text>
                      </Pressable>
                    </View>
                  ))}
                  {form.photos.length < 5 && (
                    <Pressable onPress={pickImages} className="w-20 h-20 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border items-center justify-center active:opacity-70">
                      <Text className="text-2xl text-text-muted dark:text-text-secondary">+</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Review summary */}
              <View className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 gap-3">
                <Text className="text-dark dark:text-white font-semibold">Итог заказа</Text>
                {selectedCategory && (
                  <View className="flex-row items-center gap-2">
                    <Text>{selectedCategory.icon}</Text>
                    <Text className="text-text-muted dark:text-text-secondary text-sm">{selectedCategory.name}</Text>
                  </View>
                )}
                <Text className="text-dark dark:text-white text-sm font-medium">{form.title}</Text>
                {form.description && (
                  <Text className="text-text-muted dark:text-text-secondary text-sm" numberOfLines={3}>
                    {form.description}
                  </Text>
                )}
                {form.budget && (
                  <Text className="text-dark dark:text-white text-sm">
                    Бюджет: {parseInt(form.budget).toLocaleString()} {CURRENCIES[form.currency].symbol}
                  </Text>
                )}
                <Text className="text-text-muted dark:text-text-secondary text-sm">📍 {form.city}</Text>
              </View>

              <Pressable onPress={handleSubmit} disabled={mutation.isPending} className="bg-primary py-4 rounded-2xl items-center mb-8 active:opacity-80 disabled:opacity-50">
                {mutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-dark dark:text-white font-bold text-base">Опубликовать заказ 🚀</Text>}
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
