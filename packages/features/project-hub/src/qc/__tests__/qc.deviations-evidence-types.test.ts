import { describe, expect, it } from 'vitest';

import type {
  IApprovalProvenanceEntry,
  IDeviationCondition,
  IDeviationReadinessMapping,
  IEvidenceMinimumRule,
  IEvidenceSufficiencyCheck,
  IExternalApprovalResolution,
  IOfficialSourceConflict,
} from '../../index.js';

import {
  APPROVAL_PROVENANCE_EVENT_SEQUENCE,
  CONFLICT_RESOLUTION_PATH_DEFINITIONS,
  DEVIATION_CONDITION_DEFINITIONS,
  DEVIATION_READINESS_EFFECT_MAP,
  EVIDENCE_MINIMUM_USE_CASE_DEFINITIONS,
  QC_APPROVAL_PROVENANCE_EVENTS,
  QC_CONFLICT_RESOLUTION_PATH_LABELS,
  QC_CONFLICT_RESOLUTION_PATHS,
  QC_DEVIATION_CONDITION_TYPE_LABELS,
  QC_DEVIATION_CONDITION_TYPES,
  QC_DEVIATION_READINESS_EFFECT_LABELS,
  QC_DEVIATION_READINESS_EFFECTS,
  QC_EVIDENCE_MINIMUM_USE_CASE_LABELS,
  QC_EVIDENCE_MINIMUM_USE_CASES,
  QC_EVIDENCE_SUFFICIENCY_STATUSES,
  QC_EXTERNAL_APPROVAL_RESOLUTION_TYPES,
  QC_READINESS_IMPACT_ACTIONS,
} from '../../index.js';

describe('P3-E15-T10 Stage 6 QC deviations-evidence contract stability', () => {
  // -- Enum array lengths -------------------------------------------------------

  describe('enum array lengths', () => {
    it('QC_DEVIATION_CONDITION_TYPES has 6 members', () => {
      expect(QC_DEVIATION_CONDITION_TYPES).toHaveLength(6);
    });

    it('QC_EVIDENCE_MINIMUM_USE_CASES has 7 members', () => {
      expect(QC_EVIDENCE_MINIMUM_USE_CASES).toHaveLength(7);
    });

    it('QC_EVIDENCE_SUFFICIENCY_STATUSES has 4 members', () => {
      expect(QC_EVIDENCE_SUFFICIENCY_STATUSES).toHaveLength(4);
    });

    it('QC_CONFLICT_RESOLUTION_PATHS has 4 members', () => {
      expect(QC_CONFLICT_RESOLUTION_PATHS).toHaveLength(4);
    });

    it('QC_READINESS_IMPACT_ACTIONS has 6 members', () => {
      expect(QC_READINESS_IMPACT_ACTIONS).toHaveLength(6);
    });

    it('QC_APPROVAL_PROVENANCE_EVENTS has 6 members', () => {
      expect(QC_APPROVAL_PROVENANCE_EVENTS).toHaveLength(6);
    });

    it('QC_DEVIATION_READINESS_EFFECTS has 4 members', () => {
      expect(QC_DEVIATION_READINESS_EFFECTS).toHaveLength(4);
    });

    it('QC_EXTERNAL_APPROVAL_RESOLUTION_TYPES has 4 members', () => {
      expect(QC_EXTERNAL_APPROVAL_RESOLUTION_TYPES).toHaveLength(4);
    });
  });

  // -- Label map key counts -----------------------------------------------------

  describe('label map key counts', () => {
    it('QC_DEVIATION_CONDITION_TYPE_LABELS has 6 entries', () => {
      expect(Object.keys(QC_DEVIATION_CONDITION_TYPE_LABELS)).toHaveLength(6);
    });

    it('QC_EVIDENCE_MINIMUM_USE_CASE_LABELS has 7 entries', () => {
      expect(Object.keys(QC_EVIDENCE_MINIMUM_USE_CASE_LABELS)).toHaveLength(7);
    });

    it('QC_CONFLICT_RESOLUTION_PATH_LABELS has 4 entries', () => {
      expect(Object.keys(QC_CONFLICT_RESOLUTION_PATH_LABELS)).toHaveLength(4);
    });

    it('QC_DEVIATION_READINESS_EFFECT_LABELS has 4 entries', () => {
      expect(Object.keys(QC_DEVIATION_READINESS_EFFECT_LABELS)).toHaveLength(4);
    });
  });

  // -- Definition array lengths -------------------------------------------------

  describe('definition array lengths', () => {
    it('EVIDENCE_MINIMUM_USE_CASE_DEFINITIONS has 7 rows', () => {
      expect(EVIDENCE_MINIMUM_USE_CASE_DEFINITIONS).toHaveLength(7);
    });

    it('DEVIATION_CONDITION_DEFINITIONS has 6 rows', () => {
      expect(DEVIATION_CONDITION_DEFINITIONS).toHaveLength(6);
    });

    it('APPROVAL_PROVENANCE_EVENT_SEQUENCE has 6 entries', () => {
      expect(APPROVAL_PROVENANCE_EVENT_SEQUENCE).toHaveLength(6);
    });

    it('DEVIATION_READINESS_EFFECT_MAP has 8 entries', () => {
      expect(DEVIATION_READINESS_EFFECT_MAP).toHaveLength(8);
    });

    it('CONFLICT_RESOLUTION_PATH_DEFINITIONS has 4 rows', () => {
      expect(CONFLICT_RESOLUTION_PATH_DEFINITIONS).toHaveLength(4);
    });
  });

  // -- Type contract stability --------------------------------------------------

  describe('type contract stability', () => {
    it('IDeviationCondition satisfies shape', () => {
      const record: IDeviationCondition = {
        conditionId: 'cond-1',
        deviationId: 'dev-1',
        conditionType: 'LIMITED_DURATION',
        description: 'Valid for 30 days',
        enforcementCriteria: 'Must close within 30 days of approval',
        isSatisfied: false,
        satisfiedAt: null,
        linkedRecordRefs: ['ref-1'],
      };
      expect(record.conditionId).toBe('cond-1');
    });

    it('IEvidenceMinimumRule satisfies shape', () => {
      const record: IEvidenceMinimumRule = {
        ruleId: 'rule-1',
        useCase: 'PLAN_ACTIVATION',
        governedMinimumDescription: 'At least one approved document',
        requiredEvidenceTypes: ['DOCUMENT'],
        minimumCount: 1,
        sufficiencyRequiresReviewerAcceptance: true,
        isGovernedFloor: true,
        projectCanTighten: true,
      };
      expect(record.ruleId).toBe('rule-1');
    });

    it('IEvidenceSufficiencyCheck satisfies shape', () => {
      const record: IEvidenceSufficiencyCheck = {
        checkId: 'check-1',
        targetRecordId: 'rec-1',
        useCase: 'GATE_ACCEPTANCE',
        ruleId: 'rule-1',
        linkedEvidenceRefs: ['ev-1'],
        status: 'SATISFIED',
        checkedAt: '2026-01-01T00:00:00Z',
        checkedByUserId: 'user-1',
      };
      expect(record.checkId).toBe('check-1');
    });

    it('IOfficialSourceConflict satisfies shape', () => {
      const record: IOfficialSourceConflict = {
        conflictId: 'conflict-1',
        projectId: 'proj-1',
        affectedRecordId: 'rec-1',
        previousSourceRef: 'src-v1',
        newerSourceRef: 'src-v2',
        conflictDetectedAt: '2026-01-01T00:00:00Z',
        resolutionPath: null,
        resolvedAt: null,
        resolvedByUserId: null,
        recheckDueDate: null,
        deviationRefIfException: null,
      };
      expect(record.conflictId).toBe('conflict-1');
    });

    it('IApprovalProvenanceEntry satisfies shape', () => {
      const record: IApprovalProvenanceEntry = {
        entryId: 'entry-1',
        externalApprovalDependencyId: 'ead-1',
        event: 'IDENTIFIED',
        actorUserId: 'user-1',
        occurredAt: '2026-01-01T00:00:00Z',
        proofSourceRef: null,
        affectedQcRecordRefs: ['rec-1'],
        notes: 'Initial identification',
      };
      expect(record.entryId).toBe('entry-1');
    });

    it('IDeviationReadinessMapping satisfies shape', () => {
      const record: IDeviationReadinessMapping = {
        mappingId: 'map-1',
        deviationId: 'dev-1',
        affectedRecordId: 'rec-1',
        deviationState: 'APPROVED',
        readinessEffect: 'READY_WITH_CONDITIONS',
        conditionsSatisfied: false,
      };
      expect(record.mappingId).toBe('map-1');
    });

    it('IExternalApprovalResolution satisfies shape', () => {
      const record: IExternalApprovalResolution = {
        resolutionId: 'res-1',
        externalApprovalDependencyId: 'ead-1',
        resolutionType: 'APPROVED_WITH_PROOF',
        responderIdentity: 'City Inspector',
        proofRef: 'proof-1',
        resolvedAt: '2026-01-01T00:00:00Z',
        justification: null,
        readinessRecordsReleased: ['rec-1'],
      };
      expect(record.resolutionId).toBe('res-1');
    });
  });
});
