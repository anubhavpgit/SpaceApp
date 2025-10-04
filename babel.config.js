module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Support for three.js and three-globe
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: false,
    }],
  ],
};
