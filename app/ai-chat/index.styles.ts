import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: vs(10),
    paddingHorizontal: s(4),
    borderBottomWidth: 0.5
  },
  backBtn: { paddingHorizontal: s(8), paddingVertical: vs(6) },
  backIcon: { color: '#FF6B35', fontSize: s(26) },
  headerInfo: { flex: 1, marginLeft: s(10) },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  headerIcon: { fontSize: s(20) },
  headerTitle: { fontSize: s(17), fontWeight: '700' },
  headerSubtitle: { fontSize: s(11) },
  clearBtn: { padding: s(10) },
  clearText: { fontSize: s(13) },

  // ── Suggestions footer ────────────────────────────────────
  suggestionsWrap: { marginTop: vs(16), gap: vs(8) },
  suggestionsLabel: { fontSize: s(12), textAlign: 'center' },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), justifyContent: 'center' },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: s(16),
    paddingHorizontal: s(12),
    paddingVertical: vs(8)
  },
  suggestionText: { fontSize: s(13) },

  // ── User bubble ───────────────────────────────────────────
  userBubbleWrap: { alignItems: 'flex-end' },
  userBubble: {
    backgroundColor: '#FF6B35',
    borderRadius: s(18),
    borderBottomRightRadius: s(4),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    maxWidth: '80%'
  },
  userBubbleText: { color: '#fff', fontSize: s(15), lineHeight: s(21) },

  // ── AI bubble ─────────────────────────────────────────────
  aiBubbleWrap: { alignItems: 'flex-start', gap: vs(10) },
  aiBubbleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: s(8) },
  aiAvatar: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(2)
  },
  aiAvatarIcon: { fontSize: s(16) },
  aiBubble: {
    flex: 1,
    borderRadius: s(18),
    borderBottomLeftRadius: s(4),
    paddingHorizontal: s(14),
    paddingVertical: vs(10)
  },
  aiLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  aiLoadingText: { fontSize: s(13) },
  aiBubbleText: { fontSize: s(15), lineHeight: s(22) },

  // ── Specialists list ──────────────────────────────────────
  specialistsWrap: { width: '100%', paddingLeft: s(40), gap: vs(8) },
  specialistsLabel: { fontSize: s(12) },

  // ── Input bar ─────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: s(6),
    paddingHorizontal: s(8),
    paddingTop: vs(8),
    borderTopWidth: 0.5
  },
  fieldWrap: {
    flex: 1,
    borderRadius: s(22),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    maxHeight: vs(120)
  },
  field: { fontSize: s(15), lineHeight: s(20), padding: 0 },
  sendBtn: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    marginBottom: vs(2),
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendIcon: { fontSize: s(14), marginLeft: s(2) }
})

export default styles
