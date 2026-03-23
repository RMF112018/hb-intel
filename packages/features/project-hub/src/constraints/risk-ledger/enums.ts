/**
 * P3-E6-T01 Risk Ledger enumerations.
 * String literal union types for all governed value sets.
 */

// ── Risk Status Lifecycle (§1.3) ────────────────────────────────────

/** Risk lifecycle status. Terminal states: Closed, Void, Cancelled. */
export type RiskStatus =
  | 'Identified'
  | 'UnderAssessment'
  | 'Mitigated'
  | 'Accepted'
  | 'MaterializationPending'
  | 'Closed'
  | 'Void'
  | 'Cancelled';

// ── Risk Category (§1.4) ────────────────────────────────────────────

/**
 * Governed risk category. Immutable after creation.
 * Manager of Operational Excellence may add, rename, or retire via governed configuration.
 */
export type RiskCategory =
  | 'SITE_CONDITIONS'
  | 'DESIGN'
  | 'PERMITS_REGULATORY'
  | 'PROCUREMENT'
  | 'LABOR'
  | 'SUBCONTRACTOR'
  | 'WEATHER_ENVIRONMENTAL'
  | 'FINANCIAL'
  | 'SCHEDULE'
  | 'SCOPE'
  | 'STAKEHOLDER'
  | 'SAFETY_HEALTH'
  | 'LEGAL_CONTRACTUAL'
  | 'TECHNOLOGY'
  | 'FORCE_MAJEURE'
  | 'OTHER';

// ── Probability and Impact Scales (§1.5) ────────────────────────────

/** Ordinal probability level (1–5). Multiplied with impact to produce riskScore. */
export type RiskProbability = 1 | 2 | 3 | 4 | 5;

/** Ordinal impact level (1–5). Multiplied with probability to produce riskScore. */
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
