/**
 * SF26-T01 — Saved Views TypeScript Contract Stubs.
 *
 * Scope model, schema compatibility, reconciliation, view lifecycle,
 * filter/sort/group/presentation state, and module adapter interface.
 *
 * Governing: SF26-T01, SF26 Master Plan L-01/L-04/L-06
 */

// ── Scope Model ──────────────────────────────────────────────────────────

/** View ownership scope levels. */
export type SavedViewScope = 'personal' | 'team' | 'role' | 'system';

/** View lifecycle action. */
export type SavedViewAction = 'save' | 'apply' | 'set-default' | 'share' | 'delete' | 'duplicate';

// ── Core Interfaces ──────────────────────────────────────────────────────

/** A saved view definition with scope, schema, and presentation state. */
export interface ISavedViewDefinition {
  viewId: string;
  name: string;
  scope: SavedViewScope;
  ownerUpn: string;
  moduleKey: string;
  schemaVersion: string;
  filters: IFilterClause[];
  sort: ISortDefinition[];
  groups: IGroupDefinition[];
  presentation: IViewPresentationState;
  isDefault: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

/** A single filter clause. */
export interface IFilterClause {
  fieldKey: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

/** A sort definition. */
export interface ISortDefinition {
  fieldKey: string;
  direction: 'asc' | 'desc';
}

/** A group definition. */
export interface IGroupDefinition {
  fieldKey: string;
  collapsed: boolean;
}

/** View presentation state (columns, density, etc.). */
export interface IViewPresentationState {
  visibleColumns: string[];
  columnOrder: string[];
  density: 'compact' | 'normal' | 'comfortable';
  pinnedColumns: string[];
}

// ── Module Adapter Interface ─────────────────────────────────────────────

/**
 * Module adapter interface for saved view state mapping.
 *
 * Modules implement this to translate between their domain state
 * and the saved-views primitive contract.
 */
export interface ISavedViewStateMapper<TState> {
  moduleKey: string;
  toSavedView(state: TState): Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;
  fromSavedView(view: ISavedViewDefinition): TState;
  getSchemaVersion(): string;
}

// ── Schema Compatibility ─────────────────────────────────────────────────

/** Schema compatibility check result. */
export interface ISchemaCompatibilityResult {
  compatible: boolean;
  currentVersion: string;
  viewVersion: string;
  missingFields: string[];
  removedFields: string[];
  userMessage: string | null;
}

/** Reconciliation result after applying a view with schema drift. */
export interface IViewReconciliationResult {
  reconciled: boolean;
  droppedFilters: string[];
  droppedSorts: string[];
  droppedGroups: string[];
  droppedColumns: string[];
  userMessage: string;
}

// ── Scope Permissions ────────────────────────────────────────────────────

/** Permission check result for a view action. */
export interface IViewPermissionResult {
  allowed: boolean;
  reason: string | null;
}

// ── Co-Dependency Surface ────────────────────────────────────────────────

/** Handoff context consumed by export-runtime and bulk-actions. */
export interface ISavedViewContext {
  viewId: string;
  viewName: string;
  filters: IFilterClause[];
  sort: ISortDefinition[];
  visibleColumns: string[];
  scope: SavedViewScope;
}

// ── Telemetry ────────────────────────────────────────────────────────────

/** Saved view telemetry event type. */
export type SavedViewTelemetryEvent =
  | 'view-created'
  | 'view-applied'
  | 'view-shared'
  | 'view-deleted'
  | 'view-set-default'
  | 'schema-reconciled'
  | 'compatibility-warning';

// ── Constants ────────────────────────────────────────────────────────────

export const SAVED_VIEW_SCOPES: readonly SavedViewScope[] = ['personal', 'team', 'role', 'system'] as const;
export const SAVED_VIEW_ACTIONS: readonly SavedViewAction[] = ['save', 'apply', 'set-default', 'share', 'delete', 'duplicate'] as const;
