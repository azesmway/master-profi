import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  container: { paddingHorizontal: s(24), paddingTop: vs(64) },
  title: { fontSize: s(28), fontWeight: '700', marginBottom: vs(8) },
  subtitle: { fontSize: s(16), marginBottom: vs(32) },
  section: { marginBottom: vs(24) },
  label: { fontSize: s(13), fontWeight: '500', marginBottom: vs(8), marginLeft: s(4) },
  input: {
    borderWidth: 1,
    borderRadius: s(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(20),
    fontSize: s(16),
    outlineStyle: 'none'
  },
  roleList: { gap: vs(12) },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
    padding: s(16),
    borderRadius: s(16),
    borderWidth: 1
  },
  roleItemActive: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderColor: '#FF6B35'
  },
  roleIcon: { fontSize: s(28) },
  roleText: { flex: 1 },
  roleTitle: { fontSize: s(15), fontWeight: '600' },
  roleDesc: { fontSize: s(13), marginTop: vs(2) },
  radioOuter: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterActive: { borderColor: '#FF6B35' },
  radioInner: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: '#FF6B35'
  },
  cityPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: s(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(20)
  },
  cityText: { fontSize: s(16) },
  cityDropdown: {
    borderWidth: 1,
    borderRadius: s(16),
    marginTop: vs(8),
    overflow: 'hidden'
  },
  cityOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    borderBottomWidth: 1
  },
  cityOptionActive: { backgroundColor: 'rgba(255,107,53,0.08)' },
  cityOptionText: { fontSize: s(15) },
  errorText: { color: '#EF4444', fontSize: s(14), marginBottom: vs(16), marginLeft: s(4) },
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

export default styles
