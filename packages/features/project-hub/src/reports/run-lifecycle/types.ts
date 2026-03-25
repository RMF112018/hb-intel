/**
 * P3-E9-T04 reports run-lifecycle TypeScript contracts.
 * Lifecycle transitions, approval gates, release authority, pipeline steps, archival, distribution.
 */

import type {
  ApprovalBlockingCondition,
  ApprovalGateRequirement,
  DistributionAction,
  GenerationPipelineStep,
  ReleaseAuthorityLevel,
  RunArchivalReason,
  RunLifecycleStatus,
} from './enums.js';

// -- Run Lifecycle Transition -------------------------------------------------

export interface IRunLifecycleTransition {
  readonly from: RunLifecycleStatus;
  readonly to: RunLifecycleStatus;
  readonly familyRestriction: string | null;
  readonly requiresApproval: boolean;
  readonly requiresChainComplete: boolean;
}

// -- Approval Gate Config -----------------------------------------------------

export interface IApprovalGateConfig {
  readonly familyKey: string;
  readonly gateRequirement: ApprovalGateRequirement;
  readonly approverRole: string;
  readonly requiresInternalReviewChain: boolean;
  readonly chainBlocksApproval: boolean;
}

// -- Release Authority Config -------------------------------------------------

export interface IReleaseAuthorityConfig {
  readonly familyKey: string;
  readonly authorityLevel: ReleaseAuthorityLevel;
  readonly peCanRelease: boolean;
  readonly perCanRelease: boolean;
}

// -- Generation Pipeline Step Def ---------------------------------------------

export interface IGenerationPipelineStepDef {
  readonly step: GenerationPipelineStep;
  readonly order: number;
  readonly description: string;
  readonly isTerminal: boolean;
}

// -- Run Archival Record ------------------------------------------------------

export interface IRunArchivalRecord {
  readonly archivalId: string;
  readonly runId: string;
  readonly reason: RunArchivalReason;
  readonly archivedByUPN: string;
  readonly archivedAt: string;
  readonly supersededByRunId: string | null;
}

// -- Distribution Record ------------------------------------------------------

export interface IDistributionRecord {
  readonly distributionId: string;
  readonly runId: string;
  readonly action: DistributionAction;
  readonly distributedAt: string;
  readonly distributedByUPN: string;
  readonly recipientCount: number;
}

// -- Approval Precondition Check ----------------------------------------------

export interface IApprovalPreconditionCheck {
  readonly checkId: string;
  readonly runId: string;
  readonly internalReviewChainComplete: boolean;
  readonly approvalGateRequired: boolean;
  readonly blockingCondition: ApprovalBlockingCondition | null;
}

// -- Family Lifecycle Policy --------------------------------------------------

export interface IFamilyLifecyclePolicy {
  readonly familyKey: string;
  readonly approvalGateConfig: IApprovalGateConfig;
  readonly releaseAuthorityConfig: IReleaseAuthorityConfig;
  readonly requiresInternalReviewChain: boolean;
  readonly allowsDirectRelease: boolean;
  readonly perCanGenerateReviewerRun: boolean;
}
