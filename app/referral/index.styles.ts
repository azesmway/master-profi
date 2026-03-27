import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── List header ───────────────────────────────────────────
  headerRow: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12)
  },
  backBtn: { color: '#FF6B35', fontSize: s(16) },
  headerTitle: { fontSize: s(22), fontWeight: '700' },

  // ── Hero banner ───────────────────────────────────────────
  heroWrap: { marginHorizontal: s(20), marginVertical: vs(12) },
  heroBanner: {
    backgroundColor: '#FF6B35',
    borderRadius: s(24),
    padding: s(24),
    alignItems: 'center'
  },
  heroIcon: { fontSize: s(48), marginBottom: vs(8) },
  heroTitle: { color: '#fff', fontSize: s(22), fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { color: '#ffffff99', fontSize: s(14), textAlign: 'center', marginTop: vs(8), lineHeight: s(20) },

  // ── Stats row ─────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: s(12),
    paddingHorizontal: s(20),
    marginBottom: vs(12)
  },
  statCard: { flex: 1, alignItems: 'center', padding: s(16) },
  statValueOrange: { color: '#FF6B35', fontWeight: '800', fontSize: s(24) },
  statValueGreen: { color: '#22C55E', fontWeight: '800', fontSize: s(24) },
  statValueYellow: { color: '#F59E0B', fontWeight: '800', fontSize: s(24) },
  statLabel: { fontSize: s(12), marginTop: vs(2) },

  // ── Referral code card ────────────────────────────────────
  codeCard: { marginHorizontal: s(20), marginBottom: vs(12), gap: vs(12) },
  codeBox: {
    borderRadius: s(14),
    padding: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  codeText: { color: '#FF6B35', fontWeight: '800', fontSize: s(20), letterSpacing: 3 },
  copyText: { fontSize: s(13) },

  // ── How it works ──────────────────────────────────────────
  howCard: { marginHorizontal: s(20), marginBottom: vs(20), gap: vs(14) },
  howStep: { flexDirection: 'row', gap: s(12), alignItems: 'flex-start' },
  howStepIcon: { fontSize: s(18) },
  howStepText: { flex: 1, lineHeight: s(20), fontSize: s(14) },

  // ── Referrals list header ─────────────────────────────────
  listTitle: { fontSize: s(18), paddingHorizontal: s(20), marginBottom: vs(12) },

  // ── Referral item ─────────────────────────────────────────
  referralItem: { marginHorizontal: s(20), marginBottom: vs(8) },
  referralRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  referralLeft: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  referralAvatar: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center'
  },
  referralAvatarText: { color: '#FF6B35', fontWeight: '700', fontSize: s(16) },
  referralName: { fontSize: s(14), fontWeight: '600' },
  referralDate: { fontSize: s(12) },
  referralRight: { alignItems: 'flex-end', gap: vs(4) },
  referralBonus: { color: '#22C55E', fontSize: s(12), fontWeight: '600' },

  // ── Status badge ──────────────────────────────────────────
  statusBadge: { paddingHorizontal: s(10), paddingVertical: vs(4), borderRadius: s(20) },
  statusBadgeText: { fontSize: s(11), fontWeight: '700' },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingVertical: vs(32) },
  emptyIcon: { fontSize: s(40), marginBottom: vs(8) },
  emptyText: { textAlign: 'center', fontSize: s(14) }
})

export default styles
