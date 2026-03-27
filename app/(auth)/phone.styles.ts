import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: s(24),
    paddingTop: vs(64),
    paddingBottom: vs(16)
  },
  backBtn: { marginBottom: vs(32) },
  backText: { color: '#FF6B35', fontSize: s(16) },
  title: { fontSize: s(28), fontWeight: '700', marginBottom: vs(8) },
  subtitle: { fontSize: s(16) },
  inputArea: { paddingHorizontal: s(24), marginTop: vs(16) },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(16),
    borderWidth: 1,
    overflow: 'hidden'
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(16),
    paddingVertical: vs(20),
    borderRightWidth: 1
  },
  flag: { fontSize: s(20) },
  code: { fontWeight: '600', fontSize: s(16) },
  phoneInput: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(20),
    fontSize: s(16),
    outlineStyle: 'none'
  },
  errorText: { color: '#EF4444', fontSize: s(14), marginTop: vs(8), marginLeft: s(4) },
  submitArea: { paddingHorizontal: s(24), marginTop: vs(24) },
  submitBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: vs(16),
    borderRadius: s(16),
    alignItems: 'center'
  },
  disabledBtn: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  submitText: { color: '#fff', fontSize: s(16), fontWeight: '700' }
})
