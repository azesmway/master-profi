import { api } from './api';
import type { ChatRoom, Message, ApiResponse } from '@/types';

export const chatService = {
  // Список чат-комнат
  getRooms: () =>
    api.get<{ data: ChatRoom[] }>('/chat/rooms'),

  // История сообщений
  getMessages: (roomId: string, page = 1, limit = 50) =>
    api.get<ApiResponse<Message[]>>(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit },
    }),

  // Создать комнату
  createRoom: (participantIds: string[], orderId?: string) =>
    api.post<ChatRoom>('/chat/rooms', { participantIds, orderId }),
};
