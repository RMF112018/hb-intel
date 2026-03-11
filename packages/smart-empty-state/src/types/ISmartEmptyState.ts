// T02 canonical types — exactly per SF11-T02-TypeScript-Contracts.md

export type EmptyStateClassification =
  | 'first-use'
  | 'truly-empty'
  | 'filter-empty'
  | 'permission-empty'
  | 'loading-failed';

export type EmptyStateVariant = 'full-page' | 'inline';

export interface IEmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'button' | 'link';
}

export interface IEmptyStateContext {
  module: string;
  view: string;
  hasActiveFilters: boolean;
  hasPermission: boolean;
  isFirstVisit: boolean;
  currentUserRole: string;
  isLoadError: boolean;
}

export interface IEmptyStateConfig {
  module: string;
  view: string;
  classification: EmptyStateClassification;
  illustration?: string;
  heading: string;
  description: string;
  primaryAction?: IEmptyStateAction;
  secondaryAction?: IEmptyStateAction;
  filterClearAction?: IEmptyStateAction;
  coachingTip?: string;
}

export interface ISmartEmptyStateConfig {
  resolve: (context: IEmptyStateContext) => IEmptyStateConfig;
}

export interface IEmptyStateVisitStore {
  hasVisited: (module: string, view: string) => boolean;
  markVisited: (module: string, view: string) => void;
}

export interface IUseFirstVisitResult {
  isFirstVisit: boolean;
  markVisited: () => void;
}

export interface IUseEmptyStateResult {
  classification: EmptyStateClassification;
  resolved: IEmptyStateConfig;
}
