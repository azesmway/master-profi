import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

import styles from './dashboard.styles'

export default function AdminDashboard() {
  const { colors } = useTheme()
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Admin Dashboard</Text>
    </View>
  )
}
