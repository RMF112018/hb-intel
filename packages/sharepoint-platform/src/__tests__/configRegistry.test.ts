import { describe, expect, it } from 'vitest';
import {
  normalizeRegistryRecord,
  resolvePlatformConfigValue,
  type PlatformConfigRegistryRecord,
} from '../configRegistry.js';

const BASE: PlatformConfigRegistryRecord = {
  applicationKey: 'Foleon',
  environmentKey: 'Production',
  scopeKey: 'HBCentral',
  configKey: 'FoleonContentRegistryListGuid',
  valueType: 'Guid',
  isActive: true,
  validationStatus: 'Not Validated',
  isSecretReference: false,
  configValue: '2e57615d-457e-49b8-aef3-038e85cbe068',
};

describe('platform config registry normalization', () => {
  it('normalizes valid GUID values', () => {
    const result = normalizeRegistryRecord(BASE);
    expect(result.source).toBe('registry');
    expect(result.value).toBe('2e57615d-457e-49b8-aef3-038e85cbe068');
  });

  it('rejects invalid GUID values', () => {
    const result = normalizeRegistryRecord({ ...BASE, configValue: 'not-a-guid' });
    expect(result.source).toBe('invalid');
    expect(result.diagnostics.join(' ')).toContain('valid GUID');
  });

  it('rejects blocked placeholders', () => {
    const result = normalizeRegistryRecord({ ...BASE, validationStatus: 'Blocked' });
    expect(result.source).toBe('blocked');
  });

  it('rejects expired active records', () => {
    const result = normalizeRegistryRecord(
      { ...BASE, effectiveThrough: '2020-01-01T00:00:00.000Z' },
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(result.source).toBe('expired');
  });

  it('rejects backend URLs that include /api', () => {
    const result = normalizeRegistryRecord({
      ...BASE,
      configKey: 'FoleonApiBaseUrl',
      valueType: 'Url',
      configValue: 'https://example.test/api',
    });
    expect(result.source).toBe('invalid');
    expect(result.diagnostics.join(' ')).toContain('must not include /api');
  });

  it('parses origin lists from JSON arrays and rejects wildcards', () => {
    const valid = normalizeRegistryRecord({
      ...BASE,
      configKey: 'AcceptedFoleonOrigins',
      valueType: 'OriginList',
      configValueJson: '["https://viewer.us.foleon.com"]',
    });
    expect(valid.source).toBe('registry');
    expect(valid.value).toEqual(['https://viewer.us.foleon.com']);

    const invalid = normalizeRegistryRecord({
      ...BASE,
      configKey: 'AcceptedFoleonOrigins',
      valueType: 'OriginList',
      configValueJson: '["https://*.foleon.com"]',
    });
    expect(invalid.source).toBe('invalid');
  });

  it('does not expose secret reference names as values', () => {
    const result = normalizeRegistryRecord({
      ...BASE,
      configKey: 'FoleonClientSecret',
      valueType: 'SecretReference',
      isSecretReference: true,
      secretReferenceName: 'HB_FOLEON_CLIENT_SECRET',
      configValue: undefined,
    });
    expect(result.source).toBe('registry');
    expect(result.value).toEqual({ secretReferencePresent: true });
    expect(JSON.stringify(result.value)).not.toContain('HB_FOLEON_CLIENT_SECRET');
  });

  it('resolves exact scope before configured fallbacks', () => {
    const records: PlatformConfigRegistryRecord[] = [
      { ...BASE, scopeKey: 'Backend', configKey: 'FoleonApiBaseUrl', valueType: 'Url', configValue: 'https://fallback.example.test' },
      { ...BASE, scopeKey: 'SPFx', configKey: 'FoleonApiBaseUrl', valueType: 'Url', configValue: 'https://exact.example.test' },
    ];
    const result = resolvePlatformConfigValue<string>(records, {
      applicationKey: 'Foleon',
      environmentKey: 'Production',
      scopeKey: 'SPFx',
      configKey: 'FoleonApiBaseUrl',
      scopeFallbacks: ['Backend'],
    });
    expect(result.source).toBe('registry');
    expect(result.value).toBe('https://exact.example.test');
  });

  it('blocks duplicate active logical keys', () => {
    const result = resolvePlatformConfigValue([BASE, { ...BASE }], {
      applicationKey: 'Foleon',
      environmentKey: 'Production',
      scopeKey: 'HBCentral',
      configKey: 'FoleonContentRegistryListGuid',
    });
    expect(result.source).toBe('duplicate');
  });
});
