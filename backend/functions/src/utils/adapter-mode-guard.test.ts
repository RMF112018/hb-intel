import { describe, it, expect, vi, afterEach } from 'vitest';
import { normalizeAdapterMode, assertAdapterModeValid } from './adapter-mode-guard.js';

describe('normalizeAdapterMode', () => {
  it('returns proxy for "proxy"', () => {
    expect(normalizeAdapterMode('proxy')).toBe('proxy');
  });

  it('normalizes "real" to "proxy" (backward compat)', () => {
    expect(normalizeAdapterMode('real')).toBe('proxy');
  });

  it('returns mock for "mock"', () => {
    expect(normalizeAdapterMode('mock')).toBe('mock');
  });

  it('throws for unknown mode', () => {
    expect(() => normalizeAdapterMode('banana')).toThrow('Unknown adapter mode: "banana"');
  });

  it('throws for empty string', () => {
    expect(() => normalizeAdapterMode('')).toThrow('Unknown adapter mode');
  });
});

describe('assertAdapterModeValid', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns proxy when HBC_ADAPTER_MODE=proxy', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    expect(assertAdapterModeValid()).toBe('proxy');
  });

  it('normalizes "real" to proxy', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'real');
    expect(assertAdapterModeValid()).toBe('proxy');
  });

  it('defaults to proxy when HBC_ADAPTER_MODE is unset', () => {
    delete process.env.HBC_ADAPTER_MODE;
    expect(assertAdapterModeValid()).toBe('proxy');
  });

  it('returns mock when HBC_ADAPTER_MODE=mock in non-production', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    delete process.env.AZURE_FUNCTIONS_ENVIRONMENT;
    expect(assertAdapterModeValid()).toBe('mock');
  });

  it('allows mock in production when NODE_ENV=test (test runner)', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('AZURE_FUNCTIONS_ENVIRONMENT', 'Production');
    vi.stubEnv('NODE_ENV', 'test');
    expect(assertAdapterModeValid()).toBe('mock');
  });

  it('throws when mock is used in production (non-test)', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('AZURE_FUNCTIONS_ENVIRONMENT', 'Production');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => assertAdapterModeValid()).toThrow('Mock mode is not permitted in production');
  });

  it('throws for unknown mode', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'invalid');
    expect(() => assertAdapterModeValid()).toThrow('Unknown adapter mode: "invalid"');
  });

  it('error message includes guidance', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'invalid');
    try {
      assertAdapterModeValid();
      expect.fail('should throw');
    } catch (err) {
      expect((err as Error).message).toContain('HBC_ADAPTER_MODE');
      expect((err as Error).message).toContain('proxy');
      expect((err as Error).message).toContain('mock');
    }
  });
});
