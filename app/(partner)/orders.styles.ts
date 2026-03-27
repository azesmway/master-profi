import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const partnerOrdersStyles = StyleSheet.create({
  // ── List header ───────────────────────────────────────────
  listHeader: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listHeaderTitle: { fontSize: s(22), fontWeight: '700' },
  createBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(12)
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: s(13) },

  // ── Stats row ─────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: s(10),
    paddingHorizontal: s(20),
    marginBottom: vs(16)
  },
  statCard: { flex: 1, alignItems: 'center', padding: s(14) },
  statValue: { fontWeight: '800', fontSize: s(18) },
  statLabel: { fontSize: s(11) },

  // ── Card header ───────────────────────────────────────────
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardTitleWrap: { flex: 1, marginRight: s(8) },
  cardTitle: { fontSize: s(15), fontWeight: '600' },
  cardCatName: { fontSize: s(12), marginTop: vs(2) },
  statusBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(20)
  },
  statusBadgeText: { fontSize: s(11), fontWeight: '700' },

  // ── Financials box ────────────────────────────────────────
  financialsBox: {
    borderRadius: s(12),
    padding: s(12),
    gap: vs(6)
  },
  finRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finDivider: { height: 1 },
  finTotalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finTotalLabel: { color: '#22C55E', fontWeight: '600', fontSize: s(14) },
  finTotalValue: { color: '#22C55E', fontWeight: '800', fontSize: s(14) },
  finCommission: { color: '#FF6B35', fontWeight: '600', fontSize: s(14) },
  finPlatformCut: { color: '#EF4444', fontSize: s(14) },

  // ── Client info ───────────────────────────────────────────
  clientRow: { flexDirection: 'row', gap: s(16) },
  clientText: { fontSize: s(13) },

  // ── Card item wrapper ─────────────────────────────────────
  cardItem: { paddingHorizontal: s(20), marginBottom: vs(12) },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingVertical: vs(48) },
  emptyIcon: { fontSize: s(48), marginBottom: vs(12) },
  emptyTitle: { fontSize: s(18), marginBottom: vs(8) },
  emptySubtitle: { textAlign: 'center', marginBottom: vs(20) }
})
