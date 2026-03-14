/**
 * W0-G3-T06: Summary field registry, status labels, department labels, urgency indicators.
 *
 * This is the single source of truth for which fields appear in a project setup
 * summary view and how they map to complexity tiers. Surfaces must import these
 * registries — they must not redefine field sets or role-check visibility.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T06-Summary-View-Expandable-History-and-Complexity-Rules.md
 */
import type { ComplexityTier } from '@hbc/complexity';
import type { ProjectSetupRequestState } from '@hbc/models';
import type { BicUrgencyTier } from '@hbc/bic-next-move';

// ─── Status Label Map ─────────────────────────────────────────────────────────

/**
 * Human-readable labels for every project setup request state.
 * Surfaces display the mapped label — they do not invent display strings.
 */
export const PROJECT_SETUP_STATUS_LABELS: Readonly<Record<ProjectSetupRequestState, string>> = {
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  NeedsClarification: 'Clarification Needed',
  AwaitingExternalSetup: 'Awaiting External Setup',
  ReadyToProvision: 'Queued for Provisioning',
  Provisioning: 'Provisioning',
  Completed: 'Completed',
  Failed: 'Failed',
};

// ─── Department Display Labels ────────────────────────────────────────────────

/**
 * Display labels for department identifiers.
 * Keyed by the canonical department slug used in IProjectSetupRequest.department.
 */
export const DEPARTMENT_DISPLAY_LABELS: Readonly<Record<string, string>> = {
  'commercial': 'Commercial',
  'luxury-residential': 'Luxury Residential',
};

// ─── Urgency Display ──────────────────────────────────────────────────────────

export interface IUrgencyIndicator {
  label: string;
  color: 'red' | 'yellow' | 'green';
}

/**
 * Visual indicator configuration for each BIC urgency tier.
 */
export const URGENCY_INDICATOR_MAP: Readonly<Record<BicUrgencyTier, IUrgencyIndicator>> = {
  immediate: { label: 'Immediate', color: 'red' },
  watch: { label: 'Watch', color: 'yellow' },
  upcoming: { label: 'Upcoming', color: 'green' },
};

// ─── Summary Field Registry ──────────────────────────────────────────────────

export type SummaryFieldSource = 'request' | 'bic' | 'provisioning';

export interface ISummaryFieldDescriptor {
  readonly fieldId: string;
  readonly label: string;
  readonly source: SummaryFieldSource;
  readonly sourcePath: string;
  readonly minTier?: ComplexityTier;
  readonly maxTier?: ComplexityTier;
  /** Human-readable condition for conditional visibility (e.g. "state=Completed"). */
  readonly visibleWhen?: string;
}

/**
 * Canonical field registry for project setup summary views.
 *
 * Fields are ordered by tier (ungated → standard → expert). Surfaces render
 * fields in this order, filtered by the current complexity tier using
 * HbcComplexityGate or the helper functions in complexity-gate-helpers.ts.
 */
export const PROJECT_SETUP_SUMMARY_FIELDS: readonly ISummaryFieldDescriptor[] = [
  // ── Core fields (always visible, no gate) ──
  { fieldId: 'projectName', label: 'Project Name', source: 'request', sourcePath: 'IProjectSetupRequest.projectName' },
  { fieldId: 'department', label: 'Department', source: 'request', sourcePath: 'IProjectSetupRequest.department' },
  { fieldId: 'statusLabel', label: 'Current Status', source: 'request', sourcePath: 'IProjectSetupRequest.state → PROJECT_SETUP_STATUS_LABELS' },
  { fieldId: 'currentOwner', label: 'Current Owner', source: 'bic', sourcePath: 'IBicNextMoveState.currentOwner.displayName' },
  { fieldId: 'expectedAction', label: 'Expected Action', source: 'bic', sourcePath: 'IBicNextMoveState.expectedAction' },
  { fieldId: 'submittedAt', label: 'Submitted', source: 'request', sourcePath: 'IProjectSetupRequest.submittedAt' },
  { fieldId: 'urgencyTier', label: 'Urgency', source: 'bic', sourcePath: 'IBicNextMoveState.urgencyTier' },
  // ── Core fields visible conditionally (no tier gate) ──
  { fieldId: 'siteUrl', label: 'Provisioned Site', source: 'request', sourcePath: 'IProjectSetupRequest.siteUrl', visibleWhen: 'state=Completed' },
  { fieldId: 'bicBadge', label: 'BIC Badge', source: 'bic', sourcePath: 'IBicNextMoveState (compact: name + urgency dot)' },
  // ── Standard tier ──
  { fieldId: 'bicDetail', label: 'BIC Detail Chain', source: 'bic', sourcePath: 'IBicNextMoveState (previous → current → next)', minTier: 'standard' },
  { fieldId: 'blockedReason', label: 'Blocked Reason', source: 'bic', sourcePath: 'IBicNextMoveState.blockedReason', minTier: 'standard' },
  { fieldId: 'teamMembers', label: 'Team Members', source: 'request', sourcePath: 'IProjectSetupRequest.groupMembers + projectLeadId', minTier: 'standard' },
  { fieldId: 'addOns', label: 'Add-ons Selected', source: 'request', sourcePath: 'IProjectSetupRequest.addOns', minTier: 'standard' },
  { fieldId: 'projectNumber', label: 'Project Number', source: 'request', sourcePath: 'IProjectSetupRequest.projectNumber', minTier: 'standard' },
  { fieldId: 'estimatedValue', label: 'Estimated Value', source: 'request', sourcePath: 'IProjectSetupRequest.estimatedValue', minTier: 'standard' },
  { fieldId: 'clarificationCount', label: 'Clarifications', source: 'request', sourcePath: 'IProjectSetupRequest.clarificationItems (open/responded count)', minTier: 'standard' },
  { fieldId: 'stepCount', label: 'Provisioning Steps', source: 'provisioning', sourcePath: 'IProvisioningStatus.steps (completed/total)', minTier: 'standard' },
  // ── Expert tier ──
  { fieldId: 'entraGroupIds', label: 'Entra ID Groups', source: 'provisioning', sourcePath: 'IProvisioningStatus.entraGroups', minTier: 'expert' },
  { fieldId: 'lastSagaStep', label: 'Last Saga Step', source: 'provisioning', sourcePath: 'ISagaStepResult (last completed)', minTier: 'expert' },
] as const;

/** Core summary fields (no tier gate). */
export const CORE_SUMMARY_FIELD_IDS = PROJECT_SETUP_SUMMARY_FIELDS
  .filter((f) => !f.minTier)
  .map((f) => f.fieldId);
