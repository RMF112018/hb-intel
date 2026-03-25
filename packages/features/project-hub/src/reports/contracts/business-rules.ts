/**
 * P3-E9-T02 reports contracts business rules.
 * State machine validation, governance policy, approval gates.
 */

import type { ReportFamilyKey } from '../foundation/enums.js';
import type { ReportRunStatus } from '../run-ledger/enums.js';
import type { ConfigVersionState, InternalReviewChainStatus, ReportValidationRule } from './enums.js';
import {
  REPORT_RUN_STATUS_TRANSITIONS,
  CONFIG_VERSION_STATE_TRANSITIONS,
  INTERNAL_REVIEW_CHAIN_TRANSITIONS,
} from './constants.js';

// -- State Machine Validators -------------------------------------------------

export const isValidRunStatusTransition = (from: ReportRunStatus, to: ReportRunStatus): boolean =>
  REPORT_RUN_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to);

export const isValidConfigVersionTransition = (from: ConfigVersionState, to: ConfigVersionState): boolean =>
  CONFIG_VERSION_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);

export const isValidReviewChainTransition = (from: InternalReviewChainStatus, to: InternalReviewChainStatus): boolean =>
  INTERNAL_REVIEW_CHAIN_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Approval Gates -----------------------------------------------------------

export const isRunApprovalRequired = (familyKey: ReportFamilyKey): boolean =>
  familyKey === 'PX_REVIEW';

export const canRunTransitionToReleased = (status: ReportRunStatus, familyKey: ReportFamilyKey): boolean => {
  if (familyKey === 'PX_REVIEW') return status === 'COMPLETED'; // requires approval first (modeled via approvalMetadata)
  return status === 'COMPLETED'; // non-gated can release from completed
};

// -- Field Authority ----------------------------------------------------------

export const isSnapshotRefImmutable = (): true => true;
export const canPmEditNarrative = (): true => true;
export const canPerEditNarrative = (): false => false;
export const isScoreFieldReadOnly = (): true => true;
export const isRecommendationFieldReadOnly = (): true => true;

// -- Validation Rule Evaluation -----------------------------------------------

export const isValidationRuleSatisfied = (rule: ReportValidationRule, hasValue: boolean): boolean => {
  const requiredRules: readonly ReportValidationRule[] = [
    'FAMILY_KEY_REQUIRED',
    'PROJECT_ID_REQUIRED',
    'CONFIG_VERSION_REQUIRED',
    'SNAPSHOT_REFS_REQUIRED',
    'GENERATED_BY_REQUIRED',
    'APPROVED_BY_REQUIRED',
    'RELEASED_BY_REQUIRED',
  ];
  if ((requiredRules as readonly string[]).includes(rule)) return hasValue;
  return true; // non-required rules satisfied by default
};

// -- Internal Review Chain Bypass ---------------------------------------------

export const canBypassInternalReviewChain = (familyKey: ReportFamilyKey, bypassFlag: boolean): boolean =>
  familyKey === 'OWNER_REPORT' && bypassFlag === true;
