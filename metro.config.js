const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for css files
config.resolver.assetExts.push('css');

module.exports = config; 