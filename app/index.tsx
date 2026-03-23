import { Redirect } from 'expo-router'
import { useColorScheme as useNativeWindScheme } from 'nativewind'
import { Text, useColorScheme, View } from 'react-native'

export default function Index() {
  return <Redirect href="/(auth)/welcome" />
}
