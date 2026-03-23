/**
 * P3-E6-T02 Constraint Ledger business rules.
 * Pure functions implementing C-01 through C-08.
 */

import type { ConstraintStatus } from './enums.js';
import type { IConstraintImmutabilityResult, IConstraintRecord } from './types.js';
import { CONSTRAINT_IMMUTABLE_FIELDS, TERMINAL_CONSTRAINT_STATUSES } from './constants.js';

/**
 * Calculate the number of calendar days a constraint has been open.
 * Returns the difference in calendar days between dateIdentified and today.
 */
export const calculateDaysOpen = (dateIdentified: string, today: string): number => {
  const start = new Date(dateIdentified);
  const end = new Date(today);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

/**
 * C-05: Check whether a constraint is overdue.
 * A constraint is overdue when its dueDate is before today
 * AND its status is not terminal.
 */
export const isConstraintOverdue = (
  record: Pick<IConstraintRecord, 'dueDate' | 'status'>,
  today: string,
): boolean => {
  if ((TERMINAL_CONSTRAINT_STATUSES as readonly ConstraintStatus[]).includes(record.status)) {
    return false;
  }
  return record.dueDate < today;
};

/**
 * Generate a constraint number in CON-### format.
 * Pads the sequence number to at least 3 digits.
 */
export const generateConstraintNumber = (sequenceNumber: number): string =>
  `CON-${String(sequenceNumber).padStart(3, '0')}`;

/**
 * C-01: Validate that immutable fields have not been changed.
 * Compares proposed updates against the original record for all fields in CONSTRAINT_IMMUTABLE_FIELDS.
 */
export const validateConstraintRecordImmutability = (
  original: IConstraintRecord,
  updated: Partial<IConstraintRecord>,
): IConstraintImmutabilityResult => {
  const violations: string[] = [];

  for (const field of CONSTRAINT_IMMUTABLE_FIELDS) {
    if (field in updated && updated[field as keyof IConstraintRecord] !== original[field as keyof IConstraintRecord]) {
      violations.push(`Field '${field}' is immutable and cannot be changed after creation.`);
    }
  }

  return { valid: violations.length === 0, violations };
};
