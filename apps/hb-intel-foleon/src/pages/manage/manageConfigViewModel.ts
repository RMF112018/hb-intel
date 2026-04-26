import type {
  FoleonConfigDiagnostics,
  FoleonReadinessIssueCode,
  FoleonRuntimeReadiness,
  IFoleonRuntimeContract,
} from '../../runtime/foleonRuntimeContract.js';

export interface AdminActionItem {
  readonly id: string;
  readonly priority: number;
  readonly title: string;
  readonly body: string;
}

export interface HealthLine {
  readonly id: string;
  readonly label: string;
  readonly status: ConfigStatusLabel;
  readonly detail: string;
}

export interface SystemHealthGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly lines: ReadonlyArray<HealthLine>;
}

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

export function formatRedactedDiagnosticsJson(contract: IFoleonRuntimeContract): string {
  return JSON.stringify(buildSafeDiagnostics(contract), null, 2);
}

export function buildSystemHealthGroups(args: {
  readonly readiness: FoleonRuntimeReadiness | undefined;
  readonly diagnostics: FoleonConfigDiagnostics | undefined;
  readonly contract: IFoleonRuntimeContract;
}): ReadonlyArray<SystemHealthGroup> {
  const r = args.readiness ?? emptyReadiness();
  const d = args.diagnostics;
  const dup = Boolean(d?.registryDuplicateActiveKeysDetected);
  const hygiene = d?.registrySecretHygieneStatus ?? 'unknown';
  const registryReachable = d?.registryFetchStatus === 'available';

  return [
    {
      id: 'api-approval',
      title: 'API approval and tokens',
      description: 'SharePoint must be able to obtain tokens for the Foleon backend API before reads or writes run in this session.',
      lines: [
        healthLine(
          'token-provider',
          'Token provider',
          r.tokenProviderReady,
          'SPFx can create a token provider for this API.',
          'SPFx could not create a token provider for the resolved API identity.',
        ),
        healthLine(
          'token-acquisition',
          'API token acquisition',
          r.tokenAcquisitionReady,
          'Tokens are being acquired for the Foleon API.',
          'Token acquisition failed or consent is still required for the Foleon API.',
        ),
      ],
    },
    {
      id: 'backend-connection',
      title: 'Backend connection',
      description: 'Network path, safe configuration probe, and API identity must be in place before route checks succeed.',
      lines: [
        healthLine(
          'backend-url',
          'Backend endpoint',
          r.backendUrlReady,
          'A backend base URL is configured (value is not shown here).',
          'Backend base URL is missing from resolved configuration.',
        ),
        healthLine(
          'backend-safe-config',
          'Safe configuration probe',
          r.backendSafeConfigReady,
          'The backend safe-configuration probe succeeded.',
          'The backend safe-configuration probe has not succeeded yet.',
        ),
        healthLine(
          'api-identity',
          'API identity (Entra)',
          r.authResourceReady,
          'An API identity is configured (value is not shown here).',
          'API identity for token audience is missing from resolved configuration.',
        ),
      ],
    },
    {
      id: 'registry-connection',
      title: 'Registry connection',
      description: 'Central registry values drive list bindings, backend endpoints, and governance targets.',
      lines: [
        healthLine(
          'registry-ready',
          'Registry configuration',
          r.registryReady,
          'Registry connectivity and validation checks passed.',
          'Registry connectivity or validation is still blocked.',
        ),
        healthLine(
          'registry-fetch',
          'Registry reachability',
          registryReachable,
          registryFetchDetail(d?.registryFetchStatus, true),
          registryFetchDetail(d?.registryFetchStatus, false),
        ),
        healthLine(
          'registry-duplicate',
          'Active registry keys',
          !dup,
          'No duplicate active registry keys were reported.',
          'Duplicate active registry keys were reported and must be resolved.',
        ),
        healthLineHygiene(hygiene),
      ],
    },
    {
      id: 'sharepoint-lists',
      title: 'SharePoint lists',
      description: 'Foleon Manager needs SharePoint lists for content, placements, events, and sync history.',
      lines: [
        healthLine(
          'list-bindings',
          'List bindings for Foleon',
          r.listBindingsReady,
          'Required list bindings are present for this site.',
          'One or more required SharePoint lists are not bound yet.',
        ),
      ],
    },
    {
      id: 'route-read-publish',
      title: 'Route authorization and publishing access',
      description: 'Route proof, read access, and publishing (write) access are tracked separately.',
      lines: [
        healthLine(
          'route-auth',
          'Route authorization',
          r.backendRouteAuthorizationReady,
          'Backend route authorization checks succeeded.',
          'Backend route authorization is not proven yet.',
        ),
        healthLine(
          'read-access',
          'Read access',
          r.readPathReady,
          'Read-only routes for content and placements are ready.',
          'Read-only routes are not ready for this session.',
        ),
        healthLine(
          'publish-access',
          'Publishing (write) access',
          r.writePathReady,
          'Publishing and placement writes are allowed when other guards pass.',
          'Publishing and placement writes remain blocked until authorization and safe configuration are proven.',
        ),
      ],
    },
    {
      id: 'sync-packaging',
      title: 'Sync access and packaging',
      description: 'Sync uses backend Foleon OAuth. Packaging compares this runtime to expected governance targets (values are not shown here).',
      lines: [
        healthLine(
          'sync-access',
          'Sync access',
          r.syncPathReady,
          'Backend Foleon OAuth is ready for sync operations.',
          'Backend Foleon OAuth is not ready; sync operations stay blocked.',
        ),
        healthLine(
          'viewer-origins',
          'Viewer origins policy',
          args.contract.originPolicy.allowedOrigins.length > 0,
          `${args.contract.originPolicy.allowedOrigins.length} HTTPS viewer origins are configured (URLs are not listed here).`,
          'No approved HTTPS viewer origins are configured yet.',
        ),
        healthLine(
          'manifest-governance',
          'Manifest governance',
          args.contract.governed.manifestIdMatchesExpected,
          'Runtime manifest matches the expected governance target.',
          'Runtime manifest does not match the expected governance target.',
        ),
        healthLine(
          'package-governance',
          'Package version governance',
          args.contract.governed.packageVersionMatchesExpected,
          'Runtime package version matches the expected governance target.',
          'Runtime package version does not match the expected governance target.',
        ),
      ],
    },
  ];
}

export function buildRequiredAdminActions(args: {
  readonly readiness: FoleonRuntimeReadiness | undefined;
  readonly diagnostics: FoleonConfigDiagnostics | undefined;
  readonly consentRequired: boolean;
}): ReadonlyArray<AdminActionItem> {
  const r = args.readiness ?? emptyReadiness();
  const seen = new Set<string>();
  const items: AdminActionItem[] = [];

  const push = (item: AdminActionItem): void => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const blocker of args.diagnostics?.blockers ?? []) {
    const meta = blockerToAction(blocker, args.consentRequired);
    push({ id: `blocker:${blocker.code}`, priority: meta.priority, title: meta.title, body: meta.body });
  }

  if (!r.tokenAcquisitionReady && !seen.has('blocker:token-acquisition-failed')) {
    push({
      id: 'gap:token-acquisition',
      priority: args.consentRequired ? 100 : 95,
      title: args.consentRequired ? 'Approve API access for the Foleon integration' : 'Fix API token acquisition',
      body: args.consentRequired
        ? 'A SharePoint administrator must approve the HB SharePoint Creator app registration and access_as_user in SharePoint Admin Center API access before reads, writes, or sync can run.'
        : 'Token acquisition for the Foleon API is still failing after configuration checks.',
    });
  }
  if (!r.tokenProviderReady && !seen.has('blocker:token-provider-unavailable')) {
    push({
      id: 'gap:token-provider',
      priority: 93,
      title: 'Restore the SPFx token provider',
      body: 'Confirm this page runs in SharePoint with a valid SPFx context so a token provider can be created for the Foleon API.',
    });
  }
  if (!r.authResourceReady && !seen.has('blocker:auth-resource-missing')) {
    push({
      id: 'gap:auth-resource',
      priority: 88,
      title: 'Configure the API identity',
      body: 'Resolve the Foleon API identity from the registry or web part properties so tokens target the correct Entra resource.',
    });
  }
  if (!r.backendUrlReady && !seen.has('blocker:backend-url-missing')) {
    push({
      id: 'gap:backend-url',
      priority: 86,
      title: 'Configure the backend endpoint',
      body: 'Provide a reachable backend base URL from the registry or explicit configuration.',
    });
  }
  if (!r.listBindingsReady && !seen.has('blocker:list-bindings-missing')) {
    push({
      id: 'gap:list-bindings',
      priority: 65,
      title: 'Bind required SharePoint lists',
      body: 'Activate and validate list GUID records in the platform registry so Foleon lists resolve for this site.',
    });
  }
  if (!r.backendSafeConfigReady && !seen.has('blocker:backend-safe-config-unavailable') && !seen.has('blocker:backend-graph-config-missing')) {
    push({
      id: 'gap:safe-config',
      priority: 63,
      title: 'Prove backend safe configuration',
      body: 'Ensure the backend safe-configuration route succeeds and reports required SharePoint Graph configuration.',
    });
  }
  if (!r.backendRouteAuthorizationReady && !seen.has('blocker:backend-route-authorization-failed') && !seen.has('blocker:backend-route-authorization-unproven')) {
    push({
      id: 'gap:route-auth',
      priority: 57,
      title: 'Prove backend route authorization',
      body: 'Complete route authorization checks so read and write operations can be enabled safely.',
    });
  }
  if (!r.readPathReady && !seen.has('blocker:backend-route-authorization-failed')) {
    push({
      id: 'gap:read-path',
      priority: 52,
      title: 'Restore read access',
      body: 'Confirm read-only backend probes succeed so Manager can load registry-backed content.',
    });
  }
  if (!r.writePathReady) {
    push({
      id: 'gap:write-path',
      priority: 48,
      title: 'Enable publishing access when safe',
      body: 'Publishing stays blocked until safe configuration and route authorization are proven for this tenant.',
    });
  }
  if (!r.syncPathReady && !seen.has('blocker:sync-oauth-config-missing')) {
    push({
      id: 'gap:sync-path',
      priority: 40,
      title: 'Finish backend Foleon OAuth for sync',
      body: 'Configure backend Foleon OAuth so document and project sync routes can run.',
    });
  }

  return [...items].sort((left, right) => right.priority - left.priority);
}

function healthLineHygiene(hygiene: 'pass' | 'fail' | 'unknown'): HealthLine {
  if (hygiene === 'pass') {
    return { id: 'registry-hygiene', label: 'Secret hygiene signals', status: 'Valid', detail: 'Secret hygiene checks passed.' };
  }
  if (hygiene === 'fail') {
    return {
      id: 'registry-hygiene',
      label: 'Secret hygiene signals',
      status: 'Blocked',
      detail: 'Secret hygiene checks reported a failure in registry records.',
    };
  }
  return {
    id: 'registry-hygiene',
    label: 'Secret hygiene signals',
    status: 'Warning',
    detail: 'Secret hygiene has not been evaluated yet.',
  };
}

function healthLine(
  id: string,
  label: string,
  ready: boolean,
  okDetail: string,
  badDetail: string,
): HealthLine {
  return {
    id,
    label,
    status: ready ? 'Valid' : 'Blocked',
    detail: ready ? okDetail : badDetail,
  };
}

function registryFetchDetail(status: FoleonConfigDiagnostics['registryFetchStatus'], ok: boolean): string {
  if (ok && status === 'available') return 'Registry endpoint responded.';
  if (ok) return 'Registry checks passed for this view.';
  if (status === 'unavailable') return 'Registry endpoint is not reachable.';
  if (status === 'available') return 'Other registry checks still need attention.';
  return 'Registry connection has not completed setup.';
}

function blockerToAction(
  blocker: { readonly code: FoleonReadinessIssueCode; readonly message: string },
  consentRequired: boolean,
): { readonly priority: number; readonly title: string; readonly body: string } {
  const safeDetail = safeBlockerMessage(blocker.code, blocker.message);
  switch (blocker.code) {
    case 'token-acquisition-failed':
      return {
        priority: consentRequired || blocker.message.toLowerCase().includes('consent_required') ? 100 : 95,
        title: consentRequired || blocker.message.toLowerCase().includes('consent_required')
          ? 'Approve API access for the Foleon integration'
          : 'Fix API token acquisition',
        body: safeDetail,
      };
    case 'token-provider-unavailable':
      return { priority: 93, title: 'Restore the SPFx token provider', body: safeDetail };
    case 'auth-resource-missing':
      return { priority: 88, title: 'Configure the API identity', body: safeDetail };
    case 'backend-url-missing':
      return { priority: 86, title: 'Configure the backend endpoint', body: safeDetail };
    case 'registry-duplicate-active-key':
      return { priority: 72, title: 'Resolve duplicate registry keys', body: safeDetail };
    case 'registry-secret-hygiene-failed':
      return { priority: 71, title: 'Fix registry secret hygiene', body: safeDetail };
    case 'registry-unavailable':
      return { priority: 70, title: 'Restore registry availability', body: safeDetail };
    case 'list-bindings-missing':
      return { priority: 65, title: 'Bind required SharePoint lists', body: safeDetail };
    case 'backend-safe-config-unavailable':
      return { priority: 63, title: 'Prove backend safe configuration', body: safeDetail };
    case 'backend-graph-config-missing':
      return { priority: 62, title: 'Finish SharePoint Graph list configuration', body: safeDetail };
    case 'backend-route-authorization-failed':
      return { priority: 58, title: 'Fix backend route authorization', body: safeDetail };
    case 'backend-route-authorization-unproven':
      return { priority: 57, title: 'Prove backend route authorization', body: safeDetail };
    case 'sync-oauth-config-missing':
      return { priority: 40, title: 'Finish backend Foleon OAuth for sync', body: safeDetail };
    default:
      return { priority: 10, title: 'Review configuration blockers', body: safeDetail };
  }
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
