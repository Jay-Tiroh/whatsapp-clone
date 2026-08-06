const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Destructure transformer and resolver from the default config
const { transformer, resolver } = config;

// Route .svg files through the react-native-svg-transformer
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...resolver,
  // Remove 'svg' from asset extensions
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  // Add 'svg' to source extensions so it compiles as a component
  sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/shared/types/uniwind-types.d.ts",
});
