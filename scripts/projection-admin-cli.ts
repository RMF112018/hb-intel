/**
 * Operator CLI for the My Projects projection seed/rebuild/status controls.
 *
 * Wraps the production seed service (`createProjectionSeedService`) and the run
 * ledger so operators can trigger or inspect projection runs without going
 * through the admin HTTP endpoint. Useful for: pre-cutover seed (Stage 4,
 * Doc 07 §6), one-off source-rebuild during repair, status sweep ahead of
 * cutover readiness.
 *
 * Auth: relies on the same federated Graph token + SharePoint list
 * managed-identity paths as the Function App.
 *
 * Usage:
 *   pnpm tsx scripts/projection-admin-cli.ts --command=seed [--dry-run] [--notes "..."]
 *   pnpm tsx scripts/projection-admin-cli.ts --command=rebuild [--source-list-kind=Projects|LegacyRegistry] [--dry-run] [--notes "..."]
 *   pnpm tsx scripts/projection-admin-cli.ts --command=status [--limit=10] [--run-type=manual-rebuild] [--source-list-kind=Projects]
 *
 * Output: structured JSON to stdout; non-zero exit on failure.
 */

import { randomUUID } from 'node:crypto';

import { GraphListClient } from '../backend/functions/src/services/legacy-fallback/graph-list-client.js';
import { getProjectionConfig } from '../backend/functions/src/services/my-projects-projection/projection-config.js';
import { SharePointProjectionControlStateRepository } from '../backend/functions/src/services/my-projects-projection/state/sharepoint-control-state-repository.js';
import { SharePointProjectionRunRepository } from '../backend/functions/src/services/my-projects-projection/state/sharepoint-run-repository.js';
import { ProjectionSourceSyncStateRepository } from '../backend/functions/src/services/my-projects-projection/state/source-sync-state-repository.js';
import { SharePointStateStore } from '../backend/functions/src/services/my-projects-projection/state/sharepoint-state-store.js';
import { SyncFailureRepository } from '../backend/functions/src/services/my-projects-projection/state/sync-failure-repository.js';
import { createGraphMyProjectsRegistryRepository } from '../backend/functions/src/services/my-projects-projection/registry/my-projects-registry-repository.js';
import { createGraphProjectionSourceFetchClient } from '../backend/functions/src/services/my-projects-projection/engine/projection-source-fetch-client.js';
import {
  createProjectionSeedService,
  type IProjectionSeedService,
  type ISeedRunResult,
} from '../backend/functions/src/services/my-projects-projection/engine/projection-seed-service.js';
import { createProjectionGraphDeltaClient } from '../backend/functions/src/services/my-projects-projection/delta/projection-graph-delta-client.js';
import type { IProjectionAdminRebuildRequest } from '../backend/functions/src/services/my-projects-projection/projection-admin-contracts.js';
import {
  isProjectionRunType,
  isSourceListKind,
  type ProjectionRunType,
  type SourceListKind,
} from '../backend/functions/src/services/my-projects-projection/projection-types.js';
import type { IProjectionRunEntity } from '../backend/functions/src/services/my-projects-projection/projection-state-entities.js';
import {
  createProjectionSourceListLocator,
  type IGraphSiteListResolver,
} from '../backend/functions/src/services/my-projects-projection/subscriptions/projection-source-list-locator.js';

export type CliCommand = 'seed' | 'rebuild' | 'status';

export interface ICliArgs {
  readonly command: CliCommand;
  readonly sourceListKind?: SourceListKind;
  readonly dryRun: boolean;
  readonly notes?: string;
  readonly limit?: number;
  readonly runType?: ProjectionRunType;
}

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliUsageError';
  }
}

export function parseArgs(argv: readonly string[]): ICliArgs {
  let command: CliCommand | undefined;
  let sourceListKind: SourceListKind | undefined;
  let dryRun = false;
  let notes: string | undefined;
  let limit: number | undefined;
  let runType: ProjectionRunType | undefined;

  const flagValue = (token: string, prefix: string): string | null => {
    if (token === prefix) return '';
    if (token.startsWith(`${prefix}=`)) return token.slice(prefix.length + 1);
    return null;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      throw new CliUsageError(usageMessage());
    }
    if (token === '--dry-run') {
      dryRun = true;
      continue;
    }

    const commandValue = flagValue(token, '--command');
    if (commandValue !== null) {
      const value = commandValue === '' ? argv[++i] : commandValue;
      if (value !== 'seed' && value !== 'rebuild' && value !== 'status') {
        throw new CliUsageError(
          `Invalid --command value '${value}'. Expected 'seed' | 'rebuild' | 'status'.`,
        );
      }
      command = value;
      continue;
    }

    const sourceValue = flagValue(token, '--source-list-kind');
    if (sourceValue !== null) {
      const value = sourceValue === '' ? argv[++i] : sourceValue;
      if (!isSourceListKind(value)) {
        throw new CliUsageError(
          `Invalid --source-list-kind value '${value}'. Expected 'Projects' | 'LegacyRegistry'.`,
        );
      }
      sourceListKind = value;
      continue;
    }

    const notesValue = flagValue(token, '--notes');
    if (notesValue !== null) {
      notes = notesValue === '' ? argv[++i] : notesValue;
      continue;
    }

    const limitValue = flagValue(token, '--limit');
    if (limitValue !== null) {
      const raw = limitValue === '' ? argv[++i] : limitValue;
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new CliUsageError(`Invalid --limit value '${raw}'. Expected a positive integer.`);
      }
      limit = parsed;
      continue;
    }

    const runTypeValue = flagValue(token, '--run-type');
    if (runTypeValue !== null) {
      const value = runTypeValue === '' ? argv[++i] : runTypeValue;
      if (!isProjectionRunType(value)) {
        throw new CliUsageError(`Invalid --run-type value '${value}'.`);
      }
      runType = value;
      continue;
    }

    throw new CliUsageError(`Unrecognized argument '${token}'. ${usageMessage()}`);
  }

  if (command === undefined) {
    throw new CliUsageError(`Missing required --command flag. ${usageMessage()}`);
  }

  return {
    command,
    ...(sourceListKind ? { sourceListKind } : {}),
    dryRun,
    ...(notes ? { notes } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(runType ? { runType } : {}),
  };
}

function usageMessage(): string {
  return (
    'Usage:\n' +
    '  --command=seed [--dry-run] [--notes "..."]\n' +
    '  --command=rebuild [--source-list-kind=Projects|LegacyRegistry] [--dry-run] [--notes "..."]\n' +
    '  --command=status [--limit=N] [--run-type=<run-type>] [--source-list-kind=<kind>]'
  );
}

export interface ICliDeps {
  readonly seedService: IProjectionSeedService;
  readonly runRepository: {
    listRecent(args: {
      runType?: ProjectionRunType;
      sourceListKind?: SourceListKind;
      limit: number;
    }): Promise<ReadonlyArray<IProjectionRunEntity>>;
  };
  readonly rebuildLeaseTtlMinutes: number;
  readonly runIdProvider: () => string;
  readonly projectionBatchIdProvider: () => string;
  readonly leaseOwnerProvider: () => string;
}

export interface ICliReport {
  readonly command: CliCommand;
  readonly ok: boolean;
  readonly result?: ISeedRunResult;
  readonly status?: ReadonlyArray<Record<string, unknown>>;
  readonly error?: { readonly code: string; readonly message: string };
}

export async function runCli(args: ICliArgs, deps: ICliDeps): Promise<ICliReport> {
  if (args.command === 'status') {
    const recent = await deps.runRepository.listRecent({
      limit: args.limit ?? 10,
      ...(args.runType ? { runType: args.runType } : {}),
      ...(args.sourceListKind ? { sourceListKind: args.sourceListKind } : {}),
    });
    return {
      command: 'status',
      ok: true,
      status: recent.map((entity) => ({
        runId: entity.RunId,
        runType: entity.RunType,
        status: entity.Status,
        startedAtUtc: entity.StartedAtUtc,
        completedAtUtc: entity.CompletedAtUtc ?? null,
        sourceListKind: entity.SourceListKind || null,
        helperRowsInserted: entity.HelperRowsInserted ?? 0,
        helperRowsUpdated: entity.HelperRowsUpdated ?? 0,
        helperRowsReactivated: entity.HelperRowsReactivated ?? 0,
        helperRowsDeactivated: entity.HelperRowsDeactivated ?? 0,
      })),
    };
  }

  const rebuildRequest: IProjectionAdminRebuildRequest =
    args.command === 'seed'
      ? {
          rebuildKind: 'seed',
          ...(args.dryRun ? { dryRun: true } : {}),
          ...(args.notes ? { notes: args.notes } : {}),
        }
      : args.sourceListKind
        ? {
            rebuildKind: 'source-rebuild',
            sourceListKind: args.sourceListKind,
            ...(args.dryRun ? { dryRun: true } : {}),
            ...(args.notes ? { notes: args.notes } : {}),
          }
        : {
            rebuildKind: 'full-rebuild',
            ...(args.dryRun ? { dryRun: true } : {}),
            ...(args.notes ? { notes: args.notes } : {}),
          };

  const result = await deps.seedService.runSeedOrRebuild({
    request: rebuildRequest,
    runId: deps.runIdProvider(),
    projectionBatchId: deps.projectionBatchIdProvider(),
    leaseOwner: deps.leaseOwnerProvider(),
    rebuildLeaseTtlMinutes: deps.rebuildLeaseTtlMinutes,
  });

  return {
    command: args.command,
    ok: result.status === 'succeeded',
    result,
  };
}

function buildProductionDeps(): ICliDeps {
  const config = getProjectionConfig();
  const sourceGraph = new GraphListClient(config.sites.sourceSiteUrl);
  const registryGraph = new GraphListClient(config.sites.registrySiteUrl);
  const store = new SharePointStateStore(config.sites.registrySiteUrl);
  const runRepository = new SharePointProjectionRunRepository(store);
  const resolver: IGraphSiteListResolver = {
    async resolveSiteId() {
      return sourceGraph.resolveSiteId();
    },
    async resolveListId(_siteId, listTitle) {
      return sourceGraph.resolveListId(listTitle);
    },
  };
  const seedService = createProjectionSeedService({
    sourceFetchClient: createGraphProjectionSourceFetchClient({ graph: sourceGraph }),
    registryRepository: createGraphMyProjectsRegistryRepository({ graph: registryGraph }),
    leaseRepository: new SharePointProjectionControlStateRepository(store),
    runRepository,
    sourceSyncStateRepository: new ProjectionSourceSyncStateRepository(store),
    failureRepository: new SyncFailureRepository(store),
    sourceListLocator: createProjectionSourceListLocator({
      resolver,
      config: {
        sourceSiteUrl: config.sites.sourceSiteUrl,
        projectsListTitle: config.sites.projectsListTitle,
        legacyRegistryListTitle: config.sites.legacyRegistryListTitle,
      },
    }),
    deltaClient: createProjectionGraphDeltaClient(),
  });
  return {
    seedService,
    runRepository,
    rebuildLeaseTtlMinutes: config.leases.rebuildLeaseMinutes,
    runIdProvider: () => randomUUID(),
    projectionBatchIdProvider: () => randomUUID(),
    leaseOwnerProvider: () => `cli-${randomUUID()}`,
  };
}

const isMain =
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('projection-admin-cli.ts');

if (isMain) {
  (async (): Promise<void> => {
    let args: ICliArgs;
    try {
      args = parseArgs(process.argv.slice(2));
    } catch (err: unknown) {
      if (err instanceof CliUsageError) {
        // eslint-disable-next-line no-console
        console.error(err.message);
        process.exitCode = 2;
        return;
      }
      throw err;
    }

    const report = await runCli(args, buildProductionDeps());
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  })().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ ok: false, error: { code: 'unhandled', message } }));
    process.exitCode = 1;
  });
}
