/**
 * P3-E6-T04 Change Ledger business rules.
 * Pure functions implementing CE-01 through CE-07.
 */

import type { IChangeEventImmutabilityResult, IChangeEventRecord, IChangeLineItem } from './types.js';
import { CHANGE_EVENT_IMMUTABLE_FIELDS } from './constants.js';

/**
 * Generate a change event number in CE-### format.
 * Pads the sequence number to at least 3 digits.
 */
export const generateChangeEventNumber = (sequenceNumber: number): string =>
  `CE-${String(sequenceNumber).padStart(3, '0')}`;

/**
 * CE-04: Calculate total cost from line items.
 * Sums all line item totalCost values.
 */
export const calculateTotalCostFromLineItems = (lineItems: readonly IChangeLineItem[]): number =>
  lineItems.reduce((sum, item) => sum + item.totalCost, 0);

/**
 * CE-01: Validate that immutable fields have not been changed.
 * Canonical identity fields are permanent — mode promotion does not replace them.
 */
export const validateChangeEventRecordImmutability = (
  original: IChangeEventRecord,
  updated: Partial<IChangeEventRecord>,
): IChangeEventImmutabilityResult => {
  const violations: string[] = [];

  for (const field of CHANGE_EVENT_IMMUTABLE_FIELDS) {
    if (field in updated && updated[field as keyof IChangeEventRecord] !== original[field as keyof IChangeEventRecord]) {
      violations.push(`Field '${field}' is immutable and cannot be changed after creation.`);
    }
  }

  return { valid: violations.length === 0, violations };
};
