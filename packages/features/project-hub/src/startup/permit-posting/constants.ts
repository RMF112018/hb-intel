/**
 * P3-E11-T10 Stage 4 Project Startup Permit Posting Verification constants.
 * Permit type mappings, verification rules, spine publication.
 */

import type {
  AppSurface,
  StartupPermitType,
  PermitVerificationResult,
  Stage4ActivityEvent,
  Stage4WorkQueueItem,
} from './enums.js';
import type {
  IStartupPermitTypeMapping,
  IStage4ActivityEventDef,
  IStage4WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const PERMIT_POSTING_SCOPE = 'startup/permit-posting' as const;

// -- Enum Arrays ------------------------------------------------------------

export const STARTUP_PERMIT_TYPES = [
  'Master', 'Roofing', 'Plumbing', 'HVAC', 'Electrical', 'FireAlarm',
  'FireSprinkler', 'Elevator', 'Irrigation', 'LowVoltage', 'SiteUtilities', 'RightOfWay',
] as const satisfies ReadonlyArray<StartupPermitType>;

export const PERMIT_VERIFICATION_RESULTS = [
  'Yes', 'No', 'NA',
] as const satisfies ReadonlyArray<PermitVerificationResult>;

export const APP_SURFACES = [
  'PWA', 'SPFx',
] as const satisfies ReadonlyArray<AppSurface>;

export const STAGE4_ACTIVITY_EVENTS = [
  'PermitPostingVerified',
] as const satisfies ReadonlyArray<Stage4ActivityEvent>;

export const STAGE4_WORK_QUEUE_ITEMS = [
  'PermitNotPosted',
] as const satisfies ReadonlyArray<Stage4WorkQueueItem>;

// -- Permit Type Mappings (T07 §9.2) ----------------------------------------

export const PERMIT_TYPE_MAPPINGS: ReadonlyArray<IStartupPermitTypeMapping> = [
  { taskNumber: '4.01', permitType: 'Master', label: 'Master permit', applicabilityNote: null },
  { taskNumber: '4.02', permitType: 'Roofing', label: 'Roofing permit', applicabilityNote: 'NA if project scope does not include roofing' },
  { taskNumber: '4.03', permitType: 'Plumbing', label: 'Plumbing permit', applicabilityNote: 'NA if project scope does not include plumbing' },
  { taskNumber: '4.04', permitType: 'HVAC', label: 'HVAC permit', applicabilityNote: 'NA if project scope does not include HVAC' },
  { taskNumber: '4.05', permitType: 'Electrical', label: 'Electric permit', applicabilityNote: 'NA if project scope does not include electrical' },
  { taskNumber: '4.06', permitType: 'FireAlarm', label: 'Fire Alarm permit', applicabilityNote: 'NA if project scope does not include fire alarm' },
  { taskNumber: '4.07', permitType: 'FireSprinkler', label: 'Fire Sprinklers permit', applicabilityNote: 'NA if project scope does not include fire sprinklers' },
  { taskNumber: '4.08', permitType: 'Elevator', label: 'Elevator permit', applicabilityNote: 'NA if project scope does not include elevator' },
  { taskNumber: '4.09', permitType: 'Irrigation', label: 'Irrigation permit', applicabilityNote: 'NA if project scope does not include irrigation' },
  { taskNumber: '4.10', permitType: 'LowVoltage', label: 'Low Voltage permit', applicabilityNote: 'NA if project scope does not include low voltage' },
  { taskNumber: '4.11', permitType: 'SiteUtilities', label: 'Site-Utilities permits', applicabilityNote: null },
  { taskNumber: '4.12', permitType: 'RightOfWay', label: 'Right of way, FDOT, MOT plans', applicabilityNote: 'NA if project does not involve public right of way' },
];

// -- Verification Required Fields (T07 §9.1) --------------------------------

/** Fields required on PermitVerificationDetail when task result = Yes. */
export const PERMIT_YES_REQUIRED_FIELDS: ReadonlyArray<string> = [
  'verifiedBy', 'verifiedAt', 'physicalEvidenceAttachmentIds',
];

/** Fields required on PermitVerificationDetail when task result = No. */
export const PERMIT_NO_REQUIRED_FIELDS: ReadonlyArray<string> = [
  'discrepancyReason',
];

// -- Stage 4 Spine Publication Definitions -----------------------------------

export const STAGE4_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage4ActivityEventDef> = [
  { event: 'PermitPostingVerified', description: 'Section 4 permit posting item verified (result set to Yes/No/NA)' },
];

export const STAGE4_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage4WorkQueueItemDef> = [
  { item: 'PermitNotPosted', description: 'Unverified permit item in Section 4 with result = No', assignedTo: 'PM' },
];

// -- Label Maps ---------------------------------------------------------------

export const STARTUP_PERMIT_TYPE_LABELS: Readonly<Record<StartupPermitType, string>> = {
  Master: 'Master Permit',
  Roofing: 'Roofing Permit',
  Plumbing: 'Plumbing Permit',
  HVAC: 'HVAC Permit',
  Electrical: 'Electrical Permit',
  FireAlarm: 'Fire Alarm Permit',
  FireSprinkler: 'Fire Sprinkler Permit',
  Elevator: 'Elevator Permit',
  Irrigation: 'Irrigation Permit',
  LowVoltage: 'Low Voltage Permit',
  SiteUtilities: 'Site-Utilities Permit',
  RightOfWay: 'Right of Way / FDOT / MOT',
};

export const PERMIT_VERIFICATION_RESULT_LABELS: Readonly<Record<PermitVerificationResult, string>> = {
  Yes: 'Posted',
  No: 'Not Posted',
  NA: 'Not Applicable',
};
