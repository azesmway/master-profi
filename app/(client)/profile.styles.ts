import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(24),
    paddingHorizontal: s(20)
  },
  pageTitle: { fontSize: s(24), fontWeight: '700' },
  editBtn: { color: '#FF6B35', fontWeight: '600', fontSize: s(14) },
  avatarSection: { alignItems: 'center', marginBottom: vs(24) },
  avatarOuter: { position: 'relative' },
  avatar: { width: s(100), height: s(100), borderRadius: s(50), borderWidth: 1, borderColor: '#e6e6e6' },
  avatarPlaceholder: {
    width: s(100),
    height: s(100),
    borderRadius: s(50),
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: { color: '#fff', fontSize: s(36), fontWeight: '700' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: { fontSize: s(14) },
  avatarName: { fontSize: s(20), fontWeight: '700', marginTop: vs(12) },
  avatarPhone: { fontSize: s(14), marginTop: vs(4) },
  infoCard: { gap: s(16) },
  fieldLabel: { fontSize: s(12), marginBottom: vs(6) },
  fieldInput: { paddingVertical: vs(10) },
  fieldValue: { fontSize: s(14), fontWeight: '600' },
  saveBtn: { marginTop: vs(16) },
  statsCard: { flexDirection: 'row', marginTop: vs(16) },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: s(22), fontWeight: '700' },
  statLabel: { fontSize: s(12), marginTop: vs(2) },
  menuCard: { gap: 0, marginTop: vs(16) },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    gap: s(12)
  },
  menuIcon: { fontSize: s(20) },
  menuLabel: { fontSize: s(14), fontWeight: '500', flex: 1 },
  menuArrow: { fontSize: s(16) },
  menuDivider: { height: 1 },
  logoutBtn: { marginTop: vs(24), borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: s(15) },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 20,
    fontWeight: '700' as const
  }
})

export default styles
