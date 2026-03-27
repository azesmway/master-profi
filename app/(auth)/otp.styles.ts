import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const styles = StyleSheet.create({
  container: { paddingHorizontal: s(24), paddingTop: vs(64) },
  backBtn: { marginBottom: vs(32) },
  backText: { color: '#FF6B35', fontSize: s(16) },
  title: { fontSize: s(28), fontWeight: '700', marginBottom: vs(8) },
  subtitle: { fontSize: s(16) },
  phoneHighlight: { fontWeight: '600' },
  boxRow: {
    flexDirection: 'row',
    gap: s(10),
    marginTop: vs(40),
    marginBottom: vs(16),
    justifyContent: 'center'
  },
  box: {
    width: s(48),
    height: vs(56),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  boxChar: { fontSize: s(22), fontWeight: '700' },
  cursor: {
    width: s(2),
    height: vs(24),
    backgroundColor: '#FF6B35',
    borderRadius: s(1)
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    outlineStyle: 'none'
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    marginTop: vs(16)
  },
  loadingText: { fontSize: s(14) },
  errorText: {
    color: '#EF4444',
    fontSize: s(14),
    textAlign: 'center',
    marginTop: vs(8)
  },
  resendRow: { alignItems: 'center', marginTop: vs(32) },
  countdownText: { fontSize: s(14) },
  countdownNum: { fontWeight: '600' },
  resendText: { color: '#FF6B35', fontWeight: '500', fontSize: s(14) },
  pressed: { opacity: 0.6 }
})
