import {
  MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS,
  normalizeUpn,
  type MyProjectLinkItem,
  type MyProjectLinksDiagnostics,
  type MyProjectLinksPrincipalUnresolvedReason,
  type MyProjectLinksReadModel,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelSourceStatus,
  type MyWorkReadModelWarning,
} from '@hbc/models/myWork';
import { PROJECTS_LIST_NAME } from '../../../../services/projects-list-contract.js';
import { resolveSpField } from '../../../../services/projects-list-mapper.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from '../../../../services/legacy-fallback/list-descriptors.js';
import { GraphListClient } from '../../../../services/legacy-fallback/graph-list-client.js';
import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import {
  classifyGraphErrorStage,
  sanitizeForTelemetry,
  type RegistryCacheTelemetryState,
  type MyProjectLinksLoaderStage,
} from './my-project-links-runtime-diagnostics.js';
import {
  buildRoleFieldObjectFromRow,
  buildSummary,
  readOptionalNumber,
  readOptionalUrl,
  reconcileProjectLinks,
  trimToString,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from './my-project-links-domain.js';

export {
  reconcileProjectLinks,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from './my-project-links-domain.js';

const MAX_SOURCE_ROWS = 25000;
const REGISTRY_SOURCE_CACHE_TTL_MS = 60_000;
type RegistryFilterMode = 'disabled-correctness-recovery';
type RegistryCacheState = RegistryCacheTelemetryState;

interface IRegistrySourceTelemetry {
  registryCacheState?: RegistryCacheState;
  registryCacheAgeMs?: number;
  registryServerFilterApplied?: boolean;
  registryFilterMode?: RegistryFilterMode;
}

type SourceFailure = 'projects-source-failed' | 'legacy-registry-source-failed';

interface ISourceLoadResult<T> {
  ok: boolean;
  rows: readonly T[];
  bounded: boolean;
  failure?: SourceFailure;
  /** Stage of the underlying GraphListClient throw, when ok is false. */
  failureStage?: MyProjectLinksLoaderStage;
  /** Sanitized error message (token/JWT-stripped), when ok is false. */
  failureMessage?: string;
  registryTelemetry?: IRegistrySourceTelemetry;
}

interface IProjectLinksSourceDeps {
  loadProjectsRows: () => Promise<ISourceLoadResult<IProjectSourceRow>>;
  loadRegistryRows: () => Promise<ISourceLoadResult<ILegacyRegistrySourceRow>>;
  now: () => string;
}

function selectEnvelopeStatus(
  projects: ISourceLoadResult<IProjectSourceRow>,
  registry: ISourceLoadResult<ILegacyRegistrySourceRow>,
): MyWorkReadModelSourceStatus {
  if (!projects.ok && !registry.ok) return 'source-unavailable';
  if (projects.bounded || registry.bounded) return 'partial';
  if (!projects.ok || !registry.ok) return 'partial';
  return 'available';
}

function sourceReadinessStatus(result: ISourceLoadResult<unknown>): MyWorkReadModelSourceStatus {
  if (!result.ok) return 'source-unavailable';
  if (result.bounded) return 'partial';
  return 'available';
}

function buildEnvelopeWarnings(
  status: MyWorkReadModelSourceStatus,
  projects: ISourceLoadResult<IProjectSourceRow>,
  registry: ISourceLoadResult<ILegacyRegistrySourceRow>,
): MyWorkReadModelWarning[] {
  if (status === 'source-unavailable') {
    return [{ code: 'source-unavailable' }];
  }
  if (status !== 'partial') return [];

  const warnings: MyWorkReadModelWarning[] = [{ code: 'partial-source-data' }];
  if (projects.bounded || registry.bounded) {
    warnings.push({ code: 'result-set-truncated' });
  }
  return warnings;
}

function classifyPrincipalUnresolvedReason(
  rawPrincipalName: unknown,
): MyProjectLinksPrincipalUnresolvedReason {
  // The provider only reaches this path when `normalizeUpn(...)` returned null.
  // Distinguish the two failure modes so operators can triage between
  // "claim was empty / whitespace" and "claim was present but not a valid UPN".
  if (typeof rawPrincipalName !== 'string') return 'missing-upn';
  const trimmed = rawPrincipalName.trim();
  return trimmed.length === 0 ? 'missing-upn' : 'invalid-upn-format';
}

/**
 * Derive the sanitized diagnostics blob from the same facts the envelope
 * assembly already consumes. Closed-set enums and numeric counts only —
 * never includes the actor's UPN, OID, or displayName.
 */
function selectDiagnostics(input: {
  readonly actorUpn: string | null;
  readonly rawPrincipalName: unknown;
  readonly projects: ISourceLoadResult<IProjectSourceRow>;
  readonly registry: ISourceLoadResult<ILegacyRegistrySourceRow>;
  readonly matchCount: number;
}): MyProjectLinksDiagnostics {
  if (input.actorUpn === null) {
    return {
      classification: 'principal-unresolved',
      principalResolution: 'unresolved',
      principalUnresolvedReason: classifyPrincipalUnresolvedReason(input.rawPrincipalName),
      matchCount: 0,
      projectsSourceStatus: 'principal-unresolved',
      legacyFallbackRegistrySourceStatus: 'principal-unresolved',
      projectionMode: 'legacy',
    };
  }

  const projectsSourceStatus = sourceReadinessStatus(input.projects);
  const legacyFallbackRegistrySourceStatus = sourceReadinessStatus(input.registry);
  const envelopeStatus = selectEnvelopeStatus(input.projects, input.registry);

  let classification: MyProjectLinksDiagnostics['classification'];
  if (envelopeStatus === 'source-unavailable') {
    classification = 'source-unavailable';
  } else if (envelopeStatus === 'partial') {
    classification = 'partial';
  } else if (input.matchCount === 0) {
    classification = 'zero-match-available-sources';
  } else {
    classification = 'available';
  }

  return {
    classification,
    principalResolution: 'resolved',
    matchCount: input.matchCount,
    projectsSourceStatus,
    legacyFallbackRegistrySourceStatus,
    projectionMode: 'legacy',
  };
}

function createDefaultSourceDeps(): IProjectLinksSourceDeps {
  const graph = new GraphListClient(getLegacyFallbackListHostSiteUrl());
  let cachedRegistryResult: ISourceLoadResult<ILegacyRegistrySourceRow> | null = null;
  let cachedRegistryAtMs: number | null = null;
  let inFlightRegistryLoad: Promise<ISourceLoadResult<ILegacyRegistrySourceRow>> | null = null;
  let lastRegistryCacheState: RegistryCacheState = 'miss';
  const markRegistryCacheState = (state: RegistryCacheState): void => {
    lastRegistryCacheState = state;
  };

  const projectSelectFields = [
    'Title',
    resolveSpField('projectNumber'),
    resolveSpField('projectName'),
    resolveSpField('year'),
    resolveSpField('projectStage'),
    resolveSpField('siteUrl'),
    resolveSpField('procoreProject'),
    resolveSpField('buildingConnectedUrl'),
    resolveSpField('documentCrunchUrl'),
    resolveSpField('leadEstimatorUpn'),
    resolveSpField('supportingEstimatorUpns'),
    resolveSpField('projectManagerUpn'),
    resolveSpField('projectExecutiveUpn'),
    ...MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((definition) => definition.internalField),
  ] as const;

  const registrySelectFields = [
    'ProjectNumber',
    'ProjectNameRaw',
    'LegacyYear',
    'FolderWebUrl',
    'MatchStatus',
    'MatchConfidence',
    'MatchMethod',
    'MatchedProjectListItemId',
    'IsActive',
    'procoreProject',
    'projectStage',
    'buildingConnectedUrl',
    'documentCrunchUrl',
    ...MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((definition) => definition.internalField),
  ] as const;

  return {
    now: () => new Date().toISOString(),
    async loadProjectsRows(): Promise<ISourceLoadResult<IProjectSourceRow>> {
      try {
        const rows = await graph.listItems(PROJECTS_LIST_NAME, {
          select: [...projectSelectFields],
          top: MAX_SOURCE_ROWS,
        });
        const mapped = rows
          .map((entry): IProjectSourceRow | null => {
            const row: Record<string, unknown> = { Id: Number(entry.id), ...entry.fields };
            const projectNumber = trimToString(row[resolveSpField('projectNumber')]);
            const projectName =
              trimToString(row[resolveSpField('projectName')]) || trimToString(row.Title);
            if (!projectNumber || !projectName) return null;

            return {
              id: Number(row.Id),
              projectNumber,
              projectName,
              year: readOptionalNumber(row[resolveSpField('year')]),
              projectStage: trimToString(row[resolveSpField('projectStage')]) || undefined,
              siteUrl: readOptionalUrl(row[resolveSpField('siteUrl')]),
              procoreProject: trimToString(row[resolveSpField('procoreProject')]) || undefined,
              buildingConnectedUrl:
                trimToString(row[resolveSpField('buildingConnectedUrl')]) || undefined,
              documentCrunchUrl:
                trimToString(row[resolveSpField('documentCrunchUrl')]) || undefined,
              roleArrays: buildRoleFieldObjectFromRow(row),
              legacyRoleFallbacks: {
                leadEstimatorUpn:
                  trimToString(row[resolveSpField('leadEstimatorUpn')]) || undefined,
                supportingEstimatorUpns: row[resolveSpField('supportingEstimatorUpns')],
                projectManagerUpn:
                  trimToString(row[resolveSpField('projectManagerUpn')]) || undefined,
                projectExecutiveUpn:
                  trimToString(row[resolveSpField('projectExecutiveUpn')]) || undefined,
              },
            };
          })
          .filter((row): row is IProjectSourceRow => row !== null);

        return {
          ok: true,
          rows: mapped,
          bounded: rows.length >= MAX_SOURCE_ROWS,
        };
      } catch (error) {
        return {
          ok: false,
          rows: [],
          bounded: false,
          failure: 'projects-source-failed',
          failureStage: classifyGraphErrorStage(error),
          failureMessage: sanitizeForTelemetry(error),
        };
      }
    },

    async loadRegistryRows(): Promise<ISourceLoadResult<ILegacyRegistrySourceRow>> {
      const nowMs = Date.now();
      if (
        cachedRegistryResult &&
        cachedRegistryAtMs !== null &&
        nowMs - cachedRegistryAtMs < REGISTRY_SOURCE_CACHE_TTL_MS
      ) {
        markRegistryCacheState('hit');
        return {
          ...cachedRegistryResult,
          registryTelemetry: {
            registryCacheState: 'hit',
            registryCacheAgeMs: Math.max(0, nowMs - cachedRegistryAtMs),
            registryServerFilterApplied: false,
            registryFilterMode: 'disabled-correctness-recovery',
          },
        };
      }

      if (inFlightRegistryLoad) {
        markRegistryCacheState('coalesced');
        const result = await inFlightRegistryLoad;
        return {
          ...result,
          registryTelemetry: {
            ...(result.registryTelemetry ?? {}),
            registryCacheState: 'coalesced',
            registryServerFilterApplied: false,
            registryFilterMode: 'disabled-correctness-recovery',
          },
        };
      }
      markRegistryCacheState('miss');

      const loadPromise = (async (): Promise<ISourceLoadResult<ILegacyRegistrySourceRow>> => {
        try {
          const rows = await graph.listItems(LEGACY_FALLBACK_REGISTRY_LIST_TITLE, {
            select: [...registrySelectFields],
            top: MAX_SOURCE_ROWS,
          });

          const mapped = rows.map((entry): ILegacyRegistrySourceRow => {
            const row: Record<string, unknown> = { Id: Number(entry.id), ...entry.fields };
            return {
              id: Number(row.Id),
              projectNumber: trimToString(row.ProjectNumber),
              projectNameRaw: trimToString(row.ProjectNameRaw),
              legacyYear: readOptionalNumber(row.LegacyYear),
              isActive: row.IsActive === true || row.IsActive === 1 || row.IsActive === '1',
              folderWebUrl: readOptionalUrl(row.FolderWebUrl),
              matchStatus: trimToString(row.MatchStatus),
              matchConfidence: trimToString(row.MatchConfidence) || undefined,
              matchMethod: trimToString(row.MatchMethod) || undefined,
              matchedProjectListItemId: readOptionalNumber(row.MatchedProjectListItemId),
              procoreProject: trimToString(row.procoreProject) || undefined,
              projectStage: trimToString(row.projectStage) || undefined,
              buildingConnectedUrl: trimToString(row.buildingConnectedUrl) || undefined,
              documentCrunchUrl: trimToString(row.documentCrunchUrl) || undefined,
              roleArrays: buildRoleFieldObjectFromRow(row),
            };
          });

          const result: ISourceLoadResult<ILegacyRegistrySourceRow> = {
            ok: true,
            rows: mapped,
            bounded: rows.length >= MAX_SOURCE_ROWS,
            registryTelemetry: {
              registryCacheState: lastRegistryCacheState,
              registryCacheAgeMs: 0,
              registryServerFilterApplied: false,
              registryFilterMode: 'disabled-correctness-recovery',
            },
          };
          cachedRegistryResult = result;
          cachedRegistryAtMs = Date.now();
          return result;
        } catch (error) {
          return {
            ok: false,
            rows: [],
            bounded: false,
            failure: 'legacy-registry-source-failed',
            failureStage: classifyGraphErrorStage(error),
            failureMessage: sanitizeForTelemetry(error),
            registryTelemetry: {
              registryCacheState: lastRegistryCacheState,
              registryServerFilterApplied: false,
              registryFilterMode: 'disabled-correctness-recovery',
            },
          };
        } finally {
          inFlightRegistryLoad = null;
        }
      })();

      inFlightRegistryLoad = loadPromise;
      return loadPromise;
    },
  };
}

export class MyProjectLinksReadModelProvider {
  constructor(private readonly deps: IProjectLinksSourceDeps = createDefaultSourceDeps()) {}

  async getMyProjectLinks(
    context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>> {
    const actorUpn = normalizeUpn(context.actor.principalName);

    if (!actorUpn) {
      const unresolvedSentinel: ISourceLoadResult<never> = { ok: true, rows: [], bounded: false };
      return {
        mode: 'backend',
        sourceStatus: 'principal-unresolved',
        readOnly: true,
        warnings: [{ code: 'principal-unresolved' }],
        generatedAtUtc: this.deps.now(),
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
          diagnostics: selectDiagnostics({
            actorUpn: null,
            rawPrincipalName: context.actor.principalName,
            projects: unresolvedSentinel as ISourceLoadResult<IProjectSourceRow>,
            registry: unresolvedSentinel as ISourceLoadResult<ILegacyRegistrySourceRow>,
            matchCount: 0,
          }),
        },
      };
    }

    const projectsStart = Date.now();
    let projectsDurationMs = 0;
    const registryStart = Date.now();
    let registryDurationMs = 0;
    const [projects, registry] = await Promise.all([
      this.deps.loadProjectsRows().finally(() => {
        projectsDurationMs = Date.now() - projectsStart;
      }),
      this.deps.loadRegistryRows().finally(() => {
        registryDurationMs = Date.now() - registryStart;
      }),
    ]);

    if (context.projectLinksDiagnostics) {
      context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent(
        'myProjectLinks.read.sources.result',
        {
          projectsDurationMs,
          registryDurationMs,
          projectsStatus: sourceReadinessStatus(projects),
          registryStatus: sourceReadinessStatus(registry),
          projectsRowCount: projects.ok ? projects.rows.length : 0,
          registryRowCount: registry.ok ? registry.rows.length : 0,
          projectsBounded: projects.ok ? projects.bounded : false,
          registryBounded: registry.ok ? registry.bounded : false,
          ...(registry.registryTelemetry?.registryCacheState
            ? { registryCacheState: registry.registryTelemetry.registryCacheState }
            : {}),
          ...(registry.registryTelemetry?.registryCacheAgeMs !== undefined
            ? { registryCacheAgeMs: registry.registryTelemetry.registryCacheAgeMs }
            : {}),
          ...(registry.registryTelemetry?.registryServerFilterApplied !== undefined
            ? {
                registryServerFilterApplied: registry.registryTelemetry.registryServerFilterApplied,
              }
            : {}),
          ...(registry.registryTelemetry?.registryFilterMode
            ? { registryFilterMode: registry.registryTelemetry.registryFilterMode }
            : {}),
        },
      );
    }

    // Tier-1 telemetry: when either source loader caught a GraphListClient
    // throw, name the failing stage on a customEvent so an operator can
    // discriminate token vs site vs list vs items from the next hosted
    // reproduction without redeploying a richer Graph diagnostic.
    if (context.projectLinksDiagnostics) {
      if (!projects.ok) {
        context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent('projects-loader.failed', {
          listName: PROJECTS_LIST_NAME,
          stage: projects.failureStage ?? 'other',
          ...(projects.failureMessage ? { sanitizedMessage: projects.failureMessage } : {}),
        });
      }
      if (!registry.ok) {
        context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent('registry-loader.failed', {
          listName: LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
          stage: registry.failureStage ?? 'other',
          ...(registry.failureMessage ? { sanitizedMessage: registry.failureMessage } : {}),
        });
      }
    }

    const sourceStatus = selectEnvelopeStatus(projects, registry);
    const warnings = buildEnvelopeWarnings(sourceStatus, projects, registry);
    const reconcileStart = Date.now();
    const items = reconcileProjectLinks(actorUpn, projects.rows, registry.rows, {
      projects,
      registry,
    });
    const reconcileDurationMs = Date.now() - reconcileStart;
    const summary = buildSummary(items);

    if (context.projectLinksDiagnostics) {
      context.projectLinksDiagnostics.trackMyProjectLinksRuntimeEvent(
        'myProjectLinks.read.reconcile.result',
        {
          durationMs: reconcileDurationMs,
          matchedItemCount: items.length,
          sourceStatus,
          assignedProjectCount: summary.assignedProjectCount,
          dualLaunchReadyCount: summary.dualLaunchReadyCount,
          sharePointReadyCount: summary.sharePointReadyCount,
          procoreReadyCount: summary.procoreReadyCount,
        },
      );
    }

    return {
      mode: 'backend',
      sourceStatus,
      readOnly: true,
      warnings,
      generatedAtUtc: this.deps.now(),
      data: {
        moduleId: 'my-project-links',
        actor: {
          principalName: actorUpn,
          ...(context.actor.displayName ? { displayName: context.actor.displayName } : {}),
        },
        summary,
        items,
        sourceReadiness: {
          projects: sourceReadinessStatus(projects),
          legacyFallbackRegistry: sourceReadinessStatus(registry),
        },
        diagnostics: selectDiagnostics({
          actorUpn,
          rawPrincipalName: context.actor.principalName,
          projects,
          registry,
          matchCount: items.length,
        }),
      },
    };
  }
}
