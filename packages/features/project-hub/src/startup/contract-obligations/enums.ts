/**
 * P3-E11-T10 Stage 5 Project Startup Contract Obligations Register enumerations.
 * Obligation lifecycle, categories, triggers, monitoring, contract metadata.
 */

// -- Obligation Status (T04 §4) ---------------------------------------------

/** Obligation lifecycle states per T04 §4. */
export type ObligationStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'SATISFIED'
  | 'WAIVED'
  | 'NOT_APPLICABLE';

// -- Obligation Category (T04 §5) -------------------------------------------

/** The 12 obligation categories per T04 §5. */
export type ObligationCategory =
  | 'SPECIAL_TERMS'
  | 'LIQUIDATED_DAMAGES'
  | 'SPLIT_SAVINGS'
  | 'ALLOWANCES'
  | 'BONDING_REQUIREMENTS'
  | 'INSURANCE_REQUIREMENTS'
  | 'SCHEDULE_MILESTONES'
  | 'PAYMENT_TERMS'
  | 'CHANGE_ORDER_AUTHORITY'
  | 'WARRANTIES'
  | 'OWNER_COMMITMENT'
  | 'OTHER';

// -- Obligation Trigger Basis (T04 §3.1) ------------------------------------

/** Obligation trigger basis per T04 §3.1. */
export type ObligationTriggerBasis =
  | 'PROJECT_START'
  | 'NTP_ISSUED'
  | 'CONTRACT_EXECUTION'
  | 'MILESTONE_DATE'
  | 'RECURRING_MONTHLY'
  | 'RECURRING_QUARTERLY'
  | 'OWNER_NOTICE'
  | 'AS_NEEDED'
  | 'PROJECT_CLOSE'
  | 'NONE';

// -- Monitoring Priority (T04 §6.2) -----------------------------------------

/** Monitoring priority per T04 §6.2. Governs reminder lead days. */
export type MonitoringPriority =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

// -- Contract Type (T04 §9) -------------------------------------------------

/** Owner contract type per T04 §9. */
export type ContractType =
  | 'AIA Docs'
  | 'Consensus Docs'
  | 'Construction Manager'
  | 'Cost Plus with GMP'
  | 'Cost Plus without GMP'
  | 'Lump Sum'
  | 'Purchase Order'
  | 'Stipulated Sum'
  | 'Time & Material';

// -- Delivery Method (T04 §9) -----------------------------------------------

/** Project delivery method per T04 §9. */
export type StartupDeliveryMethod =
  | 'Construction Manager'
  | 'Design Build'
  | 'Fast Track'
  | 'General Contractor'
  | 'Owners Representative'
  | 'P3'
  | 'Preconstruction'
  | 'Program Manager';

// -- Stage 5 Activity Spine Events (T10 §2 Stage 5) -------------------------

/** Activity Spine events emitted by Stage 5. */
export type Stage5ActivityEvent =
  | 'ContractObligationAdded'
  | 'ContractObligationStatusChanged';

// -- Stage 5 Health Spine Metrics (T10 §2 Stage 5) --------------------------

/** Health Spine metrics published by Stage 5. */
export type Stage5HealthMetric =
  | 'contractObligationsFlagged'
  | 'contractObligationsOverdue';

// -- Stage 5 Work Queue Items (T10 §2 Stage 5) ------------------------------

/** Work Queue items raised by Stage 5. */
export type Stage5WorkQueueItem =
  | 'ObligationOpenFlagged'
  | 'ObligationDueSoon'
  | 'ObligationOverdue';
