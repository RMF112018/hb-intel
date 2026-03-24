/**
 * P3-E14-T10 Stage 5 Project Warranty Module owner-intake constants.
 * Communication prompts, status mapping, cadence, Layer 2 seams, SoT constraints.
 */

import type {
  CommunicationCadenceTier,
  CommunicationDirection,
  CommunicationPromptTrigger,
  Layer2SeamContract,
} from './enums.js';
import type {
  ICommunicationCadenceAdvisoryDef,
  ICommunicationPromptDef,
  ILayer2SeamContractDef,
  INoSotDuplicateConstraint,
  IOwnerStatusMapping,
  IPhase3InternalCapabilityDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const COMMUNICATION_DIRECTIONS = ['Outbound', 'Inbound'] as const satisfies ReadonlyArray<CommunicationDirection>;
export const COMMUNICATION_PROMPT_TRIGGERS = [
  'NOT_COVERED_DETERMINATION', 'DENIED_DETERMINATION', 'CASE_ACCEPTED_ASSIGNED',
  'VISIT_DATE_CONFIRMED', 'CORRECTION_PENDING_VERIFICATION', 'CASE_RESOLVED_CLOSED', 'NO_PROMPT',
] as const satisfies ReadonlyArray<CommunicationPromptTrigger>;
export const LAYER2_SEAM_CONTRACTS_ENUM = [
  'OWNER_PORTAL_INTAKE', 'OWNER_NOTIFICATION', 'PROPERTY_MANAGER_ROLE',
  'OWNER_AUTH_MODEL', 'SELF_SERVICE_STATUS_VISIBILITY',
] as const satisfies ReadonlyArray<Layer2SeamContract>;
export const COMMUNICATION_CADENCE_TIERS = ['Standard', 'Expedited'] as const satisfies ReadonlyArray<CommunicationCadenceTier>;

// -- Label Maps -----------------------------------------------------------------

export const COMMUNICATION_DIRECTION_LABELS: Readonly<Record<CommunicationDirection, string>> = {
  Outbound: 'PM communicated to owner', Inbound: 'Owner communicated to PM (PM-recorded)',
};

// -- Communication Prompts (T05 §3.2) -----------------------------------------

export const COMMUNICATION_PROMPT_DEFINITIONS: ReadonlyArray<ICommunicationPromptDef> = [
  { fromStatus: 'PendingCoverageDecision', toStatus: 'NotCovered', trigger: 'NOT_COVERED_DETERMINATION', promptText: 'Log communication to owner: not covered determination' },
  { fromStatus: 'PendingCoverageDecision', toStatus: 'Denied', trigger: 'DENIED_DETERMINATION', promptText: 'Log communication to owner: claim denied determination' },
  { fromStatus: 'PendingCoverageDecision', toStatus: 'Assigned', trigger: 'CASE_ACCEPTED_ASSIGNED', promptText: 'Consider notifying owner: case accepted and assigned' },
  { fromStatus: 'AwaitingSubcontractor', toStatus: 'Scheduled', trigger: 'VISIT_DATE_CONFIRMED', promptText: 'Log communication to owner: visit date confirmed' },
  { fromStatus: 'Corrected', toStatus: 'PendingVerification', trigger: 'CORRECTION_PENDING_VERIFICATION', promptText: 'Optional: notify owner of pending verification' },
  { fromStatus: 'Verified', toStatus: 'Closed', trigger: 'CASE_RESOLVED_CLOSED', promptText: 'Log communication to owner: case resolved and closed' },
  { fromStatus: 'Open', toStatus: 'PendingCoverageDecision', trigger: 'NO_PROMPT', promptText: '' },
];

// -- Owner Status Mapping (T05 §4.2) ------------------------------------------

export const OWNER_STATUS_MAPPINGS: ReadonlyArray<IOwnerStatusMapping> = [
  { internalStatus: 'Open', ownerFacingText: 'Under review' },
  { internalStatus: 'PendingCoverageDecision', ownerFacingText: 'Under review' },
  { internalStatus: 'Assigned', ownerFacingText: 'Accepted — assigned to responsible contractor' },
  { internalStatus: 'AwaitingSubcontractor', ownerFacingText: 'Accepted — awaiting contractor response' },
  { internalStatus: 'AwaitingOwner', ownerFacingText: 'Requires your input or site access' },
  { internalStatus: 'Scheduled', ownerFacingText: 'Repair visit scheduled' },
  { internalStatus: 'InProgress', ownerFacingText: 'Repair work underway' },
  { internalStatus: 'Corrected', ownerFacingText: 'Repair completed — pending verification' },
  { internalStatus: 'PendingVerification', ownerFacingText: 'Pending our final inspection' },
  { internalStatus: 'Verified', ownerFacingText: 'Repair verified — case closing' },
  { internalStatus: 'Closed', ownerFacingText: 'Resolved and closed' },
  { internalStatus: 'NotCovered', ownerFacingText: 'Outside warranty scope' },
  { internalStatus: 'Denied', ownerFacingText: 'Not covered — not a warranty claim' },
  { internalStatus: 'Duplicate', ownerFacingText: 'Consolidated with existing open case' },
  { internalStatus: 'Voided', ownerFacingText: 'Withdrawn' },
  { internalStatus: 'Reopened', ownerFacingText: 'Re-opened for further investigation' },
];

// -- Communication Cadence Advisories (T05 §4.4) ------------------------------

export const COMMUNICATION_CADENCE_ADVISORIES: ReadonlyArray<ICommunicationCadenceAdvisoryDef> = [
  { tier: 'Expedited', thresholdDays: 3, advisoryText: 'No owner update logged in 3 days on an expedited case' },
  { tier: 'Standard', thresholdDays: 7, advisoryText: 'No owner update logged in 7 days' },
];

// -- Layer 2 Seam Contracts (T05 §5) ------------------------------------------

export const LAYER2_SEAM_CONTRACT_DEFINITIONS: ReadonlyArray<ILayer2SeamContractDef> = [
  { seam: 'OWNER_PORTAL_INTAKE', seamField: 'IOwnerIntakeLog.sourceChannel', phase3Value: 'PmEntered', layer2Description: 'Owner portal writes same IOwnerIntakeLog with sourceChannel = OwnerPortal' },
  { seam: 'OWNER_NOTIFICATION', seamField: 'IWarrantyCommunicationEvent.sourceChannel', phase3Value: 'PmEntered', layer2Description: 'Notification engine writes CommunicationEvent with sourceChannel = OwnerPortal' },
  { seam: 'PROPERTY_MANAGER_ROLE', seamField: 'IOwnerIntakeLog.reportedByOwner', phase3Value: 'Free text', layer2Description: 'Normalizable to governed external party record; additive migration' },
  { seam: 'OWNER_AUTH_MODEL', seamField: 'sourceChannel fields', phase3Value: 'PmEntered', layer2Description: 'EXT_OWNER role added to @hbc/auth; owner-direct cases carry OwnerPortal' },
  { seam: 'SELF_SERVICE_STATUS_VISIBILITY', seamField: 'WarrantyCase.status', phase3Value: 'Same canonical status', layer2Description: 'Layer 2 renders same mapping table with owner-appropriate language' },
];

// -- Phase 3 Internal Capabilities (T05 §2.1) ---------------------------------

export const PHASE3_INTERNAL_CAPABILITIES: ReadonlyArray<IPhase3InternalCapabilityDef> = [
  { capability: 'Intake form and case creation', phase3Position: 'Internal only — PM enters' },
  { capability: 'Case status visibility', phase3Position: 'Internal only — PM communicates externally' },
  { capability: 'Communication history', phase3Position: 'Internal log on PM side' },
  { capability: 'Evidence review', phase3Position: 'Internal only — PM may share externally' },
  { capability: 'Denial/not-covered communication', phase3Position: 'Internal — system surfaces templates; PM delivers' },
  { capability: 'Subcontractor coordination', phase3Position: 'Internal only — PM coordinates outside system' },
];

// -- No-Duplicate SoT Constraints (T05 §6) ------------------------------------

export const NO_DUPLICATE_SOT_CONSTRAINTS: ReadonlyArray<INoSotDuplicateConstraint> = [
  { prohibition: 'Layer 2 may NOT maintain its own owner case database synced from Project Hub' },
  { prohibition: 'Layer 2 may NOT create owner-visible copies of cases in a separate store' },
  { prohibition: 'Layer 2 may NOT fork the status lifecycle — 16-state WarrantyCaseStatus is canonical for both layers' },
  { prohibition: 'Layer 2 communications log is the same IWarrantyCommunicationEvent table as Phase 3' },
];
