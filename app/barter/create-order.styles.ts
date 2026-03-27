import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12)
  },
  backBtn: { color: '#FF6B35', fontSize: s(16) },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: s(18), fontWeight: '700' },
  headerSubtitle: { fontSize: s(12) },
  headerBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: '#8B5CF640'
  },
  headerBadgeText: { color: '#8B5CF6', fontWeight: '700', fontSize: s(12) },

  // ── Info banner ───────────────────────────────────────────
  infoBanner: {
    backgroundColor: '#8B5CF615',
    borderWidth: 1,
    borderColor: '#8B5CF630',
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    gap: s(10),
    alignItems: 'flex-start'
  },
  infoBannerIcon: { fontSize: s(20) },
  infoBannerTitle: { color: '#8B5CF6', fontWeight: '700', marginBottom: vs(4), fontSize: s(14) },
  infoBannerText: { fontSize: s(13), lineHeight: s(18) },

  // ── Field label ───────────────────────────────────────────
  fieldLabel: { marginBottom: vs(8), fontSize: s(14) },
  fieldLabelSm: { marginBottom: vs(6), fontSize: s(13) },
  errorText: { color: '#EF4444', fontSize: s(12), marginTop: vs(4) },

  // ── Category chip ─────────────────────────────────────────
  catChip: {
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: s(14),
    borderWidth: 1
  },
  catChipIcon: { fontSize: s(20), marginBottom: vs(4) },
  catChipText: { fontSize: s(10), textAlign: 'center' },

  // ── Barter offer input ────────────────────────────────────
  barterInput: {
    height: vs(110),
    textAlignVertical: 'top',
    paddingTop: vs(12),
    borderColor: '#8B5CF640',
    borderWidth: 1.5
  },
  descInput: {
    height: vs(90),
    textAlignVertical: 'top',
    paddingTop: vs(12)
  },

  // ── City chip ─────────────────────────────────────────────
  cityChip: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(20),
    borderWidth: 1
  },
  cityChipText: { fontSize: s(13) },

  // ── Partner section ───────────────────────────────────────
  partnerSectionTitle: { fontSize: s(15), fontWeight: '600' },
  commissionRow: { flexDirection: 'row', gap: s(8) },
  commissionBtn: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: s(12),
    borderWidth: 1,
    alignItems: 'center'
  },
  commissionBtnText: { fontWeight: '700', fontSize: s(14) },

  // ── Submit button ─────────────────────────────────────────
  submitBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: s(16) }
})

export default styles
