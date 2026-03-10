import type { ISeedFieldMapping, ISeedValidationError, ISeedRowMeta } from '../types';

/**
 * Validates a single parsed row against the active field mappings.
 *
 * D-03: Runs both during validate-on-map (single field) and
 *       full-pass validation (all fields).
 *
 * @param row           - The raw source row (string-keyed record)
 * @param rowNumber     - 1-based row number for error reporting
 * @param activeMapping - Map of sourceColumn → destinationField
 * @param fieldMappings - The ISeedFieldMapping array from the config
 *
 * @returns ISeedRowMeta with isValid flag and errors array
 */
export function validateRow<TSource, TDest>(
  row: TSource,
  rowNumber: number,
  activeMapping: Record<string, keyof TDest>,
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): ISeedRowMeta {
  const errors: ISeedValidationError[] = [];
  const rawRow = row as Record<string, string>;

  // Build a reverse index: destinationField → source column(s) in activeMapping
  const destToSourceCol = new Map<keyof TDest, string>();
  for (const [sourceCol, destField] of Object.entries(activeMapping)) {
    destToSourceCol.set(destField as keyof TDest, sourceCol);
  }

  for (const mapping of fieldMappings) {
    const sourceCol = destToSourceCol.get(mapping.destinationField);

    // Check required fields
    if (mapping.required) {
      if (!sourceCol) {
        // Required field is not mapped — this is a config-level error,
        // not a row-level error. Should be caught by isMappingComplete check.
        continue;
      }
      const value = rawRow[sourceCol] ?? '';
      if (value.trim() === '') {
        errors.push({
          row: rowNumber,
          column: sourceCol,
          value: '',
          error: `"${mapping.label}" is required and cannot be empty.`,
        });
        continue;
      }
    }

    // Run field-level validate function if present
    if (sourceCol && mapping.validate) {
      const value = rawRow[sourceCol] ?? '';
      const errorMsg = mapping.validate(value);
      if (errorMsg !== null) {
        errors.push({
          row: rowNumber,
          column: sourceCol,
          value,
          error: errorMsg,
        });
      }
    }
  }

  return {
    rowNumber,
    isValid: errors.length === 0,
    errors,
    skipped: false,
  };
}

/**
 * Runs validateRow on all rows and returns the full ISeedRowMeta array.
 * Used for the full-pass validation before the Preview step.
 */
export function validateAllRows<TSource, TDest>(
  rows: TSource[],
  activeMapping: Record<string, keyof TDest>,
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): ISeedRowMeta[] {
  return rows.map((row, index) =>
    validateRow(row, index + 1, activeMapping, fieldMappings)
  );
}
