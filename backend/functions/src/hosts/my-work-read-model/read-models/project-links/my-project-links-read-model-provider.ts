import {
  MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS,
  normalizeUpn,
  parseUpnArrayStorage,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
  type MyProjectLinkWarning,
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
  type MyProjectLinksLoaderStage,
} from './my-project-links-runtime-diagnostics.js';

const MAX_SOURCE_ROWS = 25000;
const PROCORE_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

interface IProjectSourceRow {
  id: number;
  projectNumber: string;
  projectName: string;
  year: number | null;
  projectStage?: string;
  siteUrl?: string;
  procoreProject?: string;
  roleArrays: Partial<Record<string, unknown>>;
  legacyRoleFallbacks: {
    leadEstimatorUpn?: string;
    supportingEstimatorUpns?: unknown;
    projectManagerUpn?: string;
    projectExecutiveUpn?: string;
  };
}

interface ILegacyRegistrySourceRow {
  id: number;
  projectNumber: string;
  projectNameRaw: string;
  legacyYear: number | null;
  isActive: boolean;
  folderWebUrl?: string;
  matchStatus: string;
  matchConfidence?: string;
  matchMethod?: string;
  matchedProjectListItemId: number | null;
  procoreProject?: string;
  roleArrays: Partial<Record<string, unknown>>;
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
}

interface IProjectLinksSourceDeps {
  loadProjectsRows: () => Promise<ISourceLoadResult<IProjectSourceRow>>;
  loadRegistryRows: () => Promise<ISourceLoadResult<ILegacyRegistrySourceRow>>;
  now: () => string;
}

interface IAvailabilityKey {
  sp: number;
  procore: number;
}

function trimToString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readOptionalUrl(value: unknown): string | undefined {
  const trimmed = trimToString(value);
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

function readOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseAssignmentRolesFromProjects(
  row: IProjectSourceRow,
  actorUpn: string,
): {
  roles: readonly MyProjectAssignmentRoleId[];
  usedLegacyFallback: boolean;
} {
  const roleSet = new Set<MyProjectAssignmentRoleId>();
  let usedLegacyFallback = false;

  const legacyFallbackByCanonicalField: Record<string, unknown> = {
    leadEstimatorUpns: row.legacyRoleFallbacks.leadEstimatorUpn,
    estimatorUpns: row.legacyRoleFallbacks.supportingEstimatorUpns,
    projectManagerUpns: row.legacyRoleFallbacks.projectManagerUpn,
    projectExecutiveUpns: row.legacyRoleFallbacks.projectExecutiveUpn,
  };

  for (const definition of MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS) {
    const canonical = parseUpnArrayStorage(row.roleArrays[definition.internalField]);
    let candidates = canonical;
    if (
      candidates.length === 0 &&
      legacyFallbackByCanonicalField[definition.internalField] !== undefined
    ) {
      candidates = parseUpnArrayStorage(legacyFallbackByCanonicalField[definition.internalField]);
      if (candidates.length > 0) {
        usedLegacyFallback = true;
      }
    }
    if (candidates.includes(actorUpn)) {
      roleSet.add(definition.roleId);
    }
  }

  const roles = [...roleSet].sort((a, b) => {
    const left =
      MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.find((item) => item.roleId === a)?.priority ?? 0;
    const right =
      MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.find((item) => item.roleId === b)?.priority ?? 0;
    return left - right;
  });

  return { roles, usedLegacyFallback };
}

function parseAssignmentRolesFromRegistry(
  row: ILegacyRegistrySourceRow,
  actorUpn: string,
): readonly MyProjectAssignmentRoleId[] {
  const roleSet = new Set<MyProjectAssignmentRoleId>();

  for (const definition of MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS) {
    const candidates = parseUpnArrayStorage(row.roleArrays[definition.internalField]);
    if (candidates.includes(actorUpn)) {
      roleSet.add(definition.roleId);
    }
  }

  return [...roleSet].sort((a, b) => {
    const left =
      MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.find((item) => item.roleId === a)?.priority ?? 0;
    const right =
      MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.find((item) => item.roleId === b)?.priority ?? 0;
    return left - right;
  });
}

function isProcoreTokenValid(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/\s/.test(trimmed)) return false;
  return PROCORE_TOKEN_PATTERN.test(trimmed);
}

function buildProcoreAction(token: string | undefined): {
  action: MyProjectLinkItem['procoreAction'];
  warnings: MyProjectLinkWarning[];
} {
  const warnings: MyProjectLinkWarning[] = [];
  const trimmed = token?.trim();

  if (!trimmed) {
    warnings.push({ code: 'procore-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'Procore unavailable',
      },
      warnings,
    };
  }

  if (!isProcoreTokenValid(trimmed)) {
    warnings.push({ code: 'procore-project-invalid' });
    warnings.push({ code: 'procore-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'Procore unavailable',
        procoreProject: trimmed,
      },
      warnings,
    };
  }

  return {
    action: {
      state: 'available',
      label: 'Open Procore',
      procoreProject: trimmed,
      href: `https://app.procore.com/${encodeURIComponent(trimmed)}/project/home`,
    },
    warnings,
  };
}

function buildProjectsOnlySharePointAction(siteUrl: string | undefined): {
  action: MyProjectLinkItem['sharePointAction'];
  warnings: MyProjectLinkWarning[];
} {
  if (siteUrl) {
    return {
      action: {
        state: 'available',
        kind: 'project-site',
        label: 'Open SharePoint Site',
        href: siteUrl,
      },
      warnings: [],
    };
  }
  return {
    action: {
      state: 'unavailable',
      kind: 'none',
      label: 'SharePoint unavailable',
    },
    warnings: [{ code: 'sharepoint-launch-unavailable' }],
  };
}

function buildMergedSharePointAction(
  siteUrl: string | undefined,
  folderUrl: string | undefined,
): {
  action: MyProjectLinkItem['sharePointAction'];
  warnings: MyProjectLinkWarning[];
} {
  if (siteUrl) {
    return {
      action: {
        state: 'available',
        kind: 'project-site',
        label: 'Open SharePoint Site',
        href: siteUrl,
      },
      warnings: [],
    };
  }
  if (folderUrl) {
    return {
      action: {
        state: 'available',
        kind: 'legacy-folder',
        label: 'Open SharePoint Folder',
        href: folderUrl,
      },
      warnings: [],
    };
  }

  return {
    action: {
      state: 'unavailable',
      kind: 'none',
      label: 'SharePoint unavailable',
    },
    warnings: [{ code: 'sharepoint-launch-unavailable' }],
  };
}

function buildLegacyOnlySharePointAction(folderUrl: string | undefined): {
  action: MyProjectLinkItem['sharePointAction'];
  warnings: MyProjectLinkWarning[];
} {
  if (folderUrl) {
    return {
      action: {
        state: 'available',
        kind: 'legacy-folder',
        label: 'Open SharePoint Folder',
        href: folderUrl,
      },
      warnings: [],
    };
  }

  return {
    action: {
      state: 'unavailable',
      kind: 'none',
      label: 'SharePoint unavailable',
    },
    warnings: [{ code: 'sharepoint-launch-unavailable' }],
  };
}

function mergeWarnings(...groups: readonly MyProjectLinkWarning[][]): MyProjectLinkWarning[] {
  const seen = new Set<string>();
  const merged: MyProjectLinkWarning[] = [];
  for (const group of groups) {
    for (const warning of group) {
      const key = `${warning.code}:${warning.message ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(warning);
    }
  }
  return merged;
}

function availabilityKey(item: MyProjectLinkItem): IAvailabilityKey {
  const sp = item.sharePointAction.state === 'available' ? 1 : 0;
  const procore = item.procoreAction.state === 'available' ? 1 : 0;
  return { sp, procore };
}

function compareAvailability(left: MyProjectLinkItem, right: MyProjectLinkItem): number {
  const a = availabilityKey(left);
  const b = availabilityKey(right);

  const rank = (value: IAvailabilityKey): number => {
    if (value.sp === 1 && value.procore === 1) return 0;
    if (value.sp === 1 && value.procore === 0) return 1;
    if (value.sp === 0 && value.procore === 1) return 2;
    return 3;
  };

  return rank(a) - rank(b);
}

function sortItems(items: MyProjectLinkItem[]): MyProjectLinkItem[] {
  return items.sort((left, right) => {
    const availability = compareAvailability(left, right);
    if (availability !== 0) return availability;

    const name = left.projectName.localeCompare(right.projectName);
    if (name !== 0) return name;

    const number = left.projectNumber.localeCompare(right.projectNumber);
    if (number !== 0) return number;

    return left.recordKey.localeCompare(right.recordKey);
  });
}

function buildSummary(items: readonly MyProjectLinkItem[]): MyProjectLinksReadModel['summary'] {
  const sharePointReadyCount = items.filter(
    (item) => item.sharePointAction.state === 'available',
  ).length;
  const procoreReadyCount = items.filter((item) => item.procoreAction.state === 'available').length;

  return {
    assignedProjectCount: items.length,
    dualLaunchReadyCount: items.filter(
      (item) =>
        item.sharePointAction.state === 'available' && item.procoreAction.state === 'available',
    ).length,
    sharePointReadyCount,
    procoreReadyCount,
    noSharePointLaunchCount: items.length - sharePointReadyCount,
    noProcoreLaunchCount: items.length - procoreReadyCount,
    projectsOnlyCount: items.filter((item) => item.source === 'projects-only').length,
    mergedCount: items.filter((item) => item.source === 'merged').length,
    legacyOnlyCount: items.filter((item) => item.source === 'legacy-only').length,
  };
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

function buildRoleFieldObjectFromRow(
  row: Record<string, unknown>,
): Partial<Record<string, unknown>> {
  const output: Partial<Record<string, unknown>> = {};
  for (const definition of MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS) {
    output[definition.internalField] = row[definition.internalField];
  }
  return output;
}

function projectYearKey(projectNumber: string, year: number | null): string {
  return `${projectNumber.trim()}::${year == null ? '' : String(year)}`;
}

export function reconcileProjectLinks(
  actorUpn: string,
  projects: readonly IProjectSourceRow[],
  registryRows: readonly ILegacyRegistrySourceRow[],
  sourceStatuses: {
    projects: ISourceLoadResult<IProjectSourceRow>;
    registry: ISourceLoadResult<ILegacyRegistrySourceRow>;
  },
): readonly MyProjectLinkItem[] {
  const projectById = new Map<number, IProjectSourceRow>();
  const projectByNumberYear = new Map<string, IProjectSourceRow[]>();

  for (const project of projects) {
    projectById.set(project.id, project);
    const key = projectYearKey(project.projectNumber, project.year);
    const list = projectByNumberYear.get(key) ?? [];
    list.push(project);
    projectByNumberYear.set(key, list);
  }

  const registryByProjectId = new Map<number, ILegacyRegistrySourceRow>();
  const registryConsumed = new Set<number>();

  for (const registry of registryRows) {
    if (registry.matchedProjectListItemId != null) {
      const project = projectById.get(registry.matchedProjectListItemId);
      if (project && !registryByProjectId.has(project.id)) {
        registryByProjectId.set(project.id, registry);
        registryConsumed.add(registry.id);
      }
    }
  }

  for (const registry of registryRows) {
    if (registryConsumed.has(registry.id)) continue;
    const key = projectYearKey(registry.projectNumber, registry.legacyYear);
    const candidates = projectByNumberYear.get(key) ?? [];
    if (candidates.length === 1) {
      const project = candidates[0];
      if (!registryByProjectId.has(project.id)) {
        registryByProjectId.set(project.id, registry);
        registryConsumed.add(registry.id);
      }
    }
  }

  const items: MyProjectLinkItem[] = [];

  for (const project of projects) {
    const parsed = parseAssignmentRolesFromProjects(project, actorUpn);
    if (parsed.roles.length === 0) continue;

    const mergedRegistry = registryByProjectId.get(project.id);
    const source: MyProjectLinkItem['source'] = mergedRegistry ? 'merged' : 'projects-only';

    const sharePoint = mergedRegistry
      ? buildMergedSharePointAction(project.siteUrl, mergedRegistry.folderWebUrl)
      : buildProjectsOnlySharePointAction(project.siteUrl);

    const procore = buildProcoreAction(project.procoreProject);

    const itemWarnings: MyProjectLinkWarning[] = [];
    if (parsed.usedLegacyFallback) {
      itemWarnings.push({ code: 'schema-transition-legacy-role-fallback-used' });
    }
    if (sourceStatuses.projects.bounded || sourceStatuses.registry.bounded) {
      itemWarnings.push({ code: 'assignment-source-bounded' });
    }
    if (!sourceStatuses.projects.ok || sourceStatuses.projects.bounded) {
      itemWarnings.push({ code: 'projects-source-partial' });
    }
    if (!sourceStatuses.registry.ok || sourceStatuses.registry.bounded) {
      itemWarnings.push({ code: 'legacy-registry-source-partial' });
    }
    if (mergedRegistry) {
      itemWarnings.push({ code: 'legacy-role-data-preserved' });
    }

    items.push({
      recordKey: `projects:${project.id}`,
      source,
      projectName: project.projectName,
      projectNumber: project.projectNumber,
      ...(project.projectStage ? { projectStage: project.projectStage } : {}),
      assignmentRoles: parsed.roles,
      sharePointAction: sharePoint.action,
      procoreAction: procore.action,
      provenance: {
        projectsListItemId: project.id,
        ...(mergedRegistry ? { legacyRegistryItemId: mergedRegistry.id } : {}),
        ...(mergedRegistry && mergedRegistry.matchedProjectListItemId != null
          ? { legacyMatchedProjectListItemId: mergedRegistry.matchedProjectListItemId }
          : {}),
        ...(mergedRegistry?.matchMethod ? { fallbackMatchMethod: mergedRegistry.matchMethod } : {}),
        ...(mergedRegistry?.matchConfidence
          ? { fallbackMatchConfidence: mergedRegistry.matchConfidence }
          : {}),
      },
      warnings: mergeWarnings(itemWarnings, sharePoint.warnings, procore.warnings),
    });
  }

  const registryIncludedStatus = new Set(['matched', 'unmatched', 'review-required']);

  for (const registry of registryRows) {
    if (registryConsumed.has(registry.id)) continue;
    if (!registry.isActive) continue;
    const normalizedStatus = registry.matchStatus.trim().toLowerCase();
    if (!registryIncludedStatus.has(normalizedStatus)) {
      continue;
    }

    const roles = parseAssignmentRolesFromRegistry(registry, actorUpn);
    if (roles.length === 0) continue;

    const sharePoint = buildLegacyOnlySharePointAction(registry.folderWebUrl);
    const procore = buildProcoreAction(registry.procoreProject);
    const itemWarnings: MyProjectLinkWarning[] = [{ code: 'legacy-role-data-preserved' }];
    if (sourceStatuses.projects.bounded || sourceStatuses.registry.bounded) {
      itemWarnings.push({ code: 'assignment-source-bounded' });
    }
    if (!sourceStatuses.registry.ok || sourceStatuses.registry.bounded) {
      itemWarnings.push({ code: 'legacy-registry-source-partial' });
    }
    if (normalizedStatus !== 'matched') {
      itemWarnings.push({ code: 'legacy-match-state-excluded' });
    }

    items.push({
      recordKey: `legacy:${registry.id}`,
      source: 'legacy-only',
      projectName: registry.projectNameRaw || registry.projectNumber,
      projectNumber: registry.projectNumber,
      assignmentRoles: roles,
      sharePointAction: sharePoint.action,
      procoreAction: procore.action,
      provenance: {
        legacyRegistryItemId: registry.id,
        ...(registry.matchedProjectListItemId != null
          ? { legacyMatchedProjectListItemId: registry.matchedProjectListItemId }
          : {}),
        ...(registry.matchMethod ? { fallbackMatchMethod: registry.matchMethod } : {}),
        ...(registry.matchConfidence ? { fallbackMatchConfidence: registry.matchConfidence } : {}),
      },
      warnings: mergeWarnings(itemWarnings, sharePoint.warnings, procore.warnings),
    });
  }

  return sortItems(items);
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
  };
}

function createDefaultSourceDeps(): IProjectLinksSourceDeps {
  const graph = new GraphListClient(getLegacyFallbackListHostSiteUrl());

  const projectSelectFields = [
    'Title',
    resolveSpField('projectNumber'),
    resolveSpField('projectName'),
    resolveSpField('year'),
    resolveSpField('projectStage'),
    resolveSpField('siteUrl'),
    resolveSpField('procoreProject'),
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
            roleArrays: buildRoleFieldObjectFromRow(row),
          };
        });

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
          failure: 'legacy-registry-source-failed',
          failureStage: classifyGraphErrorStage(error),
          failureMessage: sanitizeForTelemetry(error),
        };
      }
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
