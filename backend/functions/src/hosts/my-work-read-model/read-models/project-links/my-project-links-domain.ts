/**
 * Pure My Projects domain helpers shared by:
 *   - the legacy aggregation provider (`my-project-links-read-model-provider.ts`),
 *   - the projection slice engine (`services/my-projects-projection/engine/*`).
 *
 * Keep this module dependency-free of Graph clients, telemetry reporters, and
 * Azure infrastructure. It only consumes `@hbc/models/myWork` and produces
 * per-actor `MyProjectLinkItem` lists from normalized source rows.
 */

import {
  MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS,
  parseUpnArrayStorage,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
  type MyProjectLinkWarning,
  type MyProjectLinksReadModel,
} from '@hbc/models/myWork';

const PROCORE_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface IProjectSourceRow {
  id: number;
  projectNumber: string;
  projectName: string;
  year: number | null;
  projectStage?: string;
  siteUrl?: string;
  procoreProject?: string;
  buildingConnectedUrl?: string;
  documentCrunchUrl?: string;
  roleArrays: Partial<Record<string, unknown>>;
  legacyRoleFallbacks: {
    leadEstimatorUpn?: string;
    supportingEstimatorUpns?: unknown;
    projectManagerUpn?: string;
    projectExecutiveUpn?: string;
  };
}

export interface ILegacyRegistrySourceRow {
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
  projectStage?: string;
  buildingConnectedUrl?: string;
  documentCrunchUrl?: string;
  roleArrays: Partial<Record<string, unknown>>;
}

/**
 * Narrow source-status surface that `reconcileProjectLinks` actually consults.
 * The legacy provider passes its full `ISourceLoadResult<T>` which structurally
 * satisfies this shape; the projection engine passes `{ ok: true, bounded: false }`
 * because targeted-fetch source rows are always "complete" by construction.
 */
export interface IReconcileSourceFlags {
  readonly ok: boolean;
  readonly bounded: boolean;
}

export interface IReconcileSourceStatuses {
  readonly projects: IReconcileSourceFlags;
  readonly registry: IReconcileSourceFlags;
}

interface IAvailabilityKey {
  sp: number;
  procore: number;
}

export function trimToString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function readOptionalUrl(value: unknown): string | undefined {
  const trimmed = trimToString(value);
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

export function readOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function buildRoleFieldObjectFromRow(
  row: Record<string, unknown>,
): Partial<Record<string, unknown>> {
  const output: Partial<Record<string, unknown>> = {};
  for (const definition of MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS) {
    output[definition.internalField] = row[definition.internalField];
  }
  return output;
}

export function parseAssignmentRolesFromProjects(
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

export function parseAssignmentRolesFromRegistry(
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

export function buildProcoreAction(token: string | undefined): {
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

export function buildBuildingConnectedAction(rawUrl: string | undefined): {
  action: MyProjectLinkItem['buildingConnectedAction'];
  warnings: MyProjectLinkWarning[];
} {
  const warnings: MyProjectLinkWarning[] = [];
  const trimmed = rawUrl?.trim();

  if (!trimmed) {
    warnings.push({ code: 'building-connected-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'BuildingConnected unavailable',
      },
      warnings,
    };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    warnings.push({ code: 'building-connected-url-invalid' });
    warnings.push({ code: 'building-connected-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'BuildingConnected unavailable',
      },
      warnings,
    };
  }

  return {
    action: {
      state: 'available',
      label: 'Open BuildingConnected',
      href: trimmed,
    },
    warnings,
  };
}

export function buildDocumentCrunchAction(rawUrl: string | undefined): {
  action: MyProjectLinkItem['documentCrunchAction'];
  warnings: MyProjectLinkWarning[];
} {
  const warnings: MyProjectLinkWarning[] = [];
  const trimmed = rawUrl?.trim();

  if (!trimmed) {
    warnings.push({ code: 'document-crunch-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'Document Crunch unavailable',
      },
      warnings,
    };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    warnings.push({ code: 'document-crunch-url-invalid' });
    warnings.push({ code: 'document-crunch-launch-unavailable' });
    return {
      action: {
        state: 'unavailable',
        label: 'Document Crunch unavailable',
      },
      warnings,
    };
  }

  return {
    action: {
      state: 'available',
      label: 'Open Document Crunch',
      href: trimmed,
    },
    warnings,
  };
}

export function buildProjectsOnlySharePointAction(siteUrl: string | undefined): {
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

export function buildMergedSharePointAction(
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

export function buildLegacyOnlySharePointAction(folderUrl: string | undefined): {
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

export function mergeWarnings(
  ...groups: readonly MyProjectLinkWarning[][]
): MyProjectLinkWarning[] {
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

export function sortItems(items: MyProjectLinkItem[]): MyProjectLinkItem[] {
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

export function projectYearKey(projectNumber: string, year: number | null): string {
  return `${projectNumber.trim()}::${year == null ? '' : String(year)}`;
}

/**
 * Aggregate the per-item availability counts surfaced by the read-model
 * `summary` block. Pure function of the item list; shared between the legacy
 * aggregation provider and the projection-backed provider so both modes
 * report identical summary semantics.
 */
export function buildSummary(
  items: readonly MyProjectLinkItem[],
): MyProjectLinksReadModel['summary'] {
  const sharePointReadyCount = items.filter(
    (item) => item.sharePointAction.state === 'available',
  ).length;
  const procoreReadyCount = items.filter((item) => item.procoreAction.state === 'available').length;
  const buildingConnectedReadyCount = items.filter(
    (item) => item.buildingConnectedAction.state === 'available',
  ).length;
  const documentCrunchReadyCount = items.filter(
    (item) => item.documentCrunchAction.state === 'available',
  ).length;

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
    buildingConnectedReadyCount,
    documentCrunchReadyCount,
    noBuildingConnectedLaunchCount: items.length - buildingConnectedReadyCount,
    noDocumentCrunchLaunchCount: items.length - documentCrunchReadyCount,
    multiPlatformReadyCount: items.filter(
      (item) =>
        item.sharePointAction.state === 'available' &&
        item.procoreAction.state === 'available' &&
        item.buildingConnectedAction.state === 'available' &&
        item.documentCrunchAction.state === 'available',
    ).length,
    projectsOnlyCount: items.filter((item) => item.source === 'projects-only').length,
    mergedCount: items.filter((item) => item.source === 'merged').length,
    legacyOnlyCount: items.filter((item) => item.source === 'legacy-only').length,
  };
}

export function reconcileProjectLinks(
  actorUpn: string,
  projects: readonly IProjectSourceRow[],
  registryRows: readonly ILegacyRegistrySourceRow[],
  sourceStatuses: IReconcileSourceStatuses,
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
    const buildingConnected = buildBuildingConnectedAction(project.buildingConnectedUrl);
    const documentCrunch = buildDocumentCrunchAction(project.documentCrunchUrl);

    const stage = project.projectStage ?? mergedRegistry?.projectStage;

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
      ...(stage ? { projectStage: stage } : {}),
      assignmentRoles: parsed.roles,
      sharePointAction: sharePoint.action,
      procoreAction: procore.action,
      buildingConnectedAction: buildingConnected.action,
      documentCrunchAction: documentCrunch.action,
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
      warnings: mergeWarnings(
        itemWarnings,
        sharePoint.warnings,
        procore.warnings,
        buildingConnected.warnings,
        documentCrunch.warnings,
      ),
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
    const buildingConnected = buildBuildingConnectedAction(registry.buildingConnectedUrl);
    const documentCrunch = buildDocumentCrunchAction(registry.documentCrunchUrl);
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
      ...(registry.projectStage ? { projectStage: registry.projectStage } : {}),
      assignmentRoles: roles,
      sharePointAction: sharePoint.action,
      procoreAction: procore.action,
      buildingConnectedAction: buildingConnected.action,
      documentCrunchAction: documentCrunch.action,
      provenance: {
        legacyRegistryItemId: registry.id,
        ...(registry.matchedProjectListItemId != null
          ? { legacyMatchedProjectListItemId: registry.matchedProjectListItemId }
          : {}),
        ...(registry.matchMethod ? { fallbackMatchMethod: registry.matchMethod } : {}),
        ...(registry.matchConfidence ? { fallbackMatchConfidence: registry.matchConfidence } : {}),
      },
      warnings: mergeWarnings(
        itemWarnings,
        sharePoint.warnings,
        procore.warnings,
        buildingConnected.warnings,
        documentCrunch.warnings,
      ),
    });
  }

  return sortItems(items);
}

/**
 * Collect every normalized UPN referenced by any role array across the input
 * source rows. The projection slice engine iterates this set to enumerate which
 * users a changed source row potentially affects, then calls
 * `reconcileProjectLinks` once per actor to build that user's projection items.
 *
 * Legacy four-field UPN fallback fields on Projects rows are included so a
 * Projects row without canonical role arrays still surfaces the four fallback
 * users.
 */
export function enumerateAssignedUpns(
  projects: readonly IProjectSourceRow[],
  registry: readonly ILegacyRegistrySourceRow[],
): readonly string[] {
  const upns = new Set<string>();

  const collectFromRoleArrays = (roleArrays: Partial<Record<string, unknown>>): void => {
    for (const definition of MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS) {
      for (const candidate of parseUpnArrayStorage(roleArrays[definition.internalField])) {
        if (candidate) upns.add(candidate);
      }
    }
  };

  for (const project of projects) {
    collectFromRoleArrays(project.roleArrays);
    for (const candidate of parseUpnArrayStorage(project.legacyRoleFallbacks.leadEstimatorUpn)) {
      if (candidate) upns.add(candidate);
    }
    for (const candidate of parseUpnArrayStorage(
      project.legacyRoleFallbacks.supportingEstimatorUpns,
    )) {
      if (candidate) upns.add(candidate);
    }
    for (const candidate of parseUpnArrayStorage(project.legacyRoleFallbacks.projectManagerUpn)) {
      if (candidate) upns.add(candidate);
    }
    for (const candidate of parseUpnArrayStorage(project.legacyRoleFallbacks.projectExecutiveUpn)) {
      if (candidate) upns.add(candidate);
    }
  }

  for (const row of registry) {
    collectFromRoleArrays(row.roleArrays);
  }

  return [...upns].sort();
}
