// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ---------------------------------------------------------------------------
// Web compatibility — fix "Cannot use import.meta outside a module" error.
// Some packages (tanstack-query, zustand) ship ESM with import.meta.
// This transformer converts them to CommonJS for the Metro web bundler.
// ---------------------------------------------------------------------------
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.resolver = {
  ...config.resolver,
  // Prioritise the React Native source over the Node/browser source
  // so packages resolve correctly on both mobile and web.
  sourceExts: [...(config.resolver.sourceExts ?? []), 'mjs', 'cjs'],
};

module.exports = config;
