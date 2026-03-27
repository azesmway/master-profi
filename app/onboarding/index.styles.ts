import { Dimensions, StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // ── Skip button ───────────────────────────────────────────
  skip: { position: 'absolute', right: s(20), zIndex: 10, padding: s(8) },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: s(15) },

  // ── Slide ─────────────────────────────────────────────────
  slide: {
    flex: 1,
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(40)
  },
  emoji: { fontSize: s(80), marginBottom: vs(32) },
  title: {
    fontSize: s(36),
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: s(44),
    marginBottom: vs(20)
  },
  subtitle: {
    fontSize: s(17),
    textAlign: 'center',
    lineHeight: s(26)
  },

  // ── Bottom area ───────────────────────────────────────────
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: s(32),
    gap: vs(24),
    alignItems: 'center'
  },

  // ── Dots ──────────────────────────────────────────────────
  dots: { flexDirection: 'row', gap: s(8) },
  dot: { height: vs(8), borderRadius: s(4) },
  dotActive: { width: s(24), backgroundColor: '#fff' },
  dotInactive: { width: s(8), backgroundColor: 'rgba(255,255,255,0.4)' },

  // ── Next/Start button ─────────────────────────────────────
  btn: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: s(18),
    paddingVertical: vs(18),
    alignItems: 'center'
  },
  btnText: { fontSize: s(18), fontWeight: '700', color: '#111' }
})

export default styles
