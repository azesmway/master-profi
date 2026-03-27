import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1
  },
  title: { fontSize: s(24), fontWeight: '700' },

  // ── Balance card ──────────────────────────────────────────
  balanceCard: {
    backgroundColor: '#FF6B35',
    borderRadius: s(20),
    padding: s(24),
    borderWidth: 0
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: s(13), marginBottom: vs(4) },
  balanceAmount: { color: '#fff', fontSize: s(36), fontWeight: '800', marginBottom: vs(4) },
  balancePending: { color: 'rgba(255,255,255,0.7)', fontSize: s(13) },
  balanceBtnRow: { flexDirection: 'row', gap: s(8), marginTop: vs(16) },
  balanceBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: s(12),
    paddingVertical: vs(12),
    alignItems: 'center'
  },
  balanceBtnText: { color: '#fff', fontWeight: '600', fontSize: s(14) },

  // ── Stat card ─────────────────────────────────────────────
  statCardInner: { flex: 1, alignItems: 'center', paddingVertical: vs(16) },
  statValue: { fontSize: s(22), fontWeight: '800' },
  statLabel: { fontSize: s(12), marginTop: vs(4), textAlign: 'center' },
  statSub: { fontSize: s(11), marginTop: vs(2) },

  // ── Rows ──────────────────────────────────────────────────
  quickRow: { flexDirection: 'row', gap: s(12) },
  metricsRow: { flexDirection: 'row', gap: s(12) },

  // ── Chart ─────────────────────────────────────────────────
  chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', height: vs(80), gap: s(3) },
  chartDatesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: vs(4) },
  chartDateText: { fontSize: s(11) },

  // ── Forecast ──────────────────────────────────────────────
  forecastRow: { flexDirection: 'row', gap: s(12), marginBottom: vs(12) },
  forecastItem: { flex: 1, borderRadius: s(12), padding: s(12), alignItems: 'center' },
  forecastAmount: { fontWeight: '700', fontSize: s(16) },
  forecastPeriod: { fontSize: s(11) },
  tipRow: { flexDirection: 'row', gap: s(8), marginBottom: vs(6) },
  tipText: { flex: 1, fontSize: s(13) },

  // ── Transaction row ───────────────────────────────────────
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    gap: s(12),
    borderBottomWidth: 1
  },
  txIconWrap: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    alignItems: 'center',
    justifyContent: 'center'
  },
  txIconText: { fontSize: s(18) },
  txInfo: { flex: 1 },
  txDesc: { fontSize: s(14) },
  txDate: { fontSize: s(12) },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontWeight: '700', fontSize: s(15) },
  txCommission: { fontSize: s(11) },

  // ── Section title ─────────────────────────────────────────
  sectionTitle: { fontSize: s(18), fontWeight: '700', marginBottom: vs(12) },

  // ── Empty ─────────────────────────────────────────────────
  emptyCard: { alignItems: 'center', paddingVertical: vs(32) },
  emptyIcon: { fontSize: s(36), marginBottom: vs(8) },
  emptyText: { textAlign: 'center', marginTop: vs(4) }
})

export default styles
