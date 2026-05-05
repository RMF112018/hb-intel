/**
 * PCC External Systems Launch Pad view-model contract (Phase 3 / Wave 15).
 *
 * Authoritative shape returned by `buildPccLaunchPadViewModel`. Discriminated
 * union (`loading` / `error` / `ready`) mirroring the Wave 14 Approvals
 * pattern. Each lane carries the data its dedicated card needs without
 * re-walking the read-model.
 *
 * The narrow read-model client interface lists only `getExternalSystemsLaunchPad`
 * so non-api consumers can type the client prop without re-exporting the
 * full `IPccReadModelClient` surface.
 *
 * Prompt 05 scope: header, summary band, Project Launch Links card.
 * Prompt 06 scope adds: Custom Link Review Queue card, read-only Review
 * Item detail panel, and the Add/Edit Project Link drawer (controlled,
 * inert preview — local-only state, no commands, no writes).
 * Prompt 07 scope adds: External System Registry, Mapping Status (with
 * inline mapping detail), Source Health, Audit History (with metadata
 * redacted), and HBI Source Lineage cards. All read-only / display-only;
 * HBI no-authority preserved by structure, copy, and a forbidden-button
 * scan.
 */

import type {
  ExternalLauncherType,
  ExternalReviewState,
  ExternalSystemActionId,
  ExternalSystemAuditEventType,
  ExternalSystemCategory,
  ExternalSystemKey,
  ExternalSystemLiveReadPosture,
  ExternalSystemMappingState,
  ExternalSystemMvpMode,
  ExternalSystemPostureKind,
  ExternalSystemSourceHealthState,
  ExternalSystemWritebackPolicy,
  HbiRefusalReasonCode,
  HbiSourceLineageState,
  IExternalReviewItem,
  IExternalSystemAuditEvent,
  IExternalSystemHealthSnapshot,
  IPccExternalSystemsLaunchPadReadModel,
  IPccExternalSystemsLaunchPadReadModelSummary,
  IProjectExternalLaunchLink,
  IProjectExternalSystemMapping,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  ProjectExternalLinkApprovalState,
  UrlPolicyReasonCode,
} from '@hbc/models/pcc';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';

// ---------------------------------------------------------------------------
// Narrow read-model client interface — single method
// ---------------------------------------------------------------------------

export interface IPccLaunchPadReadModelClient {
  getExternalSystemsLaunchPad(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>>;
}

// ---------------------------------------------------------------------------
// Lane IDs (one card / lane per id in the ready path)
// ---------------------------------------------------------------------------

export const PCC_LAUNCH_PAD_LANE_IDS = [
  'header',
  'summary',
  'project-links',
  'review-queue',
  'review-queue-detail',
  'add-edit-link-drawer',
  'procore-status',
  // Wave 15 / Prompt 07 — registry, mapping, health, audit, HBI lineage lanes.
  'registry',
  'mapping-status',
  'mapping-status-detail',
  'source-health',
  'audit-history',
  'hbi-lineage',
] as const;
export type PccLaunchPadLaneId = (typeof PCC_LAUNCH_PAD_LANE_IDS)[number];

// ---------------------------------------------------------------------------
// Per-link row — derived from IProjectExternalLaunchLink + registry
// ---------------------------------------------------------------------------

export interface IPccLaunchPadLinkRow {
  readonly id: string;
  readonly title: string;
  readonly providerName: string;
  readonly systemKey: ExternalSystemKey;
  readonly systemDisplayName: string;
  readonly category: ExternalSystemCategory;
  readonly linkType: ExternalLauncherType;
  readonly hostname: string;
  readonly openInNewTab: boolean;
  readonly approvalState: ProjectExternalLinkApprovalState;
  readonly urlPolicyState: UrlPolicyReasonCode;
  readonly policyReason: UrlPolicyReasonCode;
  /**
   * `true` only when both the URL policy permits the link AND the link is
   * fully approved. Even when `true`, Prompt 05/06 render an inert/disabled
   * launch affordance — never an executable external anchor. Active launch
   * behavior is staged to a later prompt.
   */
  readonly policyAndApprovalAllowed: boolean;
  /**
   * User-visible reason caption. For inert/disabled launch affordances,
   * this is the policy or approval-state reason in product-safe copy.
   */
  readonly disabledReason: string;
}

export interface IPccLaunchPadLinkGroup {
  readonly category: ExternalSystemCategory;
  readonly rows: readonly IPccLaunchPadLinkRow[];
}

// ---------------------------------------------------------------------------
// Header view-model — surface-level project context
// ---------------------------------------------------------------------------

export interface IPccLaunchPadHeaderViewModel {
  readonly projectId: PccProjectId | undefined;
  readonly subtitle: string;
}

// ---------------------------------------------------------------------------
// Summary band view-model — counts from composite summary
// ---------------------------------------------------------------------------

export type IPccLaunchPadSummaryViewModel = IPccExternalSystemsLaunchPadReadModelSummary;

// ---------------------------------------------------------------------------
// Project Launch Links lane view-model
// ---------------------------------------------------------------------------

export interface IPccLaunchPadProjectLinksViewModel {
  readonly totalLinks: number;
  readonly groups: readonly IPccLaunchPadLinkGroup[];
}

// ---------------------------------------------------------------------------
// Review Queue lane view-model (Prompt 06)
// ---------------------------------------------------------------------------

export interface IPccLaunchPadReviewItemRow {
  readonly id: string;
  readonly issueType: IExternalReviewItem['issueType'];
  readonly reviewState: ExternalReviewState;
  readonly systemKey: ExternalSystemKey;
  readonly systemDisplayName: string;
  readonly subjectKey: string;
  readonly subjectLinkRow?: IPccLaunchPadLinkRow;
  readonly currentOwnerPersona: PccPersona;
  readonly currentOwnerUpn: string;
  readonly priorityActionId: string | null;
  readonly approvalRequestId: string | null;
  readonly dueAtUtc: string | null;
  readonly dueAtDisplay: string;
  readonly issueSummary: string;
  readonly resolutionSummary?: string;
}

export interface IPccLaunchPadReviewQueueGroup {
  readonly reviewState: ExternalReviewState;
  readonly rows: readonly IPccLaunchPadReviewItemRow[];
}

export interface IPccLaunchPadReviewQueueViewModel {
  readonly totalItems: number;
  readonly groups: readonly IPccLaunchPadReviewQueueGroup[];
}

// ---------------------------------------------------------------------------
// Role/action visibility — drives disabled-reason copy only (no authority)
// ---------------------------------------------------------------------------

export type PccLaunchPadActionDecision =
  | 'allow'
  | 'deny'
  | 'allow-with-redaction'
  | 'allow-with-approval';

export type IPccLaunchPadRoleActionVisibility = Readonly<
  Partial<Record<ExternalSystemActionId, PccLaunchPadActionDecision>>
>;

// ---------------------------------------------------------------------------
// Registry inventory (Prompt 07)
// ---------------------------------------------------------------------------

/**
 * `'launch-only-inactive'` is mapped from `liveReadPosture: 'not-authorized'`
 * (live read explicitly forbidden — launcher only). All other systems are
 * considered `'active'`. The Wave 15 contract has no hard "inactive" flag;
 * this mapping satisfies the Prompt 07 "registry active/inactive" UX brief.
 */
export type PccLaunchPadRegistryActiveState = 'active' | 'launch-only-inactive';

export interface IPccLaunchPadRegistryRow {
  readonly systemKey: ExternalSystemKey;
  readonly displayName: string;
  readonly category: ExternalSystemCategory;
  readonly posture: ExternalSystemPostureKind;
  readonly mvpMode: ExternalSystemMvpMode;
  readonly liveReadPosture: ExternalSystemLiveReadPosture;
  readonly writebackPolicy: ExternalSystemWritebackPolicy;
  readonly activeState: PccLaunchPadRegistryActiveState;
  readonly recordOwner: string;
  readonly notes: string;
}

export interface IPccLaunchPadRegistryGroup {
  readonly posture: ExternalSystemPostureKind;
  readonly rows: readonly IPccLaunchPadRegistryRow[];
}

export interface IPccLaunchPadRegistryViewModel {
  readonly totalSystems: number;
  readonly groups: readonly IPccLaunchPadRegistryGroup[];
}

// ---------------------------------------------------------------------------
// Mapping status + inline detail (Prompt 07)
// ---------------------------------------------------------------------------

export interface IPccLaunchPadMappingRow {
  readonly id: string;
  readonly systemKey: ExternalSystemKey;
  readonly systemDisplayName: string;
  readonly mappingState: ExternalSystemMappingState;
  readonly mappingScope: IProjectExternalSystemMapping['mappingScope'];
  readonly sourceObjectType: string;
  readonly externalDisplayName: string;
  readonly ownerPersona: PccPersona;
  readonly ownerUpn: string;
  readonly lastVerifiedAtUtc: string | null;
  readonly lastVerifiedDisplay: string;
  readonly externalObjectId?: string;
  readonly externalObjectNumber?: string;
  readonly conflictingMappingId?: string;
  readonly reviewItemId: string | null;
}

export interface IPccLaunchPadMappingStatusGroup {
  readonly mappingState: ExternalSystemMappingState;
  readonly rows: readonly IPccLaunchPadMappingRow[];
}

export interface IPccLaunchPadMappingStatusViewModel {
  readonly totalMappings: number;
  readonly groups: readonly IPccLaunchPadMappingStatusGroup[];
}

// ---------------------------------------------------------------------------
// Source health snapshots (Prompt 07)
// ---------------------------------------------------------------------------

export type PccLaunchPadHealthSeverity = IExternalSystemHealthSnapshot['severity'];

export interface IPccLaunchPadHealthRow {
  readonly healthSnapshotId: string;
  readonly systemKey: ExternalSystemKey;
  readonly systemDisplayName: string;
  readonly healthState: ExternalSystemSourceHealthState;
  readonly severity: PccLaunchPadHealthSeverity;
  readonly statusMessage: string;
  readonly recommendedAction: string | null;
  readonly observedAtUtc: string;
  readonly observedAtDisplay: string;
  readonly lastSuccessfulReadAtUtc?: string | null;
  readonly lastSuccessfulReadDisplay?: string;
}

export interface IPccLaunchPadSourceHealthGroup {
  readonly severity: PccLaunchPadHealthSeverity;
  readonly rows: readonly IPccLaunchPadHealthRow[];
}

export interface IPccLaunchPadSourceHealthViewModel {
  readonly totalSnapshots: number;
  readonly groups: readonly IPccLaunchPadSourceHealthGroup[];
}

// ---------------------------------------------------------------------------
// Audit history (Prompt 07) — metadata redacted by construction
// ---------------------------------------------------------------------------

/**
 * `metadataJson` is intentionally absent from this row. The adapter never
 * copies that field onto the view-model; the audit card never renders it
 * to text, `data-*`, `title`, or `aria-label`. The hard gate is no
 * rendered or exposed metadata — the field name itself is unbanned in
 * source-scan because legitimate fixture/test code references it.
 */
export interface IPccLaunchPadAuditEventRow {
  readonly eventId: string;
  readonly eventType: ExternalSystemAuditEventType;
  readonly systemKey: ExternalSystemKey;
  readonly systemDisplayName: string;
  readonly actorPersona: PccPersona | null;
  readonly actorUpn: string | null;
  readonly actorDisplay: string;
  readonly occurredAtUtc: string;
  readonly occurredAtDisplay: string;
  readonly subjectKey: string;
  readonly correlationId: string;
  readonly summary: string;
}

export interface IPccLaunchPadAuditHistoryViewModel {
  readonly totalEvents: number;
  readonly rows: readonly IPccLaunchPadAuditEventRow[];
}

// ---------------------------------------------------------------------------
// HBI source lineage (Prompt 07) — discriminated by state, no authority
// ---------------------------------------------------------------------------

interface IPccLaunchPadHbiLineageEntryBase {
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly transformationNote: string;
  readonly confidenceBand: 'high' | 'medium' | 'low';
  readonly freshnessBand: 'current' | 'stale-30d' | 'stale-90d' | 'stale-1y';
}

export type IPccLaunchPadHbiLineageEntry =
  | (IPccLaunchPadHbiLineageEntryBase & {
      readonly state: 'citation-ready';
      readonly sourceSystemKey: ExternalSystemKey;
      readonly sourceListOrSystem: string;
      readonly sourceObjectType: string;
      readonly citationLabel: string;
    })
  | (IPccLaunchPadHbiLineageEntryBase & {
      readonly state: 'refusal';
      readonly refusalCode: HbiRefusalReasonCode;
      readonly refusalCopy: string;
    })
  | (IPccLaunchPadHbiLineageEntryBase & {
      readonly state: 'unauthorized';
      readonly redactedCaption: string;
    })
  | (IPccLaunchPadHbiLineageEntryBase & {
      readonly state: 'loading' | 'unavailable' | 'insufficient-evidence';
    });

export interface IPccLaunchPadHbiLineageGroup {
  readonly state: HbiSourceLineageState;
  readonly rows: readonly IPccLaunchPadHbiLineageEntry[];
}

export interface IPccLaunchPadHbiLineageViewModel {
  readonly totalEntries: number;
  readonly groups: readonly IPccLaunchPadHbiLineageGroup[];
  /**
   * Always-rendered authority disclaimer ("HBI is not an authority. Citation-
   * ready entries reflect lineage only — HBI never approves, posts, claims,
   * or overrides."). The card structurally renders this regardless of which
   * states are present in the grouped rows.
   */
  readonly boundaryCopy: string;
}

// ---------------------------------------------------------------------------
// Discriminated union — surface ready/loading/error
// ---------------------------------------------------------------------------

export interface IPccLaunchPadReadyViewModel {
  readonly status: 'ready';
  readonly cardState: PccPreviewStateKind;
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly header: IPccLaunchPadHeaderViewModel;
  readonly summary: IPccLaunchPadSummaryViewModel;
  readonly projectLinks: IPccLaunchPadProjectLinksViewModel;
  readonly reviewQueue: IPccLaunchPadReviewQueueViewModel;
  readonly roleActionVisibility: IPccLaunchPadRoleActionVisibility;
  readonly registry: IPccLaunchPadRegistryViewModel;
  readonly mappingStatus: IPccLaunchPadMappingStatusViewModel;
  readonly sourceHealth: IPccLaunchPadSourceHealthViewModel;
  readonly auditHistory: IPccLaunchPadAuditHistoryViewModel;
  readonly hbiLineage: IPccLaunchPadHbiLineageViewModel;
}

export type IPccLaunchPadViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | IPccLaunchPadReadyViewModel;

// ---------------------------------------------------------------------------
// Re-export domain aliases consumed by adapter inputs
// ---------------------------------------------------------------------------

export type {
  IExternalReviewItem,
  IExternalSystemAuditEvent,
  IExternalSystemHealthSnapshot,
  IProjectExternalLaunchLink,
  IProjectExternalSystemMapping,
};
