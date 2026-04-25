'use strict';

const path = require('path');
const build = require('@microsoft/sp-build-web');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

build.addSuppression(/Warning/gi);

const requireDomainAppConfig = process.env.REQUIRE_DOMAIN_APP_CONFIG === 'true';
const appBundleName = process.env.APP_BUNDLE_NAME || 'app.js';
const appGlobalName = process.env.APP_GLOBAL_NAME || '__hbIntel_app';
const appCssName = process.env.APP_CSS_NAME || '';

if (requireDomainAppConfig && (!process.env.APP_BUNDLE_NAME || !process.env.APP_GLOBAL_NAME)) {
  throw new Error(
    '[HB-Intel SPFx Shell] Domain packaging requires APP_BUNDLE_NAME and APP_GLOBAL_NAME. ' +
    'Refusing to compile a shell bundle with fallback app.js/__hbIntel_app values.',
  );
}

build.configureWebpack.mergeConfig({
  additionalConfiguration: (config) => {
    // Inject domain-specific constants via DefinePlugin.
    // The orchestration script (tools/build-spfx-package.ts) sets these env vars per domain.
    config.plugins.push(
      new webpack.DefinePlugin({
        __APP_BUNDLE_NAME__: JSON.stringify(appBundleName),
        __APP_GLOBAL_NAME__: JSON.stringify(appGlobalName),
        __APP_CSS_NAME__: JSON.stringify(appCssName),
        __FUNCTION_APP_URL__: JSON.stringify(process.env.FUNCTION_APP_URL || ''),
        __BACKEND_MODE__: JSON.stringify(process.env.BACKEND_MODE || ''),
        __ALLOW_BACKEND_MODE_SWITCH__: JSON.stringify(process.env.ALLOW_BACKEND_MODE_SWITCH || ''),
        __API_AUDIENCE__: JSON.stringify(process.env.API_AUDIENCE || ''),
        // Per-domain Safety governance constants. Populated only when the
        // build orchestrator (tools/build-spfx-package.ts) is producing the
        // Safety .sppkg. Empty strings for every other domain — the shell's
        // render() guards each value with a non-empty check.
        __SAFETY_ACCEPTED_BACKEND_ORIGIN__: JSON.stringify(process.env.SAFETY_ACCEPTED_BACKEND_ORIGIN || ''),
        __SAFETY_EXPECTED_MANIFEST_ID__: JSON.stringify(process.env.SAFETY_EXPECTED_MANIFEST_ID || ''),
        __SAFETY_EXPECTED_PACKAGE_VERSION__: JSON.stringify(process.env.SAFETY_EXPECTED_PACKAGE_VERSION || ''),
        __SAFETY_EXPECTED_API_AUDIENCE__: JSON.stringify(process.env.SAFETY_EXPECTED_API_AUDIENCE || ''),
        __SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT__: JSON.stringify(process.env.SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT || ''),
      })
    );

    // Copy Vite-built IIFE bundle from assets/ into the webpack output directory.
    // This makes the Vite bundle a first-class webpack asset, so gulp package-solution
    // includes it in the .sppkg through the authoritative SPFx asset flow — not via
    // post-hoc zip injection.
    const assetsDir = path.resolve(__dirname, 'assets');
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: assetsDir, to: '.', noErrorOnMissing: true },
        ],
      })
    );

    return config;
  },
});

build.initialize(require('gulp'));
