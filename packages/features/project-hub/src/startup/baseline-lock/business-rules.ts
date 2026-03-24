/**
 * P3-E11-T10 Stage 8 Project Startup Baseline Lock and Closeout Continuity business rules.
 * Snapshot completeness, immutability, authorization, API response codes.
 */

import type { BaselineAPIMethod, BaselineReadRole } from './enums.js';
import type { StartupReadinessStateCode } from '../foundation/enums.js';
import { BASELINE_READ_ROLES, STARTUP_BASELINE_REQUIRED_FIELDS } from './constants.js';

// -- Snapshot Completeness (T10 §2 Stage 8 Gate) -----------------------------

/**
 * Returns true if all 22 required StartupBaseline fields are non-null.
 * Per T10 Stage 8 gate: no field may be null at lock time.
 */
export const isBaselineSnapshotComplete = (
  snapshot: Readonly<Record<string, unknown>>,
): boolean =>
  STARTUP_BASELINE_REQUIRED_FIELDS.every(
    (field) => field in snapshot && snapshot[field] !== null && snapshot[field] !== undefined,
  );

// -- Immutability (T02 §7.1, T10 Criterion 23) --------------------------------

/**
 * Returns false. StartupBaseline is permanently immutable after creation.
 * Any mutation attempt returns HTTP 405 BASELINE_IMMUTABLE regardless of caller.
 * Per T02 §7.1 and T10 acceptance criterion 23.
 */
export const isBaselineMutationAllowed = (): false => false;

// -- Authorization (T02 §7.3) ------------------------------------------------

/**
 * Returns true if the caller role is authorized to read the baseline API.
 * Per T02 §7.3: PX role or @hbc/project-closeout service account.
 */
export const isBaselineReadAuthorized = (callerRole: string): boolean =>
  (BASELINE_READ_ROLES as readonly string[]).includes(callerRole);

// -- Snapshot Creation Gate (T01 §7.5) ----------------------------------------

/**
 * Returns true if a StartupBaseline snapshot can be created.
 * Per T01 §7.5: only during the transition to BASELINE_LOCKED.
 */
export const canCreateBaselineSnapshot = (
  targetState: StartupReadinessStateCode,
): boolean =>
  targetState === 'BASELINE_LOCKED';

// -- API Response (T02 §7.3) -------------------------------------------------

/**
 * Returns the expected HTTP status code for the given API method on the baseline endpoint.
 * Per T02 §7.3: GET→200 (when authorized), PATCH/PUT/DELETE→405.
 */
export const getBaselineAPIResponse = (method: BaselineAPIMethod): number => {
  if (method === 'GET') return 200;
  return 405;
};
