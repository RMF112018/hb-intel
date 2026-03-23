/**
 * P3-E6-T02 Constraint Ledger enumerations.
 * String literal union types for all governed value sets.
 */

// ── Constraint Status Lifecycle (§2.3) ──────────────────────────────

/** Constraint lifecycle status. Terminal states: Resolved, Void, Cancelled, Superseded. */
export type ConstraintStatus =
  | 'Identified'
  | 'UnderAction'
  | 'Pending'
  | 'Resolved'
  | 'Void'
  | 'Cancelled'
  | 'Superseded';

// ── Constraint Category (§2.4) ──────────────────────────────────────

/**
 * Governed constraint category. Immutable after creation.
 * Manager of Operational Excellence may add, rename, or retire via governed configuration.
 */
export type ConstraintCategory =
  | 'DESIGN'
  | 'PERMITS'
  | 'PROCUREMENT'
  | 'LABOR'
  | 'WEATHER'
  | 'SAFETY'
  | 'QUALITY'
  | 'SCHEDULE'
  | 'COST'
  | 'ENVIRONMENTAL'
  | 'EQUIPMENT'
  | 'COMMUNICATION'
  | 'SITE_ACCESS'
  | 'UTILITIES'
  | 'GEOTECHNICAL'
  | 'LEGAL'
  | 'TECHNOLOGY'
  | 'SECURITY'
  | 'SUBCONTRACTOR'
  | 'INSPECTIONS'
  | 'LOGISTICS'
  | 'STAKEHOLDER'
  | 'OWNER_REQUIREMENTS'
  | 'CHANGE_MANAGEMENT'
  | 'PUBLIC_WORKS'
  | 'OTHER';

// ── Constraint Priority (§2.5) ──────────────────────────────────────

/**
 * Governed constraint priority level.
 * 1 = Critical, 2 = High, 3 = Medium, 4 = Low.
 */
export type ConstraintPriority = 1 | 2 | 3 | 4;
