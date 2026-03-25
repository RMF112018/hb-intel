/**
 * P3-E14-T10 Stage 6 Project Warranty Module subcontractor-participation business rules.
 * PM-proxy, acknowledgment transitions, dispute, immutability, back-charge boundary.
 */

import type { SubAcknowledgmentStatus } from './enums.js';
import { ACKNOWLEDGMENT_TRANSITIONS } from './constants.js';

// -- PM-Proxy Model (T06 §1.1) -----------------------------------------------

/** In Phase 3, all sub entry is PM-on-behalf per T06 §1.1. Always returns true. */
export const isSubEntryPmProxyOnly = (): true => true;

// -- Acknowledgment Transitions (T06 §3.2) ------------------------------------

/** Returns true if the acknowledgment transition is valid per T06 §3.2. */
export const isValidAcknowledgmentTransition = (
  from: SubAcknowledgmentStatus | null,
  to: SubAcknowledgmentStatus,
): boolean =>
  ACKNOWLEDGMENT_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Dispute (T06 §4.1) ------------------------------------------------------

/** Returns true if dispute rationale is required per T06 §4.1. */
export const isDisputeRationaleRequired = (
  status: SubAcknowledgmentStatus,
): boolean =>
  status === 'ScopeDisputed';

// -- Resolution Immutability (T06 §6.3) ---------------------------------------

/** Resolution record is immutable after creation per T06 §6.3. Always returns true. */
export const isResolutionRecordImmutableT06 = (): true => true;

// -- Verification Gate (T06 §6.4) ---------------------------------------------

/** Verification is required for Corrected resolution per T06 §6.4. Always returns true. */
export const isVerificationRequiredForCorrected = (): true => true;

// -- Back-Charge Boundary (T06 §7.3) -----------------------------------------

/** Back-charge advisory is read-only signal per T06 §7.3. Always returns true. */
export const isBackChargeAdvisoryReadOnly = (): true => true;

// -- No Parallel Sub Store (T06 §10) ------------------------------------------

/** Layer 2 may not create parallel sub store per T06 §10. Always returns false. */
export const canLayer2CreateParallelSubStore = (): false => false;
