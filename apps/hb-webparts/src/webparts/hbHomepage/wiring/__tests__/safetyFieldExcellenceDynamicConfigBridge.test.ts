import { describe, expect, it } from 'vitest';
import {
  SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS,
  bridgeSafetyFieldExcellenceDynamicConfig,
} from '../safetyFieldExcellenceDynamicConfigBridge.js';

const KEYS = SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS;

describe('bridgeSafetyFieldExcellenceDynamicConfig', () => {
  it('returns the input unchanged when undefined', () => {
    expect(bridgeSafetyFieldExcellenceDynamicConfig(undefined)).toBeUndefined();
  });

  it('builds nested safetyFieldExcellenceDynamic from flat fields when source mode is set', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.sourceMode]: 'dynamic-only',
      [KEYS.functionAppBaseUrl]: 'https://safety-fn.example.com',
      [KEYS.safetyHubUrl]: 'https://safety-hub.example.com',
      [KEYS.includeStale]: true,
      [KEYS.diagnosticsEnabled]: false,
      [KEYS.emergencyUseCuratedFallback]: true,
    });
    expect(result?.safetyFieldExcellenceDynamic).toEqual({
      sourceMode: 'dynamic-only',
      functionAppBaseUrl: 'https://safety-fn.example.com',
      safetyHubUrl: 'https://safety-hub.example.com',
      includeStale: true,
      diagnosticsEnabled: false,
      emergencyUseCuratedFallback: true,
    });
  });

  it('preserves a pre-existing nested block; nested explicit values win over flat ones', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      safetyFieldExcellenceDynamic: {
        sourceMode: 'dynamic-with-curated-fallback',
        functionAppBaseUrl: 'https://nested.example.com',
        includeStale: false,
      },
      [KEYS.sourceMode]: 'dynamic-only',
      [KEYS.functionAppBaseUrl]: 'https://flat.example.com',
      [KEYS.includeStale]: true,
      [KEYS.safetyHubUrl]: 'https://hub-from-flat.example.com',
    });
    expect(result?.safetyFieldExcellenceDynamic).toEqual({
      sourceMode: 'dynamic-with-curated-fallback',
      functionAppBaseUrl: 'https://nested.example.com',
      includeStale: false,
      safetyHubUrl: 'https://hub-from-flat.example.com',
    });
  });

  it('does not activate dynamic mode when no source mode is provided', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.functionAppBaseUrl]: 'https://safety-fn.example.com',
      [KEYS.functionAppAudience]: 'api://safety-fn',
    });
    expect(result?.safetyFieldExcellenceDynamic).toBeUndefined();
  });

  it('does not activate dynamic mode when source mode is unrecognized', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.sourceMode]: 'definitely-not-a-real-mode',
      [KEYS.functionAppBaseUrl]: 'https://safety-fn.example.com',
    });
    expect(result?.safetyFieldExcellenceDynamic).toBeUndefined();
  });

  it('promotes the flat functionAppBaseUrl to top-level when missing', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.functionAppBaseUrl]: 'https://flat-top.example.com',
    });
    expect(result?.functionAppBaseUrl).toBe('https://flat-top.example.com');
  });

  it('preserves an existing top-level functionAppBaseUrl over the flat field', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      functionAppBaseUrl: 'https://existing-top.example.com',
      [KEYS.functionAppBaseUrl]: 'https://flat-top.example.com',
    });
    expect(result?.functionAppBaseUrl).toBe('https://existing-top.example.com');
  });

  it('promotes the preferred functionAppAudience to top-level when missing', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.functionAppAudience]: 'api://safety-fn',
    });
    expect(result?.functionAppAudience).toBe('api://safety-fn');
  });

  it('does not overwrite legacy backendAudience or substitute it for functionAppAudience', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      backendAudience: 'api://legacy-backend',
    });
    expect(result?.functionAppAudience).toBeUndefined();
    expect(result?.backendAudience).toBe('api://legacy-backend');
  });

  it('preserves nested functionAppBaseUrl fallback path used by resolveSafetyFunctionAppWiring', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      safetyFieldExcellenceDynamic: {
        sourceMode: 'dynamic-only',
        functionAppBaseUrl: 'https://nested-only.example.com',
      },
    });
    expect(result?.safetyFieldExcellenceDynamic).toMatchObject({
      sourceMode: 'dynamic-only',
      functionAppBaseUrl: 'https://nested-only.example.com',
    });
    expect(result?.functionAppBaseUrl).toBeUndefined();
  });

  it('does not pollute unrelated webPartProperties keys', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      foleonContentRegistryListId: '00000000-0000-0000-0000-000000000abc',
      kudosListHostUrl: 'https://kudos.example.com',
      [KEYS.sourceMode]: 'dynamic-only',
      [KEYS.functionAppBaseUrl]: 'https://safety-fn.example.com',
    });
    expect(result?.foleonContentRegistryListId).toBe('00000000-0000-0000-0000-000000000abc');
    expect(result?.kudosListHostUrl).toBe('https://kudos.example.com');
    expect(result?.functionAppBaseUrl).toBe('https://safety-fn.example.com');
  });

  it('trims whitespace on flat string fields', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({
      [KEYS.sourceMode]: '  dynamic-only  ',
      [KEYS.functionAppBaseUrl]: '  https://trim.example.com  ',
      [KEYS.functionAppAudience]: '  api://trim  ',
    });
    expect(result?.safetyFieldExcellenceDynamic).toEqual({
      sourceMode: 'dynamic-only',
      functionAppBaseUrl: 'https://trim.example.com',
    });
    expect(result?.functionAppBaseUrl).toBe('https://trim.example.com');
    expect(result?.functionAppAudience).toBe('api://trim');
  });

  it('does not synthesize manifest defaults — empty input stays empty', () => {
    const result = bridgeSafetyFieldExcellenceDynamicConfig({});
    expect(result).toEqual({});
  });
});
