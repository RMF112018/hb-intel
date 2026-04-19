#!/usr/bin/env tsx

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

interface IOptions {
  outputZipPath: string;
  stagingDir: string;
  skipBuild: boolean;
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

function assertArtifactShape(stagingDir: string): void {
  const requiredPaths = [
    'host.json',
    'package.json',
    'dist/index.js',
    'dist/functions/legacyFallbackDiscovery/index.js',
    'dist/functions/adminApi/legacy-fallback-routes.js',
    'node_modules/@hbc/models',
    'node_modules/@hbc/provisioning',
    'node_modules/@hbc/notification-intelligence',
    'node_modules/@hbc/acknowledgment',
    'node_modules/@azure/functions/package.json',
  ];

  for (const relPath of requiredPaths) {
    const absolutePath = path.join(stagingDir, relPath);
    if (!existsSync(absolutePath)) {
      throw new Error(`Artifact validation failed: missing ${relPath}`);
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
  assertStagedEntrypointResolves(options.stagingDir, root);

  const outputDir = path.dirname(options.outputZipPath);
  mkdirSync(outputDir, { recursive: true });
  // Dereference symlinks for deployment compatibility on hosted Linux Functions.
  runOrThrow('zip', ['-qr', options.outputZipPath, '.'], options.stagingDir);

  const summary = {
    outputZipPath: options.outputZipPath,
    stagingDir: options.stagingDir,
    deployCommand: 'az functionapp deploy --type zip --src-path <artifact.zip>',
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
