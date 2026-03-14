/**
 * W0-G3-T06: History level model and content descriptors.
 *
 * Defines three progressive history levels (0 = Core Summary, 1 = Activity
 * Timeline, 2 = Operational Detail) and the content items available at each
 * level. Surfaces use these descriptors with HbcComplexityGate to control
 * progressive disclosure of history data.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T06-Summary-View-Expandable-History-and-Complexity-Rules.md
 */
import type { ComplexityTier } from '@hbc/complexity';
import { evaluateGate } from '@hbc/complexity';

// ─── History Levels ───────────────────────────────────────────────────────────

export type HistoryLevel = 0 | 1 | 2;

export interface IHistoryContentDescriptor {
  readonly contentId: string;
  readonly label: string;
  readonly level: HistoryLevel;
  readonly minTier?: ComplexityTier;
  readonly maxTier?: ComplexityTier;
  readonly sourcePath: string;
}

export const HISTORY_LEVEL_LABELS: Readonly<Record<HistoryLevel, string>> = {
  0: 'Core Summary',
  1: 'Activity Timeline',
  2: 'Operational Detail',
};

/**
 * Canonical content descriptors for project setup history.
 *
 * Level 0 = summary fields (defined in summary-field-registry.ts; no separate
 * history content). Levels 1 and 2 add progressively deeper detail.
 */
export const PROJECT_SETUP_HISTORY_CONTENT: readonly IHistoryContentDescriptor[] = [
  // ── Level 1 — Activity Timeline ──
  { contentId: 'lifecycleTransitions', label: 'Lifecycle State Transitions', level: 1, sourcePath: 'IProvisioningStatus.stateTransitionHistory (future) / timestamps' },
  { contentId: 'clarificationPairs', label: 'Clarification Requests & Responses', level: 1, sourcePath: 'IRequestClarification[] (raisedBy, raisedAt, status, respondedAt)' },
  { contentId: 'clarificationRaiser', label: 'Who Raised Clarification', level: 1, sourcePath: 'IRequestClarification.raisedBy' },
  { contentId: 'handoffEvents', label: 'Handoff Events', level: 1, sourcePath: 'IHandoffPackage.status + timestamps' },
  { contentId: 'notificationEvents', label: 'Notification Events', level: 1, minTier: 'standard', sourcePath: 'notification-registrations (15 events)' },
  { contentId: 'clarificationMessageText', label: 'Full Clarification Message', level: 1, minTier: 'standard', sourcePath: 'IRequestClarification.message' },

  // ── Level 2 — Operational Detail ──
  { contentId: 'sagaStepResults', label: 'Saga Step Results', level: 2, minTier: 'standard', sourcePath: 'IProvisioningStatus.steps[]' },
  { contentId: 'level2ExpansionControl', label: 'Operational Detail Expansion', level: 2, minTier: 'standard', sourcePath: '(UI control)' },
  { contentId: 'idempotentSkip', label: 'Idempotent Skip Flag', level: 2, minTier: 'expert', sourcePath: 'ISagaStepResult.idempotentSkip' },
  { contentId: 'rawErrorDetails', label: 'Error Details', level: 2, minTier: 'expert', sourcePath: 'ISagaStepResult.errorMessage' },
  { contentId: 'statusResourceVersion', label: 'Status Resource Version', level: 2, minTier: 'expert', sourcePath: 'IProvisioningStatus (version fields)' },
  { contentId: 'correlationIds', label: 'Correlation IDs', level: 2, minTier: 'expert', sourcePath: 'IProvisioningStatus.correlationId' },
  { contentId: 'throttleBackoff', label: 'Throttle Backoff Records', level: 2, minTier: 'expert', sourcePath: 'IProvisioningStatus (throttle fields)' },
] as const;

/** Get all history content descriptors for a given level. */
export function getHistoryContentByLevel(level: HistoryLevel): readonly IHistoryContentDescriptor[] {
  return PROJECT_SETUP_HISTORY_CONTENT.filter((c) => c.level === level);
}

/**
 * Check if a history level's expansion control is visible at a given tier.
 *
 * Level 0 and 1 are always visible. Level 2 (Operational Detail) requires
 * standard tier or above.
 */
export function isHistoryLevelVisible(level: HistoryLevel, tier: ComplexityTier): boolean {
  if (level === 0 || level === 1) return true;
  return evaluateGate(tier, { minTier: 'standard' });
}
