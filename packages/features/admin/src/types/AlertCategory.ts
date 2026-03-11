/**
 * Six monitored alert categories per D-02.
 *
 * @design D-02
 */
export type AlertCategory =
  | 'provisioning-failure'
  | 'permission-anomaly'
  | 'stuck-workflow'
  | 'overdue-provisioning-task'
  | 'upcoming-expiration'
  | 'stale-record';
