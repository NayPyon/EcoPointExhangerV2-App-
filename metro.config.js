const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports so Metro respects the "react-native" export condition
// in @firebase/auth, which points to the correct RN bundle that includes
// getReactNativePersistence (vs the browser bundle which does not).
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = config;
