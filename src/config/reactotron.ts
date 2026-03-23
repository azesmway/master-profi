import AsyncStorage from '@react-native-async-storage/async-storage'
import Reactotron from 'reactotron-react-native'

if (__DEV__) {
  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: 'Мастер',
      host: '192.168.0.107'
    })
    .useReactNative({
      asyncStorage: false,
      networking: {
        // игнорируем внутренний трафик Expo — не засоряет логи
        ignoreUrls: /symbolicate|127\.0\.0\.1/
      },
      editor: false,
      errors: { veto: () => false },
      overlay: false
    })
    .connect()

  // Расширяем console — можно писать console.tron.log() в любом месте
  ;(console as any).tron = Reactotron.log
}

export default Reactotron
