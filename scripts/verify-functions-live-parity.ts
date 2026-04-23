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
  healthReadyTruth: {
    status: number;
    exists: boolean;
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
  healthReadyStatus: number;
  appSettings: Record<string, string>;
}

interface IOptions {
  appName: string;
  resourceGroup: string;
  expectedSha?: string;
  expectedVersion?: string;
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
    if (arg === '--output' && argv[i + 1]) {
      parsed.outputPath = argv[i + 1];
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
  }));
  const routeIssues = routes
    .filter((r) => !r.exists)
    .map((r) => `route.missing(${r.method} ${r.route} status=${r.status})`);

  const readyExists = input.healthReadyStatus !== 404 && input.healthReadyStatus > 0;
  const readyIssues = readyExists
    ? []
    : [`route.missing(GET /api/health/ready status=${input.healthReadyStatus})`];

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

  const overallPass =
    identityIssues.length === 0 &&
    routeIssues.length === 0 &&
    readyIssues.length === 0 &&
    deployIssues.length === 0;

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
    healthReadyTruth: {
      status: input.healthReadyStatus,
      exists: readyExists,
      issues: readyIssues,
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
  ];

  const healthReadyStatus = await fetchStatus(`${baseUrl}/api/health/ready`);

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

  return buildParityEvidence({
    appName: options.appName,
    resourceGroup: options.resourceGroup,
    hostName,
    checkedAtUtc: new Date().toISOString(),
    expectedIdentity,
    healthBody,
    routeStatuses,
    healthReadyStatus,
    appSettings,
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
