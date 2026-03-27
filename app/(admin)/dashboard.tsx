import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

export default function AdminDashboard() {
  const { colors } = useTheme()
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Admin Dashboard</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' }
})
