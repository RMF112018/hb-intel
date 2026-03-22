/**
 * Lifecycle status for a construction project.
 */
export enum ProjectStatus {
  /** Project is actively under construction or management. */
  Active = 'Active',
  /** Project is temporarily paused. */
  OnHold = 'OnHold',
  /** Project has been completed and closed out. */
  Completed = 'Completed',
  /** Project was cancelled before completion. */
  Cancelled = 'Cancelled',
}

/**
 * Phase 3 canonical lifecycle status for the project registry (P3-A1 §2.2).
 *
 * Distinct from the legacy `ProjectStatus` enum to preserve backward compatibility.
 */
export type ProjectLifecycleStatus =
  | 'Active'
  | 'Planning'
  | 'OnHold'
  | 'Completed'
  | 'Closed';
