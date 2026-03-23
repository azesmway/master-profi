import { api } from './api'

export const paymentsService = {
  // Создать эскроу
  createEscrow: async (orderId: string, amount: number) => {
    const res = await api.post('/payments/escrow', { orderId, amount, method: 'kaspi' })
    return res.data as { payment: any; kaspiDeeplink?: string }
  },

  // Статус платежа
  getStatus: async (orderId: string) => {
    const res = await api.get(`/payments/${orderId}/status`)
    return res.data
  },

  // Подтвердить завершение
  release: async (orderId: string) => {
    const res = await api.post(`/payments/${orderId}/release`)
    return res.data
  }
}
