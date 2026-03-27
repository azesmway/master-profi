import { api } from './api'

export interface CreateOrderPayload {
  title: string
  description: string
  categoryId?: string
  budgetFrom?: number
  budgetTo?: number
  budgetCurrency?: string
  budgetUnit?: string
  city?: string
  address?: string
  photos?: string[]
}

export interface CreateResponsePayload {
  message: string
  price: number
  currency?: string
}

export const ordersService = {
  // Список заказов (для специалиста — лента, для клиента — мои)
  findAll: (params?: Record<string, any>) => api.get('/orders', { params }),

  // Мои заказы (клиент)
  getMyOrders: (params?: Record<string, any>) => api.get('/orders/my', { params }),

  // Детали заказа
  findOne: (id: string) => api.get(`/orders/${id}`),

  // Создать заказ
  create: (data: CreateOrderPayload) => api.post('/orders', data),

  // Изменить статус
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),

  // Отменить заказ
  delete: (id: string) => api.delete(`/orders/${id}`),

  // Откликнуться на заказ (специалист)
  createResponse: (orderId: string, data: CreateResponsePayload) => api.post(`/orders/${orderId}/responses`, data),

  // Принять отклик (клиент) → создаёт чат
  acceptResponse: (responseId: string) => api.post(`/orders/responses/${responseId}/accept`),

  // Мои отклики (специалист)
  getMyResponses: () => api.get('/orders/responses/my')
}
