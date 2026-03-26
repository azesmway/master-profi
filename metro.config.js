const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

let config = getDefaultConfig(__dirname)

const { transformer, resolver } = config

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo')
}
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  // Убираем mjs из приоритета — Metro будет брать CJS
  resolverMainFields: ['react-native', 'browser', 'main'],
  unstable_enablePackageExports: false, // ← ключевое
}

module.exports = withNativeWind(config, { input: './global.css' })
