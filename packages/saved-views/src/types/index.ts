/**
 * SF26-T02 — Saved Views TypeScript Contracts.
 *
 * View model, scope ownership, schema compatibility, module adapter
 * interface, co-dependency surface, and lifecycle actions.
 *
 * Governing: SF26-T02, SF26 Master Plan L-01/L-02/L-03/L-04/L-05
 */

// ── Scope Model ──────────────────────────────────────────────────────────

export type SavedViewScope = 'personal' | 'team' | 'role' | 'system';

// ── Filter / Sort / Group / Presentation ─────────────────────────────────

export interface IFilterClause {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'is-empty' | 'is-not-empty';
  value?: unknown;
}

export interface ISortDefinition {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IGroupDefinition {
  field: string;
}

export interface IViewPresentationState {
  density?: 'compact' | 'standard' | 'comfortable';
  visibleColumnKeys?: string[];
  columnOrder?: string[];
}

// ── Core View Definition ─────────────────────────────────────────────────

export interface ISavedViewDefinition {
  viewId: string;
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
  createdAtIso: string;
  updatedAtIso: string;
}

// ── Module Adapter Interface ─────────────────────────────────────────────

export interface ISavedViewSchemaDescriptor {
  moduleKey: string;
  workspaceKey: string;
  validColumnKeys: string[];
  validFilterFields: string[];
  validGroupFields: string[];
  schemaVersion: number;
}

export interface ISavedViewStateMapper<TState> {
  serialize(state: TState): Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;
  deserialize(view: ISavedViewDefinition): TState;
  currentSchemaVersion(): number;
  currentSchema(): ISavedViewSchemaDescriptor;
}

// ── Schema Compatibility ─────────────────────────────────────────────────

export type SavedViewCompatibilityStatus = 'compatible' | 'degraded-compatible' | 'incompatible';

export interface ISavedViewCompatibilityResult {
  status: SavedViewCompatibilityStatus;
  removedColumns: string[];
  removedFilterFields: string[];
  removedGroupFields: string[];
  fallbackApplied: boolean;
  userExplanation: string;
}

// ── Scope Permissions ────────────────────────────────────────────────────

export interface ISavedViewScopePermissions {
  canSavePersonal: boolean;
  canSaveTeam: boolean;
  canSaveRole: boolean;
  canSaveSystem: boolean;
  teamIds: string[];
  roleIds: string[];
}

export interface ISavedViewOwnershipCheck {
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

// ── Co-Dependency Surface ────────────────────────────────────────────────

export interface ISavedViewContext {
  activeViewId: string | undefined;
  activeViewTitle: string | undefined;
  activeFilterClauses: IFilterClause[];
  activeSortBy: ISortDefinition[];
  activeGroupBy: IGroupDefinition[];
  activePresentation: IViewPresentationState;
  moduleKey: string;
  workspaceKey: string;
}

// ── Lifecycle Actions ────────────────────────────────────────────────────

export type SavedViewAction =
  | { type: 'apply'; viewId: string }
  | { type: 'save'; patch: Partial<ISavedViewDefinition> }
  | { type: 'save-as-new'; definition: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'> }
  | { type: 'set-default'; viewId: string }
  | { type: 'clear-default'; moduleKey: string; workspaceKey: string }
  | { type: 'delete'; viewId: string }
  | { type: 'duplicate'; viewId: string; newTitle: string }
  | { type: 'share'; viewId: string; targetScope: 'team' | 'role' | 'system' };

// ── Telemetry ────────────────────────────────────────────────────────────

export type SavedViewTelemetryEvent =
  | 'view-created'
  | 'view-applied'
  | 'view-shared'
  | 'view-deleted'
  | 'view-set-default'
  | 'schema-reconciled'
  | 'compatibility-warning';

// ── Complexity Integration (T07) ─────────────────────────────────────────

/** Complexity-based default view resolution (T07). */
export interface IComplexityViewDefault {
  complexityLevel: 'essential' | 'standard' | 'expert';
  defaultViewId: string | undefined;
}

// ── Constants ────────────────────────────────────────────────────────────

export const SAVED_VIEW_SCOPES: readonly SavedViewScope[] = ['personal', 'team', 'role', 'system'] as const;

export const SAVED_VIEW_COMPATIBILITY_STATUSES: readonly SavedViewCompatibilityStatus[] = [
  'compatible', 'degraded-compatible', 'incompatible',
] as const;
