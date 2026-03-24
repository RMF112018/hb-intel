/**
 * P3-E10-T05 Lessons Learned Operating Model enumerations.
 * Lesson categories, report-level classification, impact magnitude.
 */

// -- Lesson Category (§2.1) -------------------------------------------------

/** 15 lesson categories per T05 §2.1. */
export type LessonCategory =
  | 'PreConstruction'
  | 'EstimatingBid'
  | 'Procurement'
  | 'Schedule'
  | 'CostBudget'
  | 'Safety'
  | 'Quality'
  | 'Subcontractors'
  | 'DesignRFIs'
  | 'OwnerClient'
  | 'TechnologyBIM'
  | 'WorkforceLabor'
  | 'Commissioning'
  | 'CloseoutTurnover'
  | 'Other';

// -- Delivery Method (§2.2) -------------------------------------------------

/** Project delivery method per T05 §2.2. */
export type DeliveryMethod =
  | 'DesignBidBuild'
  | 'DesignBuild'
  | 'CMAtRisk'
  | 'GMP'
  | 'LumpSum'
  | 'IDIQJobOrder'
  | 'PublicPrivateP3';

// -- Market Sector (§2.2) ---------------------------------------------------

/** Market sector per T05 §2.2. */
export type MarketSector =
  | 'K12Education'
  | 'HigherEducation'
  | 'HealthcareMedical'
  | 'GovernmentCivic'
  | 'OfficeCommercial'
  | 'IndustrialMfg'
  | 'RetailHospitality'
  | 'ResidentialMixedUse'
  | 'TransportationInfra'
  | 'DataCenterTech'
  | 'MissionCritical'
  | 'RenovationHistoric'
  | 'Other';

// -- Project Size Band (§2.2) -----------------------------------------------

/** Project size band per T05 §2.2. */
export type ProjectSizeBand =
  | 'Under1M'
  | 'OneToFiveM'
  | 'FiveToFifteenM'
  | 'FifteenToFiftyM'
  | 'FiftyToOneHundredM'
  | 'OverOneHundredM';

// -- Impact Magnitude (§2.2, §3) --------------------------------------------

/** System-derived impact magnitude per T05 §2.2 and §3. Not user-selectable. */
export type ImpactMagnitude =
  | 'Minor'
  | 'Moderate'
  | 'Significant'
  | 'Critical';
