import type { MyProjectAssignmentRoleId } from './MyProjectAssignmentRoles.js';
import type { MyWorkReadModelSourceStatus } from './MyWorkReadModels.js';

export const MY_PROJECT_LINK_WARNING_CODES = [
  'sharepoint-launch-unavailable',
  'procore-launch-unavailable',
  'procore-project-invalid',
  'building-connected-launch-unavailable',
  'building-connected-url-invalid',
  'document-crunch-launch-unavailable',
  'document-crunch-url-invalid',
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
  readonly buildingConnectedAction: {
    readonly state: 'available' | 'unavailable';
    readonly label: 'Open BuildingConnected' | 'BuildingConnected unavailable';
    readonly href?: string;
  };
  readonly documentCrunchAction: {
    readonly state: 'available' | 'unavailable';
    readonly label: 'Open Document Crunch' | 'Document Crunch unavailable';
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

/**
 * Closed-set classification surfaced to operators triaging "why are there
 * no projects?" on a hosted tenant. The provider stamps this synchronously
 * alongside the envelope so a single field collapses the five legitimate
 * zero-row paths into one machine-readable value.
 */
export const MY_PROJECT_LINKS_DIAGNOSTIC_CLASSIFICATIONS = [
  'available',
  'zero-match-available-sources',
  'partial',
  'principal-unresolved',
  'source-unavailable',
] as const;

export type MyProjectLinksDiagnosticClassification =
  (typeof MY_PROJECT_LINKS_DIAGNOSTIC_CLASSIFICATIONS)[number];

export const MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED_REASONS = [
  'missing-upn',
  'invalid-upn-format',
] as const;

export type MyProjectLinksPrincipalUnresolvedReason =
  (typeof MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED_REASONS)[number];

/**
 * Sanitized diagnostic blob co-located with the read-model payload.
 *
 * **Redaction rule**: only closed-set enum values and numeric counts.
 * Never includes UPN, OID, displayName, or any raw claim string. The
 * provider populates this synchronously; the route layer passes it
 * through unchanged.
 */
/**
 * Closed-set identifier surfaced on `MyProjectLinksDiagnostics.projectionMode`.
 * Lets operators tell whether the route response came from the legacy
 * aggregation provider or the projection-backed provider without reading
 * server-side configuration.
 */
export type MyProjectLinksProjectionMode = 'legacy' | 'projection';

export interface MyProjectLinksDiagnostics {
  readonly classification: MyProjectLinksDiagnosticClassification;
  readonly principalResolution: 'resolved' | 'unresolved';
  readonly principalUnresolvedReason?: MyProjectLinksPrincipalUnresolvedReason;
  readonly matchCount: number;
  readonly projectsSourceStatus: MyWorkReadModelSourceStatus;
  readonly legacyFallbackRegistrySourceStatus: MyWorkReadModelSourceStatus;
  /**
   * Which provider served the read. Optional for backward compatibility with
   * existing fixtures; the live provider stamps it on every response.
   */
  readonly projectionMode?: MyProjectLinksProjectionMode;
  /**
   * In projection mode, the maximum `LastProjectedAtUtc` across the helper
   * rows that produced this response. Operators use it to gauge freshness
   * relative to source-side delta. Omitted in legacy mode.
   */
  readonly projectionMaxLastProjectedAtUtc?: string;
  /**
   * In projection mode, the most recent `ProjectionBatchId` observed across
   * the helper rows in this response. Omitted in legacy mode.
   */
  readonly projectionBatchId?: string;
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
    readonly buildingConnectedReadyCount: number;
    readonly documentCrunchReadyCount: number;
    readonly noBuildingConnectedLaunchCount: number;
    readonly noDocumentCrunchLaunchCount: number;
    readonly multiPlatformReadyCount: number;
    readonly projectsOnlyCount: number;
    readonly mergedCount: number;
    readonly legacyOnlyCount: number;
  };
  readonly items: readonly MyProjectLinkItem[];
  readonly sourceReadiness: {
    readonly projects: MyWorkReadModelSourceStatus;
    readonly legacyFallbackRegistry: MyWorkReadModelSourceStatus;
  };
  /**
   * Sanitized diagnostic classification — additive, optional. Populated
   * by the my-dashboard backend provider; safe to omit for fixtures and
   * legacy consumers.
   */
  readonly diagnostics?: MyProjectLinksDiagnostics;
}
