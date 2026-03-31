import { describe, it, expect, beforeEach } from 'vitest';
import {
  _resetConfig,
  setRuntimeConfig,
  getBackendMode,
  getFunctionAppUrl,
  checkProductionReadiness,
  ConfigError,
} from '../config/runtimeConfig.js';

/**
 * P7-02: Production mode contract tests.
 *
 * Validates that:
 * - Production mode is the first-class default (no silent ui-review defaulting)
 * - Production readiness gating surfaces actionable diagnostics
 * - ui-review mode is available only as an explicit configuration choice
 */

describe('P7-02 Production mode contract', () => {
  beforeEach(() => {
    _resetConfig();
    delete (import.meta.env as Record<string, unknown>).VITE_BACKEND_MODE;
    delete (import.meta.env as Record<string, unknown>).VITE_FUNCTION_APP_URL;
  });

  describe('mode defaults', () => {
    it('production is the default mode when no configuration is injected', () => {
      // P7-02: Verifies that the app does not silently default to ui-review.
      // Previously, the build script and shell webpart could inject 'ui-review'
      // without explicit configuration.
      expect(getBackendMode()).toBe('production');
    });

    it('production mode is active when shell injects empty backendMode', () => {
      // Simulates a shell webpart that does not inject a backendMode value
      // (the P7-02 ShellWebPart.ts change passes '' instead of 'ui-review')
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      expect(getBackendMode()).toBe('production');
    });

    it('ui-review mode requires explicit configuration', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(getBackendMode()).toBe('ui-review');
    });
  });

  describe('production readiness gating', () => {
    it('production mode with all prerequisites met is ready', () => {
      setRuntimeConfig({
        backendMode: 'production',
        functionAppUrl: 'https://hb-intel-functions.azurewebsites.net',
      });

      const readiness = checkProductionReadiness(true);
      expect(readiness.ready).toBe(true);
      expect(readiness.issues).toEqual([]);
    });

    it('production mode without functionAppUrl is not ready', () => {
      setRuntimeConfig({ backendMode: 'production' });

      const readiness = checkProductionReadiness(true);
      expect(readiness.ready).toBe(false);
      expect(readiness.issues.some((i) => i.includes('Function App URL'))).toBe(true);
    });

    it('production mode without token provider is not ready', () => {
      setRuntimeConfig({
        backendMode: 'production',
        functionAppUrl: 'https://test.azurewebsites.net',
      });

      const readiness = checkProductionReadiness(false);
      expect(readiness.ready).toBe(false);
      expect(readiness.issues.some((i) => i.includes('token provider'))).toBe(true);
    });

    it('production mode missing both prerequisites reports both issues', () => {
      setRuntimeConfig({ backendMode: 'production' });

      const readiness = checkProductionReadiness(false);
      expect(readiness.ready).toBe(false);
      expect(readiness.issues.length).toBe(2);
    });

    it('production mode throws ConfigError with actionable message when functionAppUrl required', () => {
      setRuntimeConfig({ backendMode: 'production' });

      expect(() => getFunctionAppUrl()).toThrow(ConfigError);
      try {
        getFunctionAppUrl();
      } catch (err) {
        const msg = (err as Error).message;
        expect(msg).toContain('shell webpart');
        expect(msg).toContain('VITE_FUNCTION_APP_URL');
      }
    });
  });

  describe('no silent mode fallback at config level', () => {
    it('getBackendMode never returns ui-review unless explicitly configured', () => {
      // No config at all
      expect(getBackendMode()).toBe('production');

      // Empty config
      _resetConfig();
      setRuntimeConfig({});
      expect(getBackendMode()).toBe('production');

      // Only functionAppUrl set (no backendMode)
      _resetConfig();
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      expect(getBackendMode()).toBe('production');
    });

    it('invalid backendMode values fall through to production default', () => {
      setRuntimeConfig({ backendMode: 'invalid' as 'production' });
      expect(getBackendMode()).toBe('production');
    });
  });
});
