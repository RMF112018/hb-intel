import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRuntimeConfig,
  getBackendMode,
  getAllowBackendModeSwitch,
  getFunctionAppUrl,
  getApiAudience,
  hasRuntimeConfig,
  checkProductionReadiness,
  _resetConfig,
  ConfigError,
} from '../config/runtimeConfig.js';

describe('runtimeConfig', () => {
  beforeEach(() => {
    _resetConfig();
  });

  describe('setRuntimeConfig', () => {
    it('stores config when truthy values provided', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      expect(hasRuntimeConfig()).toBe(true);
    });

    it('strips trailing slashes from functionAppUrl', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net///' });
      expect(getFunctionAppUrl()).toBe('https://test.azurewebsites.net');
    });

    it('does not store config when all values are empty', () => {
      setRuntimeConfig({});
      expect(hasRuntimeConfig()).toBe(false);
    });
  });

  describe('getBackendMode', () => {
    it('defaults to production when no config set', () => {
      expect(getBackendMode()).toBe('production');
    });

    it('returns injected backend mode', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(getBackendMode()).toBe('ui-review');
    });

    it('ignores invalid backend mode values', () => {
      setRuntimeConfig({ backendMode: 'invalid' as any });
      expect(getBackendMode()).toBe('production');
    });
  });

  describe('getAllowBackendModeSwitch', () => {
    it('defaults to false when no config set', () => {
      expect(getAllowBackendModeSwitch()).toBe(false);
    });

    it('returns true when injected as boolean', () => {
      setRuntimeConfig({ allowBackendModeSwitch: true });
      expect(getAllowBackendModeSwitch()).toBe(true);
    });

    it('normalizes string "true" to boolean', () => {
      setRuntimeConfig({ allowBackendModeSwitch: 'true' as any });
      expect(getAllowBackendModeSwitch()).toBe(true);
    });
  });

  describe('getFunctionAppUrl', () => {
    it('returns injected URL', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      expect(getFunctionAppUrl()).toBe('https://test.azurewebsites.net');
    });

    it('throws ConfigError when no URL configured in production mode', () => {
      expect(() => getFunctionAppUrl()).toThrow(ConfigError);
    });

    it('returns empty string in ui-review mode', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(getFunctionAppUrl()).toBe('');
    });
  });

  describe('getApiAudience', () => {
    it('returns undefined when no audience configured', () => {
      expect(getApiAudience()).toBeUndefined();
    });

    it('returns injected audience', () => {
      setRuntimeConfig({ apiAudience: 'api://test-client-id' });
      expect(getApiAudience()).toBe('api://test-client-id');
    });
  });

  describe('checkProductionReadiness', () => {
    it('reports not ready when no URL and no token provider', () => {
      const result = checkProductionReadiness(false);
      expect(result.ready).toBe(false);
      expect(result.issues).toHaveLength(2);
    });

    it('reports not ready when URL present but no token provider', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      const result = checkProductionReadiness(false);
      expect(result.ready).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toContain('token provider');
    });

    it('reports ready when URL and token provider both available', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      const result = checkProductionReadiness(true);
      expect(result.ready).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('_resetConfig', () => {
    it('clears stored config', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.azurewebsites.net' });
      expect(hasRuntimeConfig()).toBe(true);
      _resetConfig();
      expect(hasRuntimeConfig()).toBe(false);
    });
  });
});
