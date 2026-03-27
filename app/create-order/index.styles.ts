import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12)
  },
  backBtn: { color: '#FF6B35', fontSize: s(16) },
  headerTitle: { fontSize: s(18), fontWeight: '700', flex: 1 },
  headerStep: { fontSize: s(14) },

  // ── Progress bar ──────────────────────────────────────────
  progressWrap: { paddingHorizontal: s(20), marginBottom: vs(20) },
  progressTrack: { height: vs(4), borderRadius: s(2), overflow: 'hidden' },
  progressFill: { height: vs(4), borderRadius: s(2), backgroundColor: '#FF6B35' },

  // ── Step title ────────────────────────────────────────────
  stepTitle: { fontSize: s(24), fontWeight: '700' },

  // ── Field label / error ───────────────────────────────────
  fieldLabel: { fontSize: s(13), marginBottom: vs(8), marginLeft: s(4) },
  errorText: { color: '#EF4444', fontSize: s(12), marginTop: vs(4), marginLeft: s(4) },

  // ── Order type selector ───────────────────────────────────
  typeRow: { flexDirection: 'row', gap: s(10) },
  typeBtn: {
    flex: 1,
    paddingVertical: vs(12),
    borderRadius: s(14),
    borderWidth: 2,
    alignItems: 'center',
    gap: vs(4)
  },
  typeBtnIcon: { fontSize: s(20) },
  typeBtnLabel: { fontSize: s(13), fontWeight: '600' },
  typeBtnSub: { fontSize: s(10), textAlign: 'center' },

  // ── Category chip ─────────────────────────────────────────
  catChip: {
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderRadius: s(12),
    borderWidth: 1,
    minWidth: s(64)
  },
  catChipIcon: { fontSize: s(22), marginBottom: vs(4) },
  catChipText: { fontSize: s(12), textAlign: 'center' },

  // ── Description header row ────────────────────────────────
  descLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
    marginLeft: s(4)
  },

  // ── Barter offer input ────────────────────────────────────
  barterInput: {
    minHeight: vs(110),
    borderWidth: 1.5,
    borderColor: '#8B5CF640',
    borderRadius: s(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    fontSize: s(14),
    textAlignVertical: 'top'
  },

  // ── Budget row ────────────────────────────────────────────
  budgetRow: { flexDirection: 'row', gap: s(8) },
  budgetInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(16),
    borderWidth: 1,
    overflow: 'hidden'
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    fontSize: s(14)
  },
  currencyBtn: {
    borderRadius: s(16),
    borderWidth: 1,
    paddingHorizontal: s(16),
    justifyContent: 'center'
  },
  currencyText: { fontWeight: '500', fontSize: s(14) },

  // ── City picker ───────────────────────────────────────────
  cityPicker: {
    borderRadius: s(16),
    borderWidth: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cityPickerText: { fontSize: s(14) },
  cityPickerArrow: { fontSize: s(14) },
  cityDropdown: {
    borderRadius: s(16),
    borderWidth: 1,
    marginTop: vs(8),
    maxHeight: vs(192),
    overflow: 'hidden'
  },
  cityOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1
  },
  cityOptionText: { fontSize: s(14) },

  // ── Photos ────────────────────────────────────────────────
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(12) },
  photoWrap: { position: 'relative' },
  photoImg: { width: s(80), height: s(80), borderRadius: s(12) },
  photoDeleteBtn: {
    position: 'absolute',
    top: -vs(8),
    right: -s(8),
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoDeleteText: { color: '#fff', fontSize: s(11), fontWeight: '700' },
  photoAddBtn: {
    width: s(80),
    height: s(80),
    borderRadius: s(12),
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoAddIcon: { fontSize: s(24) },
  photoAddText: { fontSize: s(10) },

  // ── Next / submit buttons ─────────────────────────────────
  nextBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center',
    marginBottom: vs(32)
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: s(15) },
  submitBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center',
    marginBottom: vs(32)
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: s(15) }
})

export default styles
