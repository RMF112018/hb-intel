import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRuntimeConfig,
  getBackendMode,
  getAllowBackendModeSwitch,
  getFunctionAppUrl,
  hasRuntimeConfig,
  ConfigError,
  _resetConfig,
} from '../config/runtimeConfig.js';

describe('runtimeConfig', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    _resetConfig();
    Object.assign(import.meta.env, originalEnv);
    delete (import.meta.env as Record<string, unknown>).VITE_BACKEND_MODE;
    delete (import.meta.env as Record<string, unknown>).VITE_ALLOW_BACKEND_MODE_SWITCH;
    delete (import.meta.env as Record<string, unknown>).VITE_FUNCTION_APP_URL;
  });

  describe('setRuntimeConfig', () => {
    it('stores functionAppUrl from shell config', () => {
      setRuntimeConfig({ functionAppUrl: 'https://my-functions.azurewebsites.net' });
      expect(hasRuntimeConfig()).toBe(true);
      expect(getFunctionAppUrl()).toBe('https://my-functions.azurewebsites.net');
    });

    it('strips trailing slashes from functionAppUrl', () => {
      setRuntimeConfig({ functionAppUrl: 'https://my-functions.azurewebsites.net///' });
      expect(getFunctionAppUrl()).toBe('https://my-functions.azurewebsites.net');
    });

    it('ignores empty functionAppUrl', () => {
      setRuntimeConfig({ functionAppUrl: '' });
      expect(hasRuntimeConfig()).toBe(false);
    });

    it('ignores undefined functionAppUrl', () => {
      setRuntimeConfig({});
      expect(hasRuntimeConfig()).toBe(false);
    });

    it('stores backendMode from shell config', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(hasRuntimeConfig()).toBe(true);
      expect(getBackendMode()).toBe('ui-review');
    });

    it('stores allowBackendModeSwitch from shell config', () => {
      setRuntimeConfig({ allowBackendModeSwitch: true });
      expect(hasRuntimeConfig()).toBe(true);
      expect(getAllowBackendModeSwitch()).toBe(true);
    });
  });

  describe('getBackendMode', () => {
    it('defaults to production when no config source exists', () => {
      expect(getBackendMode()).toBe('production');
    });

    it('returns runtime backendMode when set', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(getBackendMode()).toBe('ui-review');
    });

    it('falls back to Vite env when runtime backendMode is absent', () => {
      Object.assign(import.meta.env, { VITE_BACKEND_MODE: 'ui-review' });
      expect(getBackendMode()).toBe('ui-review');
    });
  });

  describe('getAllowBackendModeSwitch', () => {
    it('defaults to false when no config source exists', () => {
      expect(getAllowBackendModeSwitch()).toBe(false);
    });

    it('returns runtime switch flag when set', () => {
      setRuntimeConfig({ allowBackendModeSwitch: true });
      expect(getAllowBackendModeSwitch()).toBe(true);
    });

    it('falls back to Vite env when runtime switch flag is absent', () => {
      Object.assign(import.meta.env, { VITE_ALLOW_BACKEND_MODE_SWITCH: 'true' });
      expect(getAllowBackendModeSwitch()).toBe(true);
    });
  });

  describe('getFunctionAppUrl', () => {
    it('returns runtime config when set', () => {
      setRuntimeConfig({
        backendMode: 'production',
        functionAppUrl: 'https://runtime.example.com',
      });
      expect(getFunctionAppUrl()).toBe('https://runtime.example.com');
    });

    it('does not require a Function App URL in ui-review mode', () => {
      setRuntimeConfig({ backendMode: 'ui-review' });
      expect(getFunctionAppUrl()).toBe('');
    });

    it('throws ConfigError with actionable message when no config source exists', () => {
      setRuntimeConfig({ backendMode: 'production' });
      expect(() => getFunctionAppUrl()).toThrow(ConfigError);
      expect(() => getFunctionAppUrl()).toThrow(/Function App URL is not configured/);
      expect(() => getFunctionAppUrl()).toThrow(/shell webpart must provide functionAppUrl/);
    });

    it('ConfigError has correct name property', () => {
      try {
        getFunctionAppUrl();
      } catch (err) {
        expect(err).toBeInstanceOf(ConfigError);
        expect((err as ConfigError).name).toBe('ConfigError');
      }
    });
  });

  describe('hasRuntimeConfig', () => {
    it('returns false before any config is set', () => {
      expect(hasRuntimeConfig()).toBe(false);
    });

    it('returns true after valid config is set', () => {
      setRuntimeConfig({ functionAppUrl: 'https://test.example.com' });
      expect(hasRuntimeConfig()).toBe(true);
    });
  });
});
