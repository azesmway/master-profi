import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Page header ───────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    borderBottomWidth: 1
  },
  backBtn: { marginRight: s(12) },
  backIcon: { color: '#FF6B35', fontSize: s(24) },
  headerTitle: { flex: 1, fontSize: s(18), fontWeight: '700' },

  // ── Page content wrapper ──────────────────────────────────
  page: { padding: s(20), gap: vs(16) },

  // ── Hero card ─────────────────────────────────────────────
  heroCard: { alignItems: 'center', paddingVertical: vs(24) },
  avatarWrap: { position: 'relative', marginBottom: vs(12) },
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
  onlineDot: {
    position: 'absolute',
    bottom: vs(2),
    right: s(2),
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    backgroundColor: '#22C55E',
    borderWidth: 2
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: s(6), marginBottom: vs(4) },
  heroName: { fontSize: s(20), fontWeight: '700' },
  verifiedBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(6)
  },
  verifiedText: { color: '#3B82F6', fontSize: s(12), fontWeight: '600' },
  heroStatus: { marginBottom: vs(12), fontSize: s(13) },
  statsRow: { flexDirection: 'row', gap: s(24) },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: s(20), fontWeight: '700' },
  statRating: { fontSize: s(20), fontWeight: '700', color: '#F59E0B' },
  statPrice: { fontSize: s(20), fontWeight: '700', color: '#FF6B35' },
  statLabel: { fontSize: s(11) },

  // ── Section title row ─────────────────────────────────────
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12)
  },
  sectionTitle: { fontSize: s(18), fontWeight: '700' },
  addReviewBtn: {
    backgroundColor: '#FF6B3515',
    borderWidth: 1,
    borderColor: '#FF6B3540',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(10)
  },
  addReviewText: { color: '#FF6B35', fontSize: s(13), fontWeight: '600' },

  // ── Rating summary card ───────────────────────────────────
  ratingSummary: { flexDirection: 'row', gap: s(16), marginBottom: vs(12) },
  ratingAvgWrap: { alignItems: 'center', justifyContent: 'center' },
  ratingAvgNum: { fontSize: s(40), fontWeight: '700' },
  ratingAvgCount: { fontSize: s(11), marginTop: vs(4) },

  // ── Rating bars ───────────────────────────────────────────
  ratingBarsWrap: { gap: vs(6) },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  ratingBarNum: { fontSize: s(12), width: s(8) },
  ratingBarStar: { fontSize: s(11), color: '#F59E0B' },
  ratingBarTrack: { flex: 1, height: vs(6), borderRadius: s(3) },
  ratingBarFill: { height: vs(6), backgroundColor: '#FF6B35', borderRadius: s(3) },
  ratingBarCount: { fontSize: s(11), width: s(20) },

  // ── Portfolio item ────────────────────────────────────────
  portfolioItem: { width: s(140), height: s(140), borderRadius: s(14), overflow: 'hidden' },
  portfolioImg: { width: s(140), height: s(140) },

  // ── Review card ───────────────────────────────────────────
  reviewsGap: { gap: vs(12) },
  reviewCard: { gap: vs(10) },
  reviewAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  reviewAvatar: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewAvatarImg: { width: s(36), height: s(36), borderRadius: s(18) },
  reviewAvatarText: { color: '#FF6B35', fontWeight: '700', fontSize: s(12) },
  reviewAuthorInfo: { flex: 1 },
  reviewAuthorName: { fontSize: s(14), fontWeight: '600' },
  reviewDate: { fontSize: s(11) },
  reviewMeta: { alignItems: 'flex-end', gap: vs(2) },
  reviewVerified: { color: '#22C55E', fontSize: s(10), fontWeight: '600' },
  reviewText: { lineHeight: s(20), fontSize: s(14) },
  reviewReply: { borderRadius: s(10), padding: s(10), marginTop: vs(4) },
  reviewReplyLabel: { fontSize: s(11), marginBottom: vs(4) },
  reviewReplyText: { fontSize: s(13) },

  // ── No reviews ────────────────────────────────────────────
  noReviewsCard: { alignItems: 'center', paddingVertical: vs(24) },
  noReviewsIcon: { fontSize: s(32), marginBottom: vs(8) },
  noReviewsText: { textAlign: 'center', marginTop: vs(4), fontSize: s(13) },

  // ── CTA bar ───────────────────────────────────────────────
  ctaBar: {
    paddingHorizontal: s(20),
    paddingTop: vs(12),
    borderTopWidth: 1
  },

  // ── Review modal ──────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: s(24), borderTopRightRadius: s(24), padding: s(24), gap: vs(16) },
  modalTitle: { fontSize: s(20), fontWeight: '700' },
  starsRow: { flexDirection: 'row', gap: s(8) },
  starBtn: { fontSize: s(36) },
  reviewInput: { height: vs(100), textAlignVertical: 'top', paddingTop: vs(12) },
  modalBtnRow: { flexDirection: 'row', gap: s(12) }
})

export default styles
