module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [], // Removed reanimated plugin to fix bundling error
  };
};
