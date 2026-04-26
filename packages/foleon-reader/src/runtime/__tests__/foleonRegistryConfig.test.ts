import { describe, expect, it } from 'vitest';
import {
  resolveFoleonRegistryRuntimeConfig,
  type PlatformConfigRegistryRecord,
} from '../foleonRegistryConfig.js';

const GUIDS = {
  content: '2e57615d-457e-49b8-aef3-038e85cbe068',
  placements: '5b4754b6-9411-453d-8e16-1247ec5b476a',
  events: '7786b5ac-d1e5-418b-9951-8e797dda3d7a',
  sync: 'f29dabe9-16c8-4c67-ab9e-98e12f771680',
};

const BACKEND_URL = 'https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net';

function record(overrides: Partial<PlatformConfigRegistryRecord>): PlatformConfigRegistryRecord {
  return {
    applicationKey: 'Foleon',
    environmentKey: 'Production',
    scopeKey: 'HBCentral',
    configKey: 'Example',
    valueType: 'String',
    isActive: true,
    validationStatus: 'Not Validated',
    isSecretReference: false,
    ...overrides,
  };
}

function baselineRecords(): PlatformConfigRegistryRecord[] {
  return [
    record({ configKey: 'FoleonContentRegistryListGuid', valueType: 'Guid', configValue: GUIDS.content, listGuid: GUIDS.content }),
    record({ configKey: 'FoleonHomepagePlacementsListGuid', valueType: 'Guid', configValue: GUIDS.placements, listGuid: GUIDS.placements }),
    record({ configKey: 'FoleonInteractionEventsListGuid', valueType: 'Guid', configValue: GUIDS.events, listGuid: GUIDS.events }),
    record({ configKey: 'FoleonSyncRunsListGuid', valueType: 'Guid', configValue: GUIDS.sync, listGuid: GUIDS.sync }),
    record({ scopeKey: 'Backend', configKey: 'FoleonApiBaseUrl', valueType: 'Url', configValue: BACKEND_URL, apiBaseUrl: BACKEND_URL }),
    record({ scopeKey: 'SPFx', configKey: 'AcceptedFoleonOrigins', valueType: 'OriginList', configValueJson: '["https://viewer.us.foleon.com"]' }),
    record({ scopeKey: 'SPFx', configKey: 'ExpectedManifestId', valueType: 'Guid', configValue: '2160edb3-675e-4451-92bb-8345f9d1c71e' }),
    record({ scopeKey: 'SPFx', configKey: 'FoleonExpectedPackageVersion', valueType: 'Version', configValue: '1.0.23.0' }),
  ];
}

function registry(records = baselineRecords()) {
  return {
    bootstrap: {
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      listTitle: 'HB Platform Configuration Registry',
      environmentKey: 'Production',
    },
    records,
  };
}

describe('resolveFoleonRegistryRuntimeConfig', () => {
  it('lets explicit overrides win over registry values', () => {
    const result = resolveFoleonRegistryRuntimeConfig({
      registry: registry(),
      overrides: { contentRegistryListId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    });
    expect(result.config.contentRegistryListId).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(result.summary.configSourceByKey.FoleonContentRegistryListGuid).toBe('override');
  });

  it('fills missing override values from valid registry records', () => {
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry() });
    expect(result.config.contentRegistryListId).toBe(GUIDS.content);
    expect(result.config.placementsListId).toBe(GUIDS.placements);
    expect(result.config.eventsListId).toBe(GUIDS.events);
    expect(result.config.foleonApiBaseUrl).toBe(BACKEND_URL);
    expect(result.summary.foleonReadiness.listBindingsReady).toBe(true);
    expect(result.summary.foleonReadiness.backendUrlReady).toBe(true);
  });

  it('rejects blocked placeholders and keeps readiness partial', () => {
    const records = baselineRecords().map((entry) =>
      entry.configKey === 'FoleonContentRegistryListGuid'
        ? { ...entry, validationStatus: 'Blocked' }
        : entry,
    );
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry(records) });
    expect(result.config.contentRegistryListId).toBeUndefined();
    expect(result.summary.registryValuesBlocked).toContain('FoleonContentRegistryListGuid');
    expect(result.summary.foleonReadiness.listBindingsReady).toBe(false);
  });

  it('blocks duplicate active keys', () => {
    const duplicate = baselineRecords()[0];
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry([...baselineRecords(), duplicate]) });
    expect(result.summary.registryDuplicateActiveKeysDetected).toBe(true);
    expect(result.summary.registryReadinessState).toBe('registry-invalid');
  });

  it('rejects expired active values', () => {
    const records = baselineRecords().map((entry) =>
      entry.configKey === 'FoleonHomepagePlacementsListGuid'
        ? { ...entry, effectiveThrough: '2020-01-01T00:00:00.000Z' }
        : entry,
    );
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry(records) });
    expect(result.summary.registryValuesExpired).toContain('FoleonHomepagePlacementsListGuid');
    expect(result.summary.foleonReadiness.listBindingsReady).toBe(false);
  });

  it('rejects invalid GUID records', () => {
    const records = baselineRecords().map((entry) =>
      entry.configKey === 'FoleonInteractionEventsListGuid'
        ? { ...entry, configValue: 'not-a-guid' }
        : entry,
    );
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry(records) });
    expect(result.summary.registryValuesInvalid).toContain('FoleonInteractionEventsListGuid');
  });

  it('rejects backend URLs with /api', () => {
    const records = baselineRecords().map((entry) =>
      entry.configKey === 'FoleonApiBaseUrl'
        ? { ...entry, configValue: `${BACKEND_URL}/api`, apiBaseUrl: `${BACKEND_URL}/api` }
        : entry,
    );
    const result = resolveFoleonRegistryRuntimeConfig({ registry: registry(records) });
    expect(result.config.foleonApiBaseUrl).toBeUndefined();
    expect(result.summary.foleonReadiness.backendUrlReady).toBe(false);
  });

  it('uses BackendFunctionAppUrl fallback only when FoleonApiBaseUrl is missing', () => {
    const withBoth = [
      ...baselineRecords(),
      record({ applicationKey: 'FunctionApp', scopeKey: 'Backend', configKey: 'BackendFunctionAppUrl', valueType: 'Url', configValue: 'https://fallback.example.test' }),
    ];
    expect(resolveFoleonRegistryRuntimeConfig({ registry: registry(withBoth) }).config.foleonApiBaseUrl).toBe(BACKEND_URL);

    const withoutFoleonApi = withBoth.filter((entry) => entry.configKey !== 'FoleonApiBaseUrl');
    expect(resolveFoleonRegistryRuntimeConfig({ registry: registry(withoutFoleonApi) }).config.foleonApiBaseUrl)
      .toBe('https://fallback.example.test');
  });

  it('redacts secret-reference values and reports auth-resource-missing', () => {
    const result = resolveFoleonRegistryRuntimeConfig({
      registry: registry([
        ...baselineRecords(),
        record({
          scopeKey: 'Backend',
          configKey: 'FoleonClientSecret',
          valueType: 'SecretReference',
          isSecretReference: true,
          secretReferenceName: 'HB_FOLEON_CLIENT_SECRET',
          configValue: undefined,
        }),
      ]),
    });
    expect(JSON.stringify(result.summary)).not.toContain('HB_FOLEON_CLIENT_SECRET');
    expect(result.summary.registryReadinessState).toBe('auth-resource-missing');
    expect(result.summary.foleonReadiness.authResourceReady).toBe(false);
    expect(result.summary.foleonReadiness.writePathReady).toBe(false);
  });
});
