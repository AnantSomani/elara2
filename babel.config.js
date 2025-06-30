module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for React Native URL polyfill
      'react-native-url-polyfill/babel',
    ],
  };
}; 