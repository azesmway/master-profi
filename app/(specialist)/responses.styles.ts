import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const responsesStyles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1
  },
  headerTitle: { fontSize: s(24), fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: s(16), marginTop: vs(8) },
  statText: { fontSize: s(13) },
  statValue: { fontWeight: '600' },

  // ── Response card ─────────────────────────────────────────
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
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

  // ── Offer box ─────────────────────────────────────────────
  offerBox: {
    borderRadius: s(10),
    padding: s(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  offerLabel: { fontSize: s(11) },
  offerPrice: { fontSize: s(18), color: '#FF6B35' },
  deliveryWrap: { alignItems: 'flex-end' },
  deliveryLabel: { fontSize: s(11) },
  deliveryValue: { fontSize: s(13) },

  // ── Comment ───────────────────────────────────────────────
  comment: { fontSize: s(13) },

  // ── Footer ────────────────────────────────────────────────
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardFooterLeft: { flexDirection: 'row', gap: s(8), alignItems: 'center' },
  budgetText: { fontSize: s(12) },
  dateText: { fontSize: s(11) },

  // ── Order status row ──────────────────────────────────────
  orderStatusRow: {
    borderTopWidth: 1,
    paddingTop: vs(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6)
  },
  orderStatusDot: { width: s(6), height: s(6), borderRadius: s(3) },
  orderStatusText: { fontSize: s(12) },
  chatLink: { color: '#FF6B35', fontSize: s(12), marginLeft: 'auto' },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(32) },
  emptyIcon: { fontSize: s(64), marginBottom: vs(16) },
  emptyTitle: { fontSize: s(20), textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', marginTop: vs(8), lineHeight: s(22) }
})
