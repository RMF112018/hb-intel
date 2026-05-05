/**
 * Wave 15 — External Systems Launch Pad — canonical TypeScript contract surface.
 *
 * This module is the **canonical Wave 15 vocabulary** for External Systems
 * (registry, launch links, mappings, review items, health snapshots, audit
 * events, HBI source lineage, role/action matrix, degraded-state matrix). It
 * coexists with the Wave 1 legacy contracts in `./ExternalSystems.ts`; the
 * legacy tuple uses underscore-keyed identifiers (`sage_intacct`,
 * `document_crunch`, `adobe_sign`, `outlook_calendar`) and remains active for
 * Wave 1/Wave 14 consumers. Wave 15 introduces a separate hyphen-keyed
 * identifier space (`sage-intacct`, `document-crunch`, `adobe-sign`,
 * `outlook-calendar`) that mirrors the canonical artifact
 * `external_system_registry_contract.json` verbatim.
 *
 * The contracts here are metadata-only:
 *
 *   - no secrets, tokens, API clients, or live SDK wrappers;
 *   - no sync, mirror, or write-back semantics;
 *   - no live external-system calls;
 *   - no SharePoint/Graph/PnP writes;
 *   - no tenant or list mutation;
 *   - HBI is never an authority or approver;
 *   - Wave 14 retains ownership of approval/checkpoint semantics — Wave 15
 *     review items reference Wave 14 approval requests by ID only.
 *
 * Sources of truth (verbatim mirrored below):
 *
 *   docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/
 *     external_system_registry_contract.json
 *     launcher_type_registry.json
 *     external_system_audit_event_taxonomy.json
 *     external_system_degraded_state_matrix.json
 *     external_system_role_action_matrix.json
 *     hbi_allowed_refused_behavior.json
 *
 *   docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_implementation/
 *     docs/04_DATA_MODEL_AND_READ_MODEL_CONTRACTS.md
 *     docs/07_SECURITY_URL_POLICY_AND_HBI_GUARDRAILS.md
 */

import type { PccProjectId, PccProjectNumber } from './types.js';
import type { PccPersona } from './PccUserRoles.js';
import type { PccReadModelEnvelope } from './PccReadModels.js';
import type { UrlPolicyReasonCode } from './ExternalSystemsUrlPolicy.js';

// ─── External system keys (Wave 15 hyphenated, mirrors registry contract) ────

export const EXTERNAL_SYSTEM_KEYS = [
  'sharepoint',
  'onedrive',
  'teams',
  'outlook-calendar',
  'procore',
  'sage-intacct',
  'timberscan',
  'compass',
  'document-crunch',
  'adobe-sign',
  'docusign',
  'autodesk-acc',
  'unanet',
  'permitting',
  'truelook',
  'earthcam',
  'oxblue',
  'sensera-sitecloud',
  'evercam',
  'openspace',
  'dronedeploy',
  'cupix',
  'custom-link',
] as const;

export type ExternalSystemKey = (typeof EXTERNAL_SYSTEM_KEYS)[number];

// ─── Categories ──────────────────────────────────────────────────────────────

export const EXTERNAL_SYSTEM_CATEGORIES = [
  'microsoft-365',
  'project-management',
  'accounting',
  'prequalification',
  'contract-analysis',
  'esignature',
  'design-construction-platform',
  'crm-business-development',
  'permitting',
  'progress-camera',
  'reality-capture',
  'drone-reality-capture',
  'custom',
] as const;

export type ExternalSystemCategory = (typeof EXTERNAL_SYSTEM_CATEGORIES)[number];

// ─── Posture / MVP mode / live-read posture / writeback ──────────────────────

export const EXTERNAL_SYSTEM_POSTURE_KINDS = [
  'mvp-required',
  'mvp-optional',
  'conditional',
  'project-configurable',
  'project-configurable-approval-gated',
] as const;

export type ExternalSystemPostureKind = (typeof EXTERNAL_SYSTEM_POSTURE_KINDS)[number];

export const EXTERNAL_SYSTEM_MVP_MODES = [
  'launch-and-source-context',
  'launch-only',
  'launch-mapping-health-fixture',
  'launch-and-mapping-context',
  'project-configurable-multiple-instances',
  'project-configurable-approval-required',
] as const;

export type ExternalSystemMvpMode = (typeof EXTERNAL_SYSTEM_MVP_MODES)[number];

export const EXTERNAL_SYSTEM_LIVE_READ_POSTURES = [
  'backend-mediated-future-gated',
  'future-gated',
  'not-authorized',
] as const;

export type ExternalSystemLiveReadPosture = (typeof EXTERNAL_SYSTEM_LIVE_READ_POSTURES)[number];

export const EXTERNAL_SYSTEM_WRITEBACK_POLICIES = ['prohibited'] as const;
export type ExternalSystemWritebackPolicy = (typeof EXTERNAL_SYSTEM_WRITEBACK_POLICIES)[number];

// ─── Launcher types (link-type families) ─────────────────────────────────────

export const EXTERNAL_LAUNCHER_TYPES = [
  'system',
  'ahj-portal',
  'private-provider-portal',
  'progress-camera',
  'custom',
  'accounting',
] as const;

export type ExternalLauncherType = (typeof EXTERNAL_LAUNCHER_TYPES)[number];

// ─── Approval lifecycle for project external launch links ────────────────────

export const PROJECT_EXTERNAL_LINK_APPROVAL_STATES = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'blocked-by-policy',
  'archived',
  'superseded',
] as const;

export type ProjectExternalLinkApprovalState =
  (typeof PROJECT_EXTERNAL_LINK_APPROVAL_STATES)[number];

// ─── Mapping states ──────────────────────────────────────────────────────────

export const EXTERNAL_SYSTEM_MAPPING_STATES = [
  'not-mapped',
  'mapped',
  'stale',
  'conflict',
  'missing',
  'review-required',
  'blocked',
  'confirmed',
] as const;

export type ExternalSystemMappingState = (typeof EXTERNAL_SYSTEM_MAPPING_STATES)[number];

// ─── Source health states (per system) ───────────────────────────────────────

export const EXTERNAL_SYSTEM_SOURCE_HEALTH_STATES = [
  'healthy',
  'warning',
  'degraded',
  'unavailable',
  'missing-config',
  'access-denied',
  'throttled',
  'stale',
  'unknown',
] as const;

export type ExternalSystemSourceHealthState = (typeof EXTERNAL_SYSTEM_SOURCE_HEALTH_STATES)[number];

// ─── Degraded-state matrix codes (per envelope) ──────────────────────────────

export const EXTERNAL_SYSTEM_DEGRADED_STATES = [
  'available',
  'backend-unavailable',
  'source-unavailable',
  'missing-config',
  'stale',
  'unauthorized',
  'forbidden',
  'mapping-conflict',
  'blocked-by-policy',
] as const;

export type ExternalSystemDegradedState = (typeof EXTERNAL_SYSTEM_DEGRADED_STATES)[number];

/**
 * Verbatim mirror of `external_system_degraded_state_matrix.json`. Inlined as
 * a typed const so consumers do not load JSON at runtime.
 */
export const EXTERNAL_SYSTEM_DEGRADED_STATE_MATRIX: Readonly<
  Record<
    ExternalSystemDegradedState,
    Readonly<{
      userCopy: string;
      developerBehavior: string;
      retryPosture: string;
      priorityAction: string;
      hbiBehavior: string;
    }>
  >
> = {
  available: {
    userCopy: 'Available',
    developerBehavior: 'Render normal state',
    retryPosture: 'none',
    priorityAction: 'none',
    hbiBehavior: 'May summarize with citations',
  },
  'backend-unavailable': {
    userCopy: 'Launch Pad data is temporarily unavailable.',
    developerBehavior: 'Show fallback/empty state; no SPFx retry loop',
    retryPosture: 'manual refresh only in SPFx',
    priorityAction: 'none unless persistent',
    hbiBehavior: 'Refuse source-grounded claims',
  },
  'source-unavailable': {
    userCopy: 'Source system is unavailable or not reachable.',
    developerBehavior: 'Show source-specific warning',
    retryPosture: 'future backend honors Retry-After/backoff',
    priorityAction: 'create if required system unresolved',
    hbiBehavior: 'May explain status with citations only',
  },
  'missing-config': {
    userCopy: 'Configuration is missing.',
    developerBehavior: 'Show owner and correction path',
    retryPosture: 'none',
    priorityAction: 'create mapping/config action',
    hbiBehavior: 'May summarize missing config',
  },
  stale: {
    userCopy: 'Mapping or source status requires revalidation.',
    developerBehavior: 'Block terminal confirmation until revalidated',
    retryPosture: 'none',
    priorityAction: 'create stale mapping action',
    hbiBehavior: 'May explain stale reason',
  },
  unauthorized: {
    userCopy: 'You do not have access to this external source.',
    developerBehavior: 'Redact URL/object details',
    retryPosture: 'none',
    priorityAction: 'optional access issue',
    hbiBehavior: 'Must not reveal hidden details',
  },
  forbidden: {
    userCopy: 'This action is blocked by policy.',
    developerBehavior: 'Disable action with policy reason',
    retryPosture: 'none',
    priorityAction: 'none unless reviewable',
    hbiBehavior: 'Must not bypass policy',
  },
  'mapping-conflict': {
    userCopy: 'Conflicting mappings require review.',
    developerBehavior: 'Route to review and Wave 14 checkpoint if needed',
    retryPosture: 'none',
    priorityAction: 'create mapping review action',
    hbiBehavior: 'May summarize conflict evidence',
  },
  'blocked-by-policy': {
    userCopy: 'This link or system is blocked by policy.',
    developerBehavior: 'Do not render launch href',
    retryPosture: 'none',
    priorityAction: 'none unless policy review allowed',
    hbiBehavior: 'Must not provide workaround',
  },
};

// ─── External review item lifecycle ──────────────────────────────────────────

/**
 * Review item lifecycle. Inferred from the role/action matrix actions
 * `close-review-item` and `suppress-review-item` plus doc 04's review queue
 * descriptions; not explicitly enumerated in a JSON artifact. Future prompts
 * may revise this tuple as a one-line additive change.
 */
export const EXTERNAL_REVIEW_STATES = ['pending', 'in-progress', 'closed', 'suppressed'] as const;

export type ExternalReviewState = (typeof EXTERNAL_REVIEW_STATES)[number];

// ─── Audit event taxonomy ────────────────────────────────────────────────────

export const EXTERNAL_SYSTEM_AUDIT_EVENT_TYPES = [
  'launch-pad-rendered',
  'launch-link-rendered',
  'launch-attempted',
  'launch-blocked',
  'project-link-created',
  'project-link-submitted',
  'project-link-approved',
  'project-link-rejected',
  'project-link-archived',
  'mapping-review-created',
  'mapping-correction-requested',
  'mapping-confirmed',
  'mapping-conflict-detected',
  'source-health-changed',
  'admin-verification-created',
  'review-item-closed',
  'hbi-lineage-cited',
  'hbi-refusal-issued',
] as const;

export type ExternalSystemAuditEventType = (typeof EXTERNAL_SYSTEM_AUDIT_EVENT_TYPES)[number];

// ─── HBI lineage / refusal vocabulary ────────────────────────────────────────

export const HBI_SOURCE_LINEAGE_STATES = [
  'loading',
  'citation-ready',
  'refusal',
  'unavailable',
  'unauthorized',
  'insufficient-evidence',
] as const;

export type HbiSourceLineageState = (typeof HBI_SOURCE_LINEAGE_STATES)[number];

export const HBI_REFUSAL_REASON_CODES = [
  'approve-custom-link',
  'change-procore-sage-ahj-camera-system',
  'post-to-sage',
  'make-legal-accounting-claim',
  'bypass-user-access-or-redaction',
] as const;

export type HbiRefusalReasonCode = (typeof HBI_REFUSAL_REASON_CODES)[number];

// ─── Role/action matrix vocabulary ───────────────────────────────────────────

export const EXTERNAL_SYSTEM_ROLE_IDS = [
  'pcc-admin',
  'it-admin',
  'executive-oversight',
  'project-executive',
  'project-manager',
  'superintendent',
  'project-accounting',
  'accounting-specialist',
  'accounting-manager',
  'project-team-member',
  'external-contributor',
  'viewer',
  'estimating-coordinator',
  'lead-estimator',
  'estimator',
  'chief-estimator',
  'director-of-preconstruction',
  'project-coordinator',
  'external-design-team',
  'owner-client-viewer',
  'subcontractor-limited',
  'manager-of-operational-excellence',
  'safety-qaqc',
  'hbi',
] as const;

export type ExternalSystemRoleId = (typeof EXTERNAL_SYSTEM_ROLE_IDS)[number];

export const EXTERNAL_SYSTEM_ACTION_IDS = [
  'view-launch-pad',
  'open-approved-launch-link',
  'create-permitting-link',
  'create-progress-camera-link',
  'create-custom-link-draft',
  'edit-own-draft-link',
  'edit-approved-project-link',
  'submit-custom-link-for-review',
  'approve-custom-link',
  'reject-custom-link',
  'archive-project-link',
  'restore-archived-link',
  'view-mapping-status',
  'request-mapping-correction',
  'confirm-mapping',
  'view-source-health',
  'view-redacted-access-issue',
  'view-unredacted-access-issue',
  'create-admin-verification-request',
  'close-review-item',
  'suppress-review-item',
  'view-audit-history',
  'manage-global-system-definitions',
  'manage-url-policy',
  'view-accounting-links',
  'edit-accounting-links',
  'view-hbi-summary',
  'ask-hbi-about-lineage',
] as const;

export type ExternalSystemActionId = (typeof EXTERNAL_SYSTEM_ACTION_IDS)[number];

// ─── HBI allowed/refused capability vocabulary ───────────────────────────────

export const HBI_ALLOWED_CAPABILITIES = [
  'summarize mapped systems visible to current user',
  'explain stale/missing mapping with citations',
  'list source-health warnings',
  'show cited launch/mapping lineage',
] as const;

export type HbiAllowedCapability = (typeof HBI_ALLOWED_CAPABILITIES)[number];

export const HBI_REFUSED_CAPABILITIES = [
  'approve a custom link',
  'change a Procore/Sage/AHJ/camera system',
  'post to Sage',
  'make legal/accounting/claim determinations',
  'bypass user access or redaction',
] as const;

export type HbiRefusedCapability = (typeof HBI_REFUSED_CAPABILITIES)[number];

// ─── External system definition (registry record) ────────────────────────────

export interface IExternalSystemDefinition {
  readonly systemKey: ExternalSystemKey;
  readonly displayName: string;
  readonly category: ExternalSystemCategory;
  readonly posture: ExternalSystemPostureKind;
  readonly recordOwner: string;
  readonly mvpMode: ExternalSystemMvpMode;
  readonly liveReadPosture: ExternalSystemLiveReadPosture;
  readonly writebackPolicy: ExternalSystemWritebackPolicy;
  readonly notes: string;
}

// ─── Project external launch link (state-discriminated union) ────────────────

interface IProjectExternalLaunchLinkBase {
  readonly id: string;
  readonly projectId: PccProjectId;
  readonly projectNumber: PccProjectNumber;
  readonly systemKey: ExternalSystemKey;
  readonly linkType: ExternalLauncherType;
  readonly providerName: string;
  readonly title: string;
  readonly normalizedTargetKey: string;
  readonly launchUrl: string;
  readonly hostname: string;
  readonly openInNewTab: boolean;
  readonly requiresApproval: boolean;
  readonly sortOrder: number;
  readonly audiencePersonas: readonly PccPersona[];
  readonly iframeEligible: boolean;
  readonly currentImageEligible: boolean;
  readonly isActive: boolean;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
  readonly urlPolicyState: UrlPolicyReasonCode;
  readonly policyReason: UrlPolicyReasonCode;
}

/**
 * Discriminated union keyed on `approvalState`. Submitted/approved/rejected
 * branches require `submittedByUpn`+`submittedAtUtc`. Approved branch also
 * requires `approvedByUpn`+`approvedAtUtc`.
 */
export type IProjectExternalLaunchLink =
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'draft';
      readonly submittedByUpn?: string;
      readonly submittedAtUtc?: string;
      readonly approvedByUpn?: never;
      readonly approvedAtUtc?: never;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'submitted';
      readonly submittedByUpn: string;
      readonly submittedAtUtc: string;
      readonly approvedByUpn?: never;
      readonly approvedAtUtc?: never;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'approved';
      readonly submittedByUpn: string;
      readonly submittedAtUtc: string;
      readonly approvedByUpn: string;
      readonly approvedAtUtc: string;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'rejected';
      readonly submittedByUpn: string;
      readonly submittedAtUtc: string;
      readonly approvedByUpn?: never;
      readonly approvedAtUtc?: never;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'blocked-by-policy';
      readonly submittedByUpn?: string;
      readonly submittedAtUtc?: string;
      readonly approvedByUpn?: never;
      readonly approvedAtUtc?: never;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'archived';
      readonly submittedByUpn?: string;
      readonly submittedAtUtc?: string;
      readonly approvedByUpn?: string;
      readonly approvedAtUtc?: string;
    })
  | (IProjectExternalLaunchLinkBase & {
      readonly approvalState: 'superseded';
      readonly submittedByUpn?: string;
      readonly submittedAtUtc?: string;
      readonly approvedByUpn?: string;
      readonly approvedAtUtc?: string;
    });

// ─── Project external system mapping (state-discriminated union) ─────────────

interface IProjectExternalSystemMappingBase {
  readonly id: string;
  readonly projectId: PccProjectId;
  readonly projectNumber: PccProjectNumber;
  readonly systemKey: ExternalSystemKey;
  readonly mappingScope: 'project' | 'budget-code' | 'cost-code' | 'document-folder';
  readonly sourceObjectType: string;
  readonly externalDisplayName: string;
  readonly ownerPersona: PccPersona;
  readonly ownerUpn: string;
  readonly lastVerifiedAtUtc: string | null;
  readonly reviewItemId: string | null;
}

/**
 * Discriminated union keyed on `mappingState`. `mapped` / `confirmed` require
 * `externalObjectId`. `not-mapped` / `missing` forbid it.
 */
export type IProjectExternalSystemMapping =
  | (IProjectExternalSystemMappingBase & {
      readonly mappingState: 'not-mapped' | 'missing';
      readonly externalObjectId?: never;
      readonly externalObjectNumber?: never;
    })
  | (IProjectExternalSystemMappingBase & {
      readonly mappingState: 'mapped' | 'confirmed' | 'stale';
      readonly externalObjectId: string;
      readonly externalObjectNumber: string;
    })
  | (IProjectExternalSystemMappingBase & {
      readonly mappingState: 'conflict' | 'review-required' | 'blocked';
      readonly externalObjectId: string;
      readonly externalObjectNumber: string;
      readonly conflictingMappingId?: string;
    });

// ─── External object reference ───────────────────────────────────────────────

export interface IExternalObjectReference {
  readonly id: string;
  readonly projectId: PccProjectId;
  readonly systemKey: ExternalSystemKey;
  readonly objectType: string;
  readonly externalObjectId: string;
  readonly externalObjectNumber: string;
  readonly externalObjectDisplayName: string;
  readonly sourceUrl: string;
  readonly sourceOwner: string;
  readonly recordAuthority: 'source-of-truth' | 'shadow-copy' | 'reference-only';
  readonly lastSeenAtUtc: string;
  readonly lastVerifiedAtUtc: string;
  readonly permissionState: 'authorized' | 'unauthorized' | 'pending';
  readonly redactionState: 'visible' | 'redacted' | 'redacted-by-access';
}

// ─── External review item (state-discriminated union) ────────────────────────

interface IExternalReviewItemBase {
  readonly id: string;
  readonly projectId: PccProjectId;
  readonly systemKey: ExternalSystemKey;
  readonly issueType:
    | 'mapping-conflict'
    | 'stale-mapping'
    | 'missing-mapping'
    | 'access-issue'
    | 'custom-link-approval';
  readonly subjectKey: string;
  readonly currentOwnerPersona: PccPersona;
  readonly currentOwnerUpn: string;
  readonly priorityActionId: string | null;
  readonly approvalRequestId: string | null;
  readonly dueAtUtc: string | null;
  readonly issueSummary: string;
}

export type IExternalReviewItem =
  | (IExternalReviewItemBase & {
      readonly reviewState: 'pending' | 'in-progress' | 'suppressed';
      readonly resolutionSummary?: never;
    })
  | (IExternalReviewItemBase & {
      readonly reviewState: 'closed';
      readonly resolutionSummary: string;
    });

// ─── External system health snapshot (state-discriminated union) ─────────────

interface IExternalSystemHealthSnapshotBase {
  readonly healthSnapshotId: string;
  readonly projectId: PccProjectId;
  readonly systemKey: ExternalSystemKey;
  readonly severity: 'info' | 'warning' | 'critical';
  readonly observedAtUtc: string;
  readonly statusMessage: string;
  readonly recommendedAction: string | null;
}

/**
 * Discriminated by `healthState`. `unavailable`/`access-denied` redact
 * `lastSuccessfulReadAtUtc` (forbid carrying it); other states may carry it.
 */
export type IExternalSystemHealthSnapshot =
  | (IExternalSystemHealthSnapshotBase & {
      readonly healthState: 'unavailable' | 'access-denied' | 'unknown';
      readonly lastSuccessfulReadAtUtc?: never;
    })
  | (IExternalSystemHealthSnapshotBase & {
      readonly healthState:
        | 'healthy'
        | 'warning'
        | 'degraded'
        | 'missing-config'
        | 'throttled'
        | 'stale';
      readonly lastSuccessfulReadAtUtc: string | null;
    });

// ─── External system audit event ─────────────────────────────────────────────

export interface IExternalSystemAuditEvent {
  readonly eventId: string;
  readonly projectId: PccProjectId;
  readonly systemKey: ExternalSystemKey;
  readonly eventType: ExternalSystemAuditEventType;
  readonly actorUpn: string | null;
  readonly actorPersona: PccPersona | null;
  readonly occurredAtUtc: string;
  readonly subjectKey: string;
  readonly correlationId: string;
  readonly summary: string;
  readonly metadataJson: string;
}

// ─── HBI source lineage entry (state-discriminated union) ────────────────────

interface IHbiSourceLineageEntryBase {
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly transformationNote: string;
  readonly confidenceBand: 'high' | 'medium' | 'low';
  readonly freshnessBand: 'current' | 'stale-30d' | 'stale-90d' | 'stale-1y';
}

export type IHbiSourceLineageEntry =
  | (IHbiSourceLineageEntryBase & {
      readonly state: 'citation-ready';
      readonly sourceSystemKey: ExternalSystemKey;
      readonly sourceListOrSystem: string;
      readonly sourceObjectType: string;
      readonly sourceObjectId: string;
      readonly citationLabel: string;
      readonly permissionState: 'authorized';
      readonly redactionState: 'visible';
    })
  | (IHbiSourceLineageEntryBase & {
      readonly state: 'unauthorized';
      readonly sourceSystemKey: ExternalSystemKey;
      readonly permissionState: 'unauthorized';
      readonly redactionState: 'redacted';
      readonly sourceListOrSystem?: never;
      readonly sourceObjectType?: never;
      readonly sourceObjectId?: never;
      readonly citationLabel?: never;
    })
  | (IHbiSourceLineageEntryBase & {
      readonly state: 'refusal';
      readonly refusalCode: HbiRefusalReasonCode;
      readonly sourceSystemKey?: ExternalSystemKey;
      readonly permissionState?: 'authorized' | 'unauthorized';
      readonly redactionState?: 'visible' | 'redacted';
      readonly sourceListOrSystem?: never;
      readonly sourceObjectType?: never;
      readonly sourceObjectId?: never;
      readonly citationLabel?: never;
    })
  | (IHbiSourceLineageEntryBase & {
      readonly state: 'loading' | 'unavailable' | 'insufficient-evidence';
      readonly sourceSystemKey?: ExternalSystemKey;
      readonly permissionState?: 'authorized' | 'unauthorized' | 'redacted';
      readonly redactionState?: 'visible' | 'redacted';
      readonly sourceListOrSystem?: never;
      readonly sourceObjectType?: never;
      readonly sourceObjectId?: never;
      readonly citationLabel?: never;
    });

// ─── Composite read model + per-section read models ──────────────────────────

export interface IPccExternalSystemsLaunchPadReadModelSummary {
  readonly totalProjects: number;
  readonly activeLinks: number;
  readonly mappingsWithWarnings: number;
  readonly pendingReviews: number;
}

export interface IPccExternalSystemsLaunchPadReadModelUrlPolicy {
  readonly evaluatedAtUtc: string;
  readonly allowedSchemes: readonly string[];
  readonly blockedSchemes: readonly string[];
  readonly blockedHosts: readonly string[];
  readonly approvedHostsBySystem: Readonly<Record<string, readonly string[]>>;
}

export interface IPccExternalSystemsLaunchPadReadModelDegradedStateRow {
  readonly state: ExternalSystemDegradedState;
  readonly affectedCount: number;
}

export interface IPccExternalSystemsLaunchPadReadModelRoleAction {
  readonly roleId: ExternalSystemRoleId;
  readonly actionId: ExternalSystemActionId;
  readonly decision: 'allow' | 'deny' | 'allow-with-redaction' | 'allow-with-approval';
}

export interface IPccExternalSystemsLaunchPadReadModel {
  readonly summary: IPccExternalSystemsLaunchPadReadModelSummary;
  readonly systemDefinitions: readonly IExternalSystemDefinition[];
  readonly projectLaunchLinks: readonly IProjectExternalLaunchLink[];
  readonly projectMappings: readonly IProjectExternalSystemMapping[];
  readonly objectReferences: readonly IExternalObjectReference[];
  readonly reviewItems: readonly IExternalReviewItem[];
  readonly healthSnapshots: readonly IExternalSystemHealthSnapshot[];
  readonly auditEvents: readonly IExternalSystemAuditEvent[];
  readonly hbiLineage: readonly IHbiSourceLineageEntry[];
  readonly roleActionMatrix?: readonly IPccExternalSystemsLaunchPadReadModelRoleAction[];
  readonly urlPolicy?: IPccExternalSystemsLaunchPadReadModelUrlPolicy;
  readonly degradedStates?: readonly IPccExternalSystemsLaunchPadReadModelDegradedStateRow[];
}

export interface IPccExternalSystemRegistryReadModel {
  readonly systems: readonly IExternalSystemDefinition[];
}

export interface IPccProjectExternalLaunchLinksReadModel {
  readonly projectId: PccProjectId;
  readonly links: readonly IProjectExternalLaunchLink[];
}

export interface IPccProjectExternalSystemMappingsReadModel {
  readonly projectId: PccProjectId;
  readonly mappings: readonly IProjectExternalSystemMapping[];
}

export interface IPccExternalObjectReferencesReadModel {
  readonly projectId: PccProjectId;
  readonly references: readonly IExternalObjectReference[];
}

export interface IPccExternalReviewItemsReadModel {
  readonly projectId: PccProjectId;
  readonly items: readonly IExternalReviewItem[];
}

export interface IPccExternalSystemHealthSnapshotsReadModel {
  readonly projectId: PccProjectId;
  readonly snapshots: readonly IExternalSystemHealthSnapshot[];
}

export interface IPccExternalSystemAuditEventsReadModel {
  readonly projectId: PccProjectId;
  readonly events: readonly IExternalSystemAuditEvent[];
}

export interface IPccHbiSourceLineageReadModel {
  readonly projectId: PccProjectId;
  readonly entries: readonly IHbiSourceLineageEntry[];
}

// ─── Envelope-typed aliases (consumed by the read-model response map) ────────

export type PccExternalSystemsLaunchPadReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>;
export type PccExternalSystemRegistryReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalSystemRegistryReadModel>;
export type PccProjectExternalLaunchLinksReadModelEnvelope =
  PccReadModelEnvelope<IPccProjectExternalLaunchLinksReadModel>;
export type PccProjectExternalSystemMappingsReadModelEnvelope =
  PccReadModelEnvelope<IPccProjectExternalSystemMappingsReadModel>;
export type PccExternalObjectReferencesReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalObjectReferencesReadModel>;
export type PccExternalReviewItemsReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalReviewItemsReadModel>;
export type PccExternalSystemHealthSnapshotsReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalSystemHealthSnapshotsReadModel>;
export type PccExternalSystemAuditEventsReadModelEnvelope =
  PccReadModelEnvelope<IPccExternalSystemAuditEventsReadModel>;
export type PccHbiSourceLineageReadModelEnvelope =
  PccReadModelEnvelope<IPccHbiSourceLineageReadModel>;

// ─── External system registry (verbatim mirror of registry contract JSON) ────

export const EXTERNAL_SYSTEM_REGISTRY: Readonly<
  Record<ExternalSystemKey, IExternalSystemDefinition>
> = {
  sharepoint: {
    systemKey: 'sharepoint',
    displayName: 'SharePoint',
    category: 'microsoft-365',
    posture: 'mvp-required',
    recordOwner: 'SharePoint/PCC provisioning contract',
    mvpMode: 'launch-and-source-context',
    liveReadPosture: 'backend-mediated-future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  onedrive: {
    systemKey: 'onedrive',
    displayName: 'OneDrive',
    category: 'microsoft-365',
    posture: 'mvp-required',
    recordOwner: 'Microsoft 365/user-owned storage',
    mvpMode: 'launch-only',
    liveReadPosture: 'backend-mediated-future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  teams: {
    systemKey: 'teams',
    displayName: 'Microsoft Teams',
    category: 'microsoft-365',
    posture: 'mvp-required',
    recordOwner: 'Microsoft Teams',
    mvpMode: 'launch-only',
    liveReadPosture: 'backend-mediated-future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  'outlook-calendar': {
    systemKey: 'outlook-calendar',
    displayName: 'Outlook Calendar',
    category: 'microsoft-365',
    posture: 'mvp-optional',
    recordOwner: 'Outlook/Exchange',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  procore: {
    systemKey: 'procore',
    displayName: 'Procore',
    category: 'project-management',
    posture: 'mvp-required',
    recordOwner: 'Procore for native records; PCC for mapping',
    mvpMode: 'launch-mapping-health-fixture',
    liveReadPosture: 'backend-mediated-future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  'sage-intacct': {
    systemKey: 'sage-intacct',
    displayName: 'Sage Intacct',
    category: 'accounting',
    posture: 'mvp-required',
    recordOwner: 'Sage Intacct accounting book of record',
    mvpMode: 'launch-and-mapping-context',
    liveReadPosture: 'backend-mediated-future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  timberscan: {
    systemKey: 'timberscan',
    displayName: 'Timberscan',
    category: 'accounting',
    posture: 'conditional',
    recordOwner: 'Timberscan/accounting workflow owner',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  compass: {
    systemKey: 'compass',
    displayName: 'Compass',
    category: 'prequalification',
    posture: 'mvp-required',
    recordOwner: 'Compass / Bespoke Metrics',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  'document-crunch': {
    systemKey: 'document-crunch',
    displayName: 'Document Crunch',
    category: 'contract-analysis',
    posture: 'conditional',
    recordOwner: 'Document Crunch for analysis outputs',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  'adobe-sign': {
    systemKey: 'adobe-sign',
    displayName: 'Adobe Sign',
    category: 'esignature',
    posture: 'mvp-optional',
    recordOwner: 'Adobe Sign signature transaction',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  docusign: {
    systemKey: 'docusign',
    displayName: 'DocuSign',
    category: 'esignature',
    posture: 'conditional',
    recordOwner: 'DocuSign signature transaction',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  'autodesk-acc': {
    systemKey: 'autodesk-acc',
    displayName: 'Autodesk Construction Cloud',
    category: 'design-construction-platform',
    posture: 'conditional',
    recordOwner: 'Autodesk/ACC native records',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  unanet: {
    systemKey: 'unanet',
    displayName: 'Unanet',
    category: 'crm-business-development',
    posture: 'conditional',
    recordOwner: 'Unanet CRM',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  permitting: {
    systemKey: 'permitting',
    displayName: 'Permitting / AHJ / Private Provider Portal',
    category: 'permitting',
    posture: 'project-configurable',
    recordOwner: 'AHJ or private provider owns official status; PCC owns launcher',
    mvpMode: 'project-configurable-multiple-instances',
    liveReadPosture: 'not-authorized',
    writebackPolicy: 'prohibited',
    notes: '',
  },
  truelook: {
    systemKey: 'truelook',
    displayName: 'TrueLook',
    category: 'progress-camera',
    posture: 'project-configurable',
    recordOwner: 'TrueLook',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  earthcam: {
    systemKey: 'earthcam',
    displayName: 'EarthCam',
    category: 'progress-camera',
    posture: 'project-configurable',
    recordOwner: 'EarthCam',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  oxblue: {
    systemKey: 'oxblue',
    displayName: 'OxBlue',
    category: 'progress-camera',
    posture: 'project-configurable',
    recordOwner: 'OxBlue',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  'sensera-sitecloud': {
    systemKey: 'sensera-sitecloud',
    displayName: 'Sensera Systems / SiteCloud',
    category: 'progress-camera',
    posture: 'project-configurable',
    recordOwner: 'Sensera Systems / SiteCloud',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  evercam: {
    systemKey: 'evercam',
    displayName: 'Evercam',
    category: 'progress-camera',
    posture: 'project-configurable',
    recordOwner: 'Evercam',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  openspace: {
    systemKey: 'openspace',
    displayName: 'OpenSpace',
    category: 'reality-capture',
    posture: 'project-configurable',
    recordOwner: 'OpenSpace',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  dronedeploy: {
    systemKey: 'dronedeploy',
    displayName: 'DroneDeploy',
    category: 'drone-reality-capture',
    posture: 'project-configurable',
    recordOwner: 'DroneDeploy',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  cupix: {
    systemKey: 'cupix',
    displayName: 'Cupix',
    category: 'reality-capture',
    posture: 'conditional',
    recordOwner: 'Cupix',
    mvpMode: 'launch-only',
    liveReadPosture: 'future-gated',
    writebackPolicy: 'prohibited',
    notes: 'Iframe/current-image support for camera systems is TODO/future-gated.',
  },
  'custom-link': {
    systemKey: 'custom-link',
    displayName: 'Custom Project Link',
    category: 'custom',
    posture: 'project-configurable-approval-gated',
    recordOwner: 'PCC owns launcher; external site owns content',
    mvpMode: 'project-configurable-approval-required',
    liveReadPosture: 'not-authorized',
    writebackPolicy: 'prohibited',
    notes: '',
  },
};

// ─── Launcher type registry (verbatim mirror of launcher_type_registry.json) ─

export interface IExternalLauncherTypeRegistryEntry {
  readonly type: ExternalLauncherType;
  readonly approvalRequired: boolean;
  readonly multiplePerProject: boolean;
  readonly requiredApproverRoles?: readonly ExternalSystemRoleId[];
}

export const EXTERNAL_LAUNCHER_TYPE_REGISTRY: readonly IExternalLauncherTypeRegistryEntry[] = [
  { type: 'system', approvalRequired: false, multiplePerProject: true },
  { type: 'ahj-portal', approvalRequired: false, multiplePerProject: true },
  { type: 'private-provider-portal', approvalRequired: false, multiplePerProject: true },
  { type: 'progress-camera', approvalRequired: false, multiplePerProject: true },
  {
    type: 'custom',
    approvalRequired: true,
    multiplePerProject: true,
    requiredApproverRoles: ['project-manager', 'project-executive'],
  },
  { type: 'accounting', approvalRequired: false, multiplePerProject: true },
];
