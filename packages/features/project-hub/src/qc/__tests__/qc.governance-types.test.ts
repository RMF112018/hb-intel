import { describe, expect, it } from 'vitest';
import {
  QC_GOVERNANCE_WRITE_ACTIONS,
  QC_GOVERNED_STANDARD_CATEGORIES,
  QC_CANDIDATE_CONTENT_TYPES,
  QC_EXTENSION_VALIDATION_RESULTS,
  QC_GOVERNED_CONTENT_VERSION_FIELDS,
  QC_UPDATE_NOTICE_REQUIREMENTS,
  QC_ADOPTION_DECISION_OWNERS,
  QC_BASIS_CONFLICT_OUTCOMES,
  QC_PROJECT_DECISION_LATITUDES,
  QC_CANDIDATE_SUBMISSION_STATES,
  QC_GOVERNANCE_WRITE_ACTION_LABELS,
  QC_GOVERNED_STANDARD_CATEGORY_LABELS,
  QC_BASIS_CONFLICT_OUTCOME_LABELS,
  QC_PROJECT_DECISION_LATITUDE_LABELS,
  QC_GOVERNANCE_AUTHORITY_MATRIX,
  QC_GOVERNANCE_CONCERN_LATITUDES,
  QC_CANDIDATE_VALID_TRANSITIONS,
  QC_EXTENSION_VALIDATION_RULE_DESCRIPTIONS,
} from '../../index.js';
import type {
  IGovernedQualityStandard,
  IProjectQualityExtension,
  IPromotionDecisionRecord,
  IUpdateNoticeAdoption,
} from '../../index.js';

describe('QC governance contract stability', () => {
  describe('enum array lengths', () => {
    it('QC_GOVERNANCE_WRITE_ACTIONS has 15 members', () => {
      expect(QC_GOVERNANCE_WRITE_ACTIONS).toHaveLength(15);
    });

    it('QC_GOVERNED_STANDARD_CATEGORIES has 12 members', () => {
      expect(QC_GOVERNED_STANDARD_CATEGORIES).toHaveLength(12);
    });

    it('QC_CANDIDATE_CONTENT_TYPES has 8 members', () => {
      expect(QC_CANDIDATE_CONTENT_TYPES).toHaveLength(8);
    });

    it('QC_EXTENSION_VALIDATION_RESULTS has 5 members', () => {
      expect(QC_EXTENSION_VALIDATION_RESULTS).toHaveLength(5);
    });

    it('QC_GOVERNED_CONTENT_VERSION_FIELDS has 11 members', () => {
      expect(QC_GOVERNED_CONTENT_VERSION_FIELDS).toHaveLength(11);
    });

    it('QC_UPDATE_NOTICE_REQUIREMENTS has 2 members', () => {
      expect(QC_UPDATE_NOTICE_REQUIREMENTS).toHaveLength(2);
    });

    it('QC_ADOPTION_DECISION_OWNERS has 2 members', () => {
      expect(QC_ADOPTION_DECISION_OWNERS).toHaveLength(2);
    });

    it('QC_BASIS_CONFLICT_OUTCOMES has 4 members', () => {
      expect(QC_BASIS_CONFLICT_OUTCOMES).toHaveLength(4);
    });

    it('QC_PROJECT_DECISION_LATITUDES has 7 members', () => {
      expect(QC_PROJECT_DECISION_LATITUDES).toHaveLength(7);
    });

    it('QC_CANDIDATE_SUBMISSION_STATES has 6 members', () => {
      expect(QC_CANDIDATE_SUBMISSION_STATES).toHaveLength(6);
    });
  });

  describe('label map key counts', () => {
    it('QC_GOVERNANCE_WRITE_ACTION_LABELS has 15 entries', () => {
      expect(Object.keys(QC_GOVERNANCE_WRITE_ACTION_LABELS)).toHaveLength(15);
    });

    it('QC_GOVERNED_STANDARD_CATEGORY_LABELS has 12 entries', () => {
      expect(Object.keys(QC_GOVERNED_STANDARD_CATEGORY_LABELS)).toHaveLength(12);
    });

    it('QC_BASIS_CONFLICT_OUTCOME_LABELS has 4 entries', () => {
      expect(Object.keys(QC_BASIS_CONFLICT_OUTCOME_LABELS)).toHaveLength(4);
    });

    it('QC_PROJECT_DECISION_LATITUDE_LABELS has 7 entries', () => {
      expect(Object.keys(QC_PROJECT_DECISION_LATITUDE_LABELS)).toHaveLength(7);
    });
  });

  describe('definition array lengths', () => {
    it('QC_GOVERNANCE_AUTHORITY_MATRIX has 15 rows', () => {
      expect(QC_GOVERNANCE_AUTHORITY_MATRIX).toHaveLength(15);
    });

    it('QC_GOVERNANCE_CONCERN_LATITUDES has 8 rows', () => {
      expect(QC_GOVERNANCE_CONCERN_LATITUDES).toHaveLength(8);
    });

    it('QC_CANDIDATE_VALID_TRANSITIONS has 6 rows', () => {
      expect(QC_CANDIDATE_VALID_TRANSITIONS).toHaveLength(6);
    });

    it('QC_EXTENSION_VALIDATION_RULE_DESCRIPTIONS has 5 rows', () => {
      expect(QC_EXTENSION_VALIDATION_RULE_DESCRIPTIONS).toHaveLength(5);
    });
  });

  describe('authority matrix correctness', () => {
    it('PUBLISH_GOVERNED_CORE only allows MOE_ADMIN', () => {
      const entry = QC_GOVERNANCE_AUTHORITY_MATRIX.find(
        (e) => e.action === 'PUBLISH_GOVERNED_CORE',
      );
      expect(entry).toBeDefined();
      expect(entry!.allowedRoles).toEqual(['MOE_ADMIN']);
    });

    it('AUTHOR_PROJECT_RECORDS allows PM_PE_PA', () => {
      const entry = QC_GOVERNANCE_AUTHORITY_MATRIX.find(
        (e) => e.action === 'AUTHOR_PROJECT_RECORDS',
      );
      expect(entry).toBeDefined();
      expect(entry!.allowedRoles).toContain('PM_PE_PA');
    });

    it('ADOPT_UPDATE_NOTICE allows PM_PE_PA', () => {
      const entry = QC_GOVERNANCE_AUTHORITY_MATRIX.find(
        (e) => e.action === 'ADOPT_UPDATE_NOTICE',
      );
      expect(entry).toBeDefined();
      expect(entry!.allowedRoles).toContain('PM_PE_PA');
    });
  });

  describe('compile-time typing', () => {
    it('IGovernedQualityStandard satisfies shape', () => {
      const record: IGovernedQualityStandard = {
        governedQualityStandardId: 'gs-1',
        standardKey: 'STD-001',
        governedVersionId: 'v-1',
        title: 'Test Standard',
        discipline: 'Structural',
        category: 'QUALITY_STANDARD',
        governedTaxonomyPath: '/root/structural',
        requirementText: 'Must verify',
        applicabilityScope: 'All projects',
        minimumEvidenceRuleRefs: ['ER-001'],
        sourceProvenance: 'AISC',
        publishedByUserId: 'user-1',
        publishedAt: '2026-01-01T00:00:00Z',
        state: 'PUBLISHED',
        supersededByVersionId: null,
        retiredAt: null,
      };
      expect(record.governedQualityStandardId).toBe('gs-1');
    });

    it('IProjectQualityExtension satisfies shape', () => {
      const record: IProjectQualityExtension = {
        projectQualityExtensionId: 'pqe-1',
        projectId: 'proj-1',
        parentGovernedKey: 'STD-001',
        extensionVersionId: 'ev-1',
        projectRationale: 'Project-specific need',
        taxonomyParent: '/root/structural',
        constrainedScope: 'High-rise only',
        approvalMetadata: 'Approved by PM',
        provenance: 'Project team',
        promotionStatus: 'DRAFT',
        promotedToGovernedVersionId: null,
        createdAt: '2026-01-01T00:00:00Z',
        createdByUserId: 'user-1',
        retiredAt: null,
      };
      expect(record.projectQualityExtensionId).toBe('pqe-1');
    });

    it('IPromotionDecisionRecord satisfies shape', () => {
      const record: IPromotionDecisionRecord = {
        promotionDecisionId: 'pd-1',
        candidateId: 'cand-1',
        extensionId: null,
        outcome: 'APPROVED_PROMOTED',
        governanceOwnerUserId: 'user-1',
        disciplineReviewerUserId: 'user-2',
        rationale: 'Meets all criteria',
        governedVersionIdIfPromoted: 'gv-1',
        decidedAt: '2026-01-01T00:00:00Z',
      };
      expect(record.promotionDecisionId).toBe('pd-1');
    });

    it('IUpdateNoticeAdoption satisfies shape', () => {
      const record: IUpdateNoticeAdoption = {
        adoptionId: 'ad-1',
        governedUpdateNoticeId: 'gun-1',
        projectId: 'proj-1',
        state: 'PENDING_REVIEW',
        requirement: 'MANDATORY',
        decidedByUserId: null,
        decidedAt: null,
        rationale: null,
        recheckActions: [],
        supersededByAdoptionId: null,
      };
      expect(record.adoptionId).toBe('ad-1');
    });
  });
});
