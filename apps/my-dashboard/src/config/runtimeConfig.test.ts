import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  _resetConfig,
  checkProductionReadiness,
  getProductionConfigMissingKeys,
  setRuntimeConfig,
  type ProductionConfigKey,
} from './runtimeConfig.js';

beforeEach(() => {
  _resetConfig();
  // Force Vite env to empty so the repo `.env` cannot leak values into the
  // resolution chain. Tests that need a Vite-source value re-stub explicitly.
  vi.stubEnv('VITE_BACKEND_MODE', '');
  vi.stubEnv('VITE_FUNCTION_APP_URL', '');
  vi.stubEnv('VITE_API_AUDIENCE', '');
});

afterEach(() => {
  _resetConfig();
  vi.unstubAllEnvs();
});

describe('getProductionConfigMissingKeys', () => {
  it('returns [] when backend mode is ui-review, regardless of inputs', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    expect(getProductionConfigMissingKeys(false, false)).toEqual([]);
    expect(getProductionConfigMissingKeys(true, false)).toEqual([]);
    expect(getProductionConfigMissingKeys(false, true)).toEqual([]);
    expect(getProductionConfigMissingKeys(true, true)).toEqual([]);
  });

  it('reports all three keys when production mode is active and nothing is configured', () => {
    setRuntimeConfig({ backendMode: 'production' });
    expect(getProductionConfigMissingKeys(false, false)).toEqual([
      'function-app-url',
      'api-audience',
      'api-token-provider',
    ]);
  });

  it('reports api-audience and api-token-provider when only the URL is set', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
    });
    expect(getProductionConfigMissingKeys(false, false)).toEqual([
      'api-audience',
      'api-token-provider',
    ]);
  });

  it('reports api-token-provider only when URL and audience are set but no provider was constructed', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    expect(getProductionConfigMissingKeys(true, false)).toEqual(['api-token-provider']);
  });

  it('reports function-app-url only when URL is missing but audience and provider are present', () => {
    setRuntimeConfig({
      backendMode: 'production',
      apiAudience: 'api://example',
    });
    expect(getProductionConfigMissingKeys(true, true)).toEqual(['function-app-url']);
  });

  it('reports function-app-url + api-audience when only the provider is constructed', () => {
    setRuntimeConfig({ backendMode: 'production' });
    expect(getProductionConfigMissingKeys(false, true)).toEqual([
      'function-app-url',
      'api-audience',
    ]);
  });

  it('returns [] when production mode is fully configured', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    expect(getProductionConfigMissingKeys(true, true)).toEqual([]);
  });

  it('emits keys in deterministic order (function-app-url, api-audience, api-token-provider)', () => {
    setRuntimeConfig({ backendMode: 'production' });
    const keys: ProductionConfigKey[] = getProductionConfigMissingKeys(false, false);
    expect(keys.indexOf('function-app-url')).toBeLessThan(keys.indexOf('api-audience'));
    expect(keys.indexOf('api-audience')).toBeLessThan(keys.indexOf('api-token-provider'));
  });

  it('falls back to production mode when no backend mode is configured anywhere', () => {
    // No setRuntimeConfig + Vite env stubbed empty → getBackendMode() defaults to 'production'.
    expect(getProductionConfigMissingKeys(false, false)).toEqual([
      'function-app-url',
      'api-audience',
      'api-token-provider',
    ]);
  });
});

describe('checkProductionReadiness — preserved single-arg contract', () => {
  it('reports both issues when production mode is active and nothing is configured', () => {
    setRuntimeConfig({ backendMode: 'production' });
    const result = checkProductionReadiness(false);
    expect(result.ready).toBe(false);
    expect(result.issues).toHaveLength(2);
  });

  it('is ready when URL is set and a token provider is supplied', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
    });
    const result = checkProductionReadiness(true);
    expect(result.ready).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
