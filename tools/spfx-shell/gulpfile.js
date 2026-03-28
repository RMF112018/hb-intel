'use strict';

const build = require('@microsoft/sp-build-web');
const webpack = require('webpack');

build.addSuppression(/Warning/gi);

// Inject domain-specific constants via DefinePlugin.
// The orchestration script (tools/build-spfx-package.ts) sets these env vars per domain.
build.configureWebpack.mergeConfig({
  additionalConfiguration: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __APP_BUNDLE_NAME__: JSON.stringify(process.env.APP_BUNDLE_NAME || 'app.js'),
        __APP_GLOBAL_NAME__: JSON.stringify(process.env.APP_GLOBAL_NAME || '__hbIntel_app'),
      })
    );
    return config;
  },
});

build.initialize(require('gulp'));
