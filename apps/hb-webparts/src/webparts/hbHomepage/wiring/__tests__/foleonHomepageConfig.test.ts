import { describe, expect, it } from 'vitest';
import {
  HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
  HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
  extractHomepageFoleonConfig,
  readHomepageFoleonApiResource,
  toEmbeddedFoleonMountConfig,
} from '../foleonHomepageConfig.js';

describe('homepage embedded Foleon config', () => {
  it('accepts homepage-specific property names and maps them into embedded mount config', () => {
    const config = extractHomepageFoleonConfig({
      foleonContentRegistryListId: 'content-list-id',
      foleonPlacementsListId: 'placements-list-id',
      foleonEventsListId: 'events-list-id',
      foleonAcceptedOrigins: 'https://viewer.us.foleon.com, https://example.foleon.test',
      foleonAllowPreview: true,
      foleonExpectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      foleonExpectedPackageVersion: '1.0.23.0',
      foleonApiBaseUrl: 'https://functions.example/api',
      foleonApiResource: 'api://foleon-api',
    });

    expect(config.foleonAcceptedOrigins).toEqual([
      'https://viewer.us.foleon.com',
      'https://example.foleon.test',
    ]);
    expect(readHomepageFoleonApiResource({ foleonApiResource: ' api://foleon-api ' }))
      .toBe('api://foleon-api');
    expect(toEmbeddedFoleonMountConfig(config, 'projectSpotlight')).toEqual({
      contentRegistryListId: 'content-list-id',
      placementsListId: 'placements-list-id',
      eventsListId: 'events-list-id',
      acceptedFoleonOrigins: [
        'https://viewer.us.foleon.com',
        'https://example.foleon.test',
      ],
      allowPreview: true,
      expectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      expectedPackageVersion: '1.0.23.0',
      foleonRoute: 'projectSpotlight',
      foleonApiBaseUrl: 'https://functions.example/api',
      foleonApiResource: 'api://foleon-api',
    });
    expect(toEmbeddedFoleonMountConfig(config, 'companyPulse')).toEqual(
      expect.objectContaining({
        foleonRoute: 'companyPulse',
        expectedPackageVersion: '1.0.23.0',
        foleonApiResource: 'api://foleon-api',
      }),
    );
    expect(toEmbeddedFoleonMountConfig(config, 'leadershipMessage')).toEqual(
      expect.objectContaining({
        foleonRoute: 'leadershipMessage',
        expectedPackageVersion: '1.0.23.0',
        foleonApiResource: 'api://foleon-api',
      }),
    );
  });

  it('defaults expected Foleon package governance to current Wave 01 package truth', () => {
    const config = extractHomepageFoleonConfig({});

    expect(config.foleonExpectedManifestId).toBe(HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID);
    expect(config.foleonExpectedPackageVersion).toBe(HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION);
    expect(config.foleonExpectedPackageVersion).toBe('1.0.23.0');
  });

  it('also accepts a nested foleon config bag without hardcoding tenant list IDs', () => {
    const config = extractHomepageFoleonConfig({
      foleon: {
        foleonContentRegistryListId: 'nested-content',
        foleonPlacementsListId: 'nested-placements',
        foleonEventsListId: 'nested-events',
      },
    });

    expect(config.foleonContentRegistryListId).toBe('nested-content');
    expect(config.foleonPlacementsListId).toBe('nested-placements');
    expect(config.foleonEventsListId).toBe('nested-events');
  });

  it('fills missing homepage Foleon properties from registry values', () => {
    const config = extractHomepageFoleonConfig({
      platformConfigRegistry: {
        bootstrap: {
          siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
          listTitle: 'HB Platform Configuration Registry',
          environmentKey: 'Production',
        },
        records: [
          registryRecord('FoleonContentRegistryListGuid', 'HBCentral', 'Guid', '11111111-1111-1111-1111-111111111111'),
          registryRecord('FoleonHomepagePlacementsListGuid', 'HBCentral', 'Guid', '22222222-2222-2222-2222-222222222222'),
          registryRecord('FoleonInteractionEventsListGuid', 'HBCentral', 'Guid', '33333333-3333-3333-3333-333333333333'),
          registryRecord('FoleonApiBaseUrl', 'Backend', 'Url', 'https://functions.example.test'),
        ],
      },
    });

    expect(config.foleonContentRegistryListId).toBe('11111111-1111-1111-1111-111111111111');
    expect(config.foleonPlacementsListId).toBe('22222222-2222-2222-2222-222222222222');
    expect(config.foleonEventsListId).toBe('33333333-3333-3333-3333-333333333333');
    expect(config.foleonApiBaseUrl).toBe('https://functions.example.test');
  });

  it('keeps explicit homepage Foleon properties ahead of registry values', () => {
    const config = extractHomepageFoleonConfig({
      foleonContentRegistryListId: 'override-content',
      platformConfigRegistry: {
        bootstrap: {
          siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
          listTitle: 'HB Platform Configuration Registry',
          environmentKey: 'Production',
        },
        records: [
          registryRecord('FoleonContentRegistryListGuid', 'HBCentral', 'Guid', '11111111-1111-1111-1111-111111111111'),
        ],
      },
    });

    expect(config.foleonContentRegistryListId).toBe('override-content');
  });
});

function registryRecord(
  configKey: string,
  scopeKey: string,
  valueType: string,
  value: string,
): Record<string, unknown> {
  return {
    applicationKey: 'Foleon',
    environmentKey: 'Production',
    scopeKey,
    configKey,
    valueType,
    isActive: true,
    validationStatus: 'Not Validated',
    isSecretReference: false,
    configValue: value,
    listGuid: valueType === 'Guid' ? value : undefined,
    apiBaseUrl: valueType === 'Url' ? value : undefined,
  };
}
