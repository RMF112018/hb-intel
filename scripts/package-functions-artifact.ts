#!/usr/bin/env tsx

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
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

// Assertions are scoped to the legacy-fallback lane objective. Other workspace
// packages that ship incidentally via the monolithic host's dependency graph
// are intentionally not asserted here; see artifact-inventory.json for the
// full staged surface.
const LEGACY_FALLBACK_REQUIRED_PATHS: readonly IRequiredPath[] = [
  { path: 'host.json', reason: 'Functions runtime host metadata' },
  { path: 'package.json', reason: 'Functions runtime package metadata (main entrypoint pointer)' },
  { path: 'dist/index.js', reason: 'authoritative host entrypoint (Prompt 03)' },
  { path: 'dist/functions/legacyFallbackDiscovery/index.js', reason: 'legacy fallback discovery HTTP + timer registrations' },
  { path: 'dist/functions/adminApi/legacy-fallback-routes.js', reason: 'legacy fallback review/admin route registrations' },
  { path: 'dist/services/legacy-fallback/discovery-repository.js', reason: 'SharePoint persistence boundary for sync-run and registry writes' },
  { path: 'dist/services/legacy-fallback/discovery-service.js', reason: 'discovery orchestration (drives the registered functions)' },
  { path: 'dist/services/legacy-fallback/project-index-provider.js', reason: 'project-index seam feeding the matching engine' },
  { path: 'dist/services/legacy-fallback/review-service.js', reason: 'review/override business logic behind admin routes' },
  { path: 'dist/services/legacy-fallback/review-repository.js', reason: 'SharePoint persistence boundary for review/override state' },
  { path: 'node_modules/@hbc/models', reason: '@hbc/models/provisioning models used by the lane' },
  { path: 'node_modules/@azure/functions/package.json', reason: 'Azure Functions Node v4 runtime' },
];

function assertArtifactShape(stagingDir: string): void {
  for (const entry of LEGACY_FALLBACK_REQUIRED_PATHS) {
    const absolutePath = path.join(stagingDir, entry.path);
    if (!existsSync(absolutePath)) {
      throw new Error(`Artifact validation failed: missing ${entry.path} (${entry.reason})`);
    }
  }

  const packageJson = JSON.parse(
    readFileSync(path.join(stagingDir, 'package.json'), 'utf8'),
  ) as { main?: string };
  if (packageJson.main !== './dist/index.js') {
    throw new Error(
      `Artifact validation failed: package.json main must be ./dist/index.js but found ${String(packageJson.main)}`,
    );
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

function writeArtifactInventory(stagingDir: string): string {
  const inventoryPath = path.join(stagingDir, 'artifact-inventory.json');
  const pkg = JSON.parse(readFileSync(path.join(stagingDir, 'package.json'), 'utf8')) as {
    name?: string;
    version?: string;
    main?: string;
  };
  const inventory = {
    objective: 'legacy-fallback',
    entrypoint: pkg.main ?? './dist/index.js',
    hostJson: 'host.json',
    functionsRuntimePackage: { name: pkg.name ?? '@hbc/functions', version: pkg.version ?? '0.0.0' },
    legacyFallbackRequiredPaths: [...LEGACY_FALLBACK_REQUIRED_PATHS]
      .map((entry) => ({ path: entry.path, reason: entry.reason }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    stagedWorkspacePackages: collectStagedWorkspacePackages(stagingDir),
  };
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  return inventoryPath;
}

function assertStagedEntrypointResolves(stagingDir: string, root: string): void {
  const entrypoint = path.join(stagingDir, 'dist', 'index.js');
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
  assertArtifactShape(options.stagingDir);
  const inventoryPath = writeArtifactInventory(options.stagingDir);
  assertStagedEntrypointResolves(options.stagingDir, root);

  const outputDir = path.dirname(options.outputZipPath);
  mkdirSync(outputDir, { recursive: true });
  // Dereference symlinks for deployment compatibility on hosted Linux Functions.
  runOrThrow('zip', ['-qr', options.outputZipPath, '.'], options.stagingDir);

  const summary = {
    outputZipPath: options.outputZipPath,
    stagingDir: options.stagingDir,
    inventoryPath,
    inventoryInZip: 'artifact-inventory.json',
    deployCommand: 'az functionapp deploy --type zip --src-path <artifact.zip>',
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
