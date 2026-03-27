import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Search bar ────────────────────────────────────────────
  searchBarWrap: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(12)
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  searchIcon: { fontSize: s(16), paddingHorizontal: s(12) },
  searchInput: {
    flex: 1,
    fontSize: s(14),
    paddingVertical: vs(14)
  },
  searchClearBtn: { paddingHorizontal: s(12) },
  searchCancelBtn: { fontSize: s(14), fontWeight: '500', color: '#FF6B35' },

  // ── Category chip ─────────────────────────────────────────
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: s(20),
    borderWidth: 1
  },
  catChipIcon: { fontSize: s(14) },
  catChipText: { fontSize: s(13), fontWeight: '500' },

  // ── Sort chip ─────────────────────────────────────────────
  sortChip: {
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: s(20),
    borderWidth: 1
  },
  sortChipText: { fontSize: s(13) },

  // ── Status line ───────────────────────────────────────────
  statusText: { fontSize: s(13), marginBottom: vs(4) },

  // ── AI badge ──────────────────────────────────────────────
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: '#FF6B3515',
    borderWidth: 1,
    borderColor: '#FF6B3530',
    borderRadius: s(12),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    marginBottom: vs(12)
  },
  aiBadgeIcon: { fontSize: s(16) },
  aiBadgeText: { color: '#FF6B35', fontSize: s(13), fontWeight: '500', flex: 1 },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingVertical: vs(48) },
  emptyIcon: { fontSize: s(48), marginBottom: vs(12) },
  emptyTitle: { fontSize: s(18), fontWeight: '600', marginBottom: vs(8) },
  emptySubtitle: { fontSize: s(14), textAlign: 'center' },
  emptyBtn: {
    marginTop: vs(16),
    backgroundColor: '#FF6B35',
    paddingHorizontal: s(24),
    paddingVertical: vs(12),
    borderRadius: s(12)
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: s(14) },

  // ── Error state ───────────────────────────────────────────
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(20) },
  errorIcon: { fontSize: s(40), marginBottom: vs(12) },
  errorTitle: { fontSize: s(16), fontWeight: '600', marginBottom: vs(8) },
  errorBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
    borderRadius: s(12)
  },
  errorBtnText: { color: '#fff', fontWeight: '600', fontSize: s(14) }
})

export default styles
