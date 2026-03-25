/**
 * P3-E9-T04 reports run-lifecycle business rules.
 * Family-specific lifecycle, approval gates, release authority, pipeline, archival.
 */

import type {
  ApprovalBlockingCondition,
  GenerationPipelineStep,
  ReleaseAuthorityLevel,
  RunLifecycleStatus,
} from './enums.js';
import type { IFamilyLifecyclePolicy } from './types.js';
import {
  FAMILY_LIFECYCLE_POLICIES,
  GENERATION_PIPELINE_STEPS,
  RUN_LIFECYCLE_TRANSITIONS,
} from './constants.js';

// -- Transition Validation ----------------------------------------------------

export const isValidRunLifecycleTransition = (
  from: RunLifecycleStatus,
  to: RunLifecycleStatus,
  familyKey: string,
): boolean => {
  return RUN_LIFECYCLE_TRANSITIONS.some((t) => {
    if (t.from !== from || t.to !== to) return false;
    if (t.familyRestriction !== null && t.familyRestriction !== familyKey) return false;
    return true;
  });
};

// -- Approval Gate Rules ------------------------------------------------------

export const isApprovalGateRequired = (familyKey: string): boolean => {
  const policy = FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === familyKey);
  return policy !== undefined && policy.approvalGateConfig.gateRequirement === 'PE_APPROVAL_REQUIRED';
};

export const isInternalReviewChainRequiredForApproval = (familyKey: string): boolean => {
  const policy = FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === familyKey);
  return policy !== undefined && policy.requiresInternalReviewChain;
};

export const canApproveRun = (
  status: RunLifecycleStatus,
  chainComplete: boolean,
  familyKey: string,
): boolean => {
  if (status !== 'GENERATED') return false;
  if (!isApprovalGateRequired(familyKey)) return false;
  if (isInternalReviewChainRequiredForApproval(familyKey) && !chainComplete) return false;
  return true;
};

// -- Release Authority Rules --------------------------------------------------

export const canReleaseRun = (status: RunLifecycleStatus, familyKey: string): boolean => {
  if (isApprovalGateRequired(familyKey)) return status === 'APPROVED';
  return status === 'GENERATED';
};

export const canPerReleaseFamily = (_familyKey: string, authorityLevel: ReleaseAuthorityLevel): boolean =>
  authorityLevel === 'PER_PERMITTED' || authorityLevel === 'GLOBAL';

export const canPerApproveRun = (): false => false;

export const canPeApproveRun = (): true => true;

// -- Archival Rules -----------------------------------------------------------

export const isRunArchivable = (status: RunLifecycleStatus): boolean =>
  status === 'GENERATED' || status === 'APPROVED' || status === 'RELEASED' || status === 'FAILED';

export const isRunRecordImmutableAfterArchival = (): true => true;

// -- Reviewer Run Rules -------------------------------------------------------

export const doesReviewerRunAffectStandardSequence = (): false => false;

// -- Approval Blocking --------------------------------------------------------

export const getApprovalBlockingCondition = (
  status: RunLifecycleStatus,
  chainComplete: boolean,
  gateRequired: boolean,
): ApprovalBlockingCondition | null => {
  if (status !== 'GENERATED') return 'RUN_NOT_GENERATED';
  if (!gateRequired) return 'APPROVAL_GATE_NOT_REQUIRED';
  if (!chainComplete) return 'INTERNAL_REVIEW_CHAIN_INCOMPLETE';
  return null;
};

// -- Policy Lookups -----------------------------------------------------------

export const getFamilyLifecyclePolicy = (familyKey: string): IFamilyLifecyclePolicy | null =>
  FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === familyKey) ?? null;

export const allowsDirectRelease = (familyKey: string): boolean => {
  const policy = FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === familyKey);
  return policy !== undefined && policy.allowsDirectRelease;
};

// -- Pipeline Rules -----------------------------------------------------------

export const isGenerationPipelineStepTerminal = (step: GenerationPipelineStep): boolean => {
  const def = GENERATION_PIPELINE_STEPS.find((s) => s.step === step);
  return def !== undefined && def.isTerminal;
};
