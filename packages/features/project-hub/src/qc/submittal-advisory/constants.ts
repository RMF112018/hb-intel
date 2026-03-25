/**
 * P3-E15-T10 Stage 7 Project QC Module submittal-advisory constants.
 */

import type {
  ActivationStageResult,
  AdvisoryCurrentnessStatus,
  CaptureMethod,
  ConditionalStatus,
  DocumentCurrentness,
  DocumentFamilyClass,
  DriftRequiredNextAction,
  DriftUrgencyRiskClass,
  InventoryConfirmationState,
  ManualReviewReasonCode,
  OfficialSourceType,
  PackageCompleteness,
  SubmittalCreatedFrom,
  SubmittalItemType,
  SubmittalRevisionReason,
} from './enums.js';
import type { IDocumentFamilyDefinition } from './types.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_CONDITIONAL_STATUSES = [
  'RECEIVED',
  'MISSING',
  'NOT_APPLICABLE',
  'DEFERRED_LATER_PHASE',
  'REPLACED_BY_APPROVED_EQUIVALENT',
  'WAIVED_BY_APPROVED_EXCEPTION',
] as const satisfies ReadonlyArray<ConditionalStatus>;

export const QC_SUBMITTAL_REVISION_REASONS = [
  'RESUBMITTAL',
  'PACKAGE_UPDATE',
  'OFFICIAL_SOURCE_CHANGE',
  'OVERLAY_CHANGE',
  'EXCEPTION_CHANGE',
  'OWNER_CORRECTION',
] as const satisfies ReadonlyArray<SubmittalRevisionReason>;

export const QC_OFFICIAL_SOURCE_TYPES = [
  'MANUFACTURER_SITE',
  'MANUFACTURER_PORTAL',
  'LISTED_CERTIFIER',
  'OFFICIAL_STANDARDS_PUBLISHER',
] as const satisfies ReadonlyArray<OfficialSourceType>;

export const QC_CAPTURE_METHODS = [
  'MANUAL_REFERENCE',
  'ASSISTED_REFERENCE',
  'INTEGRATED_REFERENCE',
] as const satisfies ReadonlyArray<CaptureMethod>;

export const QC_INVENTORY_CONFIRMATION_STATES = [
  'DRAFT_EXTRACTED',
  'OWNER_CONFIRMED',
  'REVIEW_CONFIRMED',
  'SUPERSEDED',
] as const satisfies ReadonlyArray<InventoryConfirmationState>;

export const QC_PACKAGE_COMPLETENESS_VALUES = [
  'COMPLETE',
  'COMPLETE_WITH_CONDITIONS',
  'INCOMPLETE',
] as const satisfies ReadonlyArray<PackageCompleteness>;

export const QC_DOCUMENT_CURRENTNESS_VALUES = [
  'CURRENT',
  'MIXED',
  'OUTDATED',
  'UNABLE_TO_VERIFY_ROLLUP',
] as const satisfies ReadonlyArray<DocumentCurrentness>;

export const QC_ADVISORY_CURRENTNESS_STATUSES = [
  'CURRENT',
  'OUTDATED',
  'UNABLE_TO_VERIFY',
] as const satisfies ReadonlyArray<AdvisoryCurrentnessStatus>;

export const QC_MANUAL_REVIEW_REASON_CODES = [
  'NO_OFFICIAL_SOURCE',
  'INSUFFICIENT_METADATA',
  'SOURCE_INACCESSIBLE',
  'SOURCE_NON_VERSIONED',
  'REQUIRES_TECHNICAL_INTERPRETATION',
  'UNABLE_TO_VERIFY_CURRENTNESS',
] as const satisfies ReadonlyArray<ManualReviewReasonCode>;

export const QC_SUBMITTAL_ITEM_TYPES = [
  'PRODUCT',
  'MATERIAL',
  'SYSTEM',
] as const satisfies ReadonlyArray<SubmittalItemType>;

export const QC_SUBMITTAL_CREATED_FROM_VALUES = [
  'MANUAL',
  'IMPORT_ASSISTED',
  'INTEGRATED',
] as const satisfies ReadonlyArray<SubmittalCreatedFrom>;

export const QC_DOCUMENT_FAMILY_CLASSES = [
  'PRODUCT_TECHNICAL_DATA',
  'INSTALLATION_REQUIREMENTS',
  'DETAIL_CONFIGURATION_GUIDANCE',
  'PERFORMANCE_CERTIFICATION_EVIDENCE',
  'FINISH_SELECTION_CONFIRMATION',
  'OPERATIONS_WARRANTY_REFERENCE',
  'EQUIVALENT_SUBSTITUTION_BASIS',
] as const satisfies ReadonlyArray<DocumentFamilyClass>;

export const QC_DRIFT_URGENCY_RISK_CLASSES = [
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFORMATIONAL',
] as const satisfies ReadonlyArray<DriftUrgencyRiskClass>;

export const QC_DRIFT_REQUIRED_NEXT_ACTIONS = [
  'RECHECK_BEFORE_MILESTONE',
  'GENERATE_QC_ISSUE',
  'PUBLISH_READINESS_WARNING',
  'MANUAL_REVIEW_NEEDED',
] as const satisfies ReadonlyArray<DriftRequiredNextAction>;

export const QC_ACTIVATION_STAGE_RESULTS = [
  'PRELIMINARY_GUIDANCE_ISSUED',
  'FULL_ACTIVATION_ISSUED',
  'ACTIVATION_BLOCKED',
  'ACTIVATION_DEFERRED',
] as const satisfies ReadonlyArray<ActivationStageResult>;

// -- Label Maps ----------------------------------------------------------------

export const QC_CONDITIONAL_STATUS_LABELS: Readonly<Record<ConditionalStatus, string>> = {
  RECEIVED: 'Received',
  MISSING: 'Missing',
  NOT_APPLICABLE: 'Not applicable',
  DEFERRED_LATER_PHASE: 'Deferred to later phase',
  REPLACED_BY_APPROVED_EQUIVALENT: 'Replaced by approved equivalent',
  WAIVED_BY_APPROVED_EXCEPTION: 'Waived by approved exception',
};

export const QC_DOCUMENT_FAMILY_CLASS_LABELS: Readonly<Record<DocumentFamilyClass, string>> = {
  PRODUCT_TECHNICAL_DATA: 'Product / Technical data',
  INSTALLATION_REQUIREMENTS: 'Installation requirements',
  DETAIL_CONFIGURATION_GUIDANCE: 'Detail / Configuration guidance',
  PERFORMANCE_CERTIFICATION_EVIDENCE: 'Performance / Certification evidence',
  FINISH_SELECTION_CONFIRMATION: 'Finish / Selection confirmation',
  OPERATIONS_WARRANTY_REFERENCE: 'Operations / Warranty reference',
  EQUIVALENT_SUBSTITUTION_BASIS: 'Equivalent / Substitution basis',
};

export const QC_PACKAGE_COMPLETENESS_LABELS: Readonly<Record<PackageCompleteness, string>> = {
  COMPLETE: 'Complete',
  COMPLETE_WITH_CONDITIONS: 'Complete with conditions',
  INCOMPLETE: 'Incomplete',
};

export const QC_DOCUMENT_CURRENTNESS_LABELS: Readonly<Record<DocumentCurrentness, string>> = {
  CURRENT: 'Current',
  MIXED: 'Mixed',
  OUTDATED: 'Outdated',
  UNABLE_TO_VERIFY_ROLLUP: 'Unable to verify (rollup)',
};

export const QC_DRIFT_URGENCY_LABELS: Readonly<Record<DriftUrgencyRiskClass, string>> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  INFORMATIONAL: 'Informational',
};

export const QC_MANUAL_REVIEW_REASON_LABELS: Readonly<Record<ManualReviewReasonCode, string>> = {
  NO_OFFICIAL_SOURCE: 'No official source',
  INSUFFICIENT_METADATA: 'Insufficient metadata',
  SOURCE_INACCESSIBLE: 'Source inaccessible',
  SOURCE_NON_VERSIONED: 'Source non-versioned',
  REQUIRES_TECHNICAL_INTERPRETATION: 'Requires technical interpretation',
  UNABLE_TO_VERIFY_CURRENTNESS: 'Unable to verify currentness',
};

// -- Definition Arrays ---------------------------------------------------------

export const DOCUMENT_FAMILY_DEFINITIONS: ReadonlyArray<IDocumentFamilyDefinition> = [
  {
    familyClass: 'PRODUCT_TECHNICAL_DATA',
    displayName: 'Product Data / Technical Data',
    governedMetadataExpectations: 'Manufacturer name, model/series, revision, publication date',
    currentnessComparisonStrategy: 'Manufacturer or certifier official source comparison',
    downstreamQcSignificance: 'Drives inspection expectations and quality plan requirements',
    isGovernedFloor: true,
  },
  {
    familyClass: 'INSTALLATION_REQUIREMENTS',
    displayName: 'Installation Requirements',
    governedMetadataExpectations: 'Manufacturer name, document identifier, revision, publication date',
    currentnessComparisonStrategy: 'Manufacturer or code official source comparison',
    downstreamQcSignificance: 'Drives preinstallation meeting content and hold-point criteria',
    isGovernedFloor: true,
  },
  {
    familyClass: 'DETAIL_CONFIGURATION_GUIDANCE',
    displayName: 'Detail / Configuration Guidance',
    governedMetadataExpectations: 'Design basis reference, revision, configuration identifier',
    currentnessComparisonStrategy: 'Design-basis official source comparison',
    downstreamQcSignificance: 'Drives coordination review and configuration verification',
    isGovernedFloor: true,
  },
  {
    familyClass: 'PERFORMANCE_CERTIFICATION_EVIDENCE',
    displayName: 'Performance / Certification Evidence',
    governedMetadataExpectations: 'Certifier name, test standard, certificate number, issue date',
    currentnessComparisonStrategy: 'Certifier or testing body official source comparison',
    downstreamQcSignificance: 'Drives acceptance criteria and third-party verification expectations',
    isGovernedFloor: true,
  },
  {
    familyClass: 'FINISH_SELECTION_CONFIRMATION',
    displayName: 'Finish / Selection Confirmation',
    governedMetadataExpectations: 'Manufacturer name, color/finish identifier, catalog reference',
    currentnessComparisonStrategy: 'Manufacturer official source comparison',
    downstreamQcSignificance: 'Drives mockup review criteria and visual inspection expectations',
    isGovernedFloor: true,
  },
  {
    familyClass: 'OPERATIONS_WARRANTY_REFERENCE',
    displayName: 'Operations / Warranty Reference',
    governedMetadataExpectations: 'Manufacturer name, warranty terms, O&M document identifier',
    currentnessComparisonStrategy: 'Manufacturer official source comparison',
    downstreamQcSignificance: 'Drives closeout package requirements and warranty tracking',
    isGovernedFloor: true,
  },
  {
    familyClass: 'EQUIVALENT_SUBSTITUTION_BASIS',
    displayName: 'Equivalent / Substitution Basis',
    governedMetadataExpectations: 'Original specified product, proposed equivalent, comparison basis',
    currentnessComparisonStrategy: 'Approved-equivalent official source comparison',
    downstreamQcSignificance: 'Drives substitution review criteria and exception tracking',
    isGovernedFloor: true,
  },
];

export const SPEC_OVERLAY_RESOLUTION_ORDER: readonly string[] = [
  'GOVERNED_BASELINE',
  'DISCIPLINE_PRODUCT_REQUIREMENT',
  'PROJECT_SPEC',
  'APPROVED_PROJECT_OVERLAY',
  'APPROVED_EXCEPTION',
];

export const UNABLE_TO_VERIFY_TRIGGERS: readonly string[] = [
  'NO_MANUFACTURER_OFFICIAL_SOURCE',
  'INSUFFICIENT_METADATA',
  'SOURCE_INACCESSIBLE_OR_NON_VERSIONED',
  'REQUIRES_HUMAN_TECHNICAL_INTERPRETATION',
];

export const DRIFT_ALERT_TRIGGERS: readonly string[] = [
  'NEWER_OFFICIAL_SOURCE_DETECTED',
  'OFFICIAL_SOURCE_CONTRADICTS_ACCEPTED',
  'SOURCE_UNAVAILABLE_AFTER_PRIOR_CURRENT',
  'PROJECT_OVERLAY_CHANGES_FAMILY_LIST',
  'APPROVED_EQUIVALENT_OR_EXCEPTION_EXPIRES',
];

export const ADVISORY_EVALUATION_PREREQUISITES: readonly string[] = [
  'VALID_IDENTITY_AND_SPEC_ANCHOR',
  'REQUIRED_PACKAGE_REFERENCE',
  'OWNER_CONFIRMED_INVENTORY',
  'OFFICIAL_SOURCE_COMPARISONS_ATTEMPTED',
  'EXCEPTION_REFERENCES_LINKED',
];
