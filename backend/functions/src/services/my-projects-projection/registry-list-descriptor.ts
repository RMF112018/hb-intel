/**
 * My Projects Registry — projection helper-list descriptor and host-site contract.
 *
 * Backs the derived projection read store for the My Dashboard | My Projects
 * incremental projection subsystem (B05.13). The list lives on the MyDashboard
 * site (separate from HBCentral source lists) and stores one row per normalized
 * UserUpn × RecordKey projection slice. Runtime reads are backend-only — the
 * SPFx surface never queries this list directly.
 *
 * Source of truth for the field contract is package doc
 * `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/`
 * (`03_SharePoint_My_Projects_Registry_Schema.md` +
 * `resources/My_Projects_Registry_Schema.json`).
 *
 * Governance (not REST-enforced by the provisioner; see operator how-to):
 *   - List is NOT hidden (operator usability).
 *   - Permission inheritance MUST be broken with restricted role assignments.
 *   - End users have no direct list permission; backend-mediated read only.
 *
 * Uniqueness:
 *   - `ProjectionKey` carries `EnforceUniqueValues=true`. The provisioner
 *     applies this as a post-create step against the indexed field.
 */

import type { IListDefinition } from '../sharepoint-service.js';

export const MY_PROJECTS_REGISTRY_LIST_TITLE = 'My Projects Registry';

export const MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard';

export const PROJECTION_SOURCE_CHOICES = ['projects-only', 'merged', 'legacy-only'] as const;
export type ProjectionSourceChoice = (typeof PROJECTION_SOURCE_CHOICES)[number];

export const SHAREPOINT_ACTION_STATE_CHOICES = ['available', 'unavailable'] as const;
export type SharePointActionStateChoice = (typeof SHAREPOINT_ACTION_STATE_CHOICES)[number];

export const SHAREPOINT_ACTION_KIND_CHOICES = ['project-site', 'legacy-folder', 'none'] as const;
export type SharePointActionKindChoice = (typeof SHAREPOINT_ACTION_KIND_CHOICES)[number];

export const LAUNCH_ACTION_STATE_CHOICES = ['available', 'unavailable'] as const;
export type LaunchActionStateChoice = (typeof LAUNCH_ACTION_STATE_CHOICES)[number];

export const DEACTIVATION_REASON_CHOICES = [
  'assignment-removed',
  'project-source-deleted',
  'registry-source-deleted',
  'merge-topology-changed',
  'rebuild-obsolete',
  'manual-repair',
  'other',
] as const;
export type DeactivationReasonChoice = (typeof DEACTIVATION_REASON_CHOICES)[number];

export interface IMyProjectsRegistryListGovernance {
  readonly hidden: false;
  readonly breakPermissionInheritance: true;
  readonly runtimeReadModel: 'backend-only';
}

export const MY_PROJECTS_REGISTRY_LIST_GOVERNANCE: IMyProjectsRegistryListGovernance = {
  hidden: false,
  breakPermissionInheritance: true,
  runtimeReadModel: 'backend-only',
};

export const MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_PROJECTS_REGISTRY_LIST_TITLE,
  description:
    'Backend-mediated projection of My Projects user-project assignments and launch metadata. Operator/system-facing; not a general end-user data source.',
  template: 100,
  fields: [
    {
      internalName: 'ProjectionKey',
      displayName: 'Projection Key',
      type: 'Text',
      required: true,
      indexed: true,
      unique: true,
    },
    {
      internalName: 'RecordKey',
      displayName: 'Record Key',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'UserUpn',
      displayName: 'User UPN',
      type: 'Text',
      required: true,
      indexed: true,
    },
    {
      internalName: 'ProjectionSource',
      displayName: 'Projection Source',
      type: 'Choice',
      required: true,
      choices: [...PROJECTION_SOURCE_CHOICES],
    },
    {
      internalName: 'IsActive',
      displayName: 'Is Active',
      type: 'Boolean',
      required: true,
      indexed: true,
      defaultValue: '1',
    },
    {
      internalName: 'ProjectionVersion',
      displayName: 'Projection Version',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'ProjectionContentHash',
      displayName: 'Projection Content Hash',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'ProjectNumber',
      displayName: 'Project Number',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'ProjectName',
      displayName: 'Project Name',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'ProjectStage',
      displayName: 'Project Stage',
      type: 'Text',
    },
    {
      internalName: 'AssignmentRolesJson',
      displayName: 'Assignment Roles JSON',
      type: 'MultiLineText',
      required: true,
    },
    {
      internalName: 'ProjectsListItemId',
      displayName: 'Projects List Item ID',
      type: 'Number',
      indexed: true,
    },
    {
      internalName: 'LegacyRegistryItemId',
      displayName: 'Legacy Registry Item ID',
      type: 'Number',
      indexed: true,
    },
    {
      internalName: 'LegacyMatchedProjectListItemId',
      displayName: 'Legacy Matched Project List Item ID',
      type: 'Number',
    },
    {
      internalName: 'FallbackMatchMethod',
      displayName: 'Fallback Match Method',
      type: 'Text',
    },
    {
      internalName: 'FallbackMatchConfidence',
      displayName: 'Fallback Match Confidence',
      type: 'Text',
    },
    {
      internalName: 'SharePointActionState',
      displayName: 'SharePoint Action State',
      type: 'Choice',
      required: true,
      choices: [...SHAREPOINT_ACTION_STATE_CHOICES],
    },
    {
      internalName: 'SharePointActionKind',
      displayName: 'SharePoint Action Kind',
      type: 'Choice',
      required: true,
      choices: [...SHAREPOINT_ACTION_KIND_CHOICES],
    },
    {
      internalName: 'SharePointActionLabel',
      displayName: 'SharePoint Action Label',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'SharePointActionHref',
      displayName: 'SharePoint Action Href',
      type: 'Text',
    },
    {
      internalName: 'ProcoreActionState',
      displayName: 'Procore Action State',
      type: 'Choice',
      required: true,
      choices: [...LAUNCH_ACTION_STATE_CHOICES],
    },
    {
      internalName: 'ProcoreProject',
      displayName: 'Procore Project',
      type: 'Text',
    },
    {
      internalName: 'ProcoreActionLabel',
      displayName: 'Procore Action Label',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'ProcoreActionHref',
      displayName: 'Procore Action Href',
      type: 'Text',
    },
    {
      internalName: 'BuildingConnectedActionState',
      displayName: 'BuildingConnected Action State',
      type: 'Choice',
      required: true,
      choices: [...LAUNCH_ACTION_STATE_CHOICES],
    },
    {
      internalName: 'BuildingConnectedActionLabel',
      displayName: 'BuildingConnected Action Label',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'BuildingConnectedActionHref',
      displayName: 'BuildingConnected Action Href',
      type: 'Text',
    },
    {
      internalName: 'DocumentCrunchActionState',
      displayName: 'Document Crunch Action State',
      type: 'Choice',
      required: true,
      choices: [...LAUNCH_ACTION_STATE_CHOICES],
    },
    {
      internalName: 'DocumentCrunchActionLabel',
      displayName: 'Document Crunch Action Label',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'DocumentCrunchActionHref',
      displayName: 'Document Crunch Action Href',
      type: 'Text',
    },
    {
      internalName: 'WarningsJson',
      displayName: 'Warnings JSON',
      type: 'MultiLineText',
    },
    {
      internalName: 'LastProjectedAtUtc',
      displayName: 'Last Projected At UTC',
      type: 'DateTime',
      required: true,
    },
    {
      internalName: 'MaxSourceModifiedUtc',
      displayName: 'Max Source Modified UTC',
      type: 'DateTime',
    },
    {
      internalName: 'ProjectionBatchId',
      displayName: 'Projection Batch ID',
      type: 'Text',
      required: true,
    },
    {
      internalName: 'DeactivatedAtUtc',
      displayName: 'Deactivated At UTC',
      type: 'DateTime',
    },
    {
      internalName: 'DeactivationReason',
      displayName: 'Deactivation Reason',
      type: 'Choice',
      choices: [...DEACTIVATION_REASON_CHOICES],
    },
  ],
};

export const MY_PROJECTS_REGISTRY_LIST_DESCRIPTORS: readonly IListDefinition[] = [
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR,
];

export function getMyProjectsRegistryListHostSiteUrl(): string {
  return MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL;
}
