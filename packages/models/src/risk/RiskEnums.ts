/**
 * Category classification for a risk item.
 */
export enum RiskCategory {
  /** Safety-related risk. */
  Safety = 'Safety',
  /** Financial / budget risk. */
  Financial = 'Financial',
  /** Schedule / timeline risk. */
  Schedule = 'Schedule',
  /** Quality / workmanship risk. */
  Quality = 'Quality',
  /** Regulatory or legal risk. */
  Regulatory = 'Regulatory',
  /** Environmental risk. */
  Environmental = 'Environmental',
}

/**
 * Lifecycle status for a risk item.
 */
export enum RiskStatus {
  /** Risk has been identified but not yet assessed. */
  Identified = 'Identified',
  /** Risk is being actively monitored. */
  Open = 'Open',
  /** Mitigation actions are in progress. */
  Mitigating = 'Mitigating',
  /** Risk has been fully mitigated. */
  Mitigated = 'Mitigated',
  /** Risk materialized into an actual issue. */
  Realized = 'Realized',
  /** Risk was closed without materializing. */
  Closed = 'Closed',
}
