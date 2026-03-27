import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { APP_VERSION } from '@/constants'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store/authStore'

interface MenuItem {
  icon: string
  label: string
  onPress: () => void
  badge?: string
  danger?: boolean
}

interface Section {
  title?: string
  items: MenuItem[]
}

interface ProfileScreenProps {
  sections: Section[]
}

export default function ProfileScreen({ sections }: ProfileScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const user = useAuthStore(s => s.user)
  const isSpecialist = user?.role === 'specialist'
  const [notificationsOn, setNotificationsOn] = useState(true)

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Профиль</Text>
        </View>

        {/* User card */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Профиль'}</Text>
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user?.phone}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{isSpecialist ? '🛠️ Специалист' : '🔍 Клиент'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats (specialist only) */}
        {isSpecialist && (
          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.statsRow}>
            {[
              { icon: '📋', label: 'Заказов', value: '0' },
              { icon: '★', label: 'Рейтинг', value: '—' },
              { icon: '💰', label: 'Доход', value: '0 ₸' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Notifications toggle */}
        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={[styles.notifRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.notifLeft}>
            <Text style={styles.notifIcon}>🔔</Text>
            <Text style={[styles.notifLabel, { color: colors.text }]}>Push-уведомления</Text>
          </View>
          <Switch
            value={notificationsOn}
            onValueChange={setNotificationsOn}
            trackColor={{ false: '#2E2E2E', true: '#FF6B35' }}
            thumbColor="white"
          />
        </Animated.View>

        {/* Sections */}
        {sections.map((section, si) => (
          <Animated.View key={si} entering={FadeInDown.delay(220 + si * 60).springify()} style={styles.section}>
            {section.title ? (
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            ) : null}
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, ii) => (
                <Pressable
                  key={ii}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.menuItem,
                    ii < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.elevated },
                  ]}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: item.danger ? '#EF4444' : colors.text }]}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {!item.danger && (
                    <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}

        <Text style={[styles.version, { color: colors.textMuted }]}>Мастер v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 24, fontWeight: '700' },
  userCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FF6B35', fontWeight: '700', fontSize: 20 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700' },
  userPhone: { fontSize: 14, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  roleBadge: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: { fontSize: 16 },
  statValue: { fontWeight: '700', fontSize: 14 },
  statLabel: { fontSize: 12 },
  notifRow: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifIcon: { fontSize: 20 },
  notifLabel: { fontWeight: '500', fontSize: 14 },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15 },
  badge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  menuArrow: { fontSize: 20 },
  version: { fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 32 },
})
