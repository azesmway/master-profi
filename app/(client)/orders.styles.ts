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
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: s(24), fontWeight: '700' },
  createBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(12)
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: s(14) },

  // ── Order card ────────────────────────────────────────────
  cardGap: { gap: 0 },

  // ── Card top row: status badge + date ─────────────────────
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8)
  },
  statusBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
    borderWidth: 1
  },
  statusBadgeText: { fontSize: s(12), fontWeight: '600' },
  cardDate: { fontSize: s(12) },

  // ── Card body ─────────────────────────────────────────────
  cardTitle: { fontSize: s(16), fontWeight: '600', marginBottom: vs(6) },
  cardDesc: { fontSize: s(13) },

  // ── Card footer ───────────────────────────────────────────
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    marginTop: vs(10),
    paddingTop: vs(10),
    borderTopWidth: 1
  },
  cardCity: { fontSize: s(12) },
  responseBadge: {
    backgroundColor: '#FF6B3520',
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(8)
  },
  responseBadgeText: { color: '#FF6B35', fontSize: s(12), fontWeight: '600' },
  cardBudget: { fontSize: s(12), marginLeft: 'auto' },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingVertical: vs(64) },
  emptyIcon: { fontSize: s(48), marginBottom: vs(12) },
  emptyTitle: { fontSize: s(20), fontWeight: '700', marginBottom: vs(8) },
  emptySubtitle: { textAlign: 'center', marginBottom: vs(20), fontSize: s(14) },
  emptyBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: s(24),
    paddingVertical: vs(12),
    borderRadius: s(14)
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: s(14) }
})

export default styles
