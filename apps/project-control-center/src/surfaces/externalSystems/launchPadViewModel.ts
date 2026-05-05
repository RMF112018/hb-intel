/**
 * PCC External Systems Launch Pad view-model contract (Phase 3 / Wave 15 / Prompt 05).
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
 * Prompt 05 scope renders header, summary band, and Project Launch Links
 * only. Review queue, audit history, registry inventory, mapping health,
 * and HBI lineage are deferred to later Wave 15 prompts and intentionally
 * absent from this view-model.
 */

import type {
  ExternalLauncherType,
  ExternalSystemCategory,
  ExternalSystemKey,
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
// Lane IDs (one card per id in the ready path)
// ---------------------------------------------------------------------------

export const PCC_LAUNCH_PAD_LANE_IDS = [
  'header',
  'summary',
  'project-links',
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
   * fully approved. Even when `true`, Prompt 05 renders an inert/disabled
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
// Discriminated union — surface ready/loading/error
// ---------------------------------------------------------------------------

export interface IPccLaunchPadReadyViewModel {
  readonly status: 'ready';
  readonly cardState: PccPreviewStateKind;
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly header: IPccLaunchPadHeaderViewModel;
  readonly summary: IPccLaunchPadSummaryViewModel;
  readonly projectLinks: IPccLaunchPadProjectLinksViewModel;
}

export type IPccLaunchPadViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | IPccLaunchPadReadyViewModel;

// ---------------------------------------------------------------------------
// Re-export the link record alias for adapter inputs
// ---------------------------------------------------------------------------

export type { IProjectExternalLaunchLink };
