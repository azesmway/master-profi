import { StyleSheet } from 'react-native'
import { s, vs } from 'react-native-size-matters'

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(4),
    paddingBottom: vs(10),
    borderBottomWidth: 0.5
  },
  backBtn: { paddingHorizontal: s(8), paddingVertical: vs(6) },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FF6B3525',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTxt: { color: '#FF6B35', fontWeight: '700', fontSize: s(14) },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: s(12),
    height: s(12),
    borderRadius: s(6),
    backgroundColor: '#22C55E',
    borderWidth: 2
  },
  hName: { fontSize: s(16), fontWeight: '600' },
  hSub: { fontSize: s(12), marginTop: vs(1) },
  hAction: { padding: s(10) },
  dateSep: { alignItems: 'center', marginVertical: vs(8) },
  datePill: { paddingHorizontal: s(12), paddingVertical: vs(4), borderRadius: s(12) },
  dateLabel: { fontSize: s(12), fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: vs(1) },
  rowOut: { justifyContent: 'flex-end', paddingLeft: s(48) },
  rowIn: { justifyContent: 'flex-start', paddingRight: s(48) },
  bubble: {
    maxWidth: '100%',
    paddingHorizontal: s(10),
    paddingTop: vs(7),
    paddingBottom: vs(5),
    position: 'relative'
  },
  msgText: { fontSize: s(15), lineHeight: s(21) },
  imgBubble: { width: s(200), height: vs(200), borderRadius: s(10), marginBottom: vs(4) },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: vs(2)
  },
  time: { fontSize: s(11) },
  ticks: { fontSize: s(11) },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: s(8),
    paddingTop: vs(8),
    borderTopWidth: 0.5,
    gap: s(6)
  },
  attachBtn: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(2)
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(2)
  }
})

export default styles
