# Мастер — маркетплейс услуг

Конкурент Profi.ru с улучшениями: AI-подбор, видео-портфолио, эскроу-оплата, бесплатные отклики.

## Стек

| Слой | Технология |
|---|---|
| Runtime | **Expo SDK 54** / React Native **0.81.5** / React **19.1.0** |
| Архитектура | New Architecture (включена по умолчанию в SDK 54) |
| Навигация | Expo Router **v6** (file-based) |
| Стейт | Zustand + MMKV |
| API-кэш | TanStack Query v5 |
| Стили | **NativeWind v5** (react-native-css) |
| HTTP | Axios + interceptors + auto-refresh |
| Анимации | React Native **Reanimated v4** + react-native-worklets |
| Жесты | React Native Gesture Handler ~2.28 |

## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить в режиме разработки
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Переменные окружения

Создайте `.env.local`:
```
EXPO_PUBLIC_API_URL=https://api.master.kz/v1
EXPO_PUBLIC_WS_URL=wss://api.master.kz
```

## Что изменилось в SDK 54 (vs SDK 52)

| Изменение | Подробности |
|---|---|
| `react-native` | `0.76.3` → `0.81.5` |
| `expo` | `~52.0.0` → `~54.0.0` |
| `react` / `react-dom` | `18.3.2` → `19.1.0` |
| `expo-router` | `~4.0.0` → `~6.0.0` |
| `react-native-reanimated` | `~3.16` → `~4.1.0` |
| `react-native-worklets` | не нужен → `~0.4.0` (peer dep Reanimated v4) |
| `nativewind` | `^4.0.1` → `preview` (v5) |
| `react-native-css` | новый пакет (замена nativewind/preset) |
| `babel.config.js` | убран `reanimated/plugin` (babel-preset-expo сам добавляет) |
| `global.css` | `@tailwind` → `@import "tailwindcss"` |
| `metro.config.js` | новый файл — `withNativeWind` из `react-native-css/metro` |
| `postcss.config.mjs` | новый файл — `@tailwindcss/postcss` |
| `nativewind-env.d.ts` | новый файл — типы для NativeWind v5 |
| `app.json` | добавлен `newArchEnabled: true`, `predictiveBackGestureEnabled: false` |
| Android edge-to-edge | принудительно в RN 0.81, `StatusBar translucent` в layout |
| `@types/react-native` | убран (типы встроены в `react-native` с RN 0.73+) |

## Структура проекта

```
master-app/
├── app/                        # Expo Router — экраны
│   ├── _layout.tsx             # Root: провайдеры, AuthGuard
│   ├── (auth)/                 # Авторизация
│   │   ├── welcome.tsx
│   │   ├── phone.tsx
│   │   ├── otp.tsx
│   │   └── register.tsx
│   ├── (client)/               # Таб-навигация клиента
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── orders/create.tsx
│   │   ├── chats.tsx
│   │   └── profile.tsx
│   ├── (specialist)/           # Таб-навигация специалиста
│   │   ├── orders.tsx
│   │   ├── responses.tsx
│   │   ├── chats.tsx
│   │   ├── earnings.tsx
│   │   └── profile.tsx
│   ├── specialist/[id].tsx     # Профиль специалиста
│   ├── order/[id].tsx          # Детали заказа + эскроу
│   └── chat/[id].tsx           # Чат с WebSocket
│
├── src/
│   ├── types/index.ts
│   ├── constants/index.ts
│   ├── store/authStore.ts
│   ├── services/api.ts
│   ├── services/authService.ts
│   └── components/
│       ├── ui/Button.tsx
│       ├── ui/index.tsx
│       ├── client/SpecialistCard.tsx
│       └── shared/{ChatsList,ProfileScreen}.tsx
│
├── metro.config.js             # NativeWind v5 / SDK 54
├── postcss.config.mjs          # Tailwind PostCSS
├── nativewind-env.d.ts         # Типы NativeWind v5
├── global.css                  # @import "tailwindcss"
├── tailwind.config.js          # react-native-css preset
├── babel.config.js             # без reanimated/plugin
└── app.json                    # newArchEnabled: true
```


## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить в режиме разработки
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Переменные окружения

Создайте `.env.local`:
```
EXPO_PUBLIC_API_URL=https://api.master.kz/v1
EXPO_PUBLIC_WS_URL=wss://api.master.kz
```

## Структура проекта

```
master-app/
├── app/                        # Expo Router — экраны
│   ├── _layout.tsx             # Root: провайдеры, AuthGuard
│   ├── auth/                   # Авторизация
│   │   ├── welcome.tsx         # Онбординг
│   │   ├── phone.tsx           # Ввод телефона
│   │   ├── otp.tsx             # Код подтверждения
│   │   └── register.tsx        # Регистрация
│   ├── client/                 # Таб-навигация клиента
│   │   ├── home.tsx            # Главная + AI-поиск
│   │   ├── search.tsx          # Поиск специалистов
│   │   ├── orders/
│   │   │   ├── index.tsx       # Мои заказы
│   │   │   └── create.tsx      # Создать заказ (3 шага)
│   │   ├── chats.tsx           # Мои чаты
│   │   └── profile.tsx         # Профиль
│   ├── specialist/             # Таб-навигация специалиста
│   │   ├── orders.tsx          # Лента заказов
│   │   ├── responses.tsx       # Мои отклики
│   │   ├── chats.tsx           # Чаты
│   │   ├── earnings.tsx        # Доход
│   │   └── profile.tsx         # Профиль
│   ├── admin/                  # Панель администратора
│   │   └── dashboard.tsx
│   ├── specialist/[id].tsx     # Профиль специалиста (TODO)
│   └── order/[id].tsx          # Детали заказа (TODO)
│
├── src/
│   ├── types/index.ts          # Все TypeScript типы
│   ├── constants/index.ts      # Цвета, категории, ключи
│   ├── store/
│   │   └── authStore.ts        # Zustand auth + MMKV
│   ├── services/
│   │   ├── api.ts              # Axios + token refresh
│   │   └── authService.ts      # Auth API методы
│   └── components/
│       ├── ui/                 # Переиспользуемые компоненты
│       │   ├── Button.tsx
│       │   └── index.tsx       # EmptyState, Skeleton, Error
│       └── client/
│           └── SpecialistCard.tsx
│
├── global.css                  # NativeWind base
├── tailwind.config.js          # Design tokens
├── babel.config.js             # NativeWind + module-resolver
├── tsconfig.json               # Path aliases
└── app.json                    # Expo config
```

## Роли и навигация

```
Не авторизован  →  /(auth)/welcome → phone → otp → register
Клиент          →  /(client)/home  (5 табов)
Специалист      →  /(specialist)/orders (5 табов)
Администратор   →  /(admin)/dashboard
```

## Следующие шаги

- [ ] Специалист `[id].tsx` — полный профиль + видео-портфолио
- [ ] Заказ `[id].tsx` — детали + отклики
- [ ] Чат — WebSocket + медиа
- [ ] Эскроу — Stripe/CloudPayments интеграция
- [ ] AI-сервис — LLM для ранжирования специалистов
- [ ] Push-уведомления — Firebase
- [ ] Профиль специалиста — видео-загрузка
