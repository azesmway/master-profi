import type { ApiResponse, SearchParams, Specialist } from '@/types'

import { api } from './api'

export const specialistsService = {
  // Список с фильтрами
  findAll: (params: SearchParams) => api.get<ApiResponse<Specialist[]>>('/specialists', { params }),

  // Профиль специалиста
  findOne: (id: string) => api.get<Specialist>(`/specialists/${id}`),

  // Мой профиль (для специалиста)
  getMyProfile: () => api.get<Specialist>('/specialists/me'),

  // Обновить профиль
  updateMyProfile: (data: Partial<Specialist>) => api.patch<Specialist>('/specialists/me', data),

  // Добавить в портфолио
  addPortfolio: (data: { type: 'photo' | 'video'; url: string; caption?: string }) => api.post('/specialists/me/portfolio', data)
}
