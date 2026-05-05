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
 *
 * Registry inventory, mapping health, audit history, and HBI lineage are
 * intentionally absent — Prompts 07/08 own those surfaces.
 */

import type {
  ExternalLauncherType,
  ExternalReviewState,
  ExternalSystemActionId,
  ExternalSystemCategory,
  ExternalSystemKey,
  IExternalReviewItem,
  IPccExternalSystemsLaunchPadReadModel,
  IPccExternalSystemsLaunchPadReadModelSummary,
  IProjectExternalLaunchLink,
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
}

export type IPccLaunchPadViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | IPccLaunchPadReadyViewModel;

// ---------------------------------------------------------------------------
// Re-export domain aliases consumed by adapter inputs
// ---------------------------------------------------------------------------

export type { IExternalReviewItem, IProjectExternalLaunchLink };
