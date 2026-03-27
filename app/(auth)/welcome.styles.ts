import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const styles = StyleSheet.create({
  screen: { padding: s(20) },
  logoArea: {
    marginVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(16)
  },
  logoBox: {
    width: s(80),
    height: vs(80),
    borderRadius: s(24),
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8)
  },
  logoEmoji: { fontSize: s(40) },
  appName: { fontSize: s(36), fontWeight: '800', letterSpacing: -0.5 },
  tagline: {
    fontSize: s(17),
    textAlign: 'center',
    lineHeight: s(26),
    paddingHorizontal: s(16)
  },
  features: { gap: 12, marginBottom: vs(32) },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
    padding: s(16),
    borderRadius: s(16)
  },
  featureIcon: { fontSize: s(24) },
  featureText: { flex: 1, fontSize: s(14), lineHeight: s(20) },
  cta: { paddingBottom: vs(40), gap: 12 },
  btnPrimary: {
    backgroundColor: '#FF6B35',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontSize: s(16), fontWeight: '700' },
  btnOutline: {
    borderWidth: 1,
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  btnOutlineText: { fontSize: s(16), fontWeight: '500' },
  pressed: { opacity: 0.75 },
  terms: { fontSize: s(12), textAlign: 'center', lineHeight: s(18), marginTop: 8 },
  link: { color: '#FF6B35' }
})
