/**
 * HB Kudos prominence and scheduling rule enforcement.
 *
 * Centralizes the business rules from the Decision-Lock-Appendix so
 * that neither the UI nor the writer can bypass them:
 *
 *   - Featured: max 1 item, requires expiration date, mutually
 *     exclusive with pinned.
 *   - Pinned: max 3 items, mutually exclusive with featured.
 *   - Scheduled items consume prominence slots only when they go live.
 *   - Slot collisions demote the incoming item to standard, flag for
 *     admin review, and notify admins.
 */

export interface ProminenceSlotState {
  /** Number of currently featured items (max 1). */
  featuredCount: number;
  /** Number of currently pinned items (max 3). */
  pinnedCount: number;
}

export const FEATURED_MAX = 1;
export const PINNED_MAX = 3;

export interface ProminenceValidationResult {
  ok: boolean;
  error?: string;
  /** When a collision is detected, the caller should demote to standard. */
  demoteToStandard?: boolean;
  /** When true, the item should be flagged for admin review. */
  flagForAdminReview?: boolean;
  /** Admin notification reason when a collision occurs. */
  adminNotificationReason?: string;
}

/**
 * Validate a 'feature' action against the current slot state.
 */
export function validateFeatureAction(
  slots: ProminenceSlotState,
  featuredExpiresAtIso: string | undefined,
): ProminenceValidationResult {
  if (!featuredExpiresAtIso?.trim()) {
    return { ok: false, error: 'Featured items require an expiration date.' };
  }
  if (slots.featuredCount >= FEATURED_MAX) {
    return {
      ok: false,
      error: `Featured slot is full (max ${FEATURED_MAX}). Unfeature the current featured item first.`,
    };
  }
  return { ok: true };
}

/**
 * Validate a 'pin' action against the current slot state.
 */
export function validatePinAction(
  slots: ProminenceSlotState,
): ProminenceValidationResult {
  if (slots.pinnedCount >= PINNED_MAX) {
    return {
      ok: false,
      error: `Pin slots are full (max ${PINNED_MAX}). Unpin an existing item first.`,
    };
  }
  return { ok: true };
}

/**
 * Handle a scheduled featured item going live when the featured slot
 * is already occupied. Returns a result that tells the caller to
 * demote to standard and flag for admin review.
 */
export function handleScheduledProminenceCollision(
  slots: ProminenceSlotState,
  intendedProminence: 'featured' | 'pinned',
): ProminenceValidationResult {
  if (intendedProminence === 'featured' && slots.featuredCount >= FEATURED_MAX) {
    return {
      ok: true,
      demoteToStandard: true,
      flagForAdminReview: true,
      adminNotificationReason:
        'Scheduled featured item went live but the featured slot was already occupied. Item published as standard approved.',
    };
  }
  if (intendedProminence === 'pinned' && slots.pinnedCount >= PINNED_MAX) {
    return {
      ok: true,
      demoteToStandard: true,
      flagForAdminReview: true,
      adminNotificationReason:
        'Scheduled pinned item went live but all pin slots were occupied. Item published as standard approved.',
    };
  }
  return { ok: true };
}

/**
 * Validate reassignment authority based on the item's queue state.
 * Flagged-for-admin-review items can only be reassigned by admins.
 */
export function validateReassignmentAuthority(
  callerRole: 'admin' | 'reviewer' | 'viewer',
  isFlaggedForAdminReview: boolean,
): string | undefined {
  if (callerRole === 'viewer') {
    return 'Viewers cannot reassign items.';
  }
  if (isFlaggedForAdminReview && callerRole !== 'admin') {
    return 'Only admins can reassign items flagged for admin review.';
  }
  return undefined;
}
