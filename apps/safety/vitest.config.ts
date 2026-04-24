import { mergeConfig, defineConfig } from 'vitest/config';
import { createWebpartVitestConfig } from '../../tools/vitest-webpart.config.js';
import { readGovernedSafetyDefines } from './config/runtimeDefines.js';

export default mergeConfig(
  createWebpartVitestConfig(__dirname),
  defineConfig({
    define: readGovernedSafetyDefines(),
  }),
);
