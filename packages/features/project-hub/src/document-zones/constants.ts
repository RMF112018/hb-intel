/**
 * P3-J1 E2 document-zones constants.
 * Default zones, governance fields, fallback mappings, rendering priority.
 */

import type {
  ProjectZonePurpose,
  ZoneFallbackStrategy,
  ZoneGovernanceLevel,
  ZoneRegistrationStatus,
  ZoneSourceType,
  ZoneVisibility,
} from './enums.js';
import type {
  IProjectZoneRegistryEntry,
  IZoneFallbackMapping,
  IZoneGovernanceField,
  IZoneRenderingPriority,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const PROJECT_ZONE_PURPOSES = [
  'SUBMITTALS',
  'PLANS_AND_SPECS',
  'RFI_RESPONSES',
  'CORRESPONDENCE',
  'MEETING_MINUTES',
  'SAFETY_DOCS',
  'QUALITY_DOCS',
  'FINANCIAL_DOCS',
  'CLOSEOUT_DOCS',
  'GENERAL',
] as const satisfies ReadonlyArray<ProjectZonePurpose>;

export const ZONE_GOVERNANCE_LEVELS = [
  'GLOBALLY_GOVERNED',
  'PROJECT_EXTENSIBLE',
] as const satisfies ReadonlyArray<ZoneGovernanceLevel>;

export const ZONE_VISIBILITIES = [
  'VISIBLE',
  'HIDDEN',
  'RESTRICTED',
] as const satisfies ReadonlyArray<ZoneVisibility>;

export const ZONE_FALLBACK_STRATEGIES = [
  'RAW_LIBRARY_FOLDER',
  'RAW_LIBRARY_ROOT',
  'NO_FALLBACK',
] as const satisfies ReadonlyArray<ZoneFallbackStrategy>;

export const ZONE_REGISTRATION_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'PENDING_SETUP',
] as const satisfies ReadonlyArray<ZoneRegistrationStatus>;

export const ZONE_SOURCE_TYPES = [
  'SHAREPOINT_LIBRARY',
  'SHAREPOINT_FOLDER',
  'PROCORE_DOCUMENTS',
  'EXTERNAL_REFERENCE',
] as const satisfies ReadonlyArray<ZoneSourceType>;

// -- Label Maps -------------------------------------------------------------------

export const PROJECT_ZONE_PURPOSE_LABELS: Readonly<Record<ProjectZonePurpose, string>> = {
  SUBMITTALS: 'Submittals',
  PLANS_AND_SPECS: 'Plans & Specifications',
  RFI_RESPONSES: 'RFI Responses',
  CORRESPONDENCE: 'Correspondence',
  MEETING_MINUTES: 'Meeting Minutes',
  SAFETY_DOCS: 'Safety Documents',
  QUALITY_DOCS: 'Quality Documents',
  FINANCIAL_DOCS: 'Financial Documents',
  CLOSEOUT_DOCS: 'Closeout Documents',
  GENERAL: 'General',
};

export const ZONE_GOVERNANCE_LEVEL_LABELS: Readonly<Record<ZoneGovernanceLevel, string>> = {
  GLOBALLY_GOVERNED: 'Globally Governed',
  PROJECT_EXTENSIBLE: 'Project Extensible',
};

export const ZONE_VISIBILITY_LABELS: Readonly<Record<ZoneVisibility, string>> = {
  VISIBLE: 'Visible',
  HIDDEN: 'Hidden',
  RESTRICTED: 'Restricted',
};

// -- Default Project Zones --------------------------------------------------------

export const DEFAULT_PROJECT_ZONES: ReadonlyArray<IProjectZoneRegistryEntry> = [
  { zoneId: 'zone-submittals', projectId: '', purpose: 'SUBMITTALS', displayName: 'Submittals', description: 'Submittal packages and responses', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Submittals', fallbackRawStructureRef: 'Submittals', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-plans-specs', projectId: '', purpose: 'PLANS_AND_SPECS', displayName: 'Plans & Specifications', description: 'Construction plans and specifications', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Plans', fallbackRawStructureRef: 'Plans', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-rfi', projectId: '', purpose: 'RFI_RESPONSES', displayName: 'RFI Responses', description: 'Request for information responses', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/RFIs', fallbackRawStructureRef: 'RFIs', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-correspondence', projectId: '', purpose: 'CORRESPONDENCE', displayName: 'Correspondence', description: 'Project correspondence and communications', governanceLevel: 'PROJECT_EXTENSIBLE', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Correspondence', fallbackRawStructureRef: 'Correspondence', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-meeting-minutes', projectId: '', purpose: 'MEETING_MINUTES', displayName: 'Meeting Minutes', description: 'Meeting minutes and agendas', governanceLevel: 'PROJECT_EXTENSIBLE', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Meeting Minutes', fallbackRawStructureRef: 'Meeting Minutes', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-safety', projectId: '', purpose: 'SAFETY_DOCS', displayName: 'Safety Documents', description: 'Safety plans, inspections, and certifications', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Safety', fallbackRawStructureRef: 'Safety', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-quality', projectId: '', purpose: 'QUALITY_DOCS', displayName: 'Quality Documents', description: 'Quality plans, reports, and certifications', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Quality', fallbackRawStructureRef: 'Quality', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-financial', projectId: '', purpose: 'FINANCIAL_DOCS', displayName: 'Financial Documents', description: 'Financial reports and backup', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'RESTRICTED', defaultLocationTarget: '/Shared Documents/Financial', fallbackRawStructureRef: 'Financial', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-closeout', projectId: '', purpose: 'CLOSEOUT_DOCS', displayName: 'Closeout Documents', description: 'Project closeout documentation', governanceLevel: 'GLOBALLY_GOVERNED', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents/Closeout', fallbackRawStructureRef: 'Closeout', fallbackStrategy: 'RAW_LIBRARY_FOLDER', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_FOLDER' },
  { zoneId: 'zone-general', projectId: '', purpose: 'GENERAL', displayName: 'General Documents', description: 'General project documents', governanceLevel: 'PROJECT_EXTENSIBLE', visibility: 'VISIBLE', defaultLocationTarget: '/Shared Documents', fallbackRawStructureRef: null, fallbackStrategy: 'RAW_LIBRARY_ROOT', registrationStatus: 'ACTIVE', sourceType: 'SHAREPOINT_LIBRARY' },
];

// -- Governance Fields ------------------------------------------------------------

export const ZONE_GOVERNANCE_FIELDS: ReadonlyArray<IZoneGovernanceField> = [
  { fieldName: 'displayName', zoneId: '*', governanceLevel: 'GLOBALLY_GOVERNED', isGloballyLocked: true, projectCanOverride: false },
  { fieldName: 'purpose', zoneId: '*', governanceLevel: 'GLOBALLY_GOVERNED', isGloballyLocked: true, projectCanOverride: false },
  { fieldName: 'visibility', zoneId: '*', governanceLevel: 'PROJECT_EXTENSIBLE', isGloballyLocked: false, projectCanOverride: true },
  { fieldName: 'defaultLocationTarget', zoneId: '*', governanceLevel: 'PROJECT_EXTENSIBLE', isGloballyLocked: false, projectCanOverride: true },
  { fieldName: 'fallbackRawStructureRef', zoneId: '*', governanceLevel: 'PROJECT_EXTENSIBLE', isGloballyLocked: false, projectCanOverride: true },
];

// -- Fallback Mappings ------------------------------------------------------------

export const ZONE_FALLBACK_MAPPINGS: ReadonlyArray<IZoneFallbackMapping> = DEFAULT_PROJECT_ZONES.map((z) => ({
  zoneId: z.zoneId,
  purpose: z.purpose,
  fallbackStrategy: z.fallbackStrategy,
  fallbackTarget: z.fallbackRawStructureRef,
  description: `Fallback for ${z.displayName}: ${z.fallbackStrategy}`,
}));

// -- Rendering Priority -----------------------------------------------------------

export const ZONE_RENDERING_PRIORITY_RULE: Readonly<IZoneRenderingPriority> = {
  priorityId: 'zone-first-rule',
  zoneId: '*',
  renderZoneFirst: true,
  fallbackToRawOnMissing: true,
};
