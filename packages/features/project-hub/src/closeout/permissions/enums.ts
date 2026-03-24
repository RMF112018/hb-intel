/**
 * P3-E10-T09 Permissions, Visibility, Executive Review enumerations.
 */

// -- Closeout Roles (§1) ----------------------------------------------------

/** 6 roles in the Closeout module per T09 §1. */
export type CloseoutRole =
  | 'PM'
  | 'SUPT'
  | 'PE'
  | 'PER'
  | 'MOE'
  | 'SUB_INTELLIGENCE_VIEWER';

// -- Intelligence Visibility Regime (§3.1) ----------------------------------

/** Two intelligence visibility regimes per T09 §3.1. */
export type CloseoutIntelligenceVisibility =
  | 'BroadlyAvailable'
  | 'Restricted';

// -- Annotation Source (§4.3) -----------------------------------------------

/** Annotation source for visibility rules per T09 §4.3. */
export type CloseoutAnnotationSource =
  | 'PE'
  | 'PER';

// -- SubIntelligence Access Level (§3.3) ------------------------------------

/** Access level tiers for SubIntelligence field visibility per T09 §3.3. */
export type SubIntelligenceAccessLevel =
  | 'PE_PER_MOE'
  | 'SUB_INTELLIGENCE_VIEWER'
  | 'GeneralUser';
