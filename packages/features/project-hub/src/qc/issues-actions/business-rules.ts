/**
 * P3-E15-T10 Stage 5 Project QC Module issues-actions business rules.
 */

import type {
  IssueOriginationMode,
  RootCauseQualification,
  RootCauseRequiredReason,
  EscalationTrigger,
  WorkQueuePublicationEvent,
  WorkQueuePublicationState,
} from './enums.js';
import {
  ROOT_CAUSE_REQUIRED_REASONS,
  ESCALATION_TRIGGERS,
  WORK_QUEUE_PUBLICATION_EVENT_MAP,
} from './constants.js';

/** T05 §3.3 — closure authority: verifier-only closure is always required. */
export const isVerifierOnlyClosureRequired = (): true => true;

/** T05 §3.3 — responsible party cannot close issues. */
export const canResponsiblePartyCloseIssue = (): false => false;

/** T05 §3.3 — responsible party cannot close actions. */
export const canResponsiblePartyCloseAction = (): false => false;

/** T05 §7.1 — root cause qualification: is root cause required for closure? */
export const isRootCauseRequiredForClosure = (qualification: RootCauseQualification): boolean =>
  qualification === 'REQUIRED';

/** T05 §7.1 — can issue close without root cause? */
export const canIssueCloseWithoutRootCause = (qualification: RootCauseQualification): boolean =>
  qualification === 'NOT_REQUIRED';

/** T05 §7.2 — should require root cause analysis for the given reason? */
export const shouldRequireRootCauseAnalysis = (reason: RootCauseRequiredReason): boolean =>
  (ROOT_CAUSE_REQUIRED_REASONS as readonly string[]).includes(reason);

/** T05 §4.2 — child closure is required for parent closure. */
export const isChildClosureRequiredForParentClosure = (): true => true;

/** T05 §4.2 — child reopen triggers parent reopen. */
export const doesChildReopenTriggerParentReopen = (): true => true;

/** T05 §3.3/§4.2/§7 — combined closure gate for issues. */
export const canIssueMoveToVerifiedClosed = (
  allActionsVerified: boolean,
  rootCauseQualification: RootCauseQualification,
  hasRootCauseRecord: boolean,
): boolean => {
  if (!allActionsVerified) return false;
  if (rootCauseQualification === 'REQUIRED' && !hasRootCauseRecord) return false;
  return true;
};

/** T05 §8.2 — work queue publication state for a given event. */
export const getWorkQueuePublicationStateForEvent = (
  event: WorkQueuePublicationEvent,
): WorkQueuePublicationState => {
  const entry = WORK_QUEUE_PUBLICATION_EVENT_MAP.find((e) => e.event === event);
  if (!entry) return 'CREATED';
  return entry.resultState;
};

/** T05 §8 — work queue is NOT the authoritative source of truth. */
export const isWorkQueuePublicationAuthoritativeSource = (): false => false;

/** T05 §8.3 — normalized publication only; no detailed reasoning published. */
export const doesWorkQueuePublishDetailedReasoning = (): false => false;

/** T05 §6 — escalation trigger active check. */
export const isEscalationTriggerActive = (trigger: EscalationTrigger): boolean =>
  (ESCALATION_TRIGGERS as readonly string[]).includes(trigger);

/** T05 §2 — origination mode validation. */
export const isOriginationModeValid = (
  mode: IssueOriginationMode,
  context: { findingContext: unknown | null; gateContext: unknown | null; adHocContext: unknown | null },
): boolean => {
  if (mode === 'FINDING_ORIGIN') return context.findingContext !== null;
  if (mode === 'GATE_ORIGIN') return context.gateContext !== null;
  if (mode === 'AD_HOC_ORIGIN') return context.adHocContext !== null;
  return false;
};

/** T05 §9 — drillback to QC is always required. */
export const isDrillbackToQcRequired = (): true => true;
