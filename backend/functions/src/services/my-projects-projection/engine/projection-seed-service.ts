/**
 * My Projects projection — initial seed / full-rebuild / source-rebuild service.
 *
 * Implements Doc 06 §12 (Full Rebuild Algorithm) and Doc 07 §6 (Stage 4 — Initial
 * Seed). The admin HTTP endpoint and the CLI operator script both call into this
 * service. Incremental sync runs through the slice engine (Prompt 07) and does
 * NOT go through this path.
 *
 * Flow:
 *   1. acquire rebuild lease (`Lease:Rebuild:Global`),
 *   2. start a run-ledger entry,
 *   3. load full source(s) — Projects + Registry, or one source for `source-rebuild`,
 *   4. enumerate every assigned UPN across the union,
 *   5. per user, reconcile via the shared domain module to produce
 *      `MyProjectLinkItem[]`,
 *   6. upsert expected helper rows by `ProjectionKey` (with content-hash
 *      short-circuit + reactivation),
 *   7. soft-deactivate active helper rows whose `ProjectionKey` is not in the
 *      expected set, using reason `rebuild-obsolete`,
 *   8. finalize run-ledger entry and release the lease.
 *
 * Dry-run produces expected counts only (no writes) so operators can preview
 * a rebuild before authorizing it.
 */

import { normalizeUpn, type MyProjectLinkItem } from '@hbc/models/myWork';

import {
  enumerateAssignedUpns,
  reconcileProjectLinks,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from '../../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';
import { computeProjectionContentHash, computeProjectionKey } from '../projection-content-hash.js';
import type {
  IProjectionAdminRebuildRequest,
  ProjectionAdminRebuildKind,
} from '../projection-admin-contracts.js';
import type {
  ProjectionRunStatus,
  ProjectionRunType,
  SourceListKind,
} from '../projection-types.js';
import type { ProjectionLeaseRowKey } from '../state/lease-repository.js';
import type { IProjectionRunStartArgs } from '../state/run-repository.js';
import {
  buildDeactivationPatch,
  buildReactivationOperationalPatch,
  mapItemToRegistryRow,
  type IMyProjectsRegistryExistingRow,
  type IMyProjectsRegistryRowFields,
  type IMyProjectsRegistryRowPatch,
} from '../registry/my-projects-registry-row-mapper.js';
import type { IMyProjectsRegistryRepository } from '../registry/my-projects-registry-repository.js';
import type { IProjectionSourceFetchClient } from './projection-source-fetch-client.js';
import type { IProjectionSourceListLocator } from '../subscriptions/projection-source-list-locator.js';
import type { IProjectionGraphDeltaClient } from '../delta/projection-graph-delta-client.js';

const OK_SOURCE_FLAGS = Object.freeze({ ok: true, bounded: false });
const OK_SOURCE_STATUSES = Object.freeze({
  projects: OK_SOURCE_FLAGS,
  registry: OK_SOURCE_FLAGS,
});

const REBUILD_LEASE_ROW_KEY = 'Lease:Rebuild:Global' as const;

export interface ISeedRunCounts {
  readonly expectedRows: number;
  readonly helperRowsInserted: number;
  readonly helperRowsUpdated: number;
  readonly helperRowsReactivated: number;
  readonly helperRowsDeactivated: number;
  readonly helperRowsUnchanged: number;
}

export interface ISeedRunResult {
  readonly runId: string;
  readonly runType: ProjectionRunType;
  readonly status: ProjectionRunStatus;
  readonly startedAtUtc: string;
  readonly completedAtUtc?: string;
  readonly sourceListKind?: SourceListKind;
  readonly dryRun: boolean;
  readonly counts: ISeedRunCounts;
  readonly failureCode?: string;
  readonly sanitizedReason?: string;
}

export interface IProjectionSeedService {
  runSeedOrRebuild(args: {
    readonly request: IProjectionAdminRebuildRequest;
    readonly runId: string;
    readonly projectionBatchId: string;
    readonly leaseOwner: string;
    readonly rebuildLeaseTtlMinutes: number;
  }): Promise<ISeedRunResult>;
}

export interface IProjectionSeedServiceDeps {
  readonly sourceFetchClient: IProjectionSourceFetchClient;
  readonly registryRepository: IMyProjectsRegistryRepository;
  readonly leaseRepository: {
    tryAcquire(args: {
      rowKey: ProjectionLeaseRowKey;
      leaseType: 'sync' | 'rebuild' | 'audit' | 'purge';
      leaseOwner: string;
      ttlMinutes: number;
      sourceListKind?: SourceListKind;
      now: Date;
    }): Promise<
      | { readonly acquired: true; readonly expiresAtUtc: string }
      | { readonly acquired: false; readonly reason: 'active'; readonly currentOwner: string; readonly expiresAtUtc: string }
      | { readonly acquired: false; readonly reason: 'race-conflict' }
    >;
    release(args: { rowKey: ProjectionLeaseRowKey; leaseOwner: string }): Promise<{ released: boolean }>;
  };
  readonly runRepository: {
    start(args: IProjectionRunStartArgs): Promise<{ rowKey: string }>;
    finalize(args: {
      rowKey: string;
      status: ProjectionRunStatus;
      completedAtUtc: string;
      counts?: Record<string, number | undefined>;
      failureCode?: string;
      notes?: string;
    }): Promise<void>;
  };
  readonly sourceSyncStateRepository: {
    get(sourceListKind: SourceListKind): Promise<{ SourceListKind: SourceListKind } | null>;
    getWithEtag(
      sourceListKind: SourceListKind,
    ): Promise<{ entity: { SourceListKind: SourceListKind }; etag: string } | null>;
    initializeBaseline(args: {
      sourceListKind: SourceListKind;
      deltaLink: string;
      batchId: string;
      atUtc: string;
    }): Promise<void>;
    clearNeedsResync(args: {
      sourceListKind: SourceListKind;
      deltaLink: string;
      batchId: string;
      atUtc: string;
      expectedEtag: string;
    }): Promise<void>;
  };
  readonly failureRepository: {
    upsertFailure(args: {
      failureId: string;
      failureClass: 'reconciliation';
      failureCode: string;
      sourceListKind?: SourceListKind;
      relatedRunId?: string;
      sanitizedMessage?: string;
      atUtc: string;
    }): Promise<void>;
  };
  readonly sourceListLocator: IProjectionSourceListLocator;
  readonly deltaClient: IProjectionGraphDeltaClient;
  readonly now?: () => Date;
}

function zeroCounts(): {
  expectedRows: number;
  helperRowsInserted: number;
  helperRowsUpdated: number;
  helperRowsReactivated: number;
  helperRowsDeactivated: number;
  helperRowsUnchanged: number;
} {
  return {
    expectedRows: 0,
    helperRowsInserted: 0,
    helperRowsUpdated: 0,
    helperRowsReactivated: 0,
    helperRowsDeactivated: 0,
    helperRowsUnchanged: 0,
  };
}

function classifyRunType(kind: ProjectionAdminRebuildKind): ProjectionRunType {
  if (kind === 'seed') return 'seed';
  return 'manual-rebuild';
}

function sanitize(input: unknown): string {
  const raw = input instanceof Error ? input.message : String(input);
  return raw.slice(0, 240);
}

export class ProjectionSeedService implements IProjectionSeedService {
  private readonly deps: Required<IProjectionSeedServiceDeps>;

  constructor(deps: IProjectionSeedServiceDeps) {
    this.deps = {
      sourceFetchClient: deps.sourceFetchClient,
      registryRepository: deps.registryRepository,
      leaseRepository: deps.leaseRepository,
      runRepository: deps.runRepository,
      sourceSyncStateRepository: deps.sourceSyncStateRepository,
      failureRepository: deps.failureRepository,
      sourceListLocator: deps.sourceListLocator,
      deltaClient: deps.deltaClient,
      now: deps.now ?? (() => new Date()),
    };
  }

  private scopeKinds(sourceScope: SourceListKind | undefined): readonly SourceListKind[] {
    if (sourceScope) return [sourceScope];
    return ['Projects', 'LegacyRegistry'];
  }

  private async initializeOrRefreshBaselines(args: {
    sourceScope: SourceListKind | undefined;
    projectionBatchId: string;
  }): Promise<void> {
    const atUtc = this.deps.now().toISOString();
    for (const kind of this.scopeKinds(args.sourceScope)) {
      const location = await this.deps.sourceListLocator.resolve(kind);
      const initial = await this.deps.deltaClient.acquireInitialDeltaLink({
        siteId: location.siteId,
        listId: location.listId,
      });
      if (!initial.ok) {
        throw new Error(
          `baseline-init-failed:${kind}:${initial.failureCode}:${initial.sanitizedReason}`,
        );
      }
      const withEtag = await this.deps.sourceSyncStateRepository.getWithEtag(kind);
      if (withEtag === null) {
        await this.deps.sourceSyncStateRepository.initializeBaseline({
          sourceListKind: kind,
          deltaLink: initial.deltaLink,
          batchId: args.projectionBatchId,
          atUtc,
        });
        continue;
      }
      await this.deps.sourceSyncStateRepository.clearNeedsResync({
        sourceListKind: kind,
        deltaLink: initial.deltaLink,
        batchId: args.projectionBatchId,
        atUtc,
        expectedEtag: withEtag.etag,
      });
    }
  }

  async runSeedOrRebuild(args: {
    request: IProjectionAdminRebuildRequest;
    runId: string;
    projectionBatchId: string;
    leaseOwner: string;
    rebuildLeaseTtlMinutes: number;
  }): Promise<ISeedRunResult> {
    const { request, runId, projectionBatchId, leaseOwner, rebuildLeaseTtlMinutes } = args;
    const startedAt = this.deps.now();
    const startedAtUtc = startedAt.toISOString();
    const runType = classifyRunType(request.rebuildKind);
    const dryRun = request.dryRun === true;
    const sourceScope: SourceListKind | undefined =
      request.rebuildKind === 'source-rebuild' ? request.sourceListKind : undefined;
    if (request.rebuildKind === 'source-rebuild' && !sourceScope) {
      return {
        runId,
        runType,
        status: 'failed',
        startedAtUtc,
        completedAtUtc: this.deps.now().toISOString(),
        dryRun,
        counts: zeroCounts(),
        failureCode: 'invalid-request',
        sanitizedReason: "source-rebuild requires 'sourceListKind'.",
      };
    }

    const counts = zeroCounts();
    let runRowKey: string | null = null;
    let leaseAcquired = false;
    let failureForPersistence: { code: string; reason: string } | null = null;

    try {
      const leaseOutcome = await this.deps.leaseRepository.tryAcquire({
        rowKey: REBUILD_LEASE_ROW_KEY,
        leaseType: 'rebuild',
        leaseOwner,
        ttlMinutes: rebuildLeaseTtlMinutes,
        now: startedAt,
      });
      if (!leaseOutcome.acquired) {
        return {
          runId,
          runType,
          status: 'skipped',
          startedAtUtc,
          completedAtUtc: this.deps.now().toISOString(),
          ...(sourceScope ? { sourceListKind: sourceScope } : {}),
          dryRun,
          counts,
          failureCode:
            leaseOutcome.reason === 'active' ? 'rebuild-lease-active' : 'rebuild-lease-conflict',
          sanitizedReason:
            leaseOutcome.reason === 'active'
              ? `rebuild lease held by ${leaseOutcome.currentOwner}`
              : 'rebuild lease race conflict',
        };
      }
      leaseAcquired = true;

      const startResult = await this.deps.runRepository.start({
        runId,
        runType,
        startedAtUtc,
        ...(sourceScope ? { sourceListKind: sourceScope } : {}),
        projectionBatchId,
      });
      runRowKey = startResult.rowKey;

      const projects: readonly IProjectSourceRow[] =
        sourceScope === 'LegacyRegistry'
          ? []
          : await this.deps.sourceFetchClient.listAllProjectsRows();
      const registry: readonly ILegacyRegistrySourceRow[] =
        sourceScope === 'Projects' ? [] : await this.deps.sourceFetchClient.listAllRegistryRows();

      const upns = enumerateAssignedUpns(projects, registry);
      const expectedByKey = new Map<
        string,
        {
          upn: string;
          item: MyProjectLinkItem;
          contentHash: string;
        }
      >();

      for (const rawUpn of upns) {
        const normalized = normalizeUpn(rawUpn);
        if (!normalized) continue;
        const items = reconcileProjectLinks(normalized, projects, registry, OK_SOURCE_STATUSES);
        for (const item of items) {
          const key = computeProjectionKey(normalized, item.recordKey);
          const contentHash = computeProjectionContentHash({
            upn: normalized,
            recordKey: item.recordKey,
            item,
          });
          expectedByKey.set(key, { upn: normalized, item, contentHash });
        }
      }
      counts.expectedRows = expectedByKey.size;

      if (dryRun) {
        // Compute the projected delta against current registry state without writing.
        for (const [key, expected] of expectedByKey) {
          const existing = await this.deps.registryRepository.findByProjectionKey(key);
          if (!existing) {
            counts.helperRowsInserted += 1;
            continue;
          }
          if (!existing.isActive) {
            counts.helperRowsReactivated += 1;
            continue;
          }
          if (existing.projectionContentHash === expected.contentHash) {
            counts.helperRowsUnchanged += 1;
            continue;
          }
          counts.helperRowsUpdated += 1;
        }
        // Stale active rows that would be deactivated are not enumerable cheaply
        // without a full helper-list scan; report the value as best-effort 0 in
        // dry-run and leave the deactivation count to the actual rebuild run.

        const completedAtUtc = this.deps.now().toISOString();
        await this.deps.runRepository.finalize({
          rowKey: runRowKey,
          status: 'succeeded',
          completedAtUtc,
          counts: {
            ChangedItemCount: counts.expectedRows,
            HelperRowsInserted: counts.helperRowsInserted,
            HelperRowsUpdated: counts.helperRowsUpdated,
            HelperRowsReactivated: counts.helperRowsReactivated,
            HelperRowsDeactivated: counts.helperRowsDeactivated,
          },
          notes:
            (request.notes ? `${request.notes}; ` : '') +
            'dry-run=true; deactivation count is not estimated in dry-run.',
        });
        return {
          runId,
          runType,
          status: 'succeeded',
          startedAtUtc,
          completedAtUtc,
          ...(sourceScope ? { sourceListKind: sourceScope } : {}),
          dryRun,
          counts,
        };
      }

      const lastProjectedAtUtc = this.deps.now().toISOString();
      const writtenKeys = new Set<string>();
      const knownExistingByKey = new Map<string, IMyProjectsRegistryExistingRow>();

      for (const [key, expected] of expectedByKey) {
        const existing = await this.deps.registryRepository.findByProjectionKey(key);
        const fields: IMyProjectsRegistryRowFields = mapItemToRegistryRow({
          projectionKey: key,
          userUpn: expected.upn,
          recordKey: expected.item.recordKey,
          item: expected.item,
          contentHash: expected.contentHash,
          projectionBatchId,
          lastProjectedAtUtc,
        });

        if (!existing) {
          await this.deps.registryRepository.insertRow(fields);
          counts.helperRowsInserted += 1;
          writtenKeys.add(key);
          continue;
        }

        knownExistingByKey.set(key, existing);

        if (!existing.isActive) {
          const patch: IMyProjectsRegistryRowPatch = {
            ...fields,
            ...buildReactivationOperationalPatch({
              projectionBatchId,
              nowUtc: lastProjectedAtUtc,
            }),
          };
          await this.deps.registryRepository.patchRow(existing.listItemId, patch);
          counts.helperRowsReactivated += 1;
          writtenKeys.add(key);
          continue;
        }

        if (existing.projectionContentHash === expected.contentHash) {
          counts.helperRowsUnchanged += 1;
          writtenKeys.add(key);
          continue;
        }

        await this.deps.registryRepository.patchRow(existing.listItemId, fields);
        counts.helperRowsUpdated += 1;
        writtenKeys.add(key);
      }

      // Soft-deactivate active helper rows not in the expected set, scoped to
      // the rebuild's scope:
      //   - 'full-rebuild' / 'seed' → scan via known projects + registry IDs.
      //   - 'source-rebuild Projects' → only ProjectsListItemId-based helpers.
      //   - 'source-rebuild LegacyRegistry' → only LegacyRegistryItemId-based helpers.
      const candidateStaleRows = await this.collectStaleCandidates({
        projects,
        registry,
        sourceScope,
      });
      const deactivatedAtUtc = this.deps.now().toISOString();
      for (const row of candidateStaleRows) {
        if (!row.isActive) continue;
        if (writtenKeys.has(row.projectionKey)) continue;
        if (expectedByKey.has(row.projectionKey)) continue;
        await this.deps.registryRepository.patchRow(
          row.listItemId,
          buildDeactivationPatch({
            reason: 'rebuild-obsolete',
            projectionBatchId,
            nowUtc: deactivatedAtUtc,
          }),
        );
        counts.helperRowsDeactivated += 1;
      }

      await this.initializeOrRefreshBaselines({
        sourceScope,
        projectionBatchId,
      });

      const completedAtUtc = this.deps.now().toISOString();
      await this.deps.runRepository.finalize({
        rowKey: runRowKey,
        status: 'succeeded',
        completedAtUtc,
        counts: {
          ChangedItemCount: counts.expectedRows,
          HelperRowsInserted: counts.helperRowsInserted,
          HelperRowsUpdated: counts.helperRowsUpdated,
          HelperRowsReactivated: counts.helperRowsReactivated,
          HelperRowsDeactivated: counts.helperRowsDeactivated,
        },
        ...(request.notes ? { notes: request.notes } : {}),
      });

      return {
        runId,
        runType,
        status: 'succeeded',
        startedAtUtc,
        completedAtUtc,
        ...(sourceScope ? { sourceListKind: sourceScope } : {}),
        dryRun,
        counts,
      };
    } catch (error) {
      const failedAtUtc = this.deps.now().toISOString();
      const reason = sanitize(error);
      failureForPersistence = { code: 'rebuild-failed', reason };
      if (runRowKey !== null) {
        try {
          await this.deps.runRepository.finalize({
            rowKey: runRowKey,
            status: 'failed',
            completedAtUtc: failedAtUtc,
            failureCode: 'rebuild-failed',
            notes: reason,
            counts: {
              ChangedItemCount: counts.expectedRows,
              HelperRowsInserted: counts.helperRowsInserted,
              HelperRowsUpdated: counts.helperRowsUpdated,
              HelperRowsReactivated: counts.helperRowsReactivated,
              HelperRowsDeactivated: counts.helperRowsDeactivated,
            },
          });
        } catch {
          // Ignore — best-effort finalize on failure path.
        }
      }
      return {
        runId,
        runType,
        status: 'failed',
        startedAtUtc,
        completedAtUtc: failedAtUtc,
        ...(sourceScope ? { sourceListKind: sourceScope } : {}),
        dryRun,
        counts,
        failureCode: 'rebuild-failed',
        sanitizedReason: reason,
      };
    } finally {
      if (failureForPersistence) {
        try {
          await this.deps.failureRepository.upsertFailure({
            failureId: `${runId}:rebuild`,
            failureClass: 'reconciliation',
            failureCode: failureForPersistence.code,
            ...(sourceScope ? { sourceListKind: sourceScope } : {}),
            relatedRunId: runId,
            sanitizedMessage: failureForPersistence.reason,
            atUtc: this.deps.now().toISOString(),
          });
        } catch {
          // no-op, failure repository is best-effort on this path.
        }
      }
      if (leaseAcquired) {
        try {
          await this.deps.leaseRepository.release({
            rowKey: REBUILD_LEASE_ROW_KEY,
            leaseOwner,
          });
        } catch {
          // Best-effort; lease will expire on its own TTL.
        }
      }
    }
  }

  private async collectStaleCandidates(args: {
    projects: readonly IProjectSourceRow[];
    registry: readonly ILegacyRegistrySourceRow[];
    sourceScope: SourceListKind | undefined;
  }): Promise<readonly IMyProjectsRegistryExistingRow[]> {
    const seen = new Map<number, IMyProjectsRegistryExistingRow>();

    if (args.sourceScope === undefined || args.sourceScope === 'Projects') {
      for (const project of args.projects) {
        const rows = await this.deps.registryRepository.findByProjectsListItemId(project.id);
        for (const row of rows) seen.set(row.listItemId, row);
      }
    }

    if (args.sourceScope === undefined || args.sourceScope === 'LegacyRegistry') {
      for (const registry of args.registry) {
        const rows = await this.deps.registryRepository.findByLegacyRegistryItemId(registry.id);
        for (const row of rows) seen.set(row.listItemId, row);
      }
    }

    return [...seen.values()];
  }
}

export function createProjectionSeedService(
  deps: IProjectionSeedServiceDeps,
): IProjectionSeedService {
  return new ProjectionSeedService(deps);
}
