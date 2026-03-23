/**
 * P3-E4-T02 validation functions for budget line import.
 * All functions are pure and deterministic.
 */

import type { CostType, IBudgetImportRow, IBudgetImportValidationError } from '../types/index.js';
import { COST_TYPES, PROCORE_COST_TYPE_MAP } from '../constants/index.js';

export const FINANCIAL_VALIDATION_SCOPE = 'financial/validation';

/** Normalize a cost code: trim and replace spaces with hyphens ('XX XX XX' → 'XX-XX-XX'). */
export const normalizeCostCode = (raw: string): string =>
  raw.trim().replace(/\s+/g, '-');

/** Extract the code portion from a Procore CSV tier value ('03 - ESTIMATING' → '03'). */
export const extractCostCodeFromCsvTier = (raw: string): string => {
  const trimmed = raw.trim();
  const dashIndex = trimmed.indexOf(' - ');
  return dashIndex >= 0 ? trimmed.slice(0, dashIndex).trim() : trimmed;
};

/** Check whether a cost code tier1 value exists in the dictionary set after normalization. */
export const isValidCostCode = (
  tier1: string,
  costCodeSet: ReadonlySet<string>,
): boolean => {
  const extracted = extractCostCodeFromCsvTier(tier1);
  const normalized = normalizeCostCode(extracted);
  // Check if any code in the set starts with this division prefix
  for (const code of costCodeSet) {
    if (code.startsWith(normalized)) {
      return true;
    }
  }
  return false;
};

/**
 * Parse a Procore CSV cost type string to the canonical CostType.
 * Extracts the prefix before ' - ' and looks up in PROCORE_COST_TYPE_MAP.
 * Returns null if the value cannot be mapped.
 */
export const parseCostTypeFromCsv = (raw: string): CostType | null => {
  const trimmed = raw.trim();
  // Try direct match first (already a canonical value)
  if ((COST_TYPES as readonly string[]).includes(trimmed)) {
    return trimmed as CostType;
  }
  // Extract prefix before ' - '
  const dashIndex = trimmed.indexOf(' - ');
  const prefix = dashIndex >= 0 ? trimmed.slice(0, dashIndex).trim().toUpperCase() : trimmed.toUpperCase();
  return PROCORE_COST_TYPE_MAP[prefix] ?? null;
};

/** Validate a single budget import row. Returns an array of errors (empty = valid). */
export const validateBudgetImportRow = (
  row: IBudgetImportRow,
  rowIndex: number,
  costCodeSet: ReadonlySet<string>,
): IBudgetImportValidationError[] => {
  const errors: IBudgetImportValidationError[] = [];

  if (!row.budgetCode || row.budgetCode.trim() === '') {
    errors.push({ rowIndex, field: 'budgetCode', value: row.budgetCode ?? '', message: 'Budget code is required' });
  }

  if (!row.budgetCodeDescription || row.budgetCodeDescription.trim() === '') {
    errors.push({ rowIndex, field: 'budgetCodeDescription', value: row.budgetCodeDescription ?? '', message: 'Budget code description is required' });
  }

  const parsedCostType = parseCostTypeFromCsv(row.costType ?? '');
  if (parsedCostType === null) {
    errors.push({ rowIndex, field: 'costType', value: row.costType ?? '', message: `Invalid cost type. Expected one of: ${COST_TYPES.join(', ')}` });
  }

  if (!row.costCodeTier1 || row.costCodeTier1.trim() === '') {
    errors.push({ rowIndex, field: 'costCodeTier1', value: row.costCodeTier1 ?? '', message: 'Cost code tier 1 is required' });
  } else if (!isValidCostCode(row.costCodeTier1, costCodeSet)) {
    errors.push({ rowIndex, field: 'costCodeTier1', value: row.costCodeTier1, message: 'Cost code tier 1 not found in cost-code dictionary' });
  }

  const originalBudget = parseFloat(row.originalBudget);
  if (isNaN(originalBudget)) {
    errors.push({ rowIndex, field: 'originalBudget', value: row.originalBudget ?? '', message: 'Original budget must be a valid number' });
  } else if (originalBudget < 0) {
    errors.push({ rowIndex, field: 'originalBudget', value: row.originalBudget, message: 'Original budget must not be negative' });
  }

  return errors;
};

/** Validate an entire import batch. Checks per-row validation plus duplicate budgetCode detection. */
export const validateBudgetImportBatch = (
  rows: readonly IBudgetImportRow[],
  costCodeSet: ReadonlySet<string>,
): { valid: boolean; errors: readonly IBudgetImportValidationError[] } => {
  const allErrors: IBudgetImportValidationError[] = [];

  // Per-row validation
  for (let i = 0; i < rows.length; i++) {
    const rowErrors = validateBudgetImportRow(rows[i], i, costCodeSet);
    allErrors.push(...rowErrors);
  }

  // Duplicate budgetCode detection
  const seen = new Map<string, number>();
  for (let i = 0; i < rows.length; i++) {
    const code = rows[i].budgetCode?.trim();
    if (code) {
      const prev = seen.get(code);
      if (prev !== undefined) {
        allErrors.push({
          rowIndex: i,
          field: 'budgetCode',
          value: code,
          message: `Duplicate budget code "${code}" (first seen at row ${prev})`,
        });
      } else {
        seen.set(code, i);
      }
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors };
};
