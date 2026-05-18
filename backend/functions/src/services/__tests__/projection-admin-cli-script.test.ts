import { describe, expect, it } from 'vitest';

import {
  CliUsageError,
  parseArgs,
  runCli,
  type ICliDeps,
} from '../../../../../scripts/projection-admin-cli.js';
import type { ISeedRunResult } from '../my-projects-projection/engine/projection-seed-service.js';

function makeDeps(
  result: ISeedRunResult,
  recent: ReadonlyArray<Record<string, unknown>> = [],
): ICliDeps {
  return {
    seedService: {
      async runSeedOrRebuild() {
        return result;
      },
    },
    runRepository: {
      async listRecent() {
        return recent;
      },
    } as unknown as ICliDeps['runRepository'],
    rebuildLeaseTtlMinutes: 30,
    runIdProvider: () => 'run-id',
    projectionBatchIdProvider: () => 'batch-id',
    leaseOwnerProvider: () => 'cli-tester',
  };
}

const RESULT_OK: ISeedRunResult = {
  runId: 'run-id',
  runType: 'seed',
  status: 'succeeded',
  startedAtUtc: '2026-05-18T13:00:00.000Z',
  completedAtUtc: '2026-05-18T13:00:01.000Z',
  dryRun: false,
  counts: {
    expectedRows: 5,
    helperRowsInserted: 5,
    helperRowsUpdated: 0,
    helperRowsReactivated: 0,
    helperRowsDeactivated: 0,
    helperRowsUnchanged: 0,
  },
};

describe('parseArgs', () => {
  it('parses --command=seed with flags', () => {
    const args = parseArgs(['--command=seed', '--dry-run', '--notes=initial']);
    expect(args).toEqual({ command: 'seed', dryRun: true, notes: 'initial' });
  });

  it('parses --command rebuild with separate-token value and source kind', () => {
    const args = parseArgs(['--command', 'rebuild', '--source-list-kind=Projects', '--notes=once']);
    expect(args).toEqual({
      command: 'rebuild',
      sourceListKind: 'Projects',
      dryRun: false,
      notes: 'once',
    });
  });

  it('parses --command=status with limit and filters', () => {
    const args = parseArgs([
      '--command=status',
      '--limit=25',
      '--run-type=manual-rebuild',
      '--source-list-kind=LegacyRegistry',
    ]);
    expect(args).toEqual({
      command: 'status',
      dryRun: false,
      limit: 25,
      runType: 'manual-rebuild',
      sourceListKind: 'LegacyRegistry',
    });
  });

  it('rejects an invalid --command value', () => {
    expect(() => parseArgs(['--command=invalid'])).toThrow(CliUsageError);
  });

  it('rejects an invalid --source-list-kind value', () => {
    expect(() => parseArgs(['--command=rebuild', '--source-list-kind=Mystery'])).toThrow(
      CliUsageError,
    );
  });

  it('rejects an unrecognized argument', () => {
    expect(() => parseArgs(['--command=seed', '--unknown'])).toThrow(CliUsageError);
  });

  it('requires --command', () => {
    expect(() => parseArgs([])).toThrow(CliUsageError);
  });

  it('rejects --limit with a non-positive integer', () => {
    expect(() => parseArgs(['--command=status', '--limit=0'])).toThrow(CliUsageError);
    expect(() => parseArgs(['--command=status', '--limit=abc'])).toThrow(CliUsageError);
  });
});

describe('runCli', () => {
  it('returns ok=true and the seed result for a successful seed run', async () => {
    const report = await runCli({ command: 'seed', dryRun: false }, makeDeps(RESULT_OK));
    expect(report.ok).toBe(true);
    expect(report.command).toBe('seed');
    expect(report.result?.status).toBe('succeeded');
  });

  it('returns ok=false when the seed result status is not succeeded', async () => {
    const report = await runCli(
      { command: 'rebuild', dryRun: false },
      makeDeps({
        ...RESULT_OK,
        status: 'failed',
        failureCode: 'rebuild-failed',
      }),
    );
    expect(report.ok).toBe(false);
    expect(report.result?.failureCode).toBe('rebuild-failed');
  });

  it('forwards source-rebuild to the seed service with sourceListKind', async () => {
    let captured: Record<string, unknown> | null = null;
    const deps: ICliDeps = {
      ...makeDeps(RESULT_OK),
      seedService: {
        async runSeedOrRebuild(args) {
          captured = { ...args };
          return RESULT_OK;
        },
      },
    };
    await runCli({ command: 'rebuild', sourceListKind: 'LegacyRegistry', dryRun: true }, deps);
    expect((captured as { request: Record<string, unknown> })?.request).toMatchObject({
      rebuildKind: 'source-rebuild',
      sourceListKind: 'LegacyRegistry',
      dryRun: true,
    });
  });

  it('renders a status report from the run repository', async () => {
    const deps = makeDeps(RESULT_OK, [
      {
        RunId: 'r1',
        RunType: 'seed',
        Status: 'succeeded',
        StartedAtUtc: '2026-05-18T11:00:00.000Z',
        CompletedAtUtc: '2026-05-18T11:01:00.000Z',
        SourceListKind: 'Projects',
        HelperRowsInserted: 4,
      },
    ]);
    const report = await runCli({ command: 'status', dryRun: false, limit: 5 }, deps);
    expect(report.ok).toBe(true);
    expect(report.status).toHaveLength(1);
    expect(report.status?.[0]).toMatchObject({
      runId: 'r1',
      runType: 'seed',
      status: 'succeeded',
      sourceListKind: 'Projects',
      helperRowsInserted: 4,
    });
  });
});
