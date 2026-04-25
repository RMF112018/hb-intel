import { describe, it, expect, vi } from 'vitest';
import {
  readFunctionAppAudience,
  readFunctionAppBaseUrl,
  resolveSafetyFunctionAppWiring,
} from '../safetyFunctionAppWiring.js';

describe('readFunctionAppBaseUrl', () => {
  it('reads the top-level functionAppBaseUrl property', () => {
    expect(
      readFunctionAppBaseUrl({ functionAppBaseUrl: 'https://example-function.app' }),
    ).toBe('https://example-function.app');
  });

  it('falls back to safetyFieldExcellenceDynamic.functionAppBaseUrl', () => {
    expect(
      readFunctionAppBaseUrl({
        safetyFieldExcellenceDynamic: {
          sourceMode: 'dynamic-only',
          functionAppBaseUrl: 'https://nested-function.app',
        },
      }),
    ).toBe('https://nested-function.app');
  });

  it('prefers the top-level property over the nested fallback', () => {
    expect(
      readFunctionAppBaseUrl({
        functionAppBaseUrl: 'https://top.example',
        safetyFieldExcellenceDynamic: {
          functionAppBaseUrl: 'https://nested.example',
        },
      }),
    ).toBe('https://top.example');
  });

  it('returns undefined when both are missing, empty, whitespace, or non-string', () => {
    expect(readFunctionAppBaseUrl(undefined)).toBeUndefined();
    expect(readFunctionAppBaseUrl({})).toBeUndefined();
    expect(readFunctionAppBaseUrl({ functionAppBaseUrl: '' })).toBeUndefined();
    expect(readFunctionAppBaseUrl({ functionAppBaseUrl: '   ' })).toBeUndefined();
    expect(readFunctionAppBaseUrl({ functionAppBaseUrl: 42 as unknown as string })).toBeUndefined();
    expect(
      readFunctionAppBaseUrl({
        safetyFieldExcellenceDynamic: { functionAppBaseUrl: '   ' },
      }),
    ).toBeUndefined();
    expect(
      readFunctionAppBaseUrl({ safetyFieldExcellenceDynamic: 'not-an-object' as unknown as Record<string, unknown> }),
    ).toBeUndefined();
  });

  it('trims surrounding whitespace', () => {
    expect(
      readFunctionAppBaseUrl({ functionAppBaseUrl: '  https://trim.example  ' }),
    ).toBe('https://trim.example');
  });
});

describe('readFunctionAppAudience', () => {
  it('reads the preferred top-level functionAppAudience property', () => {
    expect(readFunctionAppAudience({ functionAppAudience: 'api://safety-fn' })).toBe(
      'api://safety-fn',
    );
  });

  it('falls back to legacy backendAudience when functionAppAudience is absent', () => {
    expect(readFunctionAppAudience({ backendAudience: 'api://legacy-backend' })).toBe(
      'api://legacy-backend',
    );
  });

  it('prefers functionAppAudience over backendAudience', () => {
    expect(
      readFunctionAppAudience({
        functionAppAudience: 'api://preferred',
        backendAudience: 'api://legacy',
      }),
    ).toBe('api://preferred');
  });

  it('returns undefined when both are missing, empty, or non-string', () => {
    expect(readFunctionAppAudience(undefined)).toBeUndefined();
    expect(readFunctionAppAudience({})).toBeUndefined();
    expect(readFunctionAppAudience({ functionAppAudience: '' })).toBeUndefined();
    expect(readFunctionAppAudience({ backendAudience: '   ' })).toBeUndefined();
    expect(
      readFunctionAppAudience({ functionAppAudience: null as unknown as string }),
    ).toBeUndefined();
  });
});

describe('resolveSafetyFunctionAppWiring', () => {
  it('invokes createTokenProvider exactly once with the resolved audience when audience is present', () => {
    const tokenProvider = vi.fn(async () => 'fake-token');
    const createTokenProvider = vi.fn(() => tokenProvider);
    const wiring = resolveSafetyFunctionAppWiring(
      {
        functionAppBaseUrl: 'https://example.app',
        functionAppAudience: 'api://safety-fn',
      },
      createTokenProvider,
    );
    expect(createTokenProvider).toHaveBeenCalledTimes(1);
    expect(createTokenProvider).toHaveBeenCalledWith('api://safety-fn');
    expect(wiring.functionAppBaseUrl).toBe('https://example.app');
    expect(wiring.getFunctionAppToken).toBe(tokenProvider);
  });

  it('does not invoke createTokenProvider when audience is missing — getFunctionAppToken stays undefined', () => {
    const createTokenProvider = vi.fn(() => async () => 'should-not-happen');
    const wiring = resolveSafetyFunctionAppWiring(
      { functionAppBaseUrl: 'https://example.app' },
      createTokenProvider,
    );
    expect(createTokenProvider).not.toHaveBeenCalled();
    expect(wiring.functionAppBaseUrl).toBe('https://example.app');
    expect(wiring.getFunctionAppToken).toBeUndefined();
  });

  it('returns functionAppBaseUrl even when getFunctionAppToken is undefined (URL-only degradation case)', () => {
    const wiring = resolveSafetyFunctionAppWiring(
      { functionAppBaseUrl: 'https://url-only.app' },
      () => undefined,
    );
    expect(wiring.functionAppBaseUrl).toBe('https://url-only.app');
    expect(wiring.getFunctionAppToken).toBeUndefined();
  });

  it('honors the legacy backendAudience fallback so existing tenant configs keep working', () => {
    const tokenProvider = vi.fn(async () => 'legacy-token');
    const createTokenProvider = vi.fn(() => tokenProvider);
    const wiring = resolveSafetyFunctionAppWiring(
      {
        functionAppBaseUrl: 'https://legacy.app',
        backendAudience: 'api://legacy-backend',
      },
      createTokenProvider,
    );
    expect(createTokenProvider).toHaveBeenCalledTimes(1);
    expect(createTokenProvider).toHaveBeenCalledWith('api://legacy-backend');
    expect(wiring.getFunctionAppToken).toBe(tokenProvider);
  });

  it('returns both seams undefined when neither url nor audience is configured', () => {
    const createTokenProvider = vi.fn(() => async () => 'unused');
    const wiring = resolveSafetyFunctionAppWiring({}, createTokenProvider);
    expect(wiring.functionAppBaseUrl).toBeUndefined();
    expect(wiring.getFunctionAppToken).toBeUndefined();
    expect(createTokenProvider).not.toHaveBeenCalled();
  });
});
