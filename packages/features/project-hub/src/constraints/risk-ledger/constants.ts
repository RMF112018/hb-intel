/**
 * P3-E6-T01 Risk Ledger constants.
 * Contract-locked values for enumerations, transition rules, and governed defaults.
 */

import type { RiskCategory, RiskImpact, RiskProbability, RiskStatus } from './enums.js';

// ── Module Scope ────────────────────────────────────────────────────

export const CONSTRAINTS_MODULE_SCOPE = 'constraints' as const;
export const RISK_LEDGER_SCOPE = 'constraints/risk-ledger' as const;

// ── Status Enumerations (§1.3) ──────────────────────────────────────

export const RISK_STATUSES = [
  'Identified',
  'UnderAssessment',
  'Mitigated',
  'Accepted',
  'MaterializationPending',
  'Closed',
  'Void',
  'Cancelled',
] as const satisfies ReadonlyArray<RiskStatus>;

export const TERMINAL_RISK_STATUSES = [
  'Closed',
  'Void',
  'Cancelled',
] as const satisfies ReadonlyArray<RiskStatus>;

// ── Category Enumeration (§1.4) ────────────────────────────────────

export const RISK_CATEGORIES = [
  'SITE_CONDITIONS',
  'DESIGN',
  'PERMITS_REGULATORY',
  'PROCUREMENT',
  'LABOR',
  'SUBCONTRACTOR',
  'WEATHER_ENVIRONMENTAL',
  'FINANCIAL',
  'SCHEDULE',
  'SCOPE',
  'STAKEHOLDER',
  'SAFETY_HEALTH',
  'LEGAL_CONTRACTUAL',
  'TECHNOLOGY',
  'FORCE_MAJEURE',
  'OTHER',
] as const satisfies ReadonlyArray<RiskCategory>;

// ── Probability and Impact Scales (§1.5) ────────────────────────────

export const RISK_PROBABILITY_LEVELS = [1, 2, 3, 4, 5] as const satisfies ReadonlyArray<RiskProbability>;
export const RISK_IMPACT_LEVELS = [1, 2, 3, 4, 5] as const satisfies ReadonlyArray<RiskImpact>;

// ── State Transition Map (§1.3) ─────────────────────────────────────

export const VALID_RISK_TRANSITIONS: Readonly<Record<RiskStatus, readonly RiskStatus[]>> = {
  Identified: ['UnderAssessment', 'Accepted', 'Void'],
  UnderAssessment: ['Mitigated', 'Accepted', 'MaterializationPending', 'Void'],
  Mitigated: ['Accepted', 'Closed', 'MaterializationPending'],
  Accepted: ['Closed', 'MaterializationPending'],
  MaterializationPending: ['Closed'],
  Closed: [],
  Void: [],
  Cancelled: [],
};

// ── Immutable Fields (R-01) ─────────────────────────────────────────

export const RISK_IMMUTABLE_FIELDS = [
  'riskId',
  'projectId',
  'riskNumber',
  'category',
  'dateIdentified',
  'identifiedBy',
  'createdAt',
  'createdBy',
] as const;

// ── Governed Defaults ───────────────────────────────────────────────

/** Default high-risk score threshold. Governed; configurable by Manager of Operational Excellence. */
export const DEFAULT_HIGH_RISK_SCORE_THRESHOLD = 15;

// ── Label Maps ──────────────────────────────────────────────────────

export const RISK_PROBABILITY_LABELS: Readonly<Record<RiskProbability, string>> = {
  1: 'Low',
  2: 'Medium-Low',
  3: 'Medium',
  4: 'Medium-High',
  5: 'High',
};

export const RISK_IMPACT_LABELS: Readonly<Record<RiskImpact, string>> = {
  1: 'Low',
  2: 'Medium-Low',
  3: 'Medium',
  4: 'Medium-High',
  5: 'High',
};

export const RISK_CATEGORY_LABELS: Readonly<Record<RiskCategory, string>> = {
  SITE_CONDITIONS: 'Site conditions and geotechnical',
  DESIGN: 'Design completeness and coordination',
  PERMITS_REGULATORY: 'Permits, approvals, and regulatory',
  PROCUREMENT: 'Materials, equipment, and supply chain',
  LABOR: 'Labor availability and workforce',
  SUBCONTRACTOR: 'Subcontractor performance and capacity',
  WEATHER_ENVIRONMENTAL: 'Weather and environmental',
  FINANCIAL: 'Budget, cost, and commercial exposure',
  SCHEDULE: 'Schedule and sequencing risk',
  SCOPE: 'Scope creep, scope gaps, and changes',
  STAKEHOLDER: 'Owner, stakeholder, and third-party',
  SAFETY_HEALTH: 'Safety and health',
  LEGAL_CONTRACTUAL: 'Legal, contractual, and claims risk',
  TECHNOLOGY: 'Technology and systems',
  FORCE_MAJEURE: 'Force majeure and uncontrollable events',
  OTHER: 'Unclassified risk',
};
