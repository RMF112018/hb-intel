/**
 * P3-E10-T04 Closeout Lifecycle State Machine TypeScript contracts.
 * State machine, milestones, evidence gates, approval rules, work queue.
 */

import type {
  CloseoutFullMilestoneKey,
  CloseoutLifecycleState,
  CloseoutMilestoneEvidenceType,
  CloseoutMilestoneStatus,
  CloseoutTransitionTriggerType,
} from './enums.js';

// -- Lifecycle State Definitions (§2.1) -------------------------------------

/** Lifecycle state definition per T04 §2.1. */
export interface ICloseoutLifecycleStateDefinition {
  readonly state: CloseoutLifecycleState;
  readonly code: CloseoutLifecycleState;
  readonly description: string;
}

// -- State Transitions (§2.2) -----------------------------------------------

/** State transition definition per T04 §2.2. */
export interface ICloseoutStateTransition {
  readonly from: CloseoutLifecycleState;
  readonly to: CloseoutLifecycleState;
  readonly triggerType: CloseoutTransitionTriggerType;
  readonly triggerCondition: string;
  readonly peApprovalRequired: boolean;
}

// -- Milestone Definitions (§4.2) -------------------------------------------

/** Milestone definition per T04 §4.2 table. */
export interface ICloseoutMilestoneDefinition {
  readonly key: CloseoutFullMilestoneKey;
  readonly label: string;
  readonly advancesTo: CloseoutLifecycleState | null;
  readonly evidenceType: CloseoutMilestoneEvidenceType;
  readonly externalDependency: boolean;
  readonly peApprovalRequired: boolean;
}

// -- Milestone Record (§4.1) ------------------------------------------------

/** Milestone record per T04 §4.1 field table. */
export interface ICloseoutMilestoneRecord {
  readonly milestoneId: string;
  readonly projectId: string;
  readonly milestoneKey: CloseoutFullMilestoneKey;
  readonly milestoneLabel: string;
  readonly status: CloseoutMilestoneStatus;
  readonly evidenceType: CloseoutMilestoneEvidenceType;
  readonly evidenceRecordId: string | null;
  readonly evidenceDate: string | null;
  readonly externalDependency: boolean;
  readonly approvalRequired: boolean;
  readonly approvedAt: string | null;
  readonly approvedBy: string | null;
  readonly spineEvent: string | null;
  readonly notes: string | null;
}

// -- Archive-Ready Gate (§4.3) ----------------------------------------------

/** Archive-ready criterion per T04 §4.3. */
export interface IArchiveReadyCriterion {
  readonly criterionNumber: number;
  readonly description: string;
  readonly checkMechanism: string;
}

/** Context for evaluating archive-ready criteria. */
export interface IArchiveReadyContext {
  readonly completionPercentage: number;
  readonly allNonYesItemsHaveNaJustification: boolean;
  readonly section6CompletionPercentage: number;
  readonly item311YesWithDate: boolean;
  readonly item415Yes: boolean;
  readonly scorecardsCompleteMilestoneApproved: boolean;
  readonly lessonsApprovedMilestoneApproved: boolean;
  readonly autopsyCompleteMilestoneApproved: boolean;
  readonly financialFinalPaymentConfirmed: boolean;
}

/** Result of evaluating a single archive-ready criterion. */
export interface IArchiveReadyCriterionResult {
  readonly criterionNumber: number;
  readonly passed: boolean;
}

// -- PE Approval Authority (§5) ---------------------------------------------

/** PE approval authority row per T04 §5. */
export interface IPEApprovalAction {
  readonly action: string;
  readonly pmAuthority: string;
  readonly suptAuthority: string;
  readonly peAuthority: string;
}

// -- Work Queue Triggers (§7) -----------------------------------------------

/** Work queue trigger rule per T04 §7. */
export interface IWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly assignee: string;
  readonly priority: string;
  readonly autoCloseWhen: string;
}
