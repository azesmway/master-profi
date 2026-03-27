import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Page header ───────────────────────────────────────────
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(24)
  },
  pageTitle: { fontSize: s(24), fontWeight: '700' },
  editBtn: { fontWeight: '600', fontSize: s(14), color: '#FF6B35' },

  // ── Avatar section ────────────────────────────────────────
  avatarSection: { alignItems: 'center', marginBottom: vs(24) },
  avatarOuter: { position: 'relative' },
  avatar: { width: s(100), height: s(100), borderRadius: s(50) },
  avatarPlaceholder: {
    width: s(100),
    height: s(100),
    borderRadius: s(50),
    backgroundColor: '#10B981',
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
  partnerBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: s(14),
    paddingVertical: vs(6),
    borderRadius: s(20),
    marginTop: vs(8)
  },
  partnerBadgeText: { color: '#10B981', fontWeight: '700', fontSize: s(13) },

  // ── Info card ─────────────────────────────────────────────
  infoCard: { gap: vs(16) },
  fieldLabel: { fontSize: s(12), marginBottom: vs(6) },
  fieldInput: { paddingVertical: vs(10) },
  fieldValue: { fontSize: s(14), fontWeight: '600' },

  // ── Menu ──────────────────────────────────────────────────
  menuCard: { gap: 0, marginTop: vs(16) },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    gap: s(12)
  },
  menuIcon: { fontSize: s(20) },
  menuLabel: { fontSize: s(15), flex: 1 },
  menuArrow: { fontSize: s(16) },
  menuDivider: { height: 1 },

  // ── Logout ────────────────────────────────────────────────
  logoutBtn: { marginTop: vs(24), borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: s(15) }
})

export default styles
