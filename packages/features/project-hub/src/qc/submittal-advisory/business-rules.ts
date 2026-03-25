/**
 * P3-E15-T10 Stage 7 Project QC Module submittal-advisory business rules.
 */

import type { ManualReviewReasonCode, PackageCompleteness, DocumentCurrentness } from './enums.js';

// T07 §2 — spec anchoring is always required
export const isSpecAnchoringRequired = (): true => true;

// T07 §2 — package link is always required
export const isPackageLinkRequired = (): true => true;

// T07 §3 — inventory is not authoritative before owner confirmation
export const isInventoryAuthoritativeBeforeConfirmation = (): false => false;

// T07 §5 — currentness comparison uses official sources only
export const isCurrentnessOfficialSourceOnly = (): true => true;

// T07 §6 — unable-to-verify forces manual review
export const doesUnableToVerifyForceManualReview = (): true => true;

// T07 §8 — cannot activate without an acceptable verdict
export const canActivateWithoutAcceptableVerdict = (): false => false;

// T07 §4 — approved basis cannot be silently mutated
export const canSilentlyMutateApprovedBasis = (): false => false;

// T07 §7 — later conflicts create recheck advisory
export const doesLaterConflictCreateRecheckAdvisory = (): true => true;

// T07 §7 — ongoing watch is required for drift detection
export const isOngoingWatchRequired = (): true => true;

// T07 §1 — advisory is not formal submittal approval
export const isAdvisoryFormalSubmittalApproval = (): false => false;

// T07 §4 — QC module does not store submittal files
export const canQcStoreSubmittalFiles = (): false => false;

// T07 §8 — activation is two-stage (preliminary + full)
export const isActivationTwoStage = (): true => true;

// T07 §10 — extraction cannot auto-accept
export const canExtractionAutoAccept = (): false => false;

// T07 §6 — verdict acceptability for downstream activation
export const isVerdictAcceptableForActivation = (
  completeness: PackageCompleteness,
  currentness: DocumentCurrentness,
  manualReviewRequired: boolean,
): boolean => {
  if (manualReviewRequired) return false;
  if (completeness === 'INCOMPLETE') return false;
  if (currentness === 'OUTDATED' || currentness === 'UNABLE_TO_VERIFY_ROLLUP') return false;
  return true;
};

// T07 §6 — any manual review reason code forces manual review
export const shouldForceManualReview = (
  reasonCodes: readonly ManualReviewReasonCode[],
): boolean => reasonCodes.length > 0;
