/**
 * P3-E13-T08 Stage 6 Subcontract Execution Readiness Module lanes-permissions business rules.
 * Authority model, annotation isolation, lane depth, action separation.
 */

import type {
  PWADepthCapability,
  ReadinessAuthorityRoleT06,
} from './enums.js';
import {
  PWA_DEPTH_CAPABILITIES,
} from './constants.js';

// -- Annotation Isolation (T06 §3) --------------------------------------------

/**
 * Annotations are always non-mutating per T06 §3. Always returns true.
 */
export const isAnnotationNonMutating = (): true => true;

/**
 * Annotations are always stored through @hbc/field-annotations per T06 §3.
 * Always returns true.
 */
export const isAnnotationStoredInFieldAnnotations = (): true => true;

// -- Action Separation (T06 §2) -----------------------------------------------

/**
 * An annotation thread never flips Financial status per T06 §2. Always returns false.
 */
export const doesAnnotationFlipFinancialStatus = (): false => false;

/**
 * An approval action never directly flips Financial status per T06 §2. Always returns false.
 */
export const doesApprovalFlipFinancialStatus = (): false => false;

// -- Authority Model (T06 §1) -------------------------------------------------

/**
 * Returns true if the role can mutate readiness state per T06 §1.2.
 * Only Compliance / Risk owns routine evaluation and readiness issuance.
 */
export const canRoleMutateReadinessState = (
  role: ReadinessAuthorityRoleT06,
): boolean =>
  role === 'COMPLIANCE_RISK';

/**
 * Returns true if the role is review-only per T06 §1.1.
 */
export const isReviewOnlyRole = (
  role: ReadinessAuthorityRoleT06,
): boolean =>
  role === 'PER_REVIEW_ONLY' || role === 'READ_ONLY_CONSUMER';

/**
 * Returns true if the role can author operational content (assembly, evidence, submission).
 */
export const canRoleAuthorOperationalContent = (
  role: ReadinessAuthorityRoleT06,
): boolean =>
  role === 'PM_APM_PA';

/**
 * Returns true if the role participates in exception approval per T06 §1.1.
 */
export const isExceptionApprovalRole = (
  role: ReadinessAuthorityRoleT06,
): boolean =>
  role === 'PX' || role === 'CFO' || role === 'COMPLIANCE_MANAGER';

// -- Lane Depth (T06 §4) ------------------------------------------------------

/**
 * Returns true if the capability is PWA-only per T06 §4.1.
 * These require full-depth PWA — SPFx should launch to PWA for these.
 */
export const isPWAOnlyCapability = (
  capability: PWADepthCapability,
): boolean =>
  (PWA_DEPTH_CAPABILITIES as readonly string[]).includes(capability);

/**
 * Returns true if SPFx should launch to PWA for this capability per T06 §4.2.
 * Deeper workflow needs PWA rather than attempting to replicate PWA-depth specialist tooling.
 */
export const shouldSPFxLaunchToPWA = (
  capability: string,
): boolean =>
  (PWA_DEPTH_CAPABILITIES as readonly string[]).includes(capability);
