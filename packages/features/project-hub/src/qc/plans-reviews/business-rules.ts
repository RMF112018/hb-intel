/**
 * P3-E15-T10 Stage 4 Project QC Module plans-reviews business rules.
 */

import type { ControlGateStatus, FindingToIssueCondition, GateFailureConsequence, PlanCoverageAction } from './enums.js';
import type { WorkPackagePlanState } from '../foundation/enums.js';
import type { IPlanReadinessPosture } from './types.js';
import {
  CONTROL_GATE_TERMINAL_STATUSES,
  CONTROL_GATE_VALID_TRANSITIONS,
  FINDING_TO_ISSUE_SPAWN_CONDITIONS,
  PLAN_ACTIVATION_VALID_TRANSITIONS,
  PLAN_TERMINAL_STATES,
  QC_PLAN_COVERAGE_ACTIONS,
} from './constants.js';

/** T04 §5 — control gate state machine. */
export const isValidControlGateTransition = (from: ControlGateStatus, to: ControlGateStatus): boolean =>
  CONTROL_GATE_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

/** T04 §2 — plan activation state machine. */
export const isValidPlanActivationTransition = (from: WorkPackagePlanState, to: WorkPackagePlanState): boolean =>
  PLAN_ACTIVATION_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

/** T04 §2 — preliminary activation guard. */
export const canPlanSkipPreliminaryActivation = (hasUnresolvedDependencies: boolean): boolean =>
  !hasUnresolvedDependencies;

/** T04 §3 — mandatory coverage is never removable. */
export const isMandatoryCoverageRemovable = (): false => false;

/** T04 §3 — project additions are additive. */
export const isProjectAdditionAdditive = (action: PlanCoverageAction): boolean =>
  (QC_PLAN_COVERAGE_ACTIONS as readonly string[]).includes(action);

/** T04 §6 — override cannot reduce rigor without deviation. */
export const canOverrideReduceWithoutDeviation = (): false => false;

/** T04 §8.3 — finding spawn condition check. */
export const shouldFindingSpawnIssue = (condition: FindingToIssueCondition): boolean =>
  (FINDING_TO_ISSUE_SPAWN_CONDITIONS as readonly string[]).includes(condition);

/** T04 §9 — gate failure consequences. */
export const isGateFailureConsequence = (status: ControlGateStatus, consequence: GateFailureConsequence): boolean => {
  if (status === 'BLOCKED') return consequence === 'SPAWN_ISSUE' || consequence === 'BLOCK_GATE' || consequence === 'DEGRADE_PLAN_READINESS';
  if (status === 'ESCALATED') return consequence === 'ESCALATE' || consequence === 'DEGRADE_PLAN_READINESS';
  return false;
};

/** T04 §10 — verifier separation: responsible party cannot self-close gate. */
export const canResponsiblePartySelfCloseGate = (): false => false;

/** T04 §2 — plan readiness check. */
export const isPlanReadinessComplete = (posture: IPlanReadinessPosture): boolean =>
  posture.gatesBlocked === 0 && posture.gatesEscalated === 0 && posture.openExceptionCount === 0 && posture.gatesReady === posture.totalGateCount;

/** T04 §5 — gate terminal status check. */
export const isControlGateTerminal = (status: ControlGateStatus): boolean =>
  (CONTROL_GATE_TERMINAL_STATUSES as readonly string[]).includes(status);

/** T04 §2 — plan terminal state check. */
export const isPlanTerminal = (state: WorkPackagePlanState): boolean =>
  (PLAN_TERMINAL_STATES as readonly string[]).includes(state);

/** T04 §5 — gates are soft-gated. */
export const isGateSoftGated = (): true => true;

/** T04 §9 — gate failure degrades plan readiness. */
export const doesGateFailureDegradePlanReadiness = (): true => true;

/** T04 §2 — both activation depths are required. */
export const requiresBothActivationDepths = (): true => true;
