/**
 * SF26-T03 — Schema compatibility reconciliation.
 *
 * Governing: SF26-T03, L-03
 */

import type {
  ISavedViewDefinition,
  ISavedViewSchemaDescriptor,
  ISavedViewCompatibilityResult,
  SavedViewCompatibilityStatus,
} from '../types/index.js';

/**
 * Reconcile a saved view against the current module schema.
 *
 * Returns compatible/degraded-compatible/incompatible with user explanation.
 */
export function reconcile(
  view: ISavedViewDefinition,
  schema: ISavedViewSchemaDescriptor,
): ISavedViewCompatibilityResult {
  const validColumns = new Set(schema.validColumnKeys);
  const validFilters = new Set(schema.validFilterFields);
  const validGroups = new Set(schema.validGroupFields);

  const removedColumns = (view.presentation.visibleColumnKeys ?? [])
    .filter(k => !validColumns.has(k));
  const removedFilterFields = view.filterClauses
    .map(f => f.field)
    .filter(k => !validFilters.has(k));
  const removedGroupFields = view.groupBy
    .map(g => g.field)
    .filter(k => !validGroups.has(k));

  if (removedColumns.length === 0 && removedFilterFields.length === 0 && removedGroupFields.length === 0) {
    return {
      status: 'compatible',
      removedColumns: [],
      removedFilterFields: [],
      removedGroupFields: [],
      fallbackApplied: false,
      userExplanation: '',
    };
  }

  // Check if applying without removed items still yields a meaningful view
  const remainingColumns = (view.presentation.visibleColumnKeys ?? []).filter(k => validColumns.has(k));
  const remainingFilters = view.filterClauses.filter(f => validFilters.has(f.field));

  const isIncompatible = remainingColumns.length === 0 && (view.presentation.visibleColumnKeys ?? []).length > 0;

  const status: SavedViewCompatibilityStatus = isIncompatible ? 'incompatible' : 'degraded-compatible';

  const explanation = status === 'incompatible'
    ? 'This saved view references fields that no longer exist in the current workspace. Reset the view or save a new one.'
    : buildDegradedExplanation(removedColumns, removedFilterFields, removedGroupFields);

  return {
    status,
    removedColumns,
    removedFilterFields,
    removedGroupFields,
    fallbackApplied: status === 'degraded-compatible',
    userExplanation: explanation,
  };
}

function buildDegradedExplanation(
  columns: string[],
  filters: string[],
  groups: string[],
): string {
  const parts: string[] = [];
  if (columns.length > 0) {
    parts.push(`${columns.length} column(s) are no longer available and have been removed from this view: ${columns.join(', ')}`);
  }
  if (filters.length > 0) {
    parts.push(`${filters.length} filter field(s) have been removed: ${filters.join(', ')}`);
  }
  if (groups.length > 0) {
    parts.push(`${groups.length} grouping field(s) have been removed: ${groups.join(', ')}`);
  }
  return parts.join('. ') + '.';
}
