#!/usr/bin/env tsx

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

interface IOptions {
  outputZipPath: string;
  stagingDir: string;
  skipBuild: boolean;
}

interface IRequiredPath {
  readonly path: string;
  readonly reason: string;
}

function parseArgs(argv: string[]): IOptions {
  const root = process.cwd();
  let outputZipPath = path.join(root, 'functions-artifact.zip');
  let stagingDir = path.join(root, '.tmp', 'functions-deploy');
  let skipBuild = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output' && argv[index + 1]) {
      outputZipPath = path.resolve(root, argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--staging' && argv[index + 1]) {
      stagingDir = path.resolve(root, argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--skip-build') {
      skipBuild = true;
      continue;
    }
  }

  return {
    outputZipPath,
    stagingDir,
    skipBuild,
  };
}

function runOrThrow(command: string, args: readonly string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed (${command} ${args.join(' ')})`);
  }
}

function runCapture(command: string, args: readonly string[], cwd: string): string | undefined {
  const result = spawnSync(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    encoding: 'utf8',
  });
  if (result.status !== 0) return undefined;
  const out = (result.stdout ?? '').toString().trim();
  return out.length > 0 ? out : undefined;
}

function resolveCommitSha(root: string): string {
  const fromEnv = (process.env.GITHUB_SHA ?? '').trim();
  if (fromEnv.length > 0) return fromEnv;
  return runCapture('git', ['rev-parse', 'HEAD'], root) ?? 'unknown';
}

function sha256OfFile(filePath: string): string {
  const bytes = readFileSync(filePath);
  return createHash('sha256').update(bytes).digest('hex');
}

// Assertions are scoped to the legacy-fallback lane objective. Other workspace
// packages that ship incidentally via the monolithic host's dependency graph
// are intentionally not asserted here; see artifact-inventory.json for the
// full staged surface.
const LEGACY_FALLBACK_REQUIRED_PATHS: readonly IRequiredPath[] = [
  { path: 'host.json', reason: 'Functions runtime host metadata' },
  { path: 'package.json', reason: 'Functions runtime package metadata (main entrypoint pointer)' },
  { path: 'ENTRYPOINT', reason: 'authoritative host entrypoint (Prompt 03)' },
  { path: 'functions/legacyFallbackDiscovery/index.js', reason: 'legacy fallback discovery HTTP + timer registrations' },
  { path: 'functions/adminApi/legacy-fallback-routes.js', reason: 'legacy fallback review/admin route registrations' },
  { path: 'services/legacy-fallback/discovery-repository.js', reason: 'SharePoint persistence boundary for sync-run and registry writes' },
  { path: 'services/legacy-fallback/discovery-service.js', reason: 'discovery orchestration (drives the registered functions)' },
  { path: 'services/legacy-fallback/project-index-provider.js', reason: 'project-index seam feeding the matching engine' },
  { path: 'services/legacy-fallback/review-service.js', reason: 'review/override business logic behind admin routes' },
  { path: 'services/legacy-fallback/review-repository.js', reason: 'SharePoint persistence boundary for review/override state' },
  { path: 'node_modules/@hbc/models', reason: '@hbc/models/provisioning models used by the lane' },
  { path: 'node_modules/@azure/functions/package.json', reason: 'Azure Functions Node v4 runtime' },
];

const ADMIN_CONTROL_PLANE_REQUIRED_PATHS: readonly IRequiredPath[] = [
  { path: 'hosts/admin-control-plane/index.js', reason: 'admin control-plane host entrypoint composition' },
  { path: 'hosts/admin-control-plane/service-factory.js', reason: 'admin control-plane host service composition' },
  { path: 'functions/adminApi/index.js', reason: 'admin API route root registration' },
  { path: 'functions/adminApi/safety-record-keeping-routes.js', reason: 'safety ingest/preview/replay/provision/probe route registrations' },
  { path: 'functions/health/index.js', reason: 'health route root registration' },
  { path: 'functions/health/ready.js', reason: 'admin-gated readiness route registration' },
  { path: 'services/safety-ingestion-code-path.js', reason: 'Safety ingestion Graph-only code-path constant + violation error' },
  { path: 'services/safety-ingestion-application-service.js', reason: 'Safety ingestion application service enforcing assertGraphOnlyRepository' },
  { path: 'services/safety-ingestion-graph-repository.js', reason: 'Safety ingestion Graph-only repository (data-plane commit path)' },
  { path: 'services/safety-ingestion-graph-data-plane.js', reason: 'Safety ingestion Graph HTTP seam (fetch-based, no PnP/REST)' },
];

const SAFETY_ROUTE_SIGNATURES: readonly string[] = [
  'safety-records/ingest',
  'safety-records/ingest/preview',
  'safety-records/replay',
  'safety-records/provision-sharepoint',
  'safety-records/reporting-periods/{reportingPeriodId}/probe',
];

function resolveEntrypoint(stagingDir: string): string {
  const nested = './dist/backend/functions/src/index.js';
  if (existsSync(path.join(stagingDir, nested))) {
    return nested;
  }

  const canonical = './dist/index.js';
  if (existsSync(path.join(stagingDir, canonical))) {
    return canonical;
  }

  throw new Error(
    'Artifact validation failed: missing both ./dist/index.js and ./dist/backend/functions/src/index.js',
  );
}

function rewriteMainEntrypoint(stagingDir: string, mainEntrypoint: string): void {
  const packageJsonPath = path.join(stagingDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { main?: string };
  if (packageJson.main === mainEntrypoint) {
    return;
  }
  packageJson.main = mainEntrypoint;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function assertArtifactShape(stagingDir: string, mainEntrypoint: string): void {
  const runtimeRoot = path.dirname(mainEntrypoint);
  for (const entry of LEGACY_FALLBACK_REQUIRED_PATHS) {
    const resolvedPath = entry.path === 'ENTRYPOINT'
      ? mainEntrypoint
      : (entry.path.startsWith('node_modules/') || entry.path === 'host.json' || entry.path === 'package.json')
        ? `./${entry.path}`
        : path.posix.join(runtimeRoot, entry.path);
    const normalized = resolvedPath.startsWith('./') ? resolvedPath.slice(2) : resolvedPath;
    const absolutePath = path.join(stagingDir, normalized);
    if (!existsSync(absolutePath)) {
      throw new Error(`Artifact validation failed: missing ${normalized} (${entry.reason})`);
    }
  }

  for (const entry of ADMIN_CONTROL_PLANE_REQUIRED_PATHS) {
    const resolvedPath = path.posix.join(runtimeRoot, entry.path);
    const normalized = resolvedPath.startsWith('./') ? resolvedPath.slice(2) : resolvedPath;
    const absolutePath = path.join(stagingDir, normalized);
    if (!existsSync(absolutePath)) {
      throw new Error(`Artifact validation failed: missing ${normalized} (${entry.reason})`);
    }
  }
}

function collectStagedWorkspacePackages(stagingDir: string): Array<{ name: string; version: string }> {
  const hbcRoot = path.join(stagingDir, 'node_modules', '@hbc');
  if (!existsSync(hbcRoot)) {
    return [];
  }
  const entries = readdirSync(hbcRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink());

  const results: Array<{ name: string; version: string }> = [];
  for (const dirent of entries) {
    const packageJsonPath = path.join(hbcRoot, dirent.name, 'package.json');
    if (!existsSync(packageJsonPath)) continue;
    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      name?: string;
      version?: string;
    };
    results.push({
      name: parsed.name ?? `@hbc/${dirent.name}`,
      version: parsed.version ?? '0.0.0',
    });
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

function writeArtifactInventory(stagingDir: string, mainEntrypoint: string): string {
  const inventoryPath = path.join(stagingDir, 'artifact-inventory.json');
  const pkg = JSON.parse(readFileSync(path.join(stagingDir, 'package.json'), 'utf8')) as {
    name?: string;
    version?: string;
    main?: string;
  };
  const runtimeRoot = path.dirname(mainEntrypoint);
  const adminHostPath = path.posix.join(runtimeRoot, 'hosts/admin-control-plane/index.js');
  const safetyRoutesPath = path.posix.join(runtimeRoot, 'functions/adminApi/safety-record-keeping-routes.js');
  const healthIndexPath = path.posix.join(runtimeRoot, 'functions/health/index.js');
  const healthReadyPath = path.posix.join(runtimeRoot, 'functions/health/ready.js');
  const inventory = {
    objective: 'legacy-fallback',
    entrypoint: pkg.main ?? mainEntrypoint,
    hostJson: 'host.json',
    functionsRuntimePackage: { name: pkg.name ?? '@hbc/functions', version: pkg.version ?? '0.0.0' },
    legacyFallbackRequiredPaths: [...LEGACY_FALLBACK_REQUIRED_PATHS]
      .map((entry) => ({ path: entry.path, reason: entry.reason }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    adminControlPlaneRequiredPaths: [...ADMIN_CONTROL_PLANE_REQUIRED_PATHS]
      .map((entry) => ({ path: entry.path, reason: entry.reason }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    adminControlPlaneReleaseProof: {
      hostEntrypoint: adminHostPath,
      hostCompositionImports: [
        '../../functions/adminApi/index.js',
        '../../functions/adminApi/hybrid-identity-routes.js',
        '../../functions/health/index.js',
      ],
      safetyRouteSignatures: [...SAFETY_ROUTE_SIGNATURES],
      safetyRoutesModule: safetyRoutesPath,
    },
    safetyGraphCommitPathProof: {
      codePathModule: path.posix.join(runtimeRoot, 'services/safety-ingestion-code-path.js'),
      applicationServiceModule: path.posix.join(runtimeRoot, 'services/safety-ingestion-application-service.js'),
      graphRepositoryModule: path.posix.join(runtimeRoot, 'services/safety-ingestion-graph-repository.js'),
      graphDataPlaneModule: path.posix.join(runtimeRoot, 'services/safety-ingestion-graph-data-plane.js'),
      codePathLiteral: 'graph-only',
      codePathConstant: 'SAFETY_INGESTION_REQUIRED_CODE_PATH',
      violationError: 'SafetyIngestionCodePathViolationError',
      applicationServiceGuard: 'assertGraphOnlyRepository',
    },
    healthRouteReleaseProof: {
      activeEntrypoint: pkg.main ?? mainEntrypoint,
      healthIndexModule: healthIndexPath,
      healthReadyModule: healthReadyPath,
      requiredImportChain: {
        entrypointImportsHealthIndex: 'functions/health/index.js',
        healthIndexImportsReady: './ready.js',
      },
    },
    stagedWorkspacePackages: collectStagedWorkspacePackages(stagingDir),
  };
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  return inventoryPath;
}

function assertAdminControlPlaneReleaseProof(stagingDir: string, mainEntrypoint: string): void {
  const runtimeRoot = path.dirname(mainEntrypoint);
  const adminHostPath = path.join(stagingDir, path.posix.join(runtimeRoot, 'hosts/admin-control-plane/index.js').replace(/^\.\//, ''));
  const safetyRoutesPath = path.join(stagingDir, path.posix.join(runtimeRoot, 'functions/adminApi/safety-record-keeping-routes.js').replace(/^\.\//, ''));

  const hostContent = readFileSync(adminHostPath, 'utf8');
  for (const expectedImport of [
    '../../functions/adminApi/index.js',
    '../../functions/adminApi/hybrid-identity-routes.js',
    '../../functions/health/index.js',
  ]) {
    if (!hostContent.includes(expectedImport)) {
      throw new Error(`Artifact validation failed: admin host composition missing import ${expectedImport}`);
    }
  }

  const routeContent = readFileSync(safetyRoutesPath, 'utf8');
  for (const signature of SAFETY_ROUTE_SIGNATURES) {
    if (!routeContent.includes(signature)) {
      throw new Error(`Artifact validation failed: safety route signature missing ${signature}`);
    }
  }
}

function assertSafetyGraphCommitPathReleaseProof(stagingDir: string, mainEntrypoint: string): void {
  const runtimeRoot = path.dirname(mainEntrypoint);
  const stagedPath = (relative: string): string =>
    path.join(stagingDir, path.posix.join(runtimeRoot, relative).replace(/^\.\//, ''));

  const codePathPath = stagedPath('services/safety-ingestion-code-path.js');
  const applicationServicePath = stagedPath('services/safety-ingestion-application-service.js');
  const graphRepositoryPath = stagedPath('services/safety-ingestion-graph-repository.js');
  const graphDataPlanePath = stagedPath('services/safety-ingestion-graph-data-plane.js');

  const codePathContent = readFileSync(codePathPath, 'utf8');
  if (!codePathContent.includes("SAFETY_INGESTION_REQUIRED_CODE_PATH = 'graph-only'")) {
    throw new Error(
      'Artifact validation failed: safety-ingestion-code-path.js missing graph-only code-path constant',
    );
  }
  if (!codePathContent.includes('SafetyIngestionCodePathViolationError')) {
    throw new Error(
      'Artifact validation failed: safety-ingestion-code-path.js missing SafetyIngestionCodePathViolationError',
    );
  }

  const appServiceContent = readFileSync(applicationServicePath, 'utf8');
  if (!appServiceContent.includes('SafetyIngestionCodePathViolationError')) {
    throw new Error(
      'Artifact validation failed: safety-ingestion-application-service.js not wired to SafetyIngestionCodePathViolationError',
    );
  }
  if (!appServiceContent.includes('assertGraphOnlyRepository')) {
    throw new Error(
      'Artifact validation failed: safety-ingestion-application-service.js missing assertGraphOnlyRepository guard',
    );
  }
  for (const operation of ['ingest', 'preview', 'replay', 'reporting-period-probe']) {
    if (!appServiceContent.includes(`assertGraphOnlyRepository(repo, '${operation}'`)) {
      throw new Error(
        `Artifact validation failed: assertGraphOnlyRepository not invoked for operation=${operation}`,
      );
    }
  }

  const graphRepoContent = readFileSync(graphRepositoryPath, 'utf8');
  if (!graphRepoContent.includes('SAFETY_INGESTION_REQUIRED_CODE_PATH')) {
    throw new Error(
      'Artifact validation failed: safety-ingestion-graph-repository.js does not bind the required code-path constant',
    );
  }

  if (!existsSync(graphDataPlanePath)) {
    throw new Error(
      'Artifact validation failed: missing safety-ingestion-graph-data-plane.js (Graph HTTP seam)',
    );
  }
}

export function assertHealthRouteReleaseProof(stagingDir: string, mainEntrypoint: string): void {
  const normalizedEntrypoint = mainEntrypoint.startsWith('./') ? mainEntrypoint.slice(2) : mainEntrypoint;
  const runtimeRoot = path.dirname(mainEntrypoint);
  const healthIndexRelative = path.posix.join(runtimeRoot, 'functions/health/index.js').replace(/^\.\//, '');
  const healthReadyRelative = path.posix.join(runtimeRoot, 'functions/health/ready.js').replace(/^\.\//, '');
  const entrypointPath = path.join(stagingDir, normalizedEntrypoint);
  const healthIndexPath = path.join(stagingDir, healthIndexRelative);
  const healthReadyPath = path.join(stagingDir, healthReadyRelative);

  if (!existsSync(healthIndexPath)) {
    throw new Error(`Artifact validation failed: missing ${healthIndexRelative} (health route root registration)`);
  }
  if (!existsSync(healthReadyPath)) {
    throw new Error(`Artifact validation failed: missing ${healthReadyRelative} (admin-gated readiness route registration)`);
  }

  const entrypointContent = readFileSync(entrypointPath, 'utf8');
  const expectedEntrypointImport = 'functions/health/index.js';
  if (!entrypointContent.includes(expectedEntrypointImport)) {
    throw new Error(`Artifact validation failed: active entrypoint missing import ${expectedEntrypointImport}`);
  }

  const healthIndexContent = readFileSync(healthIndexPath, 'utf8');
  if (!healthIndexContent.includes('./ready.js')) {
    throw new Error('Artifact validation failed: health index missing side-effect import ./ready.js');
  }
}

function assertStagedEntrypointResolves(stagingDir: string, root: string, mainEntrypoint: string): void {
  const entrypoint = path.join(stagingDir, mainEntrypoint.startsWith('./') ? mainEntrypoint.slice(2) : mainEntrypoint);
  const entryUrl = pathToFileURL(entrypoint).href;
  const checkScript = [
    `import(${JSON.stringify(entryUrl)})`,
    ".then(() => { console.log('artifact-entrypoint-import-ok'); })",
    ".catch((error) => {",
    "  console.error('artifact-entrypoint-import-failed');",
    "  console.error(error instanceof Error ? error.message : String(error));",
    '  process.exit(1);',
    '});',
  ].join('');
  runOrThrow('node', ['--input-type=module', '-e', checkScript], root);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const functionsDir = path.join(root, 'backend', 'functions');

  rmSync(options.stagingDir, { recursive: true, force: true });
  mkdirSync(options.stagingDir, { recursive: true });
  rmSync(options.outputZipPath, { force: true });

  if (!options.skipBuild) {
    runOrThrow('pnpm', [
      'turbo',
      'run',
      'build',
      '--filter=@hbc/models',
      '--filter=@hbc/provisioning',
      '--filter=@hbc/notification-intelligence',
      '--filter=@hbc/acknowledgment',
      '--filter=@hbc/functions',
    ], root);
  }

  runOrThrow('pnpm', [
    '--filter',
    '@hbc/functions',
    'deploy',
    '--prod',
    '--legacy',
    options.stagingDir,
    '--config.node-linker=hoisted',
  ], root);

  cpSync(path.join(functionsDir, 'host.json'), path.join(options.stagingDir, 'host.json'));
  const mainEntrypoint = resolveEntrypoint(options.stagingDir);
  rewriteMainEntrypoint(options.stagingDir, mainEntrypoint);
  assertArtifactShape(options.stagingDir, mainEntrypoint);
  assertAdminControlPlaneReleaseProof(options.stagingDir, mainEntrypoint);
  assertHealthRouteReleaseProof(options.stagingDir, mainEntrypoint);
  assertSafetyGraphCommitPathReleaseProof(options.stagingDir, mainEntrypoint);
  const inventoryPath = writeArtifactInventory(options.stagingDir, mainEntrypoint);
  assertStagedEntrypointResolves(options.stagingDir, root, mainEntrypoint);

  const outputDir = path.dirname(options.outputZipPath);
  mkdirSync(outputDir, { recursive: true });
  // Dereference symlinks for deployment compatibility on hosted Linux Functions.
  runOrThrow('zip', ['-qr', options.outputZipPath, '.'], options.stagingDir);

  // Emit the out-of-zip deterministic stamp. This is what the CI workflow
  // reads to drive the runtime appsettings stamp and the post-deploy
  // identity proof — closing phase-02 audit gap G-01 (artifact truth).
  const stagedPkg = JSON.parse(readFileSync(path.join(options.stagingDir, 'package.json'), 'utf8')) as {
    name?: string;
    version?: string;
    main?: string;
  };
  const sha256 = sha256OfFile(options.outputZipPath);
  const zipBytes = statSync(options.outputZipPath).size;
  const commitSha = resolveCommitSha(root);
  const buildTimestamp = new Date().toISOString();
  const manifest = {
    packageName: stagedPkg.name ?? '@hbc/functions',
    packageVersion: stagedPkg.version ?? '0.0.0',
    commitSha,
    buildTimestamp,
    zipPath: path.basename(options.outputZipPath),
    zipBytes,
    sha256,
    entrypoint: stagedPkg.main ?? mainEntrypoint,
    hostJson: 'host.json',
    stagedWorkspacePackages: collectStagedWorkspacePackages(options.stagingDir),
  };
  const manifestPath = path.join(outputDir, 'artifact-manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const summary = {
    outputZipPath: options.outputZipPath,
    stagingDir: options.stagingDir,
    inventoryPath,
    inventoryInZip: 'artifact-inventory.json',
    manifestPath,
    packageVersion: manifest.packageVersion,
    commitSha: manifest.commitSha,
    buildTimestamp: manifest.buildTimestamp,
    sha256,
    zipBytes,
    deployCommand: 'az functionapp deploy --type zip --src-path <artifact.zip>',
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (process.env.VITEST !== 'true') {
  main();
}
