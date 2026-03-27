import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Page wrapper ──────────────────────────────────────────
  page: { paddingHorizontal: s(20), paddingTop: vs(16), gap: vs(16), paddingBottom: vs(20) },

  // ── Back button ───────────────────────────────────────────
  backBtn: { marginBottom: vs(12) },
  backText: { color: '#FF6B35', fontSize: s(16) },

  // ── Badges row ────────────────────────────────────────────
  badgesRow: { flexDirection: 'row', gap: s(8), marginBottom: vs(10), flexWrap: 'wrap' },
  badge: { paddingHorizontal: s(12), paddingVertical: vs(5), borderRadius: s(20) },
  badgeText: { fontSize: s(12), fontWeight: '700' },
  barterBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: '#8B5CF640'
  },
  barterBadgeText: { color: '#8B5CF6', fontSize: s(12), fontWeight: '700' },
  partnerBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderRadius: s(20)
  },
  partnerBadgeText: { color: '#10B981', fontSize: s(12), fontWeight: '700' },
  catBadge: { paddingHorizontal: s(12), paddingVertical: vs(5), borderRadius: s(20) },
  catBadgeText: { fontSize: s(12) },

  // ── Order title / desc ────────────────────────────────────
  orderTitle: { fontSize: s(22), fontWeight: '700', marginBottom: vs(8) },
  orderDesc: { lineHeight: s(22) },

  // ── Barter blocks ─────────────────────────────────────────
  barterClientBlock: {
    backgroundColor: '#8B5CF615',
    borderRadius: s(16),
    padding: s(16),
    borderWidth: 1,
    borderColor: '#8B5CF630'
  },
  barterClientLabel: { color: '#8B5CF6', fontWeight: '700', fontSize: s(13), marginBottom: vs(8) },
  barterClientText: { fontSize: s(15), lineHeight: s(22) },
  barterSpecialistBlock: {
    backgroundColor: '#FF6B3515',
    borderRadius: s(16),
    padding: s(16),
    borderWidth: 1,
    borderColor: '#FF6B3530'
  },
  barterSpecialistLabel: { color: '#FF6B35', fontWeight: '700', fontSize: s(13), marginBottom: vs(8) },
  barterSpecialistText: { fontSize: s(15), lineHeight: s(22) },
  barterFeeText: { fontSize: s(12), marginTop: vs(8) },
  barterNoOffers: { borderRadius: s(16), padding: s(14) },
  barterNoOffersText: { textAlign: 'center', fontSize: s(13) },

  // ── Details card rows ─────────────────────────────────────
  detailsCard: { gap: vs(10) },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },

  // ── Partner info block ────────────────────────────────────
  partnerBlock: {
    backgroundColor: '#10B98115',
    borderRadius: s(16),
    padding: s(16),
    borderWidth: 1,
    borderColor: '#10B98130',
    gap: vs(8)
  },
  partnerBlockTitle: { color: '#10B981', fontWeight: '700', fontSize: s(13) },
  partnerCommission: { color: '#10B981', fontWeight: '700', fontSize: s(14) },

  // ── Responses section ─────────────────────────────────────
  responsesTitle: { fontSize: s(18), fontWeight: '700', marginBottom: vs(12) },
  responsesGap: { gap: vs(12) },

  // ── Response card ─────────────────────────────────────────
  respSpecialistRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  respAvatar: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center'
  },
  respAvatarText: { color: '#FF6B35', fontWeight: '700', fontSize: s(16) },
  respName: { fontSize: s(15), fontWeight: '600' },
  respMeta: { fontSize: s(12) },
  respMessage: { fontSize: s(14), lineHeight: s(20) },
  respPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  respPrice: { fontSize: s(18), fontWeight: '700', color: '#FF6B35' },
  respDate: { fontSize: s(12) },
  acceptedBadge: { backgroundColor: '#22C55E20', borderRadius: s(10), padding: s(10), alignItems: 'center' },
  acceptedText: { color: '#22C55E', fontWeight: '600', fontSize: s(14) },

  // ── No responses ──────────────────────────────────────────
  noRespCard: { alignItems: 'center', paddingVertical: vs(32) },
  noRespIcon: { fontSize: s(36), marginBottom: vs(8) },
  noRespText: { textAlign: 'center', marginTop: vs(4), fontSize: s(13) },

  // ── CTA bar (specialist) ──────────────────────────────────
  ctaBar: {
    paddingHorizontal: s(20),
    paddingTop: vs(12),
    borderTopWidth: 1
  },

  // ── Modals ────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: s(24), borderTopRightRadius: s(24), padding: s(24), gap: vs(16) },
  modalTitle: { fontSize: s(20), fontWeight: '700' },
  modalFieldLabel: { marginBottom: vs(8), fontSize: s(14) },
  modalFieldLabelSm: { marginBottom: vs(6), fontSize: s(13) },
  errorText: { color: '#EF4444', fontSize: s(12), marginTop: vs(4) },
  modalBtnRow: { flexDirection: 'row', gap: s(12) },
  barterClientOffer: {
    backgroundColor: '#8B5CF615',
    borderRadius: s(14),
    padding: s(14),
    borderWidth: 1,
    borderColor: '#8B5CF630'
  },
  barterOfferLabel: { color: '#8B5CF6', fontWeight: '700', fontSize: s(12), marginBottom: vs(6) },
  barterOfferText: { fontSize: s(14), lineHeight: s(20) },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  modalHeaderIcon: { fontSize: s(24) },
  modalHeaderInfo: { flex: 1 },
  modalHeaderTitle: { fontSize: s(18), fontWeight: '700' },
  modalHeaderSub: { fontSize: s(12) },
  feeHint: { fontSize: s(12), lineHeight: s(18) }
})

export default styles
