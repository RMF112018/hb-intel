import { describe, expect, it } from 'vitest';

import {
  type GuardedCommitConfig,
  type GuardedCommitDeps,
  type CommandResult,
  buildCommitSubject,
  matchesApprovedPath,
  parseChangedFilesFromPorcelain,
  runGuardedAutoCommit,
  validateConfig,
} from './guarded-auto-commit';

function okResult(): CommandResult {
  return { exitCode: 0, stdout: '', stderr: '' };
}

function baseConfig(): GuardedCommitConfig {
  return {
    enabled: true,
    taskId: 'SF18-T04',
    taskStatus: 'complete',
    approvedPaths: [
      'packages/features/estimating/**',
      'docs/architecture/plans/shared-features/SF18*.md',
      'docs/explanation/feature-decisions/PH7-SF-18-*.md',
    ],
    validation: {
      tests: 'pnpm --filter @hbc/features-estimating test',
      typecheck: 'pnpm --filter @hbc/features-estimating typecheck',
      build: 'pnpm --filter @hbc/features-estimating build',
    },
    commit: {
      summary: 'Hooks & State Model implemented',
      body: 'Implements SF18 task completion with validation and docs updates.',
    },
    dryRun: false,
    allowDisabledBypass: false,
  };
}

function makeDeps(options?: {
  changedFiles?: string[];
  failValidationAt?: 'tests' | 'typecheck' | 'build';
  stageExitCode?: number;
  commitExitCode?: number;
}): { deps: GuardedCommitDeps; logs: string[]; calls: string[] } {
  const logs: string[] = [];
  const calls: string[] = [];

  const validationExit = (command: string): number => {
    if (options?.failValidationAt === 'tests' && command.includes(' test')) {
      return 1;
    }
    if (options?.failValidationAt === 'typecheck' && command.includes(' typecheck')) {
      return 1;
    }
    if (options?.failValidationAt === 'build' && command.includes(' build')) {
      return 1;
    }
    return 0;
  };

  const deps: GuardedCommitDeps = {
    getChangedFiles: () =>
      options?.changedFiles ?? [
        'packages/features/estimating/src/hooks/useBidReadiness.ts',
        'docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md',
      ],
    runValidation: (command: string) => {
      calls.push(`validate:${command}`);
      return {
        exitCode: validationExit(command),
        stdout: '',
        stderr: '',
      };
    },
    stageFiles: (files: string[]) => {
      calls.push(`stage:${files.join(',')}`);
      return { exitCode: options?.stageExitCode ?? 0, stdout: '', stderr: '' };
    },
    commit: (subject: string, body?: string) => {
      calls.push(`commit:${subject}${body ? `|${body}` : ''}`);
      return { exitCode: options?.commitExitCode ?? 0, stdout: '', stderr: '' };
    },
    log: (message: string) => {
      logs.push(message);
    },
  };

  return { deps, logs, calls };
}

describe('guarded-auto-commit', () => {
  it('allows commit when all conditions pass', () => {
    const config = baseConfig();
    const { deps, calls, logs } = makeDeps();

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(calls.some((call) => call.startsWith('stage:'))).toBe(true);
    expect(calls.some((call) => call.startsWith('commit:'))).toBe(true);
    expect(logs.some((log) => log.includes('Local commit created successfully'))).toBe(true);
  });

  it('blocks when tests fail', () => {
    const config = baseConfig();
    const { deps, logs, calls } = makeDeps({ failValidationAt: 'tests' });

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.refusedReason).toBe('tests-failed');
    expect(calls.some((call) => call.startsWith('commit:'))).toBe(false);
    expect(logs.some((log) => log.includes('tests gate failed'))).toBe(true);
  });

  it('blocks when typecheck fails', () => {
    const config = baseConfig();
    const { deps, logs } = makeDeps({ failValidationAt: 'typecheck' });

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.refusedReason).toBe('typecheck-failed');
    expect(logs.some((log) => log.includes('typecheck gate failed'))).toBe(true);
  });

  it('blocks when build fails', () => {
    const config = baseConfig();
    const { deps, logs } = makeDeps({ failValidationAt: 'build' });

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.refusedReason).toBe('build-failed');
    expect(logs.some((log) => log.includes('build gate failed'))).toBe(true);
  });

  it('blocks when changed file falls outside approved paths', () => {
    const config = baseConfig();
    const { deps, logs, calls } = makeDeps({
      changedFiles: [
        'packages/features/estimating/src/index.ts',
        'apps/admin/src/main.tsx',
      ],
    });

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.refusedReason).toBe('allowlist-violation');
    expect(logs.some((log) => log.includes('apps/admin/src/main.tsx'))).toBe(true);
    expect(calls.length).toBe(0);
  });

  it('blocks when task is not marked complete', () => {
    const config = {
      ...baseConfig(),
      taskStatus: 'in_progress' as const,
    };
    const { deps, calls } = makeDeps();

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.refusedReason).toBe('task-not-complete');
    expect(calls.length).toBe(0);
  });

  it('supports dry-run without staging or committing', () => {
    const config = baseConfig();
    const { deps, calls, logs } = makeDeps();

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: true, disableGuard: false },
      deps,
    );

    expect(result.ok).toBe(true);
    expect(calls.some((call) => call.startsWith('validate:'))).toBe(true);
    expect(calls.some((call) => call.startsWith('stage:'))).toBe(false);
    expect(calls.some((call) => call.startsWith('commit:'))).toBe(false);
    expect(logs.some((log) => log.includes('Dry-run enabled'))).toBe(true);
  });

  it('logs refusal reason when blocked', () => {
    const config = {
      ...baseConfig(),
      taskStatus: 'in_progress' as const,
    };
    const { deps, logs } = makeDeps();

    runGuardedAutoCommit(config, { dryRunOverride: false, disableGuard: false }, deps);

    expect(logs.some((log) => log.includes('[FAIL]'))).toBe(true);
    expect(logs.some((log) => log.includes('not complete'))).toBe(true);
  });

  it('handles disabled automation via hard-stop switch', () => {
    const config = baseConfig();
    const { deps, calls, logs } = makeDeps();

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: true },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(2);
    expect(result.refusedReason).toBe('guard-disabled');
    expect(calls.length).toBe(0);
    expect(logs.some((log) => log.includes('Guard disabled'))).toBe(true);
  });

  it('allows disabled bypass only when explicitly configured', () => {
    const config = {
      ...baseConfig(),
      allowDisabledBypass: true,
    };
    const { deps, calls } = makeDeps();

    const result = runGuardedAutoCommit(
      config,
      { dryRunOverride: false, disableGuard: true },
      deps,
    );

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(0);
    expect(result.refusedReason).toBe('guard-disabled-bypass');
    expect(calls.length).toBe(0);
  });

  it('generates SF-style default subject and supports fallback', () => {
    const subject = buildCommitSubject(baseConfig());
    expect(subject).toBe('chore(sf18): complete SF18-T04 — Hooks & State Model implemented');

    const fallback = buildCommitSubject({
      ...baseConfig(),
      taskId: 'TASK-123',
      commit: { summary: 'Complete work item' },
    });
    expect(fallback).toBe('TASK-123: Complete work item');
  });

  it('supports custom commit type/scope', () => {
    const subject = buildCommitSubject({
      ...baseConfig(),
      commit: {
        summary: 'Bid readiness engine update',
        type: 'feat',
        scope: 'estimating',
      },
    });

    expect(subject).toBe('feat(estimating): complete SF18-T04 — Bid readiness engine update');
  });

  it('validates config shape and defaults allowDisabledBypass', () => {
    const validated = validateConfig({
      enabled: true,
      taskId: 'SF18-T04',
      taskStatus: 'complete',
      approvedPaths: ['packages/features/estimating/**'],
      validation: {
        tests: 'pnpm test',
        typecheck: 'pnpm check-types',
        build: 'pnpm build',
      },
      commit: {
        summary: 'Summary',
      },
    });

    expect(validated.allowDisabledBypass).toBe(false);
  });

  it('parses porcelain changed files including rename pairs', () => {
    const parsed = parseChangedFilesFromPorcelain(
      `M  packages/features/estimating/src/a.ts\0R  old/file.ts\0new/file.ts\0?? docs/x.md\0`,
    );

    expect(parsed).toEqual([
      'docs/x.md',
      'new/file.ts',
      'old/file.ts',
      'packages/features/estimating/src/a.ts',
    ]);
  });

  it('matches glob allowlist with wildcard patterns', () => {
    expect(
      matchesApprovedPath(
        'docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md',
        ['docs/explanation/feature-decisions/PH7-SF-18-*.md'],
      ),
    ).toBe(true);

    expect(
      matchesApprovedPath('apps/admin/src/main.tsx', ['packages/features/estimating/**']),
    ).toBe(false);
  });
});
