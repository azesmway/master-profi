import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  greeting: { fontSize: s(13) },
  userName: { fontSize: s(22), fontWeight: '700' },
  avatarBtn: {
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: s(14) },
  aiCard: {
    marginHorizontal: s(20),
    marginVertical: vs(12),
    borderRadius: s(20),
    padding: s(16),
    borderWidth: 1
  },
  aiCardTitle: { fontSize: s(15), fontWeight: '700', marginBottom: vs(4) },
  aiCardSub: { fontSize: s(13), marginBottom: vs(12) },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8)
  },
  aiInput: {
    flex: 1,
    borderRadius: s(14),
    borderWidth: 1,
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    fontSize: s(14)
  },
  aiSendBtn: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeader: {
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: { fontSize: s(18), fontWeight: '700' },
  sectionLink: { fontSize: s(14), color: '#FF6B35' },
  categoriesRow: {
    paddingHorizontal: s(20),
    paddingBottom: vs(8),
    gap: s(8)
  },
  catItem: {
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: s(14),
    borderWidth: 1,
    minWidth: s(72)
  },
  catIcon: { fontSize: s(22), marginBottom: vs(4) },
  catName: { fontSize: s(11), textAlign: 'center' },
  specialistList: {
    paddingHorizontal: s(20),
    gap: s(12),
    paddingBottom: vs(24)
  }
})
