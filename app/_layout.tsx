if (__DEV__) {
  require('@/config/reactotron')
}

import '../global.css'

import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold, useFonts } from '@expo-google-fonts/manrope'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { QUERY_KEYS } from '@/constants'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useSocket } from '@/hooks/useSocket'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false
    }
  }
})

function GlobalPushListener() {
  usePushNotifications()
  return null
}

function GlobalSocketListener() {
  const queryGlobalClient = useQueryClient()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  useSocket({
    onMessage: () => {
      // Обновляем список чатов при любом новом сообщении
      queryGlobalClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_ROOMS] })
    }
  })

  return null
}

function AuthGuard() {
  const router = useRouter()
  const segments = useSegments()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isHydrated = useAuthStore(s => s.isHydrated)
  const userRole = useAuthStore(s => s.user?.role)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !isHydrated) return
    const inAuthGroup = segments[0] === '(auth)'
    // @ts-ignore
    const inOnboarding = segments[0] === 'onboarding'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome')
      return
    }

    if (isAuthenticated && !inAuthGroup && !inOnboarding) return

    if (isAuthenticated && inAuthGroup) {
      AsyncStorage.getItem('onboarding_done').then(done => {
        if (!done) {
          // @ts-ignore
          router.replace('/onboarding')
          return
        }
        switch (userRole) {
          case 'specialist':
            router.replace('/(specialist)/orders')
            break
          case 'admin':
            router.replace('/(admin)/dashboard')
            break
          default:
            router.replace('/(client)/home')
            break
        }
      })
    }
  }, [isMounted, isAuthenticated, isHydrated, segments, userRole])

  return null
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold
  })

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* View с className — NativeWind применяет dark: классы через этот элемент */}
        <View style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#FFFFFF' }} className={isDark ? 'flex-1 dark' : 'flex-1'}>
          <StatusBar style={isDark ? 'light' : 'dark'} translucent />
          <AuthGuard />
          <GlobalSocketListener />
          <GlobalPushListener />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(client)" />
            <Stack.Screen name="(specialist)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="specialist" />
            <Stack.Screen name="order" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="create-order" options={{ presentation: 'modal' }} />
            <Stack.Screen name="ai-chat" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          </Stack>
        </View>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}
