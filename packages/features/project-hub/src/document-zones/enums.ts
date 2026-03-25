/**
 * P3-J1 E2 document-zones enumerations.
 * Zone purposes, governance, visibility, fallback, registration, source types.
 */

// -- Project Zone Purpose ---------------------------------------------------------

export type ProjectZonePurpose =
  | 'SUBMITTALS'
  | 'PLANS_AND_SPECS'
  | 'RFI_RESPONSES'
  | 'CORRESPONDENCE'
  | 'MEETING_MINUTES'
  | 'SAFETY_DOCS'
  | 'QUALITY_DOCS'
  | 'FINANCIAL_DOCS'
  | 'CLOSEOUT_DOCS'
  | 'GENERAL';

// -- Zone Governance Level --------------------------------------------------------

export type ZoneGovernanceLevel = 'GLOBALLY_GOVERNED' | 'PROJECT_EXTENSIBLE';

// -- Zone Visibility --------------------------------------------------------------

export type ZoneVisibility = 'VISIBLE' | 'HIDDEN' | 'RESTRICTED';

// -- Zone Fallback Strategy -------------------------------------------------------

export type ZoneFallbackStrategy = 'RAW_LIBRARY_FOLDER' | 'RAW_LIBRARY_ROOT' | 'NO_FALLBACK';

// -- Zone Registration Status -----------------------------------------------------

export type ZoneRegistrationStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_SETUP';

// -- Zone Source Type -------------------------------------------------------------

export type ZoneSourceType = 'SHAREPOINT_LIBRARY' | 'SHAREPOINT_FOLDER' | 'PROCORE_DOCUMENTS' | 'EXTERNAL_REFERENCE';
