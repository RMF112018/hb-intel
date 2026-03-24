/**
 * P3-E11-T10 Stage 6 Project Startup Responsibility Matrix business rules.
 * Governed row immutability, critical categories, primary coverage, certification.
 */

import type { FieldTaskCategory, MatrixSheet, PMTaskCategory } from './enums.js';
import type { IMatrixReadiness, IResponsibilityAssignment } from './types.js';
import {
  FIELD_CRITICAL_CATEGORIES,
  GOVERNED_ROW_IMMUTABLE_FIELDS,
  PM_CRITICAL_CATEGORIES,
} from './constants.js';

// -- Governed Row Immutability (T05 §4) --------------------------------------

/**
 * Returns true if the field is immutable on governed (non-custom) rows.
 * Per T05 §4: taskDescription, taskCategory, sheet are immutable.
 * PATCH on these fields returns HTTP 400 IMMUTABLE_FIELD.
 */
export const isGovernedRowFieldImmutable = (fieldName: string): boolean =>
  GOVERNED_ROW_IMMUTABLE_FIELDS.includes(fieldName);

/**
 * Returns true if the field is mutable on custom rows.
 * Per T05 §4: taskDescription is editable on custom rows; sheet is always immutable.
 */
export const isCustomRowFieldMutable = (fieldName: string): boolean => {
  if (fieldName === 'sheet') return false;
  if (fieldName === 'taskDescription') return true;
  // Other fields not in governed immutable list are mutable
  return !GOVERNED_ROW_IMMUTABLE_FIELDS.includes(fieldName);
};

// -- Critical Category (T05 §9.2) --------------------------------------------

/**
 * Returns true if the task category is critical per T05 §9.2.
 * Critical categories require acknowledgedAt on Primary assignments.
 */
export const isCriticalCategory = (
  sheet: MatrixSheet,
  taskCategory: string,
): boolean => {
  if (sheet === 'PM') {
    return (PM_CRITICAL_CATEGORIES as readonly string[]).includes(taskCategory);
  }
  return (FIELD_CRITICAL_CATEGORIES as readonly string[]).includes(taskCategory);
};

// -- Primary Coverage (T05 §9.1) ---------------------------------------------

/**
 * Returns true if at least one assignment has value = Primary
 * with a named person (assignedPersonName populated).
 * Per T05 §9.1: each task category must have at least one named Primary.
 */
export const hasPrimaryCoverage = (
  assignments: ReadonlyArray<Pick<IResponsibilityAssignment, 'value' | 'assignedPersonName'>>,
): boolean =>
  assignments.some(
    (a) => a.value === 'Primary' && a.assignedPersonName !== null && a.assignedPersonName !== '',
  );

// -- Assignment Acknowledgment (T05 §9.2) ------------------------------------

/**
 * Returns true if the assignment has been acknowledged.
 * Per T05 §9.2: acknowledgedAt must be populated for critical Primary assignments.
 */
export const isAssignmentAcknowledged = (
  assignment: Pick<IResponsibilityAssignment, 'acknowledgedAt'>,
): boolean =>
  assignment.acknowledgedAt !== null;

// -- Certification Eligibility (T05 §9.1 + §9.2) ----------------------------

/** Minimal row shape for certification check. */
interface CertRow {
  readonly rowId: string;
  readonly sheet: MatrixSheet;
  readonly taskCategory: string;
  readonly isCriticalCategory: boolean;
  readonly isReminderOnly: boolean;
  readonly isCustomRow: boolean;
}

/**
 * Returns true if RESPONSIBILITY_MATRIX certification may be submitted per T05 §9.1 + §9.2.
 * Requirements:
 * 1. Every assignment-bearing PM task category has at least one named Primary
 * 2. Every assignment-bearing Field task category has at least one named Primary
 * 3. All critical-category Primary assignments have acknowledgedAt populated
 * Reminder-only rows and custom rows are excluded from gates.
 */
export const canSubmitResponsibilityMatrixCertification = (
  rows: ReadonlyArray<CertRow>,
  assignments: ReadonlyArray<Pick<IResponsibilityAssignment, 'rowId' | 'value' | 'assignedPersonName' | 'acknowledgedAt'>>,
): boolean => {
  // Get assignment-bearing governed rows grouped by sheet+category
  const governedRows = rows.filter((r) => !r.isReminderOnly && !r.isCustomRow);

  // Build set of unique (sheet, category) pairs
  const pmCategories = new Set<string>();
  const fieldCategories = new Set<string>();
  for (const row of governedRows) {
    if (row.sheet === 'PM') pmCategories.add(row.taskCategory);
    else fieldCategories.add(row.taskCategory);
  }

  // Rule 1: every PM category has named Primary
  for (const cat of pmCategories) {
    const catRows = governedRows.filter((r) => r.sheet === 'PM' && r.taskCategory === cat);
    const catAssignments = assignments.filter((a) => catRows.some((r) => r.rowId === a.rowId));
    if (!hasPrimaryCoverage(catAssignments)) return false;
  }

  // Rule 2: every Field category has named Primary
  for (const cat of fieldCategories) {
    const catRows = governedRows.filter((r) => r.sheet === 'Field' && r.taskCategory === cat);
    const catAssignments = assignments.filter((a) => catRows.some((r) => r.rowId === a.rowId));
    if (!hasPrimaryCoverage(catAssignments)) return false;
  }

  // Rule 3: all critical Primary assignments acknowledged
  const criticalRows = governedRows.filter((r) => r.isCriticalCategory);
  for (const row of criticalRows) {
    const primaryAssignments = assignments.filter(
      (a) => a.rowId === row.rowId && a.value === 'Primary' && a.assignedPersonName !== null && a.assignedPersonName !== '',
    );
    for (const pa of primaryAssignments) {
      if (!isAssignmentAcknowledged(pa)) return false;
    }
  }

  return true;
};

// -- Matrix Readiness Computation (T05 §3) ------------------------------------

/**
 * Computes matrix readiness counts for the header per T05 §3.
 */
export const computeMatrixReadiness = (
  rows: ReadonlyArray<CertRow>,
  assignments: ReadonlyArray<Pick<IResponsibilityAssignment, 'rowId' | 'value' | 'assignedPersonName' | 'acknowledgedAt'>>,
): IMatrixReadiness => {
  const governedRows = rows.filter((r) => !r.isReminderOnly && !r.isCustomRow);

  // PM rows with Primary
  const pmRows = governedRows.filter((r) => r.sheet === 'PM');
  const pmWithPrimary = pmRows.filter((r) => {
    const rowAssignments = assignments.filter((a) => a.rowId === r.rowId);
    return hasPrimaryCoverage(rowAssignments);
  });

  // Field rows with Primary
  const fieldRows = governedRows.filter((r) => r.sheet === 'Field');
  const fieldWithPrimary = fieldRows.filter((r) => {
    const rowAssignments = assignments.filter((a) => a.rowId === r.rowId);
    return hasPrimaryCoverage(rowAssignments);
  });

  // Unacknowledged critical
  const criticalRows = governedRows.filter((r) => r.isCriticalCategory);
  let unacknowledgedCriticalCount = 0;
  for (const row of criticalRows) {
    const primaryAssignments = assignments.filter(
      (a) => a.rowId === row.rowId && a.value === 'Primary' && a.assignedPersonName !== null && a.assignedPersonName !== '',
    );
    for (const pa of primaryAssignments) {
      if (!isAssignmentAcknowledged(pa)) unacknowledgedCriticalCount++;
    }
  }

  return {
    pmRowsWithPrimaryCount: pmWithPrimary.length,
    fieldRowsWithPrimaryCount: fieldWithPrimary.length,
    unacknowledgedCriticalCount,
  };
};
