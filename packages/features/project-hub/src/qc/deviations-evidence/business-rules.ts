/**
 * P3-E15-T10 Stage 6 Project QC Module deviations-evidence business rules.
 */

import type { DeviationState } from '../foundation/enums.js';
import type { DeviationConditionType, DeviationReadinessEffect, EvidenceSufficiencyStatus } from './enums.js';
import { DEVIATION_READINESS_EFFECT_MAP, QC_DEVIATION_CONDITION_TYPES } from './constants.js';

// T06 §2.4 — gate readiness with conditions
export const canGateBeReadyWithConditions = (deviationState: DeviationState): boolean =>
  deviationState === 'APPROVED';

// T06 §2.4 — expired deviation blocks
export const isDeviationExpiredBlockingReadiness = (state: DeviationState): boolean =>
  state === 'EXPIRED';

// T06 §5 — evidence sufficiency
export const isEvidenceSufficiencyInferredFromFilePresence = (): false => false;
export const isEvidenceSufficiencySatisfied = (status: EvidenceSufficiencyStatus): boolean =>
  status === 'SATISFIED';
export const requiresReviewerAcceptanceForSufficiency = (): true => true;

// T06 §4 — no file storage
export const canQcStoreEvidenceFiles = (): false => false;

// T06 §7 — conflict handling
export const isOfficialSourceConflictSilentlyResolvable = (): false => false;
export const mustConflictRouteToExplicitReview = (): true => true;

// T06 §9 — internal-only boundary
export const isExternalApprovalInternallyTracked = (): true => true;
export const canExternalPartyAccessQcSurfaces = (): false => false;

// T06 §2.4/§8 — readiness impact
export const doesExpiredDeviationAffectReadiness = (): true => true;
export const doesRejectedApprovalBlockReadiness = (): true => true;

// T06 §3/§8 — readiness effect lookup
export const getReadinessEffectForDeviationState = (state: DeviationState): DeviationReadinessEffect => {
  const entry = DEVIATION_READINESS_EFFECT_MAP.find((e) => e.deviationState === state);
  return entry ? entry.effect : 'NOT_READY';
};

// T06 §3 — condition enforceability
export const isDeviationConditionEnforceable = (conditionType: DeviationConditionType): boolean =>
  (QC_DEVIATION_CONDITION_TYPES as readonly string[]).includes(conditionType);

// T06 §6.4 — provenance requirement
export const isApprovalProvenanceRequired = (): true => true;
