const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    // Include all default asset extensions plus custom ones
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'glb',
      'gltf',
      'ttf', // Add font support for @expo-google-fonts
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
