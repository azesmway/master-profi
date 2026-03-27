import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const profileStyles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    borderBottomWidth: 1
  },
  headerTitle: { fontSize: s(22), fontWeight: '700' },
  editBtn: { fontWeight: '600', fontSize: s(14), color: '#FF6B35' },

  // ── Avatar card ───────────────────────────────────────────
  avatarCard: { alignItems: 'center', paddingVertical: vs(24) },
  avatarOuter: { position: 'relative', marginBottom: vs(12) },
  avatar: { width: s(88), height: s(88), borderRadius: s(44) },
  avatarPlaceholder: {
    width: s(88),
    height: s(88),
    borderRadius: s(44),
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: { color: '#FF6B35', fontWeight: '700', fontSize: s(32) },
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
  avatarName: { fontSize: s(20), fontWeight: '700' },
  avatarPhone: { marginTop: vs(4), fontSize: s(14) },
  avatarCats: { fontSize: s(20), marginTop: vs(8) },

  // ── Online row ────────────────────────────────────────────
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginTop: vs(12)
  },
  onlineDot: { width: s(8), height: s(8), borderRadius: s(4) },
  onlineText: { fontSize: s(14) },

  // ── Stats row ─────────────────────────────────────────────
  statsRow: { flexDirection: 'row', gap: s(24), marginTop: vs(16) },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: s(18), fontWeight: '700', color: '#FF6B35' },
  statLabel: { fontSize: s(12) },

  // ── Edit form ─────────────────────────────────────────────
  formTitle: { fontSize: s(16), fontWeight: '700', marginBottom: -vs(4) },
  fieldLabel: { fontSize: s(12), marginBottom: vs(6) },
  bioInput: { height: vs(100), textAlignVertical: 'top', paddingTop: vs(10) },
  priceRow: { flexDirection: 'row', gap: s(10) },
  priceUnitRow: { flexDirection: 'row', gap: s(8), marginTop: vs(8) },
  priceUnitBtn: { paddingHorizontal: s(12), paddingVertical: vs(6), borderRadius: s(8) },
  priceUnitText: { fontSize: s(13) },
  categoryPicker: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },

  // ── Portfolio ─────────────────────────────────────────────
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12)
  },
  portfolioTitle: { fontWeight: '600', fontSize: s(16) },
  portfolioAddBtn: {
    backgroundColor: '#FF6B3515',
    borderWidth: 1,
    borderColor: '#FF6B3540',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(10)
  },
  portfolioAddText: { color: '#FF6B35', fontWeight: '600', fontSize: s(13) },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8) },
  portfolioImage: { width: s(100), height: s(100), borderRadius: s(12) },
  portfolioDeleteBtn: {
    position: 'absolute',
    top: vs(4),
    right: s(4),
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  portfolioDeleteText: { color: '#fff', fontSize: s(12), fontWeight: '700' },
  portfolioEmpty: {
    width: s(100),
    height: s(100),
    borderRadius: s(12),
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(4)
  },
  portfolioEmptyIcon: { fontSize: s(24) },
  portfolioEmptyText: { fontSize: s(11) },

  // ── Menu ──────────────────────────────────────────────────
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

  // ── Category modal ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    borderTopLeftRadius: s(24),
    borderTopRightRadius: s(24),
    padding: s(24),
    maxHeight: '80%'
  },
  modalTitle: { fontSize: s(20), fontWeight: '700', marginBottom: vs(16) },
  modalCatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10), marginBottom: vs(20) },
  modalCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: s(12),
    borderWidth: 1
  },
  modalCatText: { fontSize: s(13) },
  modalBtnRow: { flexDirection: 'row', gap: s(12) },

  // ── Verification ──────────────────────────────────────────
  verRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  verIcon: { fontSize: s(24) },
  verInfo: { flex: 1 },
  verTitle: { fontWeight: '600', fontSize: s(15) },
  verSubtitle: { fontSize: s(13), marginTop: vs(2) },
  verBtn: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginTop: vs(10)
  }
})
