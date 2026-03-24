/**
 * P3-E7-T03 Permits lifecycle business rules.
 */

import type { PermitApplicationStatus, IssuedPermitStatus } from '../records/enums.js';
import { APPLICATION_EDIT_RULES, APPLICATION_REQUIRED_FIELDS } from './constants.js';

/** §5.1: Check who may edit an application at a given status. */
export const canEditApplication = (status: PermitApplicationStatus, role: string): boolean => {
  const rule = APPLICATION_EDIT_RULES.find((r) => r.status === status);
  if (!rule) return false;
  return rule.whoMayEdit.some((w) => w.includes(role));
};

/** §5.2: Get required fields for a given application status transition. */
export const getRequiredFieldsForApplicationTransition = (toStatus: string): readonly string[] =>
  APPLICATION_REQUIRED_FIELDS[toStatus] ?? [];

/** §4.4: Check if the permit is in a blocking state (STOP_WORK or VIOLATION_ISSUED). */
export const isStopWorkOrViolationBlocking = (status: IssuedPermitStatus): boolean =>
  status === 'STOP_WORK' || status === 'VIOLATION_ISSUED';

/** §3.3: Check if an expiration warning is needed. */
export const isExpirationWarningNeeded = (
  daysToExpiration: number,
  currentStatus: IssuedPermitStatus,
): boolean =>
  daysToExpiration <= 30 && currentStatus === 'ACTIVE';
