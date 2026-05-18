/**
 * My Projects projection slice engine.
 *
 * Implements `IProjectionSliceRecomputeService` (the contract pinned by Prompt
 * 06 in `delta/projection-slice-recompute-service.ts`). Each delta sync run
 * produces a small batch of changed/deleted source item IDs scoped to one
 * source list (Projects or LegacyRegistry); this engine resolves the relevant
 * counterpart slice, enumerates affected users, projects each per-user
 * `MyProjectLinkItem`, and upserts the resulting registry rows with
 * soft-deactivation for users that fell out of the assignment set.
 *
 * Algorithm: `06_Projection_Recompute_Algorithm.md` §§5-8.
 * Row contract:  `03_SharePoint_My_Projects_Registry_Schema.md`.
 *
 * Pure domain transformations are imported from
 * `hosts/my-work-read-model/read-models/project-links/my-project-links-domain.ts`
 * so this engine and the legacy aggregation provider share one source of
 * truth.
 */

import { normalizeUpn, type MyProjectLinkItem } from '@hbc/models/myWork';

import {
  enumerateAssignedUpns,
  reconcileProjectLinks,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from '../../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';
import type {
  IProjectionSliceRecomputeService,
  IRecomputeCounts,
  IRecomputeOutcome,
  IRecomputeRequest,
} from '../delta/projection-slice-recompute-service.js';
import { computeProjectionContentHash, computeProjectionKey } from '../projection-content-hash.js';
import type { DeactivationReasonChoice } from '../registry-list-descriptor.js';
import type {
  IMyProjectsRegistryExistingRow,
  IMyProjectsRegistryRowPatch,
} from '../registry/my-projects-registry-row-mapper.js';
import {
  buildDeactivationPatch,
  buildReactivationOperationalPatch,
  mapItemToRegistryRow,
} from '../registry/my-projects-registry-row-mapper.js';
import type { IMyProjectsRegistryRepository } from '../registry/my-projects-registry-repository.js';
import type { IProjectionSourceFetchClient } from './projection-source-fetch-client.js';

const OK_SOURCE_FLAGS = Object.freeze({ ok: true, bounded: false });
const OK_SOURCE_STATUSES = Object.freeze({
  projects: OK_SOURCE_FLAGS,
  registry: OK_SOURCE_FLAGS,
});

export interface IProjectionSliceEngineDeps {
  readonly sourceFetchClient: IProjectionSourceFetchClient;
  readonly registryRepository: IMyProjectsRegistryRepository;
  /** UTC timestamp source. Defaults to `() => new Date().toISOString()` in production. */
  readonly now?: () => string;
}

interface IMutableCounts {
  helperRowsInserted: number;
  helperRowsUpdated: number;
  helperRowsReactivated: number;
  helperRowsDeactivated: number;
  helperRowsPurged: number;
}

function zeroCounts(): IMutableCounts {
  return {
    helperRowsInserted: 0,
    helperRowsUpdated: 0,
    helperRowsReactivated: 0,
    helperRowsDeactivated: 0,
    helperRowsPurged: 0,
  };
}

function freezeCounts(counts: IMutableCounts): IRecomputeCounts {
  return Object.freeze({ ...counts });
}

function sanitize(input: unknown): string {
  const raw = input instanceof Error ? input.message : String(input);
  return raw.slice(0, 240);
}

export class ProjectionSliceEngine implements IProjectionSliceRecomputeService {
  private readonly deps: Required<IProjectionSliceEngineDeps>;

  constructor(deps: IProjectionSliceEngineDeps) {
    this.deps = {
      sourceFetchClient: deps.sourceFetchClient,
      registryRepository: deps.registryRepository,
      now: deps.now ?? (() => new Date().toISOString()),
    };
  }

  async recompute(request: IRecomputeRequest): Promise<IRecomputeOutcome> {
    const counts = zeroCounts();
    try {
      const numericChanged = parseNumericIds(request.changedItemIds);
      const numericDeleted = parseNumericIds(request.deletedItemIds);

      if (request.sourceListKind === 'Projects') {
        for (const id of numericChanged) {
          await this.recomputeProjectsChanged(id, request, counts);
        }
        for (const id of numericDeleted) {
          await this.recomputeProjectsDeleted(id, request, counts);
        }
      } else {
        for (const id of numericChanged) {
          await this.recomputeRegistryChanged(id, request, counts);
        }
        for (const id of numericDeleted) {
          await this.recomputeRegistryDeleted(id, request, counts);
        }
      }

      return { ok: true, counts: freezeCounts(counts) };
    } catch (error) {
      return {
        ok: false,
        failureCode: classifyFailure(error),
        sanitizedReason: sanitize(error),
        partialCounts: freezeCounts(counts),
      };
    }
  }

  private async recomputeProjectsChanged(
    projectsId: number,
    request: IRecomputeRequest,
    counts: IMutableCounts,
  ): Promise<void> {
    const project = await this.deps.sourceFetchClient.fetchProjectsRow(projectsId);
    if (project === null) {
      // Source row no longer exists — route to deletion path so a delta-event
      // followed by an immediate retrieval miss is handled the same way as a
      // tombstone.
      await this.recomputeProjectsDeleted(projectsId, request, counts);
      return;
    }

    const registryCounterparts = await this.resolveRegistryCounterpartsForProject(project);

    await this.applyProjectsSlice({
      project,
      registryCounterparts,
      priorActiveRowsLookup: () =>
        this.deps.registryRepository.findByProjectsListItemId(project.id),
      request,
      counts,
    });
  }

  private async recomputeProjectsDeleted(
    projectsId: number,
    request: IRecomputeRequest,
    counts: IMutableCounts,
  ): Promise<void> {
    const priorActiveRows = await this.deps.registryRepository.findByProjectsListItemId(projectsId);

    // Identify any Registry counterpart that might survive as legacy-only.
    const legacyRegistryIdsFromPrior = new Set<number>();
    for (const row of priorActiveRows) {
      if (row.legacyRegistryItemId != null) {
        legacyRegistryIdsFromPrior.add(row.legacyRegistryItemId);
      }
    }
    const counterpartsByExplicitMatch =
      await this.deps.sourceFetchClient.findRegistryRowsByMatchedProjectId(projectsId);
    for (const row of counterpartsByExplicitMatch) {
      legacyRegistryIdsFromPrior.add(row.id);
    }

    // Soft-deactivate every still-active helper row tied to the deleted Projects ID.
    for (const row of priorActiveRows) {
      if (!row.isActive) continue;
      await this.softDeactivate(row, 'project-source-deleted', request, counts);
    }

    // Recover surviving Registry counterparts as legacy-only.
    for (const legacyRegistryId of legacyRegistryIdsFromPrior) {
      const registry = await this.deps.sourceFetchClient.fetchRegistryRow(legacyRegistryId);
      if (registry === null) continue;
      await this.applyRegistrySlice({
        registry,
        projectsCounterpart: null,
        priorActiveRowsLookup: () =>
          this.deps.registryRepository.findByLegacyRegistryItemId(registry.id),
        request,
        counts,
      });
    }
  }

  private async recomputeRegistryChanged(
    registryId: number,
    request: IRecomputeRequest,
    counts: IMutableCounts,
  ): Promise<void> {
    const registry = await this.deps.sourceFetchClient.fetchRegistryRow(registryId);
    if (registry === null) {
      await this.recomputeRegistryDeleted(registryId, request, counts);
      return;
    }

    const projectsCounterpart = await this.resolveProjectsCounterpartForRegistry(registry);

    await this.applyRegistrySlice({
      registry,
      projectsCounterpart,
      priorActiveRowsLookup: () =>
        this.deps.registryRepository.findByLegacyRegistryItemId(registry.id),
      request,
      counts,
    });

    // If this row resolves to a Projects counterpart, the merged emission
    // comes from the Projects slice. Recompute the Projects slice so its
    // active row set reflects the (possibly new) Registry linkage.
    if (projectsCounterpart) {
      await this.applyProjectsSlice({
        project: projectsCounterpart,
        registryCounterparts: await this.resolveRegistryCounterpartsForProject(projectsCounterpart),
        priorActiveRowsLookup: () =>
          this.deps.registryRepository.findByProjectsListItemId(projectsCounterpart.id),
        request,
        counts,
      });
    }
  }

  private async recomputeRegistryDeleted(
    registryId: number,
    request: IRecomputeRequest,
    counts: IMutableCounts,
  ): Promise<void> {
    const priorActiveRows =
      await this.deps.registryRepository.findByLegacyRegistryItemId(registryId);

    // Track the Projects counterparts that may have been linked through these
    // helper rows so we can recompute the projects-side after deactivation.
    const projectsIdsFromPrior = new Set<number>();
    for (const row of priorActiveRows) {
      if (row.projectsListItemId != null) {
        projectsIdsFromPrior.add(row.projectsListItemId);
      }
    }

    for (const row of priorActiveRows) {
      if (!row.isActive) continue;
      await this.softDeactivate(row, 'registry-source-deleted', request, counts);
    }

    for (const projectsId of projectsIdsFromPrior) {
      const project = await this.deps.sourceFetchClient.fetchProjectsRow(projectsId);
      if (project === null) continue;
      await this.applyProjectsSlice({
        project,
        registryCounterparts: await this.resolveRegistryCounterpartsForProject(project),
        priorActiveRowsLookup: () =>
          this.deps.registryRepository.findByProjectsListItemId(project.id),
        request,
        counts,
      });
    }
  }

  private async resolveRegistryCounterpartsForProject(
    project: IProjectSourceRow,
  ): Promise<readonly ILegacyRegistrySourceRow[]> {
    const seen = new Map<number, ILegacyRegistrySourceRow>();
    const explicit = await this.deps.sourceFetchClient.findRegistryRowsByMatchedProjectId(
      project.id,
    );
    for (const row of explicit) seen.set(row.id, row);
    if (seen.size === 0) {
      const fallback = await this.deps.sourceFetchClient.findRegistryRowsByNumberYear(
        project.projectNumber,
        project.year,
      );
      if (fallback.length === 1) {
        const row = fallback[0];
        if (!seen.has(row.id)) seen.set(row.id, row);
      }
    }
    return [...seen.values()];
  }

  private async resolveProjectsCounterpartForRegistry(
    registry: ILegacyRegistrySourceRow,
  ): Promise<IProjectSourceRow | null> {
    if (registry.matchedProjectListItemId != null) {
      const explicit = await this.deps.sourceFetchClient.fetchProjectsRow(
        registry.matchedProjectListItemId,
      );
      if (explicit) return explicit;
    }
    const fallback = await this.deps.sourceFetchClient.findProjectsRowsByNumberYear(
      registry.projectNumber,
      registry.legacyYear,
    );
    return fallback.length === 1 ? fallback[0] : null;
  }

  private async applyProjectsSlice(args: {
    project: IProjectSourceRow;
    registryCounterparts: readonly ILegacyRegistrySourceRow[];
    priorActiveRowsLookup: () => Promise<readonly IMyProjectsRegistryExistingRow[]>;
    request: IRecomputeRequest;
    counts: IMutableCounts;
  }): Promise<void> {
    const { project, registryCounterparts, priorActiveRowsLookup, request, counts } = args;
    const priorRows = await priorActiveRowsLookup();

    // Build expected (upn → item) for this slice.
    const expectedByUpn = this.buildExpectedItemsForRows(
      [project],
      registryCounterparts,
      `projects:${project.id}`,
    );

    await this.upsertExpectedAndDeactivateMissing({
      expectedByUpn,
      priorRowsForSlice: priorRows,
      sliceRecordKey: `projects:${project.id}`,
      deactivationReason: 'assignment-removed',
      request,
      counts,
    });
  }

  private async applyRegistrySlice(args: {
    registry: ILegacyRegistrySourceRow;
    projectsCounterpart: IProjectSourceRow | null;
    priorActiveRowsLookup: () => Promise<readonly IMyProjectsRegistryExistingRow[]>;
    request: IRecomputeRequest;
    counts: IMutableCounts;
  }): Promise<void> {
    const { registry, projectsCounterpart, priorActiveRowsLookup, request, counts } = args;
    const priorRows = await priorActiveRowsLookup();

    let expectedRecordKey: string;
    let expectedByUpn: Map<string, MyProjectLinkItem>;

    if (projectsCounterpart) {
      // Merged: the emission comes from the Projects slice, not this slice.
      // The Registry-keyed helper rows (legacy:{id}) must be deactivated with
      // `merge-topology-changed`. We do NOT directly emit merged rows here —
      // that belongs to applyProjectsSlice which the caller invokes next.
      expectedRecordKey = `legacy:${registry.id}`;
      expectedByUpn = new Map();
    } else {
      expectedRecordKey = `legacy:${registry.id}`;
      expectedByUpn = this.buildExpectedItemsForRows([], [registry], expectedRecordKey);
    }

    await this.upsertExpectedAndDeactivateMissing({
      expectedByUpn,
      priorRowsForSlice: priorRows,
      sliceRecordKey: expectedRecordKey,
      deactivationReason: projectsCounterpart ? 'merge-topology-changed' : 'assignment-removed',
      request,
      counts,
    });
  }

  private buildExpectedItemsForRows(
    projects: readonly IProjectSourceRow[],
    registry: readonly ILegacyRegistrySourceRow[],
    forRecordKey: string,
  ): Map<string, MyProjectLinkItem> {
    const out = new Map<string, MyProjectLinkItem>();
    const upns = enumerateAssignedUpns(projects, registry);
    for (const rawUpn of upns) {
      const normalized = normalizeUpn(rawUpn);
      if (!normalized) continue;
      const items = reconcileProjectLinks(normalized, projects, registry, OK_SOURCE_STATUSES);
      for (const item of items) {
        if (item.recordKey === forRecordKey) {
          out.set(normalized, item);
        }
      }
    }
    return out;
  }

  private async upsertExpectedAndDeactivateMissing(args: {
    expectedByUpn: Map<string, MyProjectLinkItem>;
    priorRowsForSlice: readonly IMyProjectsRegistryExistingRow[];
    sliceRecordKey: string;
    deactivationReason: DeactivationReasonChoice;
    request: IRecomputeRequest;
    counts: IMutableCounts;
  }): Promise<void> {
    const {
      expectedByUpn,
      priorRowsForSlice,
      sliceRecordKey,
      deactivationReason,
      request,
      counts,
    } = args;
    const nowUtc = this.deps.now();

    const priorByUpn = new Map<string, IMyProjectsRegistryExistingRow>();
    for (const row of priorRowsForSlice) {
      // Only consider prior rows that match this slice's record key.
      if (row.recordKey !== sliceRecordKey) continue;
      const upn = normalizeUpn(row.userUpn);
      if (upn) priorByUpn.set(upn, row);
    }

    // Upsert expected
    for (const [upn, item] of expectedByUpn) {
      const projectionKey = computeProjectionKey(upn, item.recordKey);
      const contentHash = computeProjectionContentHash({ upn, recordKey: item.recordKey, item });

      const existing =
        priorByUpn.get(upn) ??
        (await this.deps.registryRepository.findByProjectionKey(projectionKey));

      const rowFields = mapItemToRegistryRow({
        projectionKey,
        userUpn: upn,
        recordKey: item.recordKey,
        item,
        contentHash,
        projectionBatchId: request.projectionBatchId,
        lastProjectedAtUtc: nowUtc,
      });

      if (!existing) {
        await this.deps.registryRepository.insertRow(rowFields);
        counts.helperRowsInserted += 1;
        continue;
      }

      if (!existing.isActive) {
        // Reactivate: clear deactivation fields, write business fields, stamp run.
        const reactivationPatch: IMyProjectsRegistryRowPatch = {
          ...rowFields,
          ...buildReactivationOperationalPatch({
            projectionBatchId: request.projectionBatchId,
            nowUtc,
          }),
        };
        await this.deps.registryRepository.patchRow(existing.listItemId, reactivationPatch);
        counts.helperRowsReactivated += 1;
        continue;
      }

      if (existing.projectionContentHash === contentHash) {
        // No-op suppression: nothing to write (Doc 06 §10).
        continue;
      }

      await this.deps.registryRepository.patchRow(existing.listItemId, rowFields);
      counts.helperRowsUpdated += 1;
    }

    // Deactivate prior active rows whose UPN is no longer in the expected set.
    for (const [upn, row] of priorByUpn) {
      if (!row.isActive) continue;
      if (expectedByUpn.has(upn)) continue;
      await this.softDeactivate(row, deactivationReason, request, counts);
    }
  }

  private async softDeactivate(
    row: IMyProjectsRegistryExistingRow,
    reason: DeactivationReasonChoice,
    request: IRecomputeRequest,
    counts: IMutableCounts,
  ): Promise<void> {
    if (!row.isActive) return;
    const nowUtc = this.deps.now();
    await this.deps.registryRepository.patchRow(
      row.listItemId,
      buildDeactivationPatch({
        reason,
        projectionBatchId: request.projectionBatchId,
        nowUtc,
      }),
    );
    counts.helperRowsDeactivated += 1;
  }
}

function parseNumericIds(ids: readonly string[]): readonly number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  for (const raw of ids) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || !Number.isInteger(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function classifyFailure(error: unknown): 'recompute-failed' | 'projection-write-failed' {
  const message = error instanceof Error ? error.message : String(error);
  if (/graph |sharepoint|insertRow|patchRow|fields/i.test(message)) {
    return 'projection-write-failed';
  }
  return 'recompute-failed';
}

export function createProjectionSliceEngine(
  deps: IProjectionSliceEngineDeps,
): IProjectionSliceRecomputeService {
  return new ProjectionSliceEngine(deps);
}
