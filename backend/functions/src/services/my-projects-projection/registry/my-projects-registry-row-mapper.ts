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

import type { MyProjectLinkItem } from '@hbc/models/myWork';

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
