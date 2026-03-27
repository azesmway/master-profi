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
  headerTitle: { flex: 1, fontSize: s(18), fontWeight: '700' },
  headerStep: { fontSize: s(14) },

  // ── Progress bar ──────────────────────────────────────────
  progressWrap: { paddingHorizontal: s(20), marginBottom: vs(16) },
  progressTrack: { height: vs(4), borderRadius: s(2) },
  progressFill: { height: vs(4), borderRadius: s(2), backgroundColor: '#FF6B35' },

  // ── Step title ────────────────────────────────────────────
  stepTitle: { fontSize: s(22), fontWeight: '700' },
  stepSubtitle: { lineHeight: s(20) },

  // ── Field label / error ───────────────────────────────────
  fieldLabel: { marginBottom: vs(8), fontSize: s(14) },
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

  // ── City chip ─────────────────────────────────────────────
  cityChip: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(20),
    borderWidth: 1
  },
  cityChipText: { fontSize: s(13) },

  // ── Commission grid ───────────────────────────────────────
  commissionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10) },
  commissionBtn: {
    width: '30%',
    paddingVertical: vs(14),
    borderRadius: s(14),
    borderWidth: 2,
    alignItems: 'center'
  },
  commissionBtnValue: { fontSize: s(20), fontWeight: '800' },
  commissionBtnNet: { fontSize: s(10), marginTop: vs(2) },

  // ── Commission breakdown card ─────────────────────────────
  breakdownCard: { gap: vs(8) },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownDivider: { height: 1 },
  breakdownTotalLabel: { color: '#22C55E', fontWeight: '700', fontSize: s(14) },
  breakdownTotalValue: { color: '#22C55E', fontWeight: '800', fontSize: s(18) },
  breakdownCut: { color: '#EF4444', fontWeight: '600', fontSize: s(14) },

  // ── Next / submit button ──────────────────────────────────
  nextBtn: { marginBottom: vs(8) },
  submitBtn: { marginBottom: vs(8) }
})

export default styles
