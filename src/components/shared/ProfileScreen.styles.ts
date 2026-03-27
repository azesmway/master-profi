import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: s(20), paddingTop: vs(16), paddingBottom: vs(8) },
  pageTitle: { fontSize: s(24), fontWeight: '700' },
  userCard: {
    marginHorizontal: s(20),
    marginTop: vs(8),
    marginBottom: vs(20),
    borderRadius: s(16),
    borderWidth: 1,
    padding: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16)
  },
  avatarCircle: {
    width: s(64),
    height: s(64),
    borderRadius: s(16),
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#FF6B35', fontWeight: '700', fontSize: s(20) },
  userInfo: { flex: 1 },
  userName: { fontSize: s(18), fontWeight: '700' },
  userPhone: { fontSize: s(14), marginTop: vs(2) },
  badgeRow: { flexDirection: 'row', marginTop: vs(6) },
  roleBadge: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(6)
  },
  roleBadgeText: { color: '#FF6B35', fontSize: s(12), fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: s(20),
    marginBottom: vs(20),
    gap: s(12)
  },
  statCard: {
    flex: 1,
    borderRadius: s(12),
    borderWidth: 1,
    paddingVertical: vs(12),
    alignItems: 'center',
    gap: vs(2)
  },
  statIcon: { fontSize: s(16) },
  statValue: { fontWeight: '700', fontSize: s(14) },
  statLabel: { fontSize: s(12) },
  notifRow: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    borderRadius: s(16),
    borderWidth: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12)
  },
  notifIcon: { fontSize: s(20) },
  notifText: { flex: 1, fontSize: s(14), fontWeight: '500' },
  notifArrow: { fontSize: s(18) },
  menuSection: { marginHorizontal: s(20), marginBottom: vs(12) },
  menuSectionTitle: { fontSize: s(12), fontWeight: '600', marginBottom: vs(8), marginLeft: s(4), textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { borderRadius: s(16), borderWidth: 1, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    gap: s(12)
  },
  menuIcon: { fontSize: s(20), width: s(28), textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: s(15) },
  badge: {
    backgroundColor: '#FF6B35',
    borderRadius: s(10),
    minWidth: s(20),
    height: s(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(5)
  },
  badgeText: { color: '#fff', fontSize: s(11), fontWeight: '700' },
  menuArrow: { fontSize: s(18) },
  menuDivider: { height: 1 },
  version: { textAlign: 'center', fontSize: s(12), marginVertical: vs(24) },
  notifLeft: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  notifLabel: { fontWeight: '500', fontSize: s(14) },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: s(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: s(8),
    marginLeft: s(4)
  },
  sectionCard: { borderRadius: s(16), borderWidth: 1, overflow: 'hidden' }
})
