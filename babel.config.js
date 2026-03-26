module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: [
      ['babel-plugin-transform-import-meta', {}],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@types': './src/types'
          }
        }
      ],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-class-static-block',
      '@babel/plugin-syntax-dynamic-import',
      'react-native-reanimated/plugin'
    ]
  }
}
