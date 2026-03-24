import { api } from './api'

export interface PromoValidateResult {
  valid: boolean
  code: string
  type: 'percent' | 'fixed' | 'free_response'
  value: number // % или ₸
  description: string
  minOrderAmount?: number
}

export interface ReferralInfo {
  referralCode: string
  referralLink: string
  totalReferrals: number
  pendingBonus: number   // ₸ ещё не зачислено
  earnedBonus: number    // ₸ уже зачислено
  referrals: ReferralItem[]
}

export interface ReferralItem {
  id: string
  name: string
  joinedAt: string
  status: 'registered' | 'first_order' | 'paid'
  bonus: number
}

export const promoService = {
  // Проверить промокод
  validate: async (code: string): Promise<PromoValidateResult> => {
    const res = await api.post('/promo/validate', { code })
    return res.data
  },

  // Применить промокод к заказу
  apply: async (code: string, orderId: string) => {
    const res = await api.post('/promo/apply', { code, orderId })
    return res.data
  },

  // Получить реферальную информацию текущего пользователя
  getReferralInfo: async (): Promise<ReferralInfo> => {
    const res = await api.get('/promo/referral')
    return res.data
  },

  // Применить реферальный код при регистрации
  applyReferral: async (referralCode: string) => {
    const res = await api.post('/promo/referral/apply', { referralCode })
    return res.data
  }
}
