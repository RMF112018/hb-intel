import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRuntimeConfig,
  getFunctionAppUrl,
  hasRuntimeConfig,
  ConfigError,
  _resetConfig,
} from '../config/runtimeConfig.js';

describe('runtimeConfig', () => {
  beforeEach(() => {
    _resetConfig();
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
  });

  describe('getFunctionAppUrl', () => {
    it('returns runtime config when set', () => {
      setRuntimeConfig({ functionAppUrl: 'https://runtime.example.com' });
      expect(getFunctionAppUrl()).toBe('https://runtime.example.com');
    });

    it('throws ConfigError with actionable message when no config source exists', () => {
      // No runtime config set, and VITE_FUNCTION_APP_URL is not defined in test env
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
