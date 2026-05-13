import type { MyProjectAssignmentRoleId } from './MyProjectAssignmentRoles.js';
import type { MyWorkReadModelSourceStatus } from './MyWorkReadModels.js';

export const MY_PROJECT_LINK_WARNING_CODES = [
  'sharepoint-launch-unavailable',
  'procore-launch-unavailable',
  'procore-project-invalid',
  'assignment-source-bounded',
  'projects-source-partial',
  'legacy-registry-source-partial',
  'legacy-match-state-excluded',
  'legacy-role-data-preserved',
  'schema-transition-legacy-role-fallback-used',
] as const;

export type MyProjectLinkWarningCode = (typeof MY_PROJECT_LINK_WARNING_CODES)[number];

export interface MyProjectLinkWarning {
  readonly code: MyProjectLinkWarningCode;
  readonly message?: string;
}

export interface MyProjectLinkItem {
  readonly recordKey: string;
  readonly source: 'projects-only' | 'merged' | 'legacy-only';
  readonly projectName: string;
  readonly projectNumber: string;
  readonly projectStage?: string;
  readonly assignmentRoles: readonly MyProjectAssignmentRoleId[];
  readonly sharePointAction: {
    readonly state: 'available' | 'unavailable';
    readonly kind: 'project-site' | 'legacy-folder' | 'none';
    readonly label: 'Open SharePoint Site' | 'Open SharePoint Folder' | 'SharePoint unavailable';
    readonly href?: string;
  };
  readonly procoreAction: {
    readonly state: 'available' | 'unavailable';
    readonly label: 'Open Procore' | 'Procore unavailable';
    readonly procoreProject?: string;
    readonly href?: string;
  };
  readonly provenance: {
    readonly projectsListItemId?: number;
    readonly legacyRegistryItemId?: number;
    readonly legacyMatchedProjectListItemId?: number;
    readonly fallbackMatchMethod?: string;
    readonly fallbackMatchConfidence?: string;
  };
  readonly warnings: readonly MyProjectLinkWarning[];
}

export interface MyProjectLinksReadModel {
  readonly moduleId: 'my-project-links';
  readonly actor: {
    readonly principalName: string;
    readonly displayName?: string;
  };
  readonly summary: {
    readonly assignedProjectCount: number;
    readonly dualLaunchReadyCount: number;
    readonly sharePointReadyCount: number;
    readonly procoreReadyCount: number;
    readonly noSharePointLaunchCount: number;
    readonly noProcoreLaunchCount: number;
    readonly projectsOnlyCount: number;
    readonly mergedCount: number;
    readonly legacyOnlyCount: number;
  };
  readonly items: readonly MyProjectLinkItem[];
  readonly sourceReadiness: {
    readonly projects: MyWorkReadModelSourceStatus;
    readonly legacyFallbackRegistry: MyWorkReadModelSourceStatus;
  };
}
