/**
 * P3-E8-T08 Readiness evaluation enumerations.
 * Decision levels, blocker types, exception/override status.
 */

// -- Readiness Evaluation Level (§2) ----------------------------------------

export type ReadinessEvaluationLevel = 'PROJECT' | 'SUBCONTRACTOR' | 'ACTIVITY';

// -- Readiness Decision (§1) ------------------------------------------------

export type ReadinessDecision = 'READY' | 'READY_WITH_EXCEPTION' | 'NOT_READY';

// -- Blocker Type (§4-6) ----------------------------------------------------

export type ReadinessBlockerType = 'HARD' | 'SOFT';

// -- Exception Status (§7) --------------------------------------------------

export type ExceptionStatus = 'ACTIVE' | 'LAPSED' | 'REVOKED';

// -- Override Status (§8) ---------------------------------------------------

export type OverrideStatus = 'PENDING' | 'ACKNOWLEDGED' | 'LAPSED' | 'REVOKED';
