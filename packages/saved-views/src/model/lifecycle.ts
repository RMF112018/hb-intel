/**
 * SF26-T03 — View lifecycle state and helpers.
 *
 * Governing: SF26-T03, L-01
 */

import type { ISavedViewDefinition, SavedViewScope, IFilterClause, ISortDefinition, IGroupDefinition, IViewPresentationState } from '../types/index.js';

/** View lifecycle state. */
export type ViewLifecycleState =
  | 'active'
  | 'default'
  | 'saved'
  | 'unsaved-changes'
  | 'degraded-compatible'
  | 'incompatible'
  | 'pending-share'
  | 'deleted';

export const VIEW_LIFECYCLE_STATES: readonly ViewLifecycleState[] = [
  'active', 'default', 'saved', 'unsaved-changes',
  'degraded-compatible', 'incompatible', 'pending-share', 'deleted',
] as const;

/** Input for creating a new saved view. */
export interface ICreateSavedViewInput {
  moduleKey: string;
  workspaceKey: string;
  title: string;
  description?: string;
  scope: SavedViewScope;
  ownerUserId?: string;
  filterClauses: IFilterClause[];
  sortBy: ISortDefinition[];
  groupBy: IGroupDefinition[];
  presentation: IViewPresentationState;
  isDefault?: boolean;
  schemaVersion: number;
}

/**
 * Create a new saved view definition.
 */
export function createSavedView(input: ICreateSavedViewInput, now?: Date): ISavedViewDefinition {
  if (!input.moduleKey) throw new Error('SavedViews: moduleKey is required');
  if (!input.workspaceKey) throw new Error('SavedViews: workspaceKey is required');
  if (!input.title) throw new Error('SavedViews: title is required');

  const timestamp = (now ?? new Date()).toISOString();
  return {
    viewId: crypto.randomUUID(),
    moduleKey: input.moduleKey,
    workspaceKey: input.workspaceKey,
    title: input.title,
    description: input.description,
    scope: input.scope,
    ownerUserId: input.ownerUserId,
    filterClauses: input.filterClauses,
    sortBy: input.sortBy,
    groupBy: input.groupBy,
    presentation: input.presentation,
    isDefault: input.isDefault ?? false,
    schemaVersion: input.schemaVersion,
    createdAtIso: timestamp,
    updatedAtIso: timestamp,
  };
}
