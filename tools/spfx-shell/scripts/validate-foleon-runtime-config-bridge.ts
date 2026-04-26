import assert from 'node:assert/strict';
import {
  applyFoleonRuntimeConfigBridge,
  buildFoleonRuntimeConfigBridge,
} from '../src/webparts/shell/foleonRuntimeConfigBridge';
import {
  buildFoleonRegistryBootstrap,
  buildFoleonRegistryConfig,
  buildFoleonRegistryItemsUrl,
  buildFoleonRegistryUnavailableConfig,
} from '../src/webparts/shell/foleonRegistryShellBridge';

const FOLEON_WEBPART_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
const NON_FOLEON_WEBPART_ID = '28acd6a7-2582-4d8a-86d4-b52bfbeb375c';

function assertFoleonPropertiesCopyToTopLevel(): void {
  const properties = {
    contentRegistryListId: '  content-list-guid  ',
    placementsListId: 'placements-list-guid',
    eventsListId: 'events-list-guid',
    expectedManifestId: FOLEON_WEBPART_ID,
    expectedPackageVersion: '1.0.16.0',
    foleonRoute: 'manage' as const,
    foleonDocId: 1234,
    foleonReaderRoutePath: ' /SitePages/Foleon-Reader.aspx ',
    foleonApiBaseUrl: ' https://functions.example.test/api ',
    foleonApiResource: ' api://foleon ',
    unknownPageProperty: 'must-not-copy',
  };
  const runtimeConfig: Record<string, unknown> = {
    webPartProperties: properties,
  };

  applyFoleonRuntimeConfigBridge(runtimeConfig, FOLEON_WEBPART_ID, properties, FOLEON_WEBPART_ID);

  assert.equal(runtimeConfig.contentRegistryListId, 'content-list-guid');
  assert.equal(runtimeConfig.placementsListId, 'placements-list-guid');
  assert.equal(runtimeConfig.eventsListId, 'events-list-guid');
  assert.equal(runtimeConfig.expectedManifestId, FOLEON_WEBPART_ID);
  assert.equal(runtimeConfig.expectedPackageVersion, '1.0.16.0');
  assert.equal(runtimeConfig.foleonRoute, 'manage');
  assert.equal(runtimeConfig.foleonDocId, 1234);
  assert.equal(runtimeConfig.foleonReaderRoutePath, '/SitePages/Foleon-Reader.aspx');
  assert.equal(runtimeConfig.foleonApiBaseUrl, 'https://functions.example.test/api');
  assert.equal(runtimeConfig.foleonApiResource, 'api://foleon');
  assert.equal(runtimeConfig.webPartProperties, properties);
  assert.equal(runtimeConfig.unknownPageProperty, undefined);
}

function assertBlankStringsAreIgnored(): void {
  const bridge = buildFoleonRuntimeConfigBridge({
    contentRegistryListId: '   ',
    placementsListId: '',
    eventsListId: '\n',
    foleonRoute: 'highlights',
    foleonDocId: ' ',
  });

  assert.equal(bridge.contentRegistryListId, undefined);
  assert.equal(bridge.placementsListId, undefined);
  assert.equal(bridge.eventsListId, undefined);
  assert.equal(bridge.foleonDocId, undefined);
  assert.equal(bridge.foleonRoute, 'highlights');
}

function assertDedicatedReaderRoutesBridge(): void {
  const bridge = buildFoleonRuntimeConfigBridge({
    foleonRoute: 'projectSpotlight',
  });

  assert.equal(bridge.foleonRoute, 'projectSpotlight');
}

function assertAcceptedOriginsStringNormalizesToArray(): void {
  const bridge = buildFoleonRuntimeConfigBridge({
    acceptedFoleonOrigins: ' https://viewer.us.foleon.com,\nhttps://preview.foleon.com ,, ',
  });

  assert.deepEqual(bridge.acceptedFoleonOrigins, [
    'https://viewer.us.foleon.com',
    'https://preview.foleon.com',
  ]);
}

function assertNonFoleonWebpartDoesNotReceiveBridgeFields(): void {
  const properties = {
    contentRegistryListId: 'content-list-guid',
    placementsListId: 'placements-list-guid',
    acceptedFoleonOrigins: 'https://viewer.us.foleon.com',
  };
  const runtimeConfig: Record<string, unknown> = {
    webPartProperties: properties,
  };

  applyFoleonRuntimeConfigBridge(
    runtimeConfig,
    NON_FOLEON_WEBPART_ID,
    properties,
    FOLEON_WEBPART_ID,
  );

  assert.deepEqual(runtimeConfig, { webPartProperties: properties });
}

function assertRegistryDefaultsFillOnlyMissingValues(): void {
  const properties = {
    contentRegistryListId: 'content-list-guid',
  };
  const runtimeConfig: Record<string, unknown> = {
    webPartProperties: properties,
  };

  applyFoleonRuntimeConfigBridge(
    runtimeConfig,
    FOLEON_WEBPART_ID,
    properties,
    FOLEON_WEBPART_ID,
    {
      contentRegistryListId: 'registry-content-guid',
      placementsListId: 'registry-placements-guid',
      foleonApiBaseUrl: 'https://functions.example.test',
    },
  );

  assert.equal(runtimeConfig.contentRegistryListId, 'content-list-guid');
  assert.equal(runtimeConfig.placementsListId, 'registry-placements-guid');
  assert.equal(runtimeConfig.foleonApiBaseUrl, 'https://functions.example.test');
}

function assertRegistryBootstrapDefaultsAndOverrides(): void {
  const defaults = buildFoleonRegistryBootstrap({});
  assert.equal(defaults.siteUrl, 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
  assert.equal(defaults.listTitle, 'HB Platform Configuration Registry');
  assert.equal(defaults.environmentKey, 'Production');

  const overrides = buildFoleonRegistryBootstrap({
    foleonRegistrySiteUrl: ' https://tenant.sharepoint.com/sites/Other ',
    foleonRegistryListTitle: ' Registry ',
    foleonRegistryEnvironmentKey: ' Test ',
  });
  assert.equal(overrides.siteUrl, 'https://tenant.sharepoint.com/sites/Other');
  assert.equal(overrides.listTitle, 'Registry');
  assert.equal(overrides.environmentKey, 'Test');
}

function assertRegistryFetchUrlIsFoleonScoped(): void {
  const url = decodeURIComponent(buildFoleonRegistryItemsUrl(buildFoleonRegistryBootstrap({})).replace(/\+/g, ' '));
  assert.match(url, /ApplicationKey eq 'Foleon'/);
  assert.match(url, /ApplicationKey eq 'FunctionApp'/);
  assert.match(url, /EnvironmentKey eq 'Production'/);
}

function assertRegistryRecordsMapToRuntimeConfig(): void {
  const bootstrap = buildFoleonRegistryBootstrap({});
  const config = buildFoleonRegistryConfig(bootstrap, [
    {
      ApplicationKey: 'Foleon',
      EnvironmentKey: 'Production',
      ScopeKey: 'Backend',
      ConfigKey: 'FoleonApiResource',
      ValueType: 'Url',
      IsActive: true,
      ValidationStatus: 'Valid',
      IsSecretReference: false,
      ConfigValue: 'api://08c399eb-a394-4087-b859-659d493f8dc7',
      ApiResource: 'api://08c399eb-a394-4087-b859-659d493f8dc7',
    },
  ]);
  const registry = config.platformConfigRegistry as { readonly records: ReadonlyArray<Record<string, unknown>> };
  assert.equal(registry.records[0].configKey, 'FoleonApiResource');
  assert.equal(registry.records[0].apiResource, 'api://08c399eb-a394-4087-b859-659d493f8dc7');
  assert.deepEqual(config.platformConfigRegistryStatus, { status: 'available' });
}

function assertRegistryFailurePassesSafeDiagnostics(): void {
  const bootstrap = buildFoleonRegistryBootstrap({});
  const config = buildFoleonRegistryUnavailableConfig(bootstrap, 'network unavailable');
  const registry = config.platformConfigRegistry as { readonly records: ReadonlyArray<Record<string, unknown>> };
  assert.deepEqual(registry.records, []);
  assert.deepEqual(config.platformConfigRegistryStatus, {
    status: 'unavailable',
    message: 'network unavailable',
  });
}

assertFoleonPropertiesCopyToTopLevel();
assertBlankStringsAreIgnored();
assertDedicatedReaderRoutesBridge();
assertAcceptedOriginsStringNormalizesToArray();
assertNonFoleonWebpartDoesNotReceiveBridgeFields();
assertRegistryDefaultsFillOnlyMissingValues();
assertRegistryBootstrapDefaultsAndOverrides();
assertRegistryFetchUrlIsFoleonScoped();
assertRegistryRecordsMapToRuntimeConfig();
assertRegistryFailurePassesSafeDiagnostics();

console.log('PASS Foleon SPFx runtime config bridge validation');
