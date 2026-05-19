/**
 * Projection-backed My Projects read provider.
 *
 * Reads the `My Projects Registry` helper list by `UserUpn + IsActive=true`,
 * reverse-maps each row into a `MyProjectLinkItem`, and assembles the same
 * `MyProjectLinksReadModel` envelope shape the legacy aggregation provider
 * returns. Selected by `config.enablement.readMode === 'projection'` at
 * resolver composition time; the route handler is unchanged.
 *
 * Locked decisions (Doc 07 §9 / Prompt 09):
 *   - No automatic request-time fallback. Helper-list read failure surfaces
 *     `sourceStatus = 'source-unavailable'` with empty items. Operator
 *     rollback is a config change, not a per-request fallback.
 *   - Public envelope shape unchanged. SPFx contract preserved.
 *   - `MyProjectLinksDiagnostics` adds optional `projectionMode`,
 *     `projectionMaxLastProjectedAtUtc`, `projectionBatchId` so operators
 *     can confirm read mode + freshness without server-side access.
 */

import {
  normalizeUpn,
  type MyProjectLinkItem,
  type MyProjectLinksDiagnostics,
  type MyProjectLinksReadModel,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelSourceStatus,
  type MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import { buildSummary, sortItems } from './my-project-links-domain.js';
import {
  classifyGraphErrorStage,
  sanitizeForTelemetry,
} from './my-project-links-runtime-diagnostics.js';
import type { IMyProjectsRegistryRepository } from '../../../../services/my-projects-projection/registry/my-projects-registry-repository.js';
import {
  mapRegistryRowToProjectLinkItem,
  type IMyProjectsRegistryReadRow,
} from '../../../../services/my-projects-projection/registry/my-projects-registry-row-mapper.js';
import type { MyProjectLinksPrincipalUnresolvedReason } from '@hbc/models/myWork';
import { SOURCE_LIST_KINDS, type SourceListKind } from '../../../../services/my-projects-projection/projection-types.js';
import type { IProjectionDeltaStateEntity } from '../../../../services/my-projects-projection/projection-state-entities.js';

export interface IProjectionMyProjectLinksReadModelProviderDeps {
  readonly registryRepository: IMyProjectsRegistryRepository;
  readonly sourceSyncStateRepository?: {
    get(sourceListKind: SourceListKind): Promise<IProjectionDeltaStateEntity | null>;
  };
  readonly now?: () => string;
}

function classifyPrincipalUnresolvedReason(
  rawPrincipalName: unknown,
): MyProjectLinksPrincipalUnresolvedReason {
  if (typeof rawPrincipalName !== 'string') return 'missing-upn';
  const trimmed = rawPrincipalName.trim();
  return trimmed.length === 0 ? 'missing-upn' : 'invalid-upn-format';
}

function pickMaxIsoString(values: readonly string[]): string | undefined {
  let best: string | undefined;
  for (const value of values) {
    if (!value) continue;
    if (best === undefined || value > best) best = value;
  }
  return best;
}

export class ProjectionMyProjectLinksReadModelProvider {
  private readonly registryRepository: IMyProjectsRegistryRepository;
  private readonly sourceSyncStateRepository?: IProjectionMyProjectLinksReadModelProviderDeps['sourceSyncStateRepository'];
  private readonly now: () => string;

  constructor(deps: IProjectionMyProjectLinksReadModelProviderDeps) {
    this.registryRepository = deps.registryRepository;
    this.sourceSyncStateRepository = deps.sourceSyncStateRepository;
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  private async resolveProjectionSourceSyncHealth():
    Promise<'healthy' | 'needs-resync' | 'uninitialized' | 'unknown' | undefined> {
    if (!this.sourceSyncStateRepository) return undefined;
    try {
      const states = await Promise.all(
        SOURCE_LIST_KINDS.map((sourceListKind) => this.sourceSyncStateRepository!.get(sourceListKind)),
      );
      if (states.some((state) => state === null)) return 'uninitialized';
      if (states.some((state) => state?.NeedsResync === true)) return 'needs-resync';
      return 'healthy';
    } catch {
      return 'unknown';
    }
  }

  async getMyProjectLinks(
    context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>> {
    const actorUpn = normalizeUpn(context.actor.principalName);
    if (!actorUpn) {
      const diagnostics: MyProjectLinksDiagnostics = {
        classification: 'principal-unresolved',
        principalResolution: 'unresolved',
        principalUnresolvedReason: classifyPrincipalUnresolvedReason(context.actor.principalName),
        matchCount: 0,
        projectsSourceStatus: 'principal-unresolved',
        legacyFallbackRegistrySourceStatus: 'principal-unresolved',
        projectionMode: 'projection',
      };
      return {
        mode: 'backend',
        sourceStatus: 'principal-unresolved',
        readOnly: true,
        warnings: [{ code: 'principal-unresolved' }],
        generatedAtUtc: this.now(),
        data: {
          moduleId: 'my-project-links',
          actor: {
            principalName: context.actor.principalName,
            ...(context.actor.displayName ? { displayName: context.actor.displayName } : {}),
          },
          summary: buildSummary([]),
          items: [],
          sourceReadiness: {
            projects: 'principal-unresolved',
            legacyFallbackRegistry: 'principal-unresolved',
          },
          diagnostics,
        },
      };
    }

    const loadStart = Date.now();
    let rows: readonly IMyProjectsRegistryReadRow[] = [];
    let loadOk = true;
    let failureStage: ReturnType<typeof classifyGraphErrorStage> | undefined;
    let sanitizedMessage: string | undefined;
    try {
      rows = await this.registryRepository.findActiveByUserUpn(actorUpn);
    } catch (error) {
      loadOk = false;
      failureStage = classifyGraphErrorStage(error);
      sanitizedMessage = sanitizeForTelemetry(error);
    }
    const loadDurationMs = Date.now() - loadStart;

    if (!loadOk) {
      if (context.projectLinksDiagnostics) {
        context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent(
          'myProjectLinks.read.projection.failed',
          {
            stage: failureStage ?? 'other',
            ...(sanitizedMessage ? { sanitizedMessage } : {}),
          },
        );
      }
      const diagnostics: MyProjectLinksDiagnostics = {
        classification: 'source-unavailable',
        principalResolution: 'resolved',
        matchCount: 0,
        projectsSourceStatus: 'source-unavailable',
        legacyFallbackRegistrySourceStatus: 'source-unavailable',
        projectionMode: 'projection',
      };
      const warnings: MyWorkReadModelWarning[] = [{ code: 'source-unavailable' }];
      return {
        mode: 'backend',
        sourceStatus: 'source-unavailable',
        readOnly: true,
        warnings,
        generatedAtUtc: this.now(),
        data: {
          moduleId: 'my-project-links',
          actor: {
            principalName: actorUpn,
            ...(context.actor.displayName ? { displayName: context.actor.displayName } : {}),
          },
          summary: buildSummary([]),
          items: [],
          sourceReadiness: {
            projects: 'source-unavailable',
            legacyFallbackRegistry: 'source-unavailable',
          },
          diagnostics,
        },
      };
    }

    const items: MyProjectLinkItem[] = rows.map((row) => mapRegistryRowToProjectLinkItem(row));
    const sortedItems = sortItems(items);
    const summary = buildSummary(sortedItems);
    const sourceStatus: MyWorkReadModelSourceStatus = 'available';

    const maxLastProjectedAtUtc = pickMaxIsoString(rows.map((r) => r.lastProjectedAtUtc));
    const projectionBatchId = pickMaxIsoString(rows.map((r) => r.projectionBatchId));

    if (context.projectLinksDiagnostics) {
      context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent(
        'myProjectLinks.read.projection.load.result',
        {
          durationMs: loadDurationMs,
          projectionRowCount: rows.length,
          matchedItemCount: sortedItems.length,
          sourceStatus,
          assignedProjectCount: summary.assignedProjectCount,
          dualLaunchReadyCount: summary.dualLaunchReadyCount,
          sharePointReadyCount: summary.sharePointReadyCount,
          procoreReadyCount: summary.procoreReadyCount,
          ...(maxLastProjectedAtUtc
            ? { projectionMaxLastProjectedAtUtc: maxLastProjectedAtUtc }
            : {}),
          ...(projectionBatchId ? { projectionBatchId } : {}),
        },
      );
    }

    const projectionSourceSyncHealth = await this.resolveProjectionSourceSyncHealth();
    const diagnostics: MyProjectLinksDiagnostics = {
      classification: sortedItems.length === 0 ? 'zero-match-available-sources' : 'available',
      principalResolution: 'resolved',
      matchCount: sortedItems.length,
      projectsSourceStatus: 'available',
      legacyFallbackRegistrySourceStatus: 'available',
      projectionMode: 'projection',
      ...(maxLastProjectedAtUtc ? { projectionMaxLastProjectedAtUtc: maxLastProjectedAtUtc } : {}),
      ...(projectionBatchId ? { projectionBatchId } : {}),
      ...(projectionSourceSyncHealth ? { projectionSourceSyncHealth } : {}),
    };

    return {
      mode: 'backend',
      sourceStatus,
      readOnly: true,
      warnings: [],
      generatedAtUtc: this.now(),
      data: {
        moduleId: 'my-project-links',
        actor: {
          principalName: actorUpn,
          ...(context.actor.displayName ? { displayName: context.actor.displayName } : {}),
        },
        summary,
        items: sortedItems,
        sourceReadiness: {
          projects: 'available',
          legacyFallbackRegistry: 'available',
        },
        diagnostics,
      },
    };
  }
}
