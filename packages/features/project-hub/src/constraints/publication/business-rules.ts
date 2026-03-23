/**
 * P3-E6-T06 Publication authority and governance rules.
 */

import type { ConstraintsPublicationAction, ConstraintsPublicationRole, StateConsumptionMode } from './enums.js';
import { PUBLICATION_AUTHORITY_MATRIX, STATE_CONSUMPTION_MAP } from './constants.js';

/**
 * Check if a given role is authorized for a specific publication action.
 */
export const isRoleAuthorizedForAction = (
  role: ConstraintsPublicationRole,
  action: ConstraintsPublicationAction,
): boolean => {
  const rule = PUBLICATION_AUTHORITY_MATRIX.find((r) => r.action === action);
  if (!rule) return false;
  return rule.allowedRoles.includes(role);
};

/** Shorthand: Can this role publish record-level snapshots? */
export const canPublishSnapshot = (role: ConstraintsPublicationRole): boolean =>
  isRoleAuthorizedForAction(role, 'PublishSnapshot');

/** Shorthand: Can this role publish review packages? */
export const canPublishReviewPackage = (role: ConstraintsPublicationRole): boolean =>
  isRoleAuthorizedForAction(role, 'PublishReviewPackage');

/** Shorthand: Can this role annotate published state? */
export const canAnnotatePublished = (role: ConstraintsPublicationRole): boolean =>
  isRoleAuthorizedForAction(role, 'AnnotatePublished');

/** Shorthand: Can this role configure governance? */
export const canConfigureGovernance = (role: ConstraintsPublicationRole): boolean =>
  isRoleAuthorizedForAction(role, 'ConfigureGovernance');

/**
 * Generate a review package number in RP-### format.
 */
export const generateReviewPackageNumber = (sequenceNumber: number): string =>
  `RP-${String(sequenceNumber).padStart(3, '0')}`;

/**
 * Get the state consumption mode for a given consumer surface.
 * Returns 'Live' if consumer is not found (safe default for operational use).
 */
export const getStateConsumptionMode = (consumer: string): StateConsumptionMode => {
  const rule = STATE_CONSUMPTION_MAP.find((r) => r.consumer === consumer);
  return rule?.stateMode ?? 'Live';
};
