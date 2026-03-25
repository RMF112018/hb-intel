import { describe, expect, it } from 'vitest';

import type {
  IAssistedExtractionResult,
  IDocumentFamilyDefinition,
  IDownstreamQcActivationMapping,
  IEnhancedSubmittalItemFields,
  IOfficialSourceReferenceEntry,
  ISpecOverlayResolution,
  ISubmittalRevisionHistoryEntry,
} from '../../index.js';

import {
  ADVISORY_EVALUATION_PREREQUISITES,
  DOCUMENT_FAMILY_DEFINITIONS,
  DRIFT_ALERT_TRIGGERS,
  QC_ACTIVATION_STAGE_RESULTS,
  QC_ADVISORY_CURRENTNESS_STATUSES,
  QC_CAPTURE_METHODS,
  QC_CONDITIONAL_STATUSES,
  QC_CONDITIONAL_STATUS_LABELS,
  QC_DOCUMENT_CURRENTNESS_LABELS,
  QC_DOCUMENT_CURRENTNESS_VALUES,
  QC_DOCUMENT_FAMILY_CLASSES,
  QC_DOCUMENT_FAMILY_CLASS_LABELS,
  QC_DRIFT_REQUIRED_NEXT_ACTIONS,
  QC_DRIFT_URGENCY_LABELS,
  QC_DRIFT_URGENCY_RISK_CLASSES,
  QC_INVENTORY_CONFIRMATION_STATES,
  QC_MANUAL_REVIEW_REASON_CODES,
  QC_MANUAL_REVIEW_REASON_LABELS,
  QC_OFFICIAL_SOURCE_TYPES,
  QC_PACKAGE_COMPLETENESS_LABELS,
  QC_PACKAGE_COMPLETENESS_VALUES,
  QC_SUBMITTAL_CREATED_FROM_VALUES,
  QC_SUBMITTAL_ITEM_TYPES,
  QC_SUBMITTAL_REVISION_REASONS,
  SPEC_OVERLAY_RESOLUTION_ORDER,
  UNABLE_TO_VERIFY_TRIGGERS,
} from '../../index.js';

describe('QC submittal-advisory contract stability', () => {
  // -- Enum array length tests ------------------------------------------------

  describe('enum arrays', () => {
    it('ConditionalStatus has 6 members', () => {
      expect(QC_CONDITIONAL_STATUSES).toHaveLength(6);
    });

    it('SubmittalRevisionReason has 6 members', () => {
      expect(QC_SUBMITTAL_REVISION_REASONS).toHaveLength(6);
    });

    it('OfficialSourceType has 4 members', () => {
      expect(QC_OFFICIAL_SOURCE_TYPES).toHaveLength(4);
    });

    it('CaptureMethod has 3 members', () => {
      expect(QC_CAPTURE_METHODS).toHaveLength(3);
    });

    it('InventoryConfirmationState has 4 members', () => {
      expect(QC_INVENTORY_CONFIRMATION_STATES).toHaveLength(4);
    });

    it('PackageCompleteness has 3 members', () => {
      expect(QC_PACKAGE_COMPLETENESS_VALUES).toHaveLength(3);
    });

    it('DocumentCurrentness has 4 members', () => {
      expect(QC_DOCUMENT_CURRENTNESS_VALUES).toHaveLength(4);
    });

    it('AdvisoryCurrentnessStatus has 3 members', () => {
      expect(QC_ADVISORY_CURRENTNESS_STATUSES).toHaveLength(3);
    });

    it('ManualReviewReasonCode has 6 members', () => {
      expect(QC_MANUAL_REVIEW_REASON_CODES).toHaveLength(6);
    });

    it('SubmittalItemType has 3 members', () => {
      expect(QC_SUBMITTAL_ITEM_TYPES).toHaveLength(3);
    });

    it('SubmittalCreatedFrom has 3 members', () => {
      expect(QC_SUBMITTAL_CREATED_FROM_VALUES).toHaveLength(3);
    });

    it('DocumentFamilyClass has 7 members', () => {
      expect(QC_DOCUMENT_FAMILY_CLASSES).toHaveLength(7);
    });

    it('DriftUrgencyRiskClass has 4 members', () => {
      expect(QC_DRIFT_URGENCY_RISK_CLASSES).toHaveLength(4);
    });

    it('DriftRequiredNextAction has 4 members', () => {
      expect(QC_DRIFT_REQUIRED_NEXT_ACTIONS).toHaveLength(4);
    });

    it('ActivationStageResult has 4 members', () => {
      expect(QC_ACTIVATION_STAGE_RESULTS).toHaveLength(4);
    });
  });

  // -- Label map key count tests ----------------------------------------------

  describe('label maps', () => {
    it('QC_CONDITIONAL_STATUS_LABELS has 6 keys', () => {
      expect(Object.keys(QC_CONDITIONAL_STATUS_LABELS)).toHaveLength(6);
    });

    it('QC_DOCUMENT_FAMILY_CLASS_LABELS has 7 keys', () => {
      expect(Object.keys(QC_DOCUMENT_FAMILY_CLASS_LABELS)).toHaveLength(7);
    });

    it('QC_PACKAGE_COMPLETENESS_LABELS has 3 keys', () => {
      expect(Object.keys(QC_PACKAGE_COMPLETENESS_LABELS)).toHaveLength(3);
    });

    it('QC_DOCUMENT_CURRENTNESS_LABELS has 4 keys', () => {
      expect(Object.keys(QC_DOCUMENT_CURRENTNESS_LABELS)).toHaveLength(4);
    });

    it('QC_DRIFT_URGENCY_LABELS has 4 keys', () => {
      expect(Object.keys(QC_DRIFT_URGENCY_LABELS)).toHaveLength(4);
    });

    it('QC_MANUAL_REVIEW_REASON_LABELS has 6 keys', () => {
      expect(Object.keys(QC_MANUAL_REVIEW_REASON_LABELS)).toHaveLength(6);
    });
  });

  // -- Definition array tests -------------------------------------------------

  describe('definition arrays', () => {
    it('DOCUMENT_FAMILY_DEFINITIONS has 7 entries', () => {
      expect(DOCUMENT_FAMILY_DEFINITIONS).toHaveLength(7);
    });

    it('SPEC_OVERLAY_RESOLUTION_ORDER has 5 entries', () => {
      expect(SPEC_OVERLAY_RESOLUTION_ORDER).toHaveLength(5);
    });

    it('UNABLE_TO_VERIFY_TRIGGERS has 4 entries', () => {
      expect(UNABLE_TO_VERIFY_TRIGGERS).toHaveLength(4);
    });

    it('DRIFT_ALERT_TRIGGERS has 5 entries', () => {
      expect(DRIFT_ALERT_TRIGGERS).toHaveLength(5);
    });

    it('ADVISORY_EVALUATION_PREREQUISITES has 5 entries', () => {
      expect(ADVISORY_EVALUATION_PREREQUISITES).toHaveLength(5);
    });
  });

  // -- Type structure checks --------------------------------------------------

  describe('type structures', () => {
    it('ISubmittalRevisionHistoryEntry has expected shape', () => {
      const entry: ISubmittalRevisionHistoryEntry = {
        submittalRevisionHistoryEntryId: 'rev-1',
        submittalItemId: 'item-1',
        revisionSequence: 1,
        revisionReason: 'RESUBMITTAL',
        priorPackageLinkRef: null,
        newPackageLinkRef: 'pkg-link-1',
        inventoryChangeSummary: 'Added product data sheet',
        priorVerdictRef: null,
        newVerdictRef: 'verdict-1',
        changedByUserId: 'user-1',
        changedAt: '2026-03-25T00:00:00Z',
        notes: null,
      };
      expect(entry.submittalRevisionHistoryEntryId).toBe('rev-1');
      expect(entry.revisionSequence).toBe(1);
    });

    it('IOfficialSourceReferenceEntry has expected shape', () => {
      const entry: IOfficialSourceReferenceEntry = {
        officialSourceReferenceEntryId: 'osr-1',
        submittalItemId: 'item-1',
        documentFamily: 'PRODUCT_TECHNICAL_DATA',
        officialPublisherName: 'Manufacturer A',
        officialSourceType: 'MANUFACTURER_SITE',
        officialDocumentTitle: 'Product Data Sheet',
        officialDocumentIdentifier: 'PDS-001',
        officialRevisionEditionIssueNumber: 'Rev 3',
        officialPublicationOrRevisionDate: '2026-01-15',
        officialSourceLinkReference: 'https://example.com/pds',
        captureMethod: 'MANUAL_REFERENCE',
        comparisonConfidence: 'HIGH',
        capturedAt: '2026-03-25T00:00:00Z',
        capturedByUserId: 'user-1',
        supersedesReferenceId: null,
      };
      expect(entry.officialSourceReferenceEntryId).toBe('osr-1');
      expect(entry.documentFamily).toBe('PRODUCT_TECHNICAL_DATA');
    });

    it('IDownstreamQcActivationMapping has expected shape', () => {
      const mapping: IDownstreamQcActivationMapping = {
        downstreamQcActivationMappingId: 'dam-1',
        submittalItemId: 'item-1',
        verdictRef: 'verdict-1',
        activationStage: 'PRELIMINARY_GUIDANCE',
        activationResult: 'PRELIMINARY_GUIDANCE_ISSUED',
        qualityPlanRequirements: ['req-1'],
        bestPracticePackets: ['bp-1'],
        inspectionExpectations: ['ie-1'],
        readinessSignals: ['rs-1'],
        exceptionDependencies: [],
        publishedAt: '2026-03-25T00:00:00Z',
        publishedByUserId: 'user-1',
      };
      expect(mapping.downstreamQcActivationMappingId).toBe('dam-1');
      expect(mapping.qualityPlanRequirements).toHaveLength(1);
    });

    it('IEnhancedSubmittalItemFields has expected shape', () => {
      const fields: IEnhancedSubmittalItemFields = {
        itemType: 'PRODUCT',
        itemTitle: 'Test Product',
        manufacturerName: 'Manufacturer A',
        productModelOrSeries: 'Model X',
        procoreSubmittalLinkRef: null,
        defaultOwnerRole: 'PM',
        defaultOwnerAssignment: 'user-1',
        highRiskFlag: false,
        createdFrom: 'MANUAL',
        supersededBySubmittalItemId: null,
      };
      expect(fields.itemType).toBe('PRODUCT');
      expect(fields.highRiskFlag).toBe(false);
    });

    it('IDocumentFamilyDefinition has expected shape', () => {
      const def: IDocumentFamilyDefinition = {
        familyClass: 'PRODUCT_TECHNICAL_DATA',
        displayName: 'Product Data / Technical Data',
        governedMetadataExpectations: 'Manufacturer name, model/series',
        currentnessComparisonStrategy: 'Manufacturer comparison',
        downstreamQcSignificance: 'Drives inspection expectations',
        isGovernedFloor: true,
      };
      expect(def.familyClass).toBe('PRODUCT_TECHNICAL_DATA');
      expect(def.isGovernedFloor).toBe(true);
    });

    it('ISpecOverlayResolution has expected shape', () => {
      const resolution: ISpecOverlayResolution = {
        resolutionId: 'res-1',
        submittalItemId: 'item-1',
        governedBaselineRef: 'baseline-1',
        disciplineProductRequirementRef: null,
        projectSpecRef: 'spec-1',
        approvedProjectOverlayRef: null,
        approvedExceptionRef: null,
        resolvedRequirements: ['req-1', 'req-2'],
      };
      expect(resolution.resolutionId).toBe('res-1');
      expect(resolution.resolvedRequirements).toHaveLength(2);
    });

    it('IAssistedExtractionResult has expected shape', () => {
      const result: IAssistedExtractionResult = {
        extractionId: 'ext-1',
        submittalItemId: 'item-1',
        candidateInventoryRows: ['row-1', 'row-2'],
        extractionSource: 'pdf-parser',
        extractionConfidence: 'MODERATE',
        requiresOwnerConfirmation: true,
        extractedAt: '2026-03-25T00:00:00Z',
      };
      expect(result.extractionId).toBe('ext-1');
      expect(result.requiresOwnerConfirmation).toBe(true);
    });
  });
});
