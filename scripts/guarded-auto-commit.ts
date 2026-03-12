#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export type TaskStatus = 'in_progress' | 'complete';

export interface GuardedCommitConfig {
  enabled: boolean;
  taskId: string;
  taskStatus: TaskStatus;
  approvedPaths: string[];
  validation: {
    tests: string;
    typecheck: string;
    build: string;
  };
  commit: {
    summary: string;
    body?: string;
    type?: string;
    scope?: string;
  };
  dryRun?: boolean;
  allowDisabledBypass?: boolean;
}

export interface CliOptions {
  configPath: string;
  dryRunOverride: boolean;
  disableGuard: boolean;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface GuardedCommitDeps {
  getChangedFiles: () => string[];
  runValidation: (command: string) => CommandResult;
  stageFiles: (files: string[]) => CommandResult;
  commit: (subject: string, body?: string) => CommandResult;
  log: (message: string) => void;
}

export interface GuardedCommitRunResult {
  ok: boolean;
  exitCode: number;
  refusedReason?: string;
}

function normalizeRepoPath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\.\//, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

export function globToRegExp(pattern: string): RegExp {
  const normalized = normalizeRepoPath(pattern);
  const doubleStarMarker = '__DOUBLE_STAR__';
  const singleStarMarker = '__SINGLE_STAR__';
  const questionMarker = '__QUESTION_MARK__';

  const withMarkers = normalized
    .replace(/\*\*/g, doubleStarMarker)
    .replace(/\*/g, singleStarMarker)
    .replace(/\?/g, questionMarker);

  let escaped = escapeRegExp(withMarkers);
  escaped = escaped
    .replace(new RegExp(doubleStarMarker, 'g'), '.*')
    .replace(new RegExp(singleStarMarker, 'g'), '[^/]*')
    .replace(new RegExp(questionMarker, 'g'), '[^/]');

  return new RegExp(`^${escaped}$`);
}

export function matchesApprovedPath(filePath: string, approvedPaths: string[]): boolean {
  const normalizedFile = normalizeRepoPath(filePath);
  return approvedPaths.some((pattern) => globToRegExp(pattern).test(normalizedFile));
}

export function parseArgs(argv: string[]): CliOptions {
  let configPath = '';
  let dryRunOverride = false;
  let disableGuard = false;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error('Missing value for --config');
      }
      configPath = next;
      i += 1;
      continue;
    }
    if (arg === '--dry-run') {
      dryRunOverride = true;
      continue;
    }
    if (arg === '--disable-guard') {
      disableGuard = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!configPath) {
    throw new Error('Missing required argument: --config <path>');
  }

  return { configPath, dryRunOverride, disableGuard };
}

export function parseChangedFilesFromPorcelain(porcelainOutput: string): string[] {
  if (!porcelainOutput) {
    return [];
  }

  const entries = porcelainOutput.split('\0').filter((entry) => entry.length > 0);
  const files = new Set<string>();

  for (let index = 0; index < entries.length; index += 1) {
    const raw = entries[index];
    const status = raw.slice(0, 2);
    const firstPath = normalizeRepoPath(raw.slice(3));

    if (firstPath) {
      files.add(firstPath);
    }

    if (status.includes('R') || status.includes('C')) {
      const secondPath = entries[index + 1];
      if (secondPath) {
        files.add(normalizeRepoPath(secondPath));
      }
      index += 1;
    }
  }

  return Array.from(files).sort();
}

function ensureNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid config: ${fieldName} must be a non-empty string`);
  }
  return value;
}

function ensureBoolean(value: unknown, fieldName: string, defaultValue?: boolean): boolean {
  if (value === undefined && defaultValue !== undefined) {
    return defaultValue;
  }
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid config: ${fieldName} must be a boolean`);
  }
  return value;
}

export function validateConfig(input: unknown): GuardedCommitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid config: expected JSON object');
  }

  const raw = input as Record<string, unknown>;

  const enabled = ensureBoolean(raw.enabled, 'enabled');
  const taskId = ensureNonEmptyString(raw.taskId, 'taskId');
  const taskStatus = ensureNonEmptyString(raw.taskStatus, 'taskStatus') as TaskStatus;
  if (taskStatus !== 'in_progress' && taskStatus !== 'complete') {
    throw new Error('Invalid config: taskStatus must be "in_progress" or "complete"');
  }

  if (!Array.isArray(raw.approvedPaths) || raw.approvedPaths.length === 0) {
    throw new Error('Invalid config: approvedPaths must be a non-empty string array');
  }
  const approvedPaths = raw.approvedPaths.map((pattern, idx) =>
    ensureNonEmptyString(pattern, `approvedPaths[${idx}]`),
  );

  if (!raw.validation || typeof raw.validation !== 'object') {
    throw new Error('Invalid config: validation must be an object');
  }
  const validationRaw = raw.validation as Record<string, unknown>;
  const validation = {
    tests: ensureNonEmptyString(validationRaw.tests, 'validation.tests'),
    typecheck: ensureNonEmptyString(validationRaw.typecheck, 'validation.typecheck'),
    build: ensureNonEmptyString(validationRaw.build, 'validation.build'),
  };

  if (!raw.commit || typeof raw.commit !== 'object') {
    throw new Error('Invalid config: commit must be an object');
  }
  const commitRaw = raw.commit as Record<string, unknown>;
  const commit = {
    summary: ensureNonEmptyString(commitRaw.summary, 'commit.summary'),
    body:
      commitRaw.body === undefined
        ? undefined
        : ensureNonEmptyString(commitRaw.body, 'commit.body'),
    type:
      commitRaw.type === undefined
        ? undefined
        : ensureNonEmptyString(commitRaw.type, 'commit.type'),
    scope:
      commitRaw.scope === undefined
        ? undefined
        : ensureNonEmptyString(commitRaw.scope, 'commit.scope'),
  };

  const dryRun =
    raw.dryRun === undefined ? undefined : ensureBoolean(raw.dryRun, 'dryRun');
  const allowDisabledBypass = ensureBoolean(
    raw.allowDisabledBypass,
    'allowDisabledBypass',
    false,
  );

  return {
    enabled,
    taskId,
    taskStatus,
    approvedPaths,
    validation,
    commit,
    dryRun,
    allowDisabledBypass,
  };
}

export function loadConfig(configPath: string): GuardedCommitConfig {
  const absoluteConfigPath = path.resolve(process.cwd(), configPath);
  const rawJson = readFileSync(absoluteConfigPath, 'utf8');
  const parsed = JSON.parse(rawJson) as unknown;
  return validateConfig(parsed);
}

export function buildCommitSubject(config: GuardedCommitConfig): string {
  const sfMatch = /^SF(\d+)-/i.exec(config.taskId);
  const type = config.commit.type;
  const scope = config.commit.scope;

  if (type) {
    const prefix = scope ? `${type}(${scope})` : type;
    return `${prefix}: complete ${config.taskId} — ${config.commit.summary}`;
  }

  if (sfMatch) {
    const sfScope = `sf${sfMatch[1]}`;
    return `${scope ? `chore(${scope})` : `chore(${sfScope})`}: complete ${config.taskId} — ${config.commit.summary}`;
  }

  return `${config.taskId}: ${config.commit.summary}`;
}

export function createRuntimeDeps(): GuardedCommitDeps {
  const log = (message: string): void => {
    console.log(message);
  };

  const runValidation = (command: string): CommandResult => {
    const result = spawnSync('zsh', ['-lc', command], {
      encoding: 'utf8',
      stdio: 'inherit',
    });

    return {
      exitCode: result.status ?? 1,
      stdout: '',
      stderr: '',
    };
  };

  const gitCapture = (args: string[]): CommandResult => {
    const result = spawnSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      exitCode: result.status ?? 1,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
    };
  };

  const gitInherit = (args: string[]): CommandResult => {
    const result = spawnSync('git', args, {
      encoding: 'utf8',
      stdio: 'inherit',
    });
    return {
      exitCode: result.status ?? 1,
      stdout: '',
      stderr: '',
    };
  };

  const getChangedFiles = (): string[] => {
    const result = gitCapture(['status', '--porcelain=1', '-z']);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to inspect git status: ${result.stderr.trim()}`);
    }
    return parseChangedFilesFromPorcelain(result.stdout);
  };

  const stageFiles = (files: string[]): CommandResult => {
    return gitInherit(['add', '--', ...files]);
  };

  const commit = (subject: string, body?: string): CommandResult => {
    const args = ['commit', '-m', subject];
    if (body && body.trim().length > 0) {
      args.push('-m', body);
    }
    return gitInherit(args);
  };

  return {
    getChangedFiles,
    runValidation,
    stageFiles,
    commit,
    log,
  };
}

function logPass(log: (message: string) => void, message: string): void {
  log(`[PASS] ${message}`);
}

function logFail(log: (message: string) => void, message: string): void {
  log(`[FAIL] ${message}`);
}

function logSkip(log: (message: string) => void, message: string): void {
  log(`[SKIP] ${message}`);
}

export function runGuardedAutoCommit(
  config: GuardedCommitConfig,
  cli: Pick<CliOptions, 'dryRunOverride' | 'disableGuard'>,
  deps: GuardedCommitDeps,
): GuardedCommitRunResult {
  const dryRun = cli.dryRunOverride || config.dryRun === true;

  deps.log('[INFO] Guarded auto-commit started');

  if (cli.disableGuard) {
    logSkip(deps.log, 'Guard disabled via --disable-guard');
    if (config.allowDisabledBypass) {
      deps.log('[INFO] Guard bypass allowed by config (allowDisabledBypass=true)');
      return { ok: false, exitCode: 0, refusedReason: 'guard-disabled-bypass' };
    }
    logFail(
      deps.log,
      'Guard disable requested but allowDisabledBypass=false, refusing commit',
    );
    return { ok: false, exitCode: 2, refusedReason: 'guard-disabled' };
  }

  if (!config.enabled) {
    logSkip(deps.log, 'Automation disabled by config (enabled=false)');
    return { ok: false, exitCode: 2, refusedReason: 'automation-disabled' };
  }
  logPass(deps.log, 'Automation enabled');

  if (config.taskStatus !== 'complete') {
    logFail(
      deps.log,
      `Task ${config.taskId} is not complete (taskStatus=${config.taskStatus})`,
    );
    return { ok: false, exitCode: 2, refusedReason: 'task-not-complete' };
  }
  logPass(deps.log, `Task ${config.taskId} marked complete`);

  const changedFiles = deps.getChangedFiles();
  if (changedFiles.length === 0) {
    logFail(deps.log, 'No changed files found in working tree');
    return { ok: false, exitCode: 2, refusedReason: 'no-changes' };
  }
  logPass(deps.log, `Collected ${changedFiles.length} changed file(s)`);

  const disallowed = changedFiles.filter(
    (file) => !matchesApprovedPath(file, config.approvedPaths),
  );
  if (disallowed.length > 0) {
    for (const file of disallowed) {
      logFail(deps.log, `Path allowlist violation: ${file}`);
    }
    return { ok: false, exitCode: 2, refusedReason: 'allowlist-violation' };
  }
  logPass(deps.log, 'All changed files are inside approved paths');

  const gates: Array<{ name: string; command: string }> = [
    { name: 'tests', command: config.validation.tests },
    { name: 'typecheck', command: config.validation.typecheck },
    { name: 'build', command: config.validation.build },
  ];

  for (const gate of gates) {
    deps.log(`[INFO] Running ${gate.name}: ${gate.command}`);
    const result = deps.runValidation(gate.command);
    if (result.exitCode !== 0) {
      logFail(
        deps.log,
        `${gate.name} gate failed (exit ${result.exitCode}) command: ${gate.command}`,
      );
      return { ok: false, exitCode: result.exitCode || 1, refusedReason: `${gate.name}-failed` };
    }
    logPass(deps.log, `${gate.name} gate passed`);
  }

  const commitSubject = buildCommitSubject(config);
  if (!commitSubject.includes(config.taskId)) {
    logFail(deps.log, 'Commit subject does not include task identifier');
    return { ok: false, exitCode: 2, refusedReason: 'invalid-commit-message' };
  }
  logPass(deps.log, `Commit subject generated: ${commitSubject}`);

  if (dryRun) {
    logSkip(deps.log, 'Dry-run enabled, skipping git add and git commit');
    deps.log('[INFO] Guarded auto-commit dry-run succeeded (no commit created)');
    return { ok: true, exitCode: 0 };
  }

  deps.log('[INFO] Staging approved changed files');
  const stageResult = deps.stageFiles(changedFiles);
  if (stageResult.exitCode !== 0) {
    logFail(deps.log, `Failed to stage files (exit ${stageResult.exitCode})`);
    return { ok: false, exitCode: stageResult.exitCode || 1, refusedReason: 'stage-failed' };
  }
  logPass(deps.log, 'Staging succeeded');

  deps.log('[INFO] Creating local git commit');
  const commitResult = deps.commit(commitSubject, config.commit.body);
  if (commitResult.exitCode !== 0) {
    logFail(deps.log, `git commit failed (exit ${commitResult.exitCode})`);
    return { ok: false, exitCode: commitResult.exitCode || 1, refusedReason: 'commit-failed' };
  }
  logPass(deps.log, 'Local commit created successfully');

  deps.log('[INFO] Completed without push (local commit only)');
  return { ok: true, exitCode: 0 };
}

function main(): void {
  try {
    const cli = parseArgs(process.argv);
    const config = loadConfig(cli.configPath);
    const deps = createRuntimeDeps();

    const result = runGuardedAutoCommit(config, cli, deps);
    if (!result.ok) {
      deps.log(`[INFO] Commit refused: ${result.refusedReason ?? 'unknown'}`);
    }
    process.exit(result.exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
