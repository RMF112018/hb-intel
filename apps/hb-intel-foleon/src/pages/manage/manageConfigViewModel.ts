import type {
  FoleonConfigDiagnostics,
  FoleonReadinessIssueCode,
  FoleonRuntimeReadiness,
  IFoleonRuntimeContract,
} from '../../runtime/foleonRuntimeContract.js';

export type ConfigSourceLabel = 'Override' | 'Registry' | 'Default' | 'Missing' | 'Blocked';
export type ConfigStatusLabel = 'Configured' | 'Missing' | 'Valid' | 'Warning' | 'Blocked';

export interface RuntimeReadinessCard {
  readonly label: string;
  readonly status: ConfigStatusLabel;
  readonly detail: string;
  readonly nextAction: string;
}

export interface ConfigSourceRow {
  readonly key: string;
  readonly displayValue: string;
  readonly source: ConfigSourceLabel;
  readonly validationStatus: ConfigStatusLabel;
  readonly required: boolean;
  readonly actionNeeded: string;
}

const CONFIG_KEYS = [
  'FoleonContentRegistryListGuid',
  'FoleonHomepagePlacementsListGuid',
  'FoleonInteractionEventsListGuid',
  'FoleonSyncRunsListGuid',
  'BackendFunctionAppUrl',
  'FoleonApiBaseUrl',
  'FoleonApiResource',
  'AcceptedFoleonOrigins',
  'ExpectedManifestId',
  'FoleonExpectedPackageVersion',
  'HomepageExpectedPackageVersion',
  'MarketingNewHostPageUrl',
  'HBCentralHubSiteUrl',
] as const;

const REQUIRED_KEYS = new Set<string>([
  'FoleonContentRegistryListGuid',
  'FoleonHomepagePlacementsListGuid',
  'FoleonInteractionEventsListGuid',
  'FoleonApiBaseUrl',
  'FoleonApiResource',
  'AcceptedFoleonOrigins',
  'ExpectedManifestId',
  'FoleonExpectedPackageVersion',
]);

export function buildRuntimeReadinessCards(
  readiness: FoleonRuntimeReadiness | undefined,
  diagnostics: FoleonConfigDiagnostics | undefined,
): ReadonlyArray<RuntimeReadinessCard> {
  const r = readiness ?? emptyReadiness();
  return [
    card('Registry', r.registryReady, 'Registry source and hygiene checks.', 'Resolve registry fetch, duplicate key, or secret hygiene blockers.'),
    card('List Bindings', r.listBindingsReady, 'Foleon SharePoint list bindings.', 'Confirm content, placements, and events list GUID records.'),
    card('Backend URL', r.backendUrlReady, 'Backend Function App origin is configured.', 'Resolve FoleonApiBaseUrl or BackendFunctionAppUrl.'),
    card('API Resource', r.authResourceReady, 'Entra Application ID URI is configured.', 'Resolve FoleonApiResource.'),
    card('Token Provider', r.tokenProviderReady, 'SPFx AAD token provider creation.', 'Confirm SPFx context and AAD token provider availability.'),
    card('Token Acquisition', r.tokenAcquisitionReady, 'SPFx token acquisition for the resolved API resource.', 'Confirm API permissions and token audience.'),
    card('Backend Safe Config', r.backendSafeConfigReady, 'Backend safe-config readiness.', 'Confirm GET /api/foleon/config succeeds and reports required safe config.'),
    card('Route Authorization', r.backendRouteAuthorizationReady, 'Backend read/write route authorization proof.', 'Confirm backend route authorization before enabling writes.'),
    card('Read Path', r.readPathReady, 'Content and placement read path.', 'Confirm read-only backend probes and Manager loading.'),
    card('Write Path', r.writePathReady, 'Save, validate, publish, suppress, and placement writes.', 'Keep blocked until safe-config and route authorization are proven.'),
    card('Sync Path', r.syncPathReady, 'Foleon OAuth/API sync readiness.', 'Configure backend Foleon OAuth before sync operations.'),
  ].map((entry) => withBlocker(entry, diagnostics));
}

export function buildConfigSourceRows(
  diagnostics: FoleonConfigDiagnostics | undefined,
): ReadonlyArray<ConfigSourceRow> {
  return CONFIG_KEYS.map((key) => {
    const source = normalizeSource(diagnostics?.configSourceByKey?.[key]);
    const status = normalizeStatus(diagnostics?.configStatusByKey?.[key], source);
    return {
      key,
      displayValue: status === 'Configured' || status === 'Valid' || status === 'Warning' ? 'Configured (redacted)' : status,
      source,
      validationStatus: status,
      required: REQUIRED_KEYS.has(key),
      actionNeeded: actionForRow(key, source, status),
    };
  });
}

export function buildSafeDiagnostics(contract: IFoleonRuntimeContract): Record<string, unknown> {
  return {
    hostMode: contract.hostMode,
    route: contract.route,
    canInitialize: contract.canInitialize,
    readiness: contract.foleonReadiness ?? emptyReadiness(),
    registryFetchStatus: contract.foleonConfigDiagnostics?.registryFetchStatus ?? 'not-configured',
    registrySecretHygieneStatus: contract.foleonConfigDiagnostics?.registrySecretHygieneStatus ?? 'unknown',
    registryDuplicateActiveKeysDetected: contract.foleonConfigDiagnostics?.registryDuplicateActiveKeysDetected ?? false,
    blockerCodes: contract.foleonConfigDiagnostics?.blockers.map((blocker) => blocker.code) ?? [],
    governance: {
      manifestIdMatchesExpected: contract.governed.manifestIdMatchesExpected,
      packageVersionMatchesExpected: contract.governed.packageVersionMatchesExpected,
    },
    originPolicy: {
      acceptedOriginCount: contract.originPolicy.allowedOrigins.length,
      allowPreview: contract.originPolicy.allowPreview,
      requireHttps: contract.originPolicy.requireHttps,
    },
  };
}

function card(
  label: string,
  ready: boolean,
  detail: string,
  nextAction: string,
): RuntimeReadinessCard {
  return {
    label,
    status: ready ? 'Valid' : 'Blocked',
    detail,
    nextAction: ready ? 'No action needed.' : nextAction,
  };
}

/** Maps readiness card labels to blocker codes so token-related cards do not cross-match. */
const READINESS_CARD_BLOCKER_CODES: Readonly<Record<string, ReadonlyArray<FoleonReadinessIssueCode>>> = {
  Registry: ['registry-duplicate-active-key', 'registry-secret-hygiene-failed', 'registry-unavailable'],
  'List Bindings': ['list-bindings-missing'],
  'Backend URL': ['backend-url-missing'],
  'API Resource': ['auth-resource-missing'],
  'Token Provider': ['token-provider-unavailable'],
  'Token Acquisition': ['token-acquisition-failed'],
  'Backend Safe Config': ['backend-safe-config-unavailable', 'backend-graph-config-missing'],
  'Route Authorization': ['backend-route-authorization-failed', 'backend-route-authorization-unproven'],
  'Read Path': ['backend-route-authorization-failed'],
  'Write Path': ['backend-route-authorization-failed', 'backend-route-authorization-unproven'],
  'Sync Path': ['sync-oauth-config-missing'],
};

function withBlocker(
  entry: RuntimeReadinessCard,
  diagnostics: FoleonConfigDiagnostics | undefined,
): RuntimeReadinessCard {
  if (entry.status === 'Valid') return entry;
  const codes = READINESS_CARD_BLOCKER_CODES[entry.label];
  if (!codes?.length) return entry;
  const blocker = diagnostics?.blockers.find((item) => codes.includes(item.code));
  return blocker ? { ...entry, detail: safeBlockerMessage(blocker.code, blocker.message) } : entry;
}

function safeBlockerMessage(code: string, message: string): string {
  if (code === 'token-acquisition-failed' && message.toLowerCase().includes('consent_required')) {
    return 'consent_required: Approve HB SharePoint Creator / access_as_user in SharePoint Admin Center API access.';
  }
  if (code === 'token-acquisition-failed') {
    return 'SPFx token acquisition failed for the resolved Foleon API resource.';
  }
  return message;
}

function normalizeSource(source: string | undefined): ConfigSourceLabel {
  if (source === 'override') return 'Override';
  if (source === 'registry') return 'Registry';
  if (source === 'default') return 'Default';
  if (source === 'blocked' || source === 'invalid' || source === 'expired' || source === 'duplicate') return 'Blocked';
  return 'Missing';
}

function normalizeStatus(status: string | undefined, source: ConfigSourceLabel): ConfigStatusLabel {
  if (source === 'Missing') return 'Missing';
  if (source === 'Blocked') return 'Blocked';
  if (status === 'blocked' || status === 'invalid' || status === 'expired' || status === 'duplicate') return 'Blocked';
  if (status === 'missing') return 'Missing';
  if (status === 'registry' || status === 'override' || status === 'default') return 'Configured';
  return source === 'Registry' || source === 'Override' || source === 'Default' ? 'Configured' : 'Missing';
}

function actionForRow(key: string, source: ConfigSourceLabel, status: ConfigStatusLabel): string {
  if (status === 'Blocked') return `Resolve ${key} validation status in the central registry.`;
  if (status === 'Missing' && REQUIRED_KEYS.has(key)) return `Populate ${key} from registry or explicit override.`;
  if (status === 'Missing') return 'Optional value is not configured.';
  return source === 'Override' ? 'Review whether the explicit override is still needed.' : 'No action needed.';
}

function emptyReadiness(): FoleonRuntimeReadiness {
  return {
    registryReady: false,
    listBindingsReady: false,
    backendUrlReady: false,
    authResourceReady: false,
    tokenProviderReady: false,
    tokenAcquisitionReady: false,
    backendSafeConfigReady: false,
    backendRouteAuthorizationReady: false,
    readPathReady: false,
    writePathReady: false,
    syncPathReady: false,
  };
}
