/**
 * Map a per-user `MyProjectLinkItem` plus projection metadata into the
 * `My Projects Registry` helper-list row field set defined by
 * `03_SharePoint_My_Projects_Registry_Schema.md`. Internal field names are
 * mirrored verbatim from `registry-list-descriptor.ts`.
 *
 * `IMyProjectsRegistryRowFields` is the payload the Graph repository POSTs/PATCHes
 * inside `{ fields: ... }`. `IMyProjectsRegistryExistingRow` is the minimal
 * projection of an existing list row needed for upsert decisioning by the
 * slice engine.
 */

import type {
  MyProjectAssignmentRoleId,
  MyProjectLinkItem,
  MyProjectLinkWarning,
} from '@hbc/models/myWork';
import { MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS } from '@hbc/models/myWork';

import { PROJECTION_VERSION } from '../projection-types.js';
import type {
  DeactivationReasonChoice,
  ProjectionSourceChoice,
  SharePointActionKindChoice,
} from '../registry-list-descriptor.js';

export interface IMyProjectsRegistryRowFields {
  Title: string;
  ProjectionKey: string;
  RecordKey: string;
  UserUpn: string;
  ProjectionSource: ProjectionSourceChoice;
  IsActive: boolean;
  ProjectionVersion: string;
  ProjectionContentHash: string;

  ProjectNumber: string;
  ProjectName: string;
  ProjectStage?: string;

  AssignmentRolesJson: string;
  ProjectsListItemId?: number;
  LegacyRegistryItemId?: number;
  LegacyMatchedProjectListItemId?: number;
  FallbackMatchMethod?: string;
  FallbackMatchConfidence?: string;

  SharePointActionState: 'available' | 'unavailable';
  SharePointActionKind: SharePointActionKindChoice;
  SharePointActionLabel: string;
  SharePointActionHref?: string;

  ProcoreActionState: 'available' | 'unavailable';
  ProcoreProject?: string;
  ProcoreActionLabel: string;
  ProcoreActionHref?: string;

  BuildingConnectedActionState: 'available' | 'unavailable';
  BuildingConnectedActionLabel: string;
  BuildingConnectedActionHref?: string;

  DocumentCrunchActionState: 'available' | 'unavailable';
  DocumentCrunchActionLabel: string;
  DocumentCrunchActionHref?: string;

  WarningsJson?: string;
  LastProjectedAtUtc: string;
  MaxSourceModifiedUtc?: string;
  ProjectionBatchId: string;
  DeactivatedAtUtc?: string;
  DeactivationReason?: DeactivationReasonChoice;
}

export interface IMyProjectsRegistryExistingRow {
  readonly listItemId: number;
  readonly projectionKey: string;
  readonly userUpn: string;
  readonly isActive: boolean;
  readonly projectionContentHash: string;
  readonly recordKey: string;
  readonly projectsListItemId: number | null;
  readonly legacyRegistryItemId: number | null;
}

export interface IMapItemToRegistryRowInput {
  readonly projectionKey: string;
  readonly userUpn: string;
  readonly recordKey: string;
  readonly item: MyProjectLinkItem;
  readonly contentHash: string;
  readonly projectionBatchId: string;
  readonly lastProjectedAtUtc: string;
  readonly maxSourceModifiedUtc?: string;
}

export function mapItemToRegistryRow(
  input: IMapItemToRegistryRowInput,
): IMyProjectsRegistryRowFields {
  const { item } = input;

  const fields: IMyProjectsRegistryRowFields = {
    Title: input.projectionKey,
    ProjectionKey: input.projectionKey,
    RecordKey: input.recordKey,
    UserUpn: input.userUpn,
    ProjectionSource: item.source,
    IsActive: true,
    ProjectionVersion: PROJECTION_VERSION,
    ProjectionContentHash: input.contentHash,

    ProjectNumber: item.projectNumber,
    ProjectName: item.projectName,

    AssignmentRolesJson: JSON.stringify(item.assignmentRoles),

    SharePointActionState: item.sharePointAction.state,
    SharePointActionKind: item.sharePointAction.kind,
    SharePointActionLabel: item.sharePointAction.label,

    ProcoreActionState: item.procoreAction.state,
    ProcoreActionLabel: item.procoreAction.label,

    BuildingConnectedActionState: item.buildingConnectedAction.state,
    BuildingConnectedActionLabel: item.buildingConnectedAction.label,

    DocumentCrunchActionState: item.documentCrunchAction.state,
    DocumentCrunchActionLabel: item.documentCrunchAction.label,

    LastProjectedAtUtc: input.lastProjectedAtUtc,
    ProjectionBatchId: input.projectionBatchId,
  };

  if (item.projectStage) fields.ProjectStage = item.projectStage;
  if (item.provenance.projectsListItemId !== undefined) {
    fields.ProjectsListItemId = item.provenance.projectsListItemId;
  }
  if (item.provenance.legacyRegistryItemId !== undefined) {
    fields.LegacyRegistryItemId = item.provenance.legacyRegistryItemId;
  }
  if (item.provenance.legacyMatchedProjectListItemId !== undefined) {
    fields.LegacyMatchedProjectListItemId = item.provenance.legacyMatchedProjectListItemId;
  }
  if (item.provenance.fallbackMatchMethod) {
    fields.FallbackMatchMethod = item.provenance.fallbackMatchMethod;
  }
  if (item.provenance.fallbackMatchConfidence) {
    fields.FallbackMatchConfidence = item.provenance.fallbackMatchConfidence;
  }
  if (item.sharePointAction.href) fields.SharePointActionHref = item.sharePointAction.href;
  if (item.procoreAction.procoreProject) fields.ProcoreProject = item.procoreAction.procoreProject;
  if (item.procoreAction.href) fields.ProcoreActionHref = item.procoreAction.href;
  if (item.buildingConnectedAction.href) {
    fields.BuildingConnectedActionHref = item.buildingConnectedAction.href;
  }
  if (item.documentCrunchAction.href) {
    fields.DocumentCrunchActionHref = item.documentCrunchAction.href;
  }
  if (item.warnings.length > 0) fields.WarningsJson = JSON.stringify(item.warnings);
  if (input.maxSourceModifiedUtc) fields.MaxSourceModifiedUtc = input.maxSourceModifiedUtc;

  return fields;
}

export interface IDeactivationPatchInput {
  readonly reason: DeactivationReasonChoice;
  readonly projectionBatchId: string;
  readonly nowUtc: string;
}

/**
 * Soft-deactivation patch. Sets IsActive=false, stamps DeactivatedAtUtc /
 * DeactivationReason, updates LastProjectedAtUtc + ProjectionBatchId for
 * traceability. Per Doc 06 §11.
 */
export function buildDeactivationPatch(
  input: IDeactivationPatchInput,
): Partial<IMyProjectsRegistryRowFields> {
  return {
    IsActive: false,
    DeactivatedAtUtc: input.nowUtc,
    DeactivationReason: input.reason,
    ProjectionBatchId: input.projectionBatchId,
    LastProjectedAtUtc: input.nowUtc,
  };
}

/**
 * Field patch where any value may be `null` to clear it on PATCH (e.g.,
 * clearing `DeactivatedAtUtc` on reactivation). The repository surfaces this
 * via `patchRowAllowNulls`.
 */
export type IMyProjectsRegistryRowPatch = {
  readonly [K in keyof IMyProjectsRegistryRowFields]?: IMyProjectsRegistryRowFields[K] | null;
};

/**
 * Reactivation patch. Clears deactivation fields and stamps the run. Business
 * fields (display, actions, hash) are written separately via the full row
 * patch when the content hash also changed.
 */
export function buildReactivationOperationalPatch(input: {
  readonly projectionBatchId: string;
  readonly nowUtc: string;
}): IMyProjectsRegistryRowPatch {
  return {
    IsActive: true,
    DeactivatedAtUtc: null,
    DeactivationReason: null,
    ProjectionBatchId: input.projectionBatchId,
    LastProjectedAtUtc: input.nowUtc,
  };
}

/**
 * Full registry-row read shape — everything needed to reconstruct a
 * `MyProjectLinkItem` plus the freshness metadata the projection-backed
 * provider surfaces in diagnostics.
 */
export interface IMyProjectsRegistryReadRow {
  readonly listItemId: number;
  readonly projectionKey: string;
  readonly recordKey: string;
  readonly userUpn: string;
  readonly isActive: boolean;
  readonly projectionSource: ProjectionSourceChoice;
  readonly projectionContentHash: string;

  readonly projectNumber: string;
  readonly projectName: string;
  readonly projectStage: string | null;

  readonly assignmentRoles: readonly MyProjectAssignmentRoleId[];
  readonly projectsListItemId: number | null;
  readonly legacyRegistryItemId: number | null;
  readonly legacyMatchedProjectListItemId: number | null;
  readonly fallbackMatchMethod: string | null;
  readonly fallbackMatchConfidence: string | null;

  readonly sharePointActionState: 'available' | 'unavailable';
  readonly sharePointActionKind: SharePointActionKindChoice;
  readonly sharePointActionLabel: string;
  readonly sharePointActionHref: string | null;

  readonly procoreActionState: 'available' | 'unavailable';
  readonly procoreActionLabel: string;
  readonly procoreActionHref: string | null;
  readonly procoreProject: string | null;

  readonly buildingConnectedActionState: 'available' | 'unavailable';
  readonly buildingConnectedActionLabel: string;
  readonly buildingConnectedActionHref: string | null;

  readonly documentCrunchActionState: 'available' | 'unavailable';
  readonly documentCrunchActionLabel: string;
  readonly documentCrunchActionHref: string | null;

  readonly warnings: readonly MyProjectLinkWarning[];
  readonly lastProjectedAtUtc: string;
  readonly projectionBatchId: string;
}

const KNOWN_ROLE_IDS = new Set<MyProjectAssignmentRoleId>(
  MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((definition) => definition.roleId),
);

function parseAssignmentRolesJson(raw: unknown): readonly MyProjectAssignmentRoleId[] {
  if (typeof raw !== 'string' || raw.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: MyProjectAssignmentRoleId[] = [];
    for (const entry of parsed) {
      if (typeof entry !== 'string') continue;
      if (KNOWN_ROLE_IDS.has(entry as MyProjectAssignmentRoleId)) {
        out.push(entry as MyProjectAssignmentRoleId);
      }
    }
    return out;
  } catch {
    return [];
  }
}

function parseWarningsJson(raw: unknown): readonly MyProjectLinkWarning[] {
  if (typeof raw !== 'string' || raw.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: MyProjectLinkWarning[] = [];
    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as { code?: unknown }).code === 'string'
      ) {
        const e = entry as { code: string; message?: unknown };
        out.push(
          typeof e.message === 'string'
            ? ({ code: e.code, message: e.message } as MyProjectLinkWarning)
            : ({ code: e.code } as MyProjectLinkWarning),
        );
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Reverse mapper — converts a stored `My Projects Registry` row back into the
 * `MyProjectLinkItem` shape the read route returns. Symmetric inverse of
 * `mapItemToRegistryRow`. The projection-backed provider consumes this.
 */
export function mapRegistryRowToProjectLinkItem(
  row: IMyProjectsRegistryReadRow,
): MyProjectLinkItem {
  const sharePointAction: MyProjectLinkItem['sharePointAction'] =
    row.sharePointActionState === 'available' && row.sharePointActionHref
      ? {
          state: 'available',
          kind:
            row.sharePointActionKind === 'project-site' ||
            row.sharePointActionKind === 'legacy-folder'
              ? row.sharePointActionKind
              : 'project-site',
          label:
            row.sharePointActionLabel === 'Open SharePoint Site' ||
            row.sharePointActionLabel === 'Open SharePoint Folder'
              ? row.sharePointActionLabel
              : 'Open SharePoint Site',
          href: row.sharePointActionHref,
        }
      : {
          state: 'unavailable',
          kind: 'none',
          label: 'SharePoint unavailable',
        };

  const procoreAction: MyProjectLinkItem['procoreAction'] =
    row.procoreActionState === 'available' && row.procoreActionHref
      ? {
          state: 'available',
          label: 'Open Procore',
          ...(row.procoreProject ? { procoreProject: row.procoreProject } : {}),
          href: row.procoreActionHref,
        }
      : {
          state: 'unavailable',
          label: 'Procore unavailable',
          ...(row.procoreProject ? { procoreProject: row.procoreProject } : {}),
        };

  const buildingConnectedAction: MyProjectLinkItem['buildingConnectedAction'] =
    row.buildingConnectedActionState === 'available' && row.buildingConnectedActionHref
      ? {
          state: 'available',
          label: 'Open BuildingConnected',
          href: row.buildingConnectedActionHref,
        }
      : {
          state: 'unavailable',
          label: 'BuildingConnected unavailable',
        };

  const documentCrunchAction: MyProjectLinkItem['documentCrunchAction'] =
    row.documentCrunchActionState === 'available' && row.documentCrunchActionHref
      ? {
          state: 'available',
          label: 'Open Document Crunch',
          href: row.documentCrunchActionHref,
        }
      : {
          state: 'unavailable',
          label: 'Document Crunch unavailable',
        };

  return {
    recordKey: row.recordKey,
    source: row.projectionSource,
    projectName: row.projectName,
    projectNumber: row.projectNumber,
    ...(row.projectStage ? { projectStage: row.projectStage } : {}),
    assignmentRoles: row.assignmentRoles,
    sharePointAction,
    procoreAction,
    buildingConnectedAction,
    documentCrunchAction,
    provenance: {
      ...(row.projectsListItemId !== null ? { projectsListItemId: row.projectsListItemId } : {}),
      ...(row.legacyRegistryItemId !== null
        ? { legacyRegistryItemId: row.legacyRegistryItemId }
        : {}),
      ...(row.legacyMatchedProjectListItemId !== null
        ? { legacyMatchedProjectListItemId: row.legacyMatchedProjectListItemId }
        : {}),
      ...(row.fallbackMatchMethod ? { fallbackMatchMethod: row.fallbackMatchMethod } : {}),
      ...(row.fallbackMatchConfidence
        ? { fallbackMatchConfidence: row.fallbackMatchConfidence }
        : {}),
    },
    warnings: row.warnings,
  };
}

/**
 * Parse a raw Graph helper-list row payload (the `fields` object surfaced by
 * `GraphListClient.listItems`) into the structured `IMyProjectsRegistryReadRow`
 * the reverse mapper consumes. Out-of-band rows (missing required fields)
 * return `null` and the caller filters them out.
 */
export function parseRegistryReadRow(
  listItemId: number,
  fields: Record<string, unknown>,
): IMyProjectsRegistryReadRow | null {
  const projectionKey = stringOrEmpty(fields.ProjectionKey);
  const recordKey = stringOrEmpty(fields.RecordKey);
  const userUpn = stringOrEmpty(fields.UserUpn);
  const projectionSourceRaw = stringOrEmpty(fields.ProjectionSource);
  const projectNumber = stringOrEmpty(fields.ProjectNumber);
  const projectName = stringOrEmpty(fields.ProjectName);
  if (!projectionKey || !recordKey || !userUpn || !projectNumber || !projectName) {
    return null;
  }
  const projectionSource: ProjectionSourceChoice =
    projectionSourceRaw === 'projects-only' ||
    projectionSourceRaw === 'merged' ||
    projectionSourceRaw === 'legacy-only'
      ? projectionSourceRaw
      : 'projects-only';

  return {
    listItemId,
    projectionKey,
    recordKey,
    userUpn,
    isActive: coerceBoolean(fields.IsActive),
    projectionSource,
    projectionContentHash: stringOrEmpty(fields.ProjectionContentHash),
    projectNumber,
    projectName,
    projectStage: nullableString(fields.ProjectStage),
    assignmentRoles: parseAssignmentRolesJson(fields.AssignmentRolesJson),
    projectsListItemId: nullableNumber(fields.ProjectsListItemId),
    legacyRegistryItemId: nullableNumber(fields.LegacyRegistryItemId),
    legacyMatchedProjectListItemId: nullableNumber(fields.LegacyMatchedProjectListItemId),
    fallbackMatchMethod: nullableString(fields.FallbackMatchMethod),
    fallbackMatchConfidence: nullableString(fields.FallbackMatchConfidence),
    sharePointActionState: actionState(fields.SharePointActionState),
    sharePointActionKind:
      stringOrEmpty(fields.SharePointActionKind) === 'project-site' ||
      stringOrEmpty(fields.SharePointActionKind) === 'legacy-folder' ||
      stringOrEmpty(fields.SharePointActionKind) === 'none'
        ? (stringOrEmpty(fields.SharePointActionKind) as SharePointActionKindChoice)
        : 'none',
    sharePointActionLabel: stringOrEmpty(fields.SharePointActionLabel),
    sharePointActionHref: nullableString(fields.SharePointActionHref),
    procoreActionState: actionState(fields.ProcoreActionState),
    procoreActionLabel: stringOrEmpty(fields.ProcoreActionLabel),
    procoreActionHref: nullableString(fields.ProcoreActionHref),
    procoreProject: nullableString(fields.ProcoreProject),
    buildingConnectedActionState: actionState(fields.BuildingConnectedActionState),
    buildingConnectedActionLabel: stringOrEmpty(fields.BuildingConnectedActionLabel),
    buildingConnectedActionHref: nullableString(fields.BuildingConnectedActionHref),
    documentCrunchActionState: actionState(fields.DocumentCrunchActionState),
    documentCrunchActionLabel: stringOrEmpty(fields.DocumentCrunchActionLabel),
    documentCrunchActionHref: nullableString(fields.DocumentCrunchActionHref),
    warnings: parseWarningsJson(fields.WarningsJson),
    lastProjectedAtUtc: stringOrEmpty(fields.LastProjectedAtUtc),
    projectionBatchId: stringOrEmpty(fields.ProjectionBatchId),
  };
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function actionState(value: unknown): 'available' | 'unavailable' {
  return value === 'available' ? 'available' : 'unavailable';
}
