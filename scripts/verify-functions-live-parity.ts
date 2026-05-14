#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export interface IExpectedIdentity {
  version: string;
  commitSha: string;
}

export interface ILiveArtifactIdentity {
  version: string;
  commitSha: string;
  buildTimestamp: string;
}

export interface IRouteProbeResult {
  route: string;
  method: 'POST' | 'GET';
  status: number;
  exists: boolean;
  responseRequestIdPresent: boolean;
}

export interface IParityEvidence {
  appName: string;
  resourceGroup: string;
  hostName: string;
  checkedAtUtc: string;
  expectedIdentity: IExpectedIdentity;
  liveIdentity: ILiveArtifactIdentity;
  identityParity: {
    hasArtifactBlock: boolean;
    versionMatch: boolean;
    commitShaMatch: boolean;
    issues: string[];
  };
  routeTruth: {
    routes: IRouteProbeResult[];
    allPresent: boolean;
    issues: string[];
  };
  commandAuthTruth: {
    noAuth: {
      routes: IRouteProbeResult[];
      issues: string[];
    };
    malformedBearer: {
      routes: IRouteProbeResult[];
      issues: string[];
    };
    adminBearer: {
      attempted: boolean;
      routes: IRouteProbeResult[];
      issues: string[];
    };
    nonAdminBearer: {
      attempted: boolean;
      routes: IRouteProbeResult[];
      issues: string[];
    };
  };
  healthReadyTruth: {
    status: number;
    exists: boolean;
    issues: string[];
  };
  readinessAuthTruth: {
    noAuth: {
      status: number;
      routeExists: boolean;
      issues: string[];
    };
    malformedBearer: {
      status: number;
      authDenied: boolean;
      issues: string[];
    };
    adminBearer: {
      attempted: boolean;
      status: number;
      passed: boolean;
      issues: string[];
    };
    nonAdminBearer: {
      attempted: boolean;
      status: number;
      passed: boolean;
      issues: string[];
    };
  };
  healthPublicContract: {
    passed: boolean;
    issues: string[];
  };
  deployStampTruth: {
    present: boolean;
    settings: {
      buildVersion: string;
      buildSha: string;
      buildTimestamp: string;
    };
    versionMatch: boolean;
    commitShaMatch: boolean;
    issues: string[];
  };
  myWorkRouteTruth: {
    functionInventory: {
      required: string[];
      found: string[];
      missing: string[];
      allPresent: boolean;
      issues: string[];
    };
    routeProbes: {
      routes: IRouteProbeResult[];
      allPresent: boolean;
      issues: string[];
    };
  };
  overallPass: boolean;
}

export interface IBuildParityEvidenceInput {
  appName: string;
  resourceGroup: string;
  hostName: string;
  checkedAtUtc: string;
  expectedIdentity: IExpectedIdentity;
  healthBody: unknown;
  routeStatuses: ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>;
  malformedRouteStatuses: ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>;
  malformedRouteProbes?: ReadonlyArray<IRouteProbeResult>;
  adminRouteStatuses?: ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>;
  nonAdminRouteStatuses?: ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>;
  healthReadyNoAuthStatus: number;
  healthReadyMalformedAuthStatus: number;
  healthReadyAdminStatus?: number;
  healthReadyAdminBody?: unknown;
  healthReadyNonAdminStatus?: number;
  appSettings: Record<string, string>;
  myWorkFunctionInventory: ReadonlyArray<string>;
  myWorkRouteStatuses: ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>;
}

interface IOptions {
  appName: string;
  resourceGroup: string;
  expectedSha?: string;
  expectedVersion?: string;
  adminToken?: string;
  nonAdminToken?: string;
  outputPath?: string;
}

function parseArgs(argv: string[]): IOptions {
  const parsed: IOptions = {
    appName: 'hb-intel-function-app',
    resourceGroup: 'hb-intel',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--app-name' && argv[i + 1]) {
      parsed.appName = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--resource-group' && argv[i + 1]) {
      parsed.resourceGroup = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--expected-sha' && argv[i + 1]) {
      parsed.expectedSha = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--expected-version' && argv[i + 1]) {
      parsed.expectedVersion = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--admin-token' && argv[i + 1]) {
      parsed.adminToken = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--output' && argv[i + 1]) {
      parsed.outputPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--non-admin-token' && argv[i + 1]) {
      parsed.nonAdminToken = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return parsed;
}

function runAz(args: string[], cwd: string): string {
  const result = spawnSync('az', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').toString().trim();
    throw new Error(`az ${args.join(' ')} failed: ${stderr || 'unknown error'}`);
  }

  return (result.stdout ?? '').toString().trim();
}

function runGit(args: string[], cwd: string): string | undefined {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  if (result.status !== 0) return undefined;
  const value = (result.stdout ?? '').toString().trim();
  return value.length > 0 ? value : undefined;
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function parseManifestExpectedIdentity(root: string): IExpectedIdentity | undefined {
  const manifestPath = path.join(root, 'artifact-manifest.json');
  if (!existsSync(manifestPath)) return undefined;

  const manifest = readJsonFile<{ packageVersion?: string; commitSha?: string }>(manifestPath);
  if (!manifest.packageVersion || !manifest.commitSha) return undefined;

  return {
    version: manifest.packageVersion,
    commitSha: manifest.commitSha,
  };
}

function parsePackageExpectedVersion(root: string): string {
  const pkg = readJsonFile<{ version?: string }>(path.join(root, 'backend/functions/package.json'));
  if (!pkg.version || pkg.version.trim().length === 0) {
    throw new Error('backend/functions/package.json version is missing');
  }
  return pkg.version;
}

function resolveExpectedIdentity(root: string, options: IOptions): IExpectedIdentity {
  const manifestIdentity = parseManifestExpectedIdentity(root);
  const gitSha = runGit(['rev-parse', 'HEAD'], root) ?? 'unknown';
  const pkgVersion = parsePackageExpectedVersion(root);

  return {
    version: options.expectedVersion ?? manifestIdentity?.version ?? pkgVersion,
    commitSha: options.expectedSha ?? manifestIdentity?.commitSha ?? gitSha,
  };
}

function parseAppSettings(raw: string): Record<string, string> {
  const parsed = JSON.parse(raw) as Array<{ name?: string; value?: string }>;
  const result: Record<string, string> = {};
  for (const item of parsed) {
    if (typeof item.name !== 'string') continue;
    result[item.name] = typeof item.value === 'string' ? item.value : '';
  }
  return result;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GET ${url} failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as unknown;
}

async function fetchStatus(url: string, init?: RequestInit): Promise<number> {
  try {
    const response = await fetch(url, init);
    return response.status;
  } catch {
    return -1;
  }
}

async function fetchProbe(
  url: string,
  route: string,
  method: 'POST' | 'GET',
  init?: RequestInit,
): Promise<IRouteProbeResult> {
  try {
    const response = await fetch(url, init);
    return {
      route,
      method,
      status: response.status,
      exists: response.status !== 404 && response.status > 0,
      responseRequestIdPresent: Boolean(response.headers.get('x-request-id')),
    };
  } catch {
    return {
      route,
      method,
      status: -1,
      exists: false,
      responseRequestIdPresent: false,
    };
  }
}

function resolveHostName(cwd: string, appName: string, resourceGroup: string): string {
  const listQuery = `[?name=='${appName}' && resourceGroup=='${resourceGroup}'] | [0].defaultHostName`;
  const fromList = runAz(['functionapp', 'list', '--query', listQuery, '-o', 'tsv'], cwd);
  if (fromList && fromList !== 'null') return fromList;

  const fromSite = runAz(
    [
      'resource',
      'show',
      '--resource-group',
      resourceGroup,
      '--resource-type',
      'Microsoft.Web/sites',
      '--name',
      appName,
      '--api-version',
      '2023-12-01',
      '--query',
      'properties.hostNames[0]',
      '-o',
      'tsv',
    ],
    cwd,
  );

  if (!fromSite || fromSite === 'null') {
    throw new Error(`Unable to resolve live hostname for ${appName} in ${resourceGroup}`);
  }

  return fromSite;
}

// My Dashboard / My Work route-registration deployment-proof contract.
// These function registrations were absent from the executable host in a prior
// incident; the verifier hard-gates their live presence after every deploy.
export const MY_WORK_REQUIRED_FUNCTIONS = [
  'getMyWorkHome',
  'getMyWorkAdobeSignActionQueue',
  'getMyWorkProjectLinks',
  'startAdobeSignOAuth',
  'completeAdobeSignOAuthCallback',
] as const;

// Public OAuth callback: deployment-proof requires non-404 only (a 302 redirect
// is acceptable handler behavior). Protected My Work routes require a 401 denial.
const MY_WORK_PUBLIC_CALLBACK_ROUTE = '/api/my-work/adobe-sign/oauth/callback';

function fetchMyWorkFunctionInventory(
  cwd: string,
  appName: string,
  resourceGroup: string,
): string[] {
  const raw = runAz(
    [
      'functionapp',
      'function',
      'list',
      '--resource-group',
      resourceGroup,
      '--name',
      appName,
      '-o',
      'json',
    ],
    cwd,
  );
  const parsed = JSON.parse(raw) as Array<{ name?: unknown }>;
  return parsed
    .map((entry) => (typeof entry.name === 'string' ? entry.name : ''))
    .filter((name) => name.length > 0);
}

export function buildParityEvidence(input: IBuildParityEvidenceInput): IParityEvidence {
  const health = (input.healthBody && typeof input.healthBody === 'object')
    ? (input.healthBody as Record<string, unknown>)
    : {};
  const artifact = (health.artifact && typeof health.artifact === 'object')
    ? (health.artifact as Record<string, unknown>)
    : undefined;

  const liveIdentity: ILiveArtifactIdentity = {
    version: typeof artifact?.version === 'string' ? artifact.version : 'missing',
    commitSha: typeof artifact?.commitSha === 'string' ? artifact.commitSha : 'missing',
    buildTimestamp: typeof artifact?.buildTimestamp === 'string' ? artifact.buildTimestamp : 'missing',
  };

  const identityIssues: string[] = [];
  const hasArtifactBlock = artifact !== undefined;
  if (!hasArtifactBlock) identityIssues.push('health.artifact.missing');
  if (liveIdentity.version === 'missing') identityIssues.push('health.artifact.version.missing');
  if (liveIdentity.commitSha === 'missing') identityIssues.push('health.artifact.commitSha.missing');
  if (liveIdentity.buildTimestamp === 'missing') identityIssues.push('health.artifact.buildTimestamp.missing');

  const versionMatch = liveIdentity.version === input.expectedIdentity.version;
  const commitShaMatch = liveIdentity.commitSha === input.expectedIdentity.commitSha;
  if (!versionMatch) {
    identityIssues.push(`health.artifact.version.mismatch(expected=${input.expectedIdentity.version},live=${liveIdentity.version})`);
  }
  if (!commitShaMatch) {
    identityIssues.push(`health.artifact.commitSha.mismatch(expected=${input.expectedIdentity.commitSha},live=${liveIdentity.commitSha})`);
  }

  const routes = input.routeStatuses.map((item) => ({
    route: item.route,
    method: item.method,
    status: item.status,
    exists: item.status !== 404 && item.status > 0,
    responseRequestIdPresent: false,
  }));
  const routeIssues = routes
    .filter((r) => !r.exists)
    .map((r) => `route.missing(${r.method} ${r.route} status=${r.status})`);
  const malformedRoutes = input.malformedRouteProbes
    ? [...input.malformedRouteProbes]
    : input.malformedRouteStatuses.map((item) => ({
      route: item.route,
      method: item.method,
      status: item.status,
      exists: item.status !== 404 && item.status > 0,
      responseRequestIdPresent: false,
    }));
  const malformedRouteIssues = malformedRoutes
    .filter((r) => r.status !== 401)
    .map((r) => `command_auth.malformed_bearer.unexpected_status(${r.route} expected=401,live=${r.status})`);
  const adminRoutes = (input.adminRouteStatuses ?? []).map((item) => ({
    route: item.route,
    method: item.method,
    status: item.status,
    exists: item.status !== 404 && item.status > 0,
    responseRequestIdPresent: false,
  }));
  const adminRouteIssues = adminRoutes
    .filter((r) => [401, 403, 404, -1].includes(r.status))
    .map((r) => `command_auth.admin_bearer.unexpected_status(${r.route} expected!=401|403|404,live=${r.status})`);
  const nonAdminRoutes = (input.nonAdminRouteStatuses ?? []).map((item) => ({
    route: item.route,
    method: item.method,
    status: item.status,
    exists: item.status !== 404 && item.status > 0,
    responseRequestIdPresent: false,
  }));
  const previewNoAuth = routes.find((r) => r.route === '/api/safety-records/ingest/preview');
  const noAuthRouteIssues = routeIssues.slice();
  if (previewNoAuth && previewNoAuth.status !== 401) {
    noAuthRouteIssues.push(
      `command_auth.no_auth.preview.unexpected_status(expected=401,live=${previewNoAuth.status})`,
    );
  }

  const nonAdminRouteIssues = nonAdminRoutes
    .filter((r) => [401, 404, -1].includes(r.status))
    .map((r) => `command_auth.non_admin_bearer.unexpected_status(${r.route} expected!=401|404,live=${r.status})`);
  const provisioningNonAdmin = nonAdminRoutes.find((r) => r.route === '/api/safety-records/provision-sharepoint');
  if (provisioningNonAdmin && provisioningNonAdmin.status !== 403) {
    nonAdminRouteIssues.push(
      `command_auth.non_admin_bearer.provisioning.unexpected_status(expected=403,live=${provisioningNonAdmin.status})`,
    );
  }

  const readyExists = input.healthReadyNoAuthStatus !== 404 && input.healthReadyNoAuthStatus > 0;
  const readyIssues = readyExists
    ? []
    : [`route.missing(GET /api/health/ready status=${input.healthReadyNoAuthStatus})`];

  const readinessNoAuthAllowed = new Set([200, 401, 403]);
  const readinessNoAuthIssues = readinessNoAuthAllowed.has(input.healthReadyNoAuthStatus)
    ? []
    : [`readiness.no_auth.unexpected_status(expected=200|401|403,live=${input.healthReadyNoAuthStatus})`];

  const readinessMalformedIssues = input.healthReadyMalformedAuthStatus === 401
    ? []
    : [`readiness.malformed_bearer.unexpected_status(expected=401,live=${input.healthReadyMalformedAuthStatus})`];

  const readinessAdminAttempted = typeof input.healthReadyAdminStatus === 'number';
  const readinessAdminIssues: string[] = [];
  if (readinessAdminAttempted) {
    if (input.healthReadyAdminStatus !== 200) {
      readinessAdminIssues.push(`readiness.admin_bearer.unexpected_status(expected=200,live=${input.healthReadyAdminStatus})`);
    } else {
      const readyBody = (input.healthReadyAdminBody && typeof input.healthReadyAdminBody === 'object')
        ? (input.healthReadyAdminBody as Record<string, unknown>)
        : {};
      for (const key of [
        'status',
        'operationalReadiness',
        'configTiers',
        'safetyPermissionPosture',
        'safetyRolloutReadiness',
        'rolloutPermissionInventory',
      ]) {
        if (!(key in readyBody)) {
          readinessAdminIssues.push(`readiness.admin_bearer.contract_missing(${key})`);
        }
      }
    }
  }
  const readinessNonAdminAttempted = typeof input.healthReadyNonAdminStatus === 'number';
  const readinessNonAdminIssues: string[] = [];
  if (readinessNonAdminAttempted && input.healthReadyNonAdminStatus !== 403) {
    readinessNonAdminIssues.push(
      `readiness.non_admin_bearer.unexpected_status(expected=403,live=${input.healthReadyNonAdminStatus})`,
    );
  }

  const healthPublicIssues: string[] = [];
  for (const key of ['status', 'artifact', 'timestamp']) {
    if (!(key in health)) {
      healthPublicIssues.push(`health.public.contract_missing(${key})`);
    }
  }
  const readinessOnlyKeys = [
    'operationalReadiness',
    'configTiers',
    'provisioningPrereqs',
    'safetyPermissionPosture',
    'safetyRolloutReadiness',
    'rolloutPermissionInventory',
    'integrations',
    'notificationRecipients',
    'environmentPosture',
    'requestId',
  ];
  for (const key of readinessOnlyKeys) {
    if (key in health) {
      healthPublicIssues.push(`health.public.unexpected_readiness_field(${key})`);
    }
  }

  const buildVersion = input.appSettings.HBC_FUNCTIONS_BUILD_VERSION ?? '';
  const buildSha = input.appSettings.HBC_FUNCTIONS_BUILD_SHA ?? '';
  const buildTimestamp = input.appSettings.HBC_FUNCTIONS_BUILD_TIMESTAMP ?? '';
  const deployIssues: string[] = [];
  if (!buildVersion) deployIssues.push('appsettings.HBC_FUNCTIONS_BUILD_VERSION.missing');
  if (!buildSha) deployIssues.push('appsettings.HBC_FUNCTIONS_BUILD_SHA.missing');
  if (!buildTimestamp) deployIssues.push('appsettings.HBC_FUNCTIONS_BUILD_TIMESTAMP.missing');

  const appVersionMatch = buildVersion === input.expectedIdentity.version;
  const appShaMatch = buildSha === input.expectedIdentity.commitSha;
  if (buildVersion && !appVersionMatch) {
    deployIssues.push(`appsettings.HBC_FUNCTIONS_BUILD_VERSION.mismatch(expected=${input.expectedIdentity.version},live=${buildVersion})`);
  }
  if (buildSha && !appShaMatch) {
    deployIssues.push(`appsettings.HBC_FUNCTIONS_BUILD_SHA.mismatch(expected=${input.expectedIdentity.commitSha},live=${buildSha})`);
  }

  const myWorkInventoryFound = MY_WORK_REQUIRED_FUNCTIONS.filter((name) =>
    input.myWorkFunctionInventory.some(
      (live) => live === name || live.endsWith(`/${name}`),
    ),
  );
  const myWorkInventoryMissing = MY_WORK_REQUIRED_FUNCTIONS.filter(
    (name) => !myWorkInventoryFound.includes(name),
  );
  const myWorkInventoryIssues = myWorkInventoryMissing.map(
    (name) => `my_work.function_inventory.missing(${name})`,
  );

  const myWorkRouteProbes: IRouteProbeResult[] = input.myWorkRouteStatuses.map((item) => ({
    route: item.route,
    method: item.method,
    status: item.status,
    exists: item.status !== 404 && item.status > 0,
    responseRequestIdPresent: false,
  }));
  const myWorkRouteIssues: string[] = [];
  for (const probe of myWorkRouteProbes) {
    if (!probe.exists) {
      myWorkRouteIssues.push(
        `my_work.route.missing(${probe.method} ${probe.route} status=${probe.status})`,
      );
      continue;
    }
    if (probe.route !== MY_WORK_PUBLIC_CALLBACK_ROUTE && probe.status !== 401) {
      myWorkRouteIssues.push(
        `my_work.route.unexpected_auth_status(${probe.method} ${probe.route} expected=401,live=${probe.status})`,
      );
    }
  }

  const overallPass =
    identityIssues.length === 0 &&
    routeIssues.length === 0 &&
    noAuthRouteIssues.length === 0 &&
    readyIssues.length === 0 &&
    readinessNoAuthIssues.length === 0 &&
    readinessMalformedIssues.length === 0 &&
    readinessAdminIssues.length === 0 &&
    readinessNonAdminIssues.length === 0 &&
    malformedRouteIssues.length === 0 &&
    adminRouteIssues.length === 0 &&
    nonAdminRouteIssues.length === 0 &&
    healthPublicIssues.length === 0 &&
    deployIssues.length === 0 &&
    myWorkInventoryIssues.length === 0 &&
    myWorkRouteIssues.length === 0;

  return {
    appName: input.appName,
    resourceGroup: input.resourceGroup,
    hostName: input.hostName,
    checkedAtUtc: input.checkedAtUtc,
    expectedIdentity: input.expectedIdentity,
    liveIdentity,
    identityParity: {
      hasArtifactBlock,
      versionMatch,
      commitShaMatch,
      issues: identityIssues,
    },
    routeTruth: {
      routes,
      allPresent: routeIssues.length === 0,
      issues: routeIssues,
    },
    commandAuthTruth: {
      noAuth: {
        routes,
        issues: noAuthRouteIssues,
      },
      malformedBearer: {
        routes: malformedRoutes,
        issues: malformedRouteIssues,
      },
      adminBearer: {
        attempted: adminRoutes.length > 0,
        routes: adminRoutes,
        issues: adminRouteIssues,
      },
      nonAdminBearer: {
        attempted: nonAdminRoutes.length > 0,
        routes: nonAdminRoutes,
        issues: nonAdminRouteIssues,
      },
    },
    healthReadyTruth: {
      status: input.healthReadyNoAuthStatus,
      exists: readyExists,
      issues: readyIssues,
    },
    readinessAuthTruth: {
      noAuth: {
        status: input.healthReadyNoAuthStatus,
        routeExists: readyExists,
        issues: readinessNoAuthIssues,
      },
      malformedBearer: {
        status: input.healthReadyMalformedAuthStatus,
        authDenied: input.healthReadyMalformedAuthStatus === 401,
        issues: readinessMalformedIssues,
      },
      adminBearer: {
        attempted: readinessAdminAttempted,
        status: input.healthReadyAdminStatus ?? -1,
        passed: readinessAdminAttempted ? readinessAdminIssues.length === 0 : false,
        issues: readinessAdminIssues,
      },
      nonAdminBearer: {
        attempted: readinessNonAdminAttempted,
        status: input.healthReadyNonAdminStatus ?? -1,
        passed: readinessNonAdminAttempted ? readinessNonAdminIssues.length === 0 : false,
        issues: readinessNonAdminIssues,
      },
    },
    healthPublicContract: {
      passed: healthPublicIssues.length === 0,
      issues: healthPublicIssues,
    },
    deployStampTruth: {
      present: Boolean(buildVersion && buildSha && buildTimestamp),
      settings: {
        buildVersion: buildVersion || 'missing',
        buildSha: buildSha || 'missing',
        buildTimestamp: buildTimestamp || 'missing',
      },
      versionMatch: appVersionMatch,
      commitShaMatch: appShaMatch,
      issues: deployIssues,
    },
    myWorkRouteTruth: {
      functionInventory: {
        required: [...MY_WORK_REQUIRED_FUNCTIONS],
        found: myWorkInventoryFound,
        missing: myWorkInventoryMissing,
        allPresent: myWorkInventoryMissing.length === 0,
        issues: myWorkInventoryIssues,
      },
      routeProbes: {
        routes: myWorkRouteProbes,
        allPresent: myWorkRouteIssues.length === 0,
        issues: myWorkRouteIssues,
      },
    },
    overallPass,
  };
}

async function execute(options: IOptions): Promise<IParityEvidence> {
  const cwd = process.cwd();
  const expectedIdentity = resolveExpectedIdentity(cwd, options);
  const hostName = resolveHostName(cwd, options.appName, options.resourceGroup);
  const baseUrl = `https://${hostName}`;

  const healthBody = await fetchJson(`${baseUrl}/api/health`);
  const routeStatuses = [
    {
      route: '/api/safety-records/ingest',
      method: 'POST' as const,
      status: await fetchStatus(`${baseUrl}/api/safety-records/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    },
    {
      route: '/api/safety-records/ingest/preview',
      method: 'POST' as const,
      status: await fetchStatus(`${baseUrl}/api/safety-records/ingest/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    },
    {
      route: '/api/safety-records/replay',
      method: 'POST' as const,
      status: await fetchStatus(`${baseUrl}/api/safety-records/replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    },
    {
      route: '/api/safety-records/provision-sharepoint',
      method: 'POST' as const,
      status: await fetchStatus(`${baseUrl}/api/safety-records/provision-sharepoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    },
  ];
  const malformedRouteProbes = await Promise.all([
    fetchProbe(
      `${baseUrl}/api/safety-records/ingest`,
      '/api/safety-records/ingest',
      'POST',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer malformed-token' },
        body: '{}',
      },
    ),
    fetchProbe(
      `${baseUrl}/api/safety-records/ingest/preview`,
      '/api/safety-records/ingest/preview',
      'POST',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer malformed-token' },
        body: '{}',
      },
    ),
    fetchProbe(
      `${baseUrl}/api/safety-records/replay`,
      '/api/safety-records/replay',
      'POST',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer malformed-token' },
        body: '{}',
      },
    ),
    fetchProbe(
      `${baseUrl}/api/safety-records/provision-sharepoint`,
      '/api/safety-records/provision-sharepoint',
      'POST',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer malformed-token' },
        body: '{}',
      },
    ),
  ]);
  const malformedRouteStatuses = malformedRouteProbes.map((probe) => ({
    route: probe.route,
    method: probe.method,
    status: probe.status,
  }));

  const healthReadyNoAuthStatus = await fetchStatus(`${baseUrl}/api/health/ready`);
  const healthReadyMalformedAuthStatus = await fetchStatus(`${baseUrl}/api/health/ready`, {
    headers: {
      Authorization: 'Bearer malformed-token',
    },
  });
  let healthReadyAdminStatus: number | undefined;
  let healthReadyAdminBody: unknown;
  let adminRouteStatuses:
    | ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>
    | undefined;
  if (options.adminToken && options.adminToken.trim().length > 0) {
    healthReadyAdminStatus = await fetchStatus(`${baseUrl}/api/health/ready`, {
      headers: {
        Authorization: `Bearer ${options.adminToken}`,
      },
    });
    if (healthReadyAdminStatus === 200) {
      try {
        const response = await fetch(`${baseUrl}/api/health/ready`, {
          headers: {
            Authorization: `Bearer ${options.adminToken}`,
          },
        });
        const text = await response.text();
        healthReadyAdminBody = JSON.parse(text) as unknown;
      } catch {
        healthReadyAdminBody = undefined;
      }
    }
    adminRouteStatuses = [
      {
        route: '/api/safety-records/ingest',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.adminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/ingest/preview',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/ingest/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.adminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/replay',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/replay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.adminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/provision-sharepoint',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/provision-sharepoint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.adminToken}` },
          body: '{}',
        }),
      },
    ];
  }
  let healthReadyNonAdminStatus: number | undefined;
  let nonAdminRouteStatuses:
    | ReadonlyArray<{ route: string; method: 'POST' | 'GET'; status: number }>
    | undefined;
  if (options.nonAdminToken && options.nonAdminToken.trim().length > 0) {
    healthReadyNonAdminStatus = await fetchStatus(`${baseUrl}/api/health/ready`, {
      headers: {
        Authorization: `Bearer ${options.nonAdminToken}`,
      },
    });
    nonAdminRouteStatuses = [
      {
        route: '/api/safety-records/ingest',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.nonAdminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/ingest/preview',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/ingest/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.nonAdminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/replay',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/replay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.nonAdminToken}` },
          body: '{}',
        }),
      },
      {
        route: '/api/safety-records/provision-sharepoint',
        method: 'POST',
        status: await fetchStatus(`${baseUrl}/api/safety-records/provision-sharepoint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.nonAdminToken}` },
          body: '{}',
        }),
      },
    ];
  }

  const appSettingsRaw = runAz(
    [
      'functionapp',
      'config',
      'appsettings',
      'list',
      '--name',
      options.appName,
      '--resource-group',
      options.resourceGroup,
      '-o',
      'json',
    ],
    cwd,
  );
  const appSettings = parseAppSettings(appSettingsRaw);

  const myWorkRouteStatuses = [
    {
      route: '/api/my-work/me/home',
      method: 'GET' as const,
      status: await fetchStatus(`${baseUrl}/api/my-work/me/home`),
    },
    {
      route: '/api/my-work/me/project-links',
      method: 'GET' as const,
      status: await fetchStatus(`${baseUrl}/api/my-work/me/project-links`),
    },
    {
      route: '/api/my-work/me/adobe-sign/action-queue',
      method: 'GET' as const,
      status: await fetchStatus(`${baseUrl}/api/my-work/me/adobe-sign/action-queue`),
    },
    {
      route: '/api/my-work/me/adobe-sign/oauth/start',
      method: 'POST' as const,
      status: await fetchStatus(`${baseUrl}/api/my-work/me/adobe-sign/oauth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    },
    {
      // Public callback: probe without following redirects so a 302 handler
      // response is captured as-is. Deployment-proof requires non-404 only.
      route: '/api/my-work/adobe-sign/oauth/callback',
      method: 'GET' as const,
      status: await fetchStatus(`${baseUrl}/api/my-work/adobe-sign/oauth/callback`, {
        redirect: 'manual',
      }),
    },
  ];

  const myWorkFunctionInventory = fetchMyWorkFunctionInventory(
    cwd,
    options.appName,
    options.resourceGroup,
  );

  return buildParityEvidence({
    appName: options.appName,
    resourceGroup: options.resourceGroup,
    hostName,
    checkedAtUtc: new Date().toISOString(),
    expectedIdentity,
    healthBody,
    routeStatuses,
    malformedRouteStatuses,
    malformedRouteProbes,
    adminRouteStatuses,
    nonAdminRouteStatuses,
    healthReadyNoAuthStatus,
    healthReadyMalformedAuthStatus,
    healthReadyAdminStatus,
    healthReadyAdminBody,
    healthReadyNonAdminStatus,
    appSettings,
    myWorkFunctionInventory,
    myWorkRouteStatuses,
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const evidence = await execute(options);
  const payload = JSON.stringify(evidence, null, 2);

  if (options.outputPath) {
    writeFileSync(path.resolve(process.cwd(), options.outputPath), `${payload}\n`, 'utf8');
  }

  console.log(payload);

  if (!evidence.overallPass) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
