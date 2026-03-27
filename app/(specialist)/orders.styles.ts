import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const ordersStyles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: s(24), fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  onlineDot: { width: s(8), height: s(8), borderRadius: s(4), backgroundColor: '#22C55E' },
  onlineText: { fontSize: s(14), fontWeight: '500', color: '#22C55E' },

  // ── Category filter ───────────────────────────────────────
  filterWrap: { marginBottom: vs(12) },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: s(12),
    borderWidth: 1
  },
  catChipIcon: { fontSize: s(14) },
  catChipText: { fontSize: s(14), fontWeight: '500' },

  // ── List header ───────────────────────────────────────────
  listHeader: { fontSize: s(13), marginBottom: vs(4) },

  // ── Empty ─────────────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingVertical: vs(64) },
  emptyIcon: { fontSize: s(48), marginBottom: vs(16) },
  emptyTitle: { fontSize: s(18), fontWeight: '600', marginBottom: vs(8) },
  emptySubtitle: { fontSize: s(14), textAlign: 'center' },

  // ── Order card ────────────────────────────────────────────
  card: {
    borderRadius: s(20),
    borderWidth: 1,
    padding: s(16)
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vs(8)
  },
  cardCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    flex: 1,
    marginRight: s(12)
  },
  cardCatIcon: { fontSize: s(18) },
  cardCatName: { fontSize: s(12) },
  cardTime: { fontSize: s(12) },
  cardTitle: { fontSize: s(15), fontWeight: '600', marginBottom: vs(4) },
  cardDesc: { fontSize: s(13), marginBottom: vs(12) },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  cardCity: { fontSize: s(12) },
  cardResponseBadge: {
    backgroundColor: '#FF6B3515',
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(6)
  },
  cardResponseText: { color: '#FF6B35', fontSize: s(12), fontWeight: '500' },
  cardBudget: { fontSize: s(14), fontWeight: '600' },
  cardBudgetUnit: { fontSize: s(12), fontWeight: '400' }
})
