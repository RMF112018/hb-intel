/**
 * P3-E14-T10 Stage 3 Project Warranty Module coverage-registry constants.
 * Coverage taxonomy, anchoring, metadata gates, turnover/startup, expiration.
 */

import type {
  CloseoutTurnoverArtifactType,
  CoverageAnchorRequirement,
  CoverageAnchorType,
  CoverageExpirationAdvisoryLevel,
  CoverageMetadataGateField,
  StartupCommissioningStatus,
} from './enums.js';
import type {
  ICoverageAnchorRequirementDef,
  ICoverageExpirationRuleDef,
  ICoverageMetadataGateDef,
  ICoverageScopeLabelDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const CLOSEOUT_TURNOVER_ARTIFACT_TYPES = [
  'WarrantyCertificate', 'OmManual', 'CommissioningReport', 'AsBuilt',
] as const satisfies ReadonlyArray<CloseoutTurnoverArtifactType>;

export const STARTUP_COMMISSIONING_STATUSES = [
  'Accepted', 'AcceptedWithConditions', 'Deferred',
] as const satisfies ReadonlyArray<StartupCommissioningStatus>;

export const COVERAGE_METADATA_GATE_FIELDS = [
  'COVERAGE_LAYER', 'COVERAGE_SCOPE', 'RESPONSIBLE_PARTY_ID',
  'RESPONSIBLE_PARTY_NAME', 'WARRANTY_START_DATE', 'WARRANTY_END_DATE',
  'LAYER_APPROPRIATE_ANCHORS', 'SOURCE_HANDOFF_REFERENCE',
] as const satisfies ReadonlyArray<CoverageMetadataGateField>;

export const COVERAGE_EXPIRATION_ADVISORY_LEVELS = [
  'NORMAL', 'APPROACHING', 'EXPIRED',
] as const satisfies ReadonlyArray<CoverageExpirationAdvisoryLevel>;

export const COVERAGE_ANCHOR_REQUIREMENTS_ENUM = [
  'REQUIRED', 'RECOMMENDED', 'OPTIONAL', 'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<CoverageAnchorRequirement>;

export const COVERAGE_ANCHOR_TYPES = [
  'LOCATION_REF', 'SYSTEM_REF', 'ASSET_REF',
] as const satisfies ReadonlyArray<CoverageAnchorType>;

// -- Label Maps -----------------------------------------------------------------

export const CLOSEOUT_TURNOVER_ARTIFACT_TYPE_LABELS: Readonly<Record<CloseoutTurnoverArtifactType, string>> = {
  WarrantyCertificate: 'Warranty Certificate', OmManual: 'O&M Manual',
  CommissioningReport: 'Commissioning Report', AsBuilt: 'As-Built',
};

export const STARTUP_COMMISSIONING_STATUS_LABELS: Readonly<Record<StartupCommissioningStatus, string>> = {
  Accepted: 'Accepted', AcceptedWithConditions: 'Accepted with Conditions', Deferred: 'Deferred',
};

// -- Coverage Expiration Threshold Default (T03 §9.2) -------------------------

export const COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT = 30;

// -- Coverage Scope Taxonomy (T03 §2.2) ---------------------------------------

export const PRODUCT_SCOPE_LABELS: ReadonlyArray<ICoverageScopeLabelDef> = [
  { layer: 'Product', scopeLabel: 'Equipment.HVAC-AHU', description: 'Air handling unit by equipment tag' },
  { layer: 'Product', scopeLabel: 'Equipment.Boiler', description: 'Boiler by equipment tag' },
  { layer: 'Product', scopeLabel: 'Equipment.Generator', description: 'Generator by equipment tag' },
  { layer: 'Product', scopeLabel: 'Equipment.Elevator', description: 'Elevator by equipment tag' },
  { layer: 'Product', scopeLabel: 'Material.Roofing-Membrane', description: 'Roofing membrane product warranty' },
  { layer: 'Product', scopeLabel: 'Material.Window-Glazing', description: 'Window and glazing product warranty' },
  { layer: 'Product', scopeLabel: 'Material.Waterproofing-Below-Grade', description: 'Below-grade waterproofing product warranty' },
];

export const LABOR_SCOPE_LABELS: ReadonlyArray<ICoverageScopeLabelDef> = [
  { layer: 'Labor', scopeLabel: 'Labor.Concrete', description: 'Concrete placement and finishing' },
  { layer: 'Labor', scopeLabel: 'Labor.Framing-Exterior', description: 'Exterior framing and sheathing' },
  { layer: 'Labor', scopeLabel: 'Labor.Roofing', description: 'Roofing installation labor' },
  { layer: 'Labor', scopeLabel: 'Labor.Plumbing', description: 'Plumbing rough-in and finish' },
  { layer: 'Labor', scopeLabel: 'Labor.Mechanical-HVAC', description: 'Mechanical and HVAC installation' },
  { layer: 'Labor', scopeLabel: 'Labor.Electrical', description: 'Electrical rough-in and finish' },
  { layer: 'Labor', scopeLabel: 'Labor.Drywall-Finish', description: 'Drywall and finish work' },
  { layer: 'Labor', scopeLabel: 'Labor.Flooring', description: 'Flooring installation' },
  { layer: 'Labor', scopeLabel: 'Labor.Painting', description: 'Painting and finishing' },
  { layer: 'Labor', scopeLabel: 'Labor.Glazing', description: 'Glazing and curtainwall installation' },
];

export const SYSTEM_SCOPE_LABELS: ReadonlyArray<ICoverageScopeLabelDef> = [
  { layer: 'System', scopeLabel: 'System.HVAC-Building', description: 'Building-wide HVAC system' },
  { layer: 'System', scopeLabel: 'System.Fire-Protection', description: 'Fire suppression and alarm system' },
  { layer: 'System', scopeLabel: 'System.Building-Envelope', description: 'Envelope — façade, windows, roofing as integrated system' },
  { layer: 'System', scopeLabel: 'System.Plumbing-Domestic', description: 'Domestic water system' },
  { layer: 'System', scopeLabel: 'System.Electrical-Distribution', description: 'Electrical distribution from service entry through panels' },
  { layer: 'System', scopeLabel: 'System.Low-Voltage', description: 'Low-voltage systems — security, AV, data' },
];

// -- Anchor Requirements by Layer (T03 §3.3) ----------------------------------

export const COVERAGE_ANCHOR_REQUIREMENTS: ReadonlyArray<ICoverageAnchorRequirementDef> = [
  // Product layer
  { layer: 'Product', anchorType: 'LOCATION_REF', requirement: 'RECOMMENDED' },
  { layer: 'Product', anchorType: 'SYSTEM_REF', requirement: 'REQUIRED' },
  { layer: 'Product', anchorType: 'ASSET_REF', requirement: 'REQUIRED' },
  // Labor layer
  { layer: 'Labor', anchorType: 'LOCATION_REF', requirement: 'REQUIRED' },
  { layer: 'Labor', anchorType: 'SYSTEM_REF', requirement: 'OPTIONAL' },
  { layer: 'Labor', anchorType: 'ASSET_REF', requirement: 'OPTIONAL' },
  // System layer
  { layer: 'System', anchorType: 'LOCATION_REF', requirement: 'OPTIONAL' },
  { layer: 'System', anchorType: 'SYSTEM_REF', requirement: 'REQUIRED' },
  { layer: 'System', anchorType: 'ASSET_REF', requirement: 'NOT_APPLICABLE' },
];

// -- Metadata Completeness Gates (T03 §4.2) -----------------------------------

export const COVERAGE_METADATA_GATES: ReadonlyArray<ICoverageMetadataGateDef> = [
  { field: 'COVERAGE_LAYER', description: 'coverageLayer within governed taxonomy' },
  { field: 'COVERAGE_SCOPE', description: 'coverageScope within governed taxonomy' },
  { field: 'RESPONSIBLE_PARTY_ID', description: 'responsiblePartyId resolved against company/vendor registry' },
  { field: 'RESPONSIBLE_PARTY_NAME', description: 'responsiblePartyName populated' },
  { field: 'WARRANTY_START_DATE', description: 'warrantyStartDate valid; before warrantyEndDate; on or after substantial completion' },
  { field: 'WARRANTY_END_DATE', description: 'warrantyEndDate valid; after warrantyStartDate' },
  { field: 'LAYER_APPROPRIATE_ANCHORS', description: 'Required anchors per coverage layer are populated (per §3.3)' },
  { field: 'SOURCE_HANDOFF_REFERENCE', description: 'At least one of: closeoutTurnoverRef, startupCommissioningRef, or sourceHandoff = Manual with PM confirmation' },
];

// -- Expiration Rules (T03 §9) ------------------------------------------------

export const COVERAGE_EXPIRATION_RULES: ReadonlyArray<ICoverageExpirationRuleDef> = [
  { level: 'NORMAL', description: 'Coverage is active and not approaching expiration' },
  { level: 'APPROACHING', description: 'Coverage is within expirationAdvisoryThresholdDays of warrantyEndDate; advisory routed' },
  { level: 'EXPIRED', description: 'warrantyEndDate has passed; coverage transitions to Expired; WarrantyCoverageExpiration record created' },
];
