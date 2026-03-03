import { RiskCategory, RiskStatus } from './RiskEnums.js';

/**
 * Risk-specific constants.
 *
 * @module risk/constants
 */

/** Human-readable labels for risk categories. */
export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  [RiskCategory.Safety]: 'Safety',
  [RiskCategory.Financial]: 'Financial',
  [RiskCategory.Schedule]: 'Schedule',
  [RiskCategory.Quality]: 'Quality',
  [RiskCategory.Regulatory]: 'Regulatory',
  [RiskCategory.Environmental]: 'Environmental',
};

/** Human-readable labels for risk statuses. */
export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  [RiskStatus.Identified]: 'Identified',
  [RiskStatus.Open]: 'Open',
  [RiskStatus.Mitigating]: 'Mitigating',
  [RiskStatus.Mitigated]: 'Mitigated',
  [RiskStatus.Realized]: 'Realized',
  [RiskStatus.Closed]: 'Closed',
};

/** Probability threshold above which a risk is considered high-priority. */
export const HIGH_RISK_PROBABILITY_THRESHOLD = 0.7;
