/**
 * Простая аналитика — отправляем события на наш сервер
 * В будущем можно подключить Amplitude/Mixpanel
 */
import { useAuthStore } from '@/store/authStore'

import { api } from './api'

export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'onboarding_skip'
  | 'register'
  | 'login'
  | 'search'
  | 'specialist_view'
  | 'order_create'
  | 'order_view'
  | 'response_send'
  | 'response_accept'
  | 'chat_open'
  | 'chat_message_send'
  | 'voice_record_start'
  | 'voice_record_success'
  | 'ai_chat_open'
  | 'ai_chat_message'
  | 'profile_edit'
  | 'portfolio_add'
  | 'review_write'

interface EventProps {
  [key: string]: string | number | boolean | undefined
}

class Analytics {
  private queue: Array<{ event: AnalyticsEvent; props?: EventProps; ts: number }> = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null

  track(event: AnalyticsEvent, props?: EventProps) {
    const user = useAuthStore.getState().user
    this.queue.push({
      event,
      props: {
        ...props,
        userId: user?.id,
        role: user?.role
      },
      ts: Date.now()
    })

    console.log(`[Analytics] ${event}`, props ?? '')

    // Батчим события и отправляем раз в 5 секунд
    if (this.flushTimer) clearTimeout(this.flushTimer)
    this.flushTimer = setTimeout(() => this.flush(), 5000)
  }

  private async flush() {
    if (this.queue.length === 0) return
    const events = [...this.queue]
    this.queue = []

    try {
      await api.post('/analytics/events', { events })
    } catch {
      // Не критично — просто логируем
    }
  }
}

export const analytics = new Analytics()
