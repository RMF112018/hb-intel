/**
 * SF28-T07 — Non-React activity event emission helper.
 *
 * For packages that cannot use React hooks (e.g., backend adapters,
 * provisioning callbacks). Wraps normalizeActivityEvent directly.
 * All emission must go through this or useActivityEmitter — no
 * free-form event payload creation allowed.
 *
 * Governing: SF28-T07
 */

import type { IActivityEmissionInput, IActivityEvent } from '../types/index.js';
import { normalizeActivityEvent } from '../model/normalize.js';

/**
 * Normalize and validate an activity emission input.
 *
 * Pure function — does NOT persist. Caller handles storage.
 *
 * @param input - Module-provided emission input
 * @param now - Reference time (defaults to current time)
 * @returns Normalized IActivityEvent ready for append-only storage
 * @throws Error if validation fails
 */
export function emitActivityEvent(
  input: IActivityEmissionInput,
  now?: Date,
): IActivityEvent {
  return normalizeActivityEvent(input, now);
}
