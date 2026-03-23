import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // animation вызывает баг на New Architecture в Expo Router ~4.x
        // используем платформо-зависимый вариант через animationTypeForReplace
        animation: Platform.OS === 'ios' ? 'default' : 'none',
        contentStyle: { backgroundColor: '#0F0F0F' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
