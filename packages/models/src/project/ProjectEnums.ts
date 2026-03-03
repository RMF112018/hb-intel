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
