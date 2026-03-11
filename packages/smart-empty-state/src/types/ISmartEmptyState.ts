/**
 * Classification of an empty state context.
 *
 * - `truly-empty` — No data exists for this module/context.
 * - `not-yet-configured` — Module exists but requires setup.
 * - `filtered-to-zero` — Data exists but current filters yield no results.
 * - `error` — Classification failed due to an error.
 * - `loading` — Classification is in progress.
 */
export type EmptyStateClassification =
  | 'truly-empty'
  | 'not-yet-configured'
  | 'filtered-to-zero'
  | 'error'
  | 'loading';

/**
 * Configuration interface for the smart empty state resolver.
 * Placeholder — will be expanded in T02/T03.
 */
export interface ISmartEmptyStateConfig {
  /** Module identifier for classification context */
  readonly moduleId: string;
  /** Whether to enable first-visit detection */
  readonly enableFirstVisit?: boolean;
}
