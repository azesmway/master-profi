// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'specialist' | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  city?: string
  email?: string
  avatar?: string
  role: UserRole
  createdAt: string
  isVerified: boolean
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
}

// ─── Specialist ─────────────────────────────────────────────────────────────

export interface Specialist {
  id: string
  userId: string
  name: string
  avatar?: string
  bio: string
  categories: Category[]
  rating: number
  reviewCount: number
  completedOrders: number
  portfolio: PortfolioItem[]
  location: Location
  responseTime: string // "в течение часа"
  isOnline: boolean
  isVerified: boolean
  price?: PriceRange
}

export interface PortfolioItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail?: string
  caption?: string
}

export interface PriceRange {
  from: number
  to?: number
  currency: 'KZT' | 'RUB'
  unit: 'hour' | 'project' | 'day'
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parentId?: string
  children?: Category[]
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'draft' | 'published' | 'in_progress' | 'pending_review' | 'completed' | 'disputed' | 'cancelled'

export interface Order {
  id: string
  clientId: string
  title: string
  description: string
  category: Category
  budget?: PriceRange
  location: Location
  photos?: string[]
  status: OrderStatus
  createdAt: string
  deadline?: string
  responseCount: number
  responses?: Response[]
}

export interface Response {
  id: string
  orderId: string
  specialist: Specialist
  message: string
  price: number
  currency: 'KZT' | 'RUB'
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

// ─── Location ────────────────────────────────────────────────────────────────

export interface Location {
  city: string
  address?: string
  lat?: number
  lng?: number
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string
  orderId: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  escrowStatus?: EscrowStatus
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'video' | 'file' | 'system'
  mediaUrl?: string
  createdAt: string
  isRead: boolean
}

// ─── Escrow ──────────────────────────────────────────────────────────────────

export type EscrowStatus = 'none' | 'pending' | 'held' | 'releasing' | 'released' | 'disputed' | 'refunded'

export interface EscrowPayment {
  id: string
  orderId: string
  amount: number
  currency: 'KZT' | 'RUB'
  status: EscrowStatus
  clientId: string
  specialistId: string
  createdAt: string
  releasedAt?: string
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  orderId: string
  authorId: string
  targetId: string
  rating: number // 1–5
  comment: string
  photos?: string[]
  createdAt: string
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SearchParams extends PaginationParams {
  query?: string
  categoryId?: string
  city?: string
  lat?: number
  lng?: number
  radius?: number
  priceFrom?: number
  priceTo?: number
  rating?: number
  sortBy?: 'rating' | 'price' | 'distance' | 'reviews' | 'online'
}
