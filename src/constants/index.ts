// ─── App Config ─────────────────────────────────────────────────────────────

export const APP_NAME = 'Мастер'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.master.kz/v1'
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'wss://api.master.kz'

// ─── Design Tokens ──────────────────────────────────────────────────────────

export const COLORS = {
  primary: '#FF6B35',
  background: '#0F0F0F',
  card: '#1A1A1A',
  elevated: '#222222',
  border: '#2E2E2E',
  text: '#FFFFFF',
  textSecondary: '#999999',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  escrow: '#8B5CF6'
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48
} as const

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999
} as const

// ─── Categories ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: '1', name: 'Ремонт и строительство', slug: 'repair', icon: '🔨', color: '#FF6B35' },
  { id: '2', name: 'Красота и здоровье', slug: 'beauty', icon: '💇', color: '#EC4899' },
  { id: '3', name: 'Репетиторы', slug: 'tutors', icon: '📚', color: '#3B82F6' },
  { id: '4', name: 'Уборка', slug: 'cleaning', icon: '🧹', color: '#10B981' },
  { id: '5', name: 'IT и технологии', slug: 'it', icon: '💻', color: '#8B5CF6' },
  { id: '6', name: 'Грузоперевозки', slug: 'cargo', icon: '🚛', color: '#F59E0B' },
  { id: '7', name: 'Фото и видео', slug: 'photo', icon: '📷', color: '#06B6D4' },
  { id: '8', name: 'Юридические услуги', slug: 'legal', icon: '⚖️', color: '#64748B' },
  { id: '9', name: 'Психология', slug: 'psychology', icon: '🧠', color: '#A78BFA' },
  { id: '10', name: 'Дизайн', slug: 'design', icon: '🎨', color: '#F43F5E' },
  { id: '11', name: 'Бухгалтерия', slug: 'finance', icon: '📊', color: '#0EA5E9' },
  { id: '12', name: 'Ещё', slug: 'other', icon: '⋯', color: '#6B7280' }
] as const

// ─── Order Statuses ──────────────────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликован',
  in_progress: 'В работе',
  pending_review: 'На проверке',
  completed: 'Завершён',
  disputed: 'Спор',
  cancelled: 'Отменён'
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  draft: '#6B7280',
  published: '#3B82F6',
  in_progress: '#FF6B35',
  pending_review: '#F59E0B',
  completed: '#22C55E',
  disputed: '#EF4444',
  cancelled: '#6B7280'
}

// ─── Escrow Statuses ────────────────────────────────────────────────────────

export const ESCROW_STATUS_LABEL: Record<string, string> = {
  none: 'Без оплаты',
  pending: 'Ожидает оплаты',
  held: 'Средства заблокированы',
  releasing: 'Идёт выплата',
  released: 'Выплачено',
  disputed: 'Спор',
  refunded: 'Возврат'
}

// ─── Cities (KZ) ────────────────────────────────────────────────────────────

export const KZ_CITIES = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'] as const

// ─── Currencies ─────────────────────────────────────────────────────────────

export const CURRENCIES = {
  RUB: { symbol: '₽', name: 'Рубль' },
  KZT: { symbol: '₸', name: 'Тенге' }
} as const

// ─── Storage Keys ────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'master:access_token',
  REFRESH_TOKEN: 'master:refresh_token',
  USER: 'master:user',
  ONBOARDING_DONE: 'master:onboarding_done',
  SELECTED_CITY: 'master:city',
  THEME: 'master:theme'
} as const

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  SPECIALISTS: 'specialists',
  SPECIALIST: 'specialist',
  ORDERS: 'orders',
  ORDER: 'order',
  CATEGORIES: 'categories',
  CHAT_ROOMS: 'chat_rooms',
  MESSAGES: 'messages',
  REVIEWS: 'reviews',
  AI_SUGGESTIONS: 'ai_suggestions',
  ESCROW: 'escrow',
  PROFILE: 'profile'
} as const
