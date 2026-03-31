import { describe, it, expect, beforeEach } from 'vitest';
import {
  _resetConfig,
  setRuntimeConfig,
  getBackendMode,
  getFunctionAppUrl,
  getApiAudience,
  checkProductionReadiness,
  ConfigError,
  type BackendMode,
} from '../config/runtimeConfig.js';

/**
 * P5-02: Mode switching and production readiness integration tests.
 *
 * Validates that production mode gating, ui-review mode, and config error
 * behavior work correctly across the full configuration resolution chain.
 *
 * Closes P5-01 gaps:
 * - B1: Integration test for ui-review vs production mode switching
 * - B3: Test for missing-config failure behavior
 */

describe('P5-02 Mode switching integration', () => {
  beforeEach(() => {
    _resetConfig();
  });

  // --- UI-Review Mode ---

  it('ui-review mode boots cleanly with no backend config', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });

    expect(getBackendMode()).toBe('ui-review');
    // getFunctionAppUrl returns empty string in ui-review
    expect(getFunctionAppUrl()).toBe('');
  });

  it('ui-review mode does not require API audience', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });

    // No API audience needed — ui-review uses localStorage
    const readiness = checkProductionReadiness(false);
    // readiness check is for production mode, not relevant in ui-review
    expect(readiness.ready).toBe(false); // Missing token provider
    expect(readiness.issues.length).toBeGreaterThan(0);
  });

  // --- Production Mode ---

  it('production mode requires functionAppUrl', () => {
    setRuntimeConfig({ backendMode: 'production' });

    expect(() => getFunctionAppUrl()).toThrow(ConfigError);
    expect(() => getFunctionAppUrl()).toThrow(/Function App URL is not configured/);
  });

  it('production mode with valid config resolves functionAppUrl', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel-functions.azurewebsites.net',
    });

    expect(getFunctionAppUrl()).toBe('https://hb-intel-functions.azurewebsites.net');
  });

  it('production readiness: ready when all prerequisites met', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://test.azurewebsites.net',
    });

    const readiness = checkProductionReadiness(true); // hasTokenProvider = true
    expect(readiness.ready).toBe(true);
    expect(readiness.issues).toEqual([]);
  });

  it('production readiness: not ready without token provider', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://test.azurewebsites.net',
    });

    const readiness = checkProductionReadiness(false);
    expect(readiness.ready).toBe(false);
    expect(readiness.issues.some((i) => i.includes('token provider'))).toBe(true);
  });

  it('production readiness: not ready without functionAppUrl', () => {
    setRuntimeConfig({ backendMode: 'production' });

    const readiness = checkProductionReadiness(true);
    expect(readiness.ready).toBe(false);
    expect(readiness.issues.some((i) => i.includes('Function App URL'))).toBe(true);
  });

  // --- API Audience ---

  it('API audience resolves from runtime config', () => {
    setRuntimeConfig({ apiAudience: 'api://test-client-id' });
    expect(getApiAudience()).toBe('api://test-client-id');
  });

  it('API audience returns undefined when not configured', () => {
    setRuntimeConfig({});
    expect(getApiAudience()).toBeUndefined();
  });

  // --- Config Error Quality ---

  it('ConfigError has actionable message with resolution steps', () => {
    setRuntimeConfig({ backendMode: 'production' });

    try {
      getFunctionAppUrl();
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      const message = (err as Error).message;
      // Must mention both SPFx and Vite paths for resolution
      expect(message).toContain('SPFx');
      expect(message).toContain('Vite');
      expect(message).toContain('VITE_FUNCTION_APP_URL');
    }
  });

  // --- Mode defaults ---

  it('defaults to production mode when no config set', () => {
    expect(getBackendMode()).toBe('production');
  });

  it('functionAppUrl trims trailing slashes', () => {
    setRuntimeConfig({
      functionAppUrl: 'https://test.azurewebsites.net///',
    });
    expect(getFunctionAppUrl()).toBe('https://test.azurewebsites.net');
  });
});
