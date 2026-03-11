/**
 * Badge rollup counts for the admin alert badge component.
 *
 * @design D-07
 */
export interface IAdminAlertBadge {
  readonly criticalCount: number;
  readonly highCount: number;
  readonly mediumCount: number;
  readonly lowCount: number;
  readonly totalCount: number;
}
