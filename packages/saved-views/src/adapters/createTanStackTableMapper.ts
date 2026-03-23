/**
 * SF26-T07 — Canonical TanStack Table state mapper.
 *
 * Governing: SF26-T07, L-06
 */

import type { ISavedViewDefinition, ISavedViewStateMapper, ISavedViewSchemaDescriptor } from '../types/index.js';

/** Normalized cross-module TanStack Table state. */
export interface TanStackTableState {
  columnVisibility: Record<string, boolean>;
  sorting: Array<{ id: string; desc: boolean }>;
  grouping: string[];
  columnFilters: Array<{ id: string; value: unknown }>;
  columnOrder: string[];
  density: 'compact' | 'standard' | 'comfortable';
}

/**
 * Create a TanStack Table state mapper for saved views.
 */
export function createTanStackTableMapper(
  moduleKey: string,
  workspaceKey: string,
  schema: ISavedViewSchemaDescriptor,
): ISavedViewStateMapper<TanStackTableState> {
  return {
    serialize(state: TanStackTableState) {
      const visibleColumnKeys = Object.entries(state.columnVisibility).filter(([, v]) => v).map(([k]) => k);
      return {
        moduleKey,
        workspaceKey,
        title: '',
        scope: 'personal' as const,
        filterClauses: state.columnFilters.map(f => ({ field: f.id, operator: 'equals' as const, value: f.value })),
        sortBy: state.sorting.map(s => ({ field: s.id, direction: s.desc ? 'desc' as const : 'asc' as const })),
        groupBy: state.grouping.map(g => ({ field: g })),
        presentation: { visibleColumnKeys, columnOrder: state.columnOrder, density: state.density },
        schemaVersion: schema.schemaVersion,
      };
    },
    deserialize(view: ISavedViewDefinition): TanStackTableState {
      const columnVisibility: Record<string, boolean> = {};
      for (const key of schema.validColumnKeys) columnVisibility[key] = false;
      for (const key of view.presentation.visibleColumnKeys ?? []) columnVisibility[key] = true;
      return {
        columnVisibility,
        sorting: view.sortBy.map(s => ({ id: s.field, desc: s.direction === 'desc' })),
        grouping: view.groupBy.map(g => g.field),
        columnFilters: view.filterClauses.map(f => ({ id: f.field, value: f.value })),
        columnOrder: view.presentation.columnOrder ?? [],
        density: (view.presentation.density as TanStackTableState['density']) ?? 'standard',
      };
    },
    currentSchemaVersion() { return schema.schemaVersion; },
    currentSchema() { return schema; },
  };
}
