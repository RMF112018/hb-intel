import { describe, expect, it } from 'vitest';
import {
  QC_ISSUE_SEVERITIES,
  QC_ISSUE_READINESS_IMPACTS,
  QC_CONTROL_GATE_TYPES,
  QC_FINDING_DISPOSITION_TYPES,
  QC_EVIDENCE_TYPES,
  QC_APPROVAL_AUTHORITY_TYPES,
  QC_ROOT_CAUSE_CATEGORIES,
  QC_RECURRENCE_CLASSIFICATIONS,
  QC_SUBMITTAL_ACTIVATION_STAGES,
  QC_CURRENTNESS_STATUSES,
  QC_REFERENCE_MATCH_CONFIDENCES,
  QC_SLA_CLASSES,
  QC_ESCALATION_LEVELS,
  QC_DEVIATION_EXCEPTION_TYPES,
  QC_ISSUE_SEVERITY_LABELS,
  QC_EVIDENCE_TYPE_LABELS,
  QC_ROOT_CAUSE_CATEGORY_LABELS,
  QC_CURRENTNESS_STATUS_LABELS,
  QC_SLA_CLASS_LABELS,
  QC_ESCALATION_LEVEL_LABELS,
  QC_RECORD_IDENTITY_RULES,
  QC_FINDING_TO_ISSUE_REQUIRED_FIELDS,
  QC_ISSUE_VALID_TRANSITIONS,
  QC_CORRECTIVE_ACTION_VALID_TRANSITIONS,
  QC_DEVIATION_VALID_TRANSITIONS,
  QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY,
  QC_SNAPSHOT_IMMUTABLE_FAMILIES,
  QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES,
  QC_WORK_PACKAGE_SCOPED_FAMILIES,
  QC_ISSUE_TERMINAL_STATES,
  QC_CORRECTIVE_ACTION_TERMINAL_STATES,
  QC_DEVIATION_TERMINAL_STATES,
} from '../../index.js';
import type {
  IWorkPackageQualityPlan,
  IQcIssue,
  ISubmittalItemRecord,
  IQualityHealthSnapshot,
  IDownstreamHandoffRef,
} from '../../index.js';

describe('QC record-families contract stability', () => {
  describe('enum array lengths', () => {
    it('QC_ISSUE_SEVERITIES has 5 members', () => {
      expect(QC_ISSUE_SEVERITIES).toHaveLength(5);
    });

    it('QC_ISSUE_READINESS_IMPACTS has 3 members', () => {
      expect(QC_ISSUE_READINESS_IMPACTS).toHaveLength(3);
    });

    it('QC_CONTROL_GATE_TYPES has 5 members', () => {
      expect(QC_CONTROL_GATE_TYPES).toHaveLength(5);
    });

    it('QC_FINDING_DISPOSITION_TYPES has 4 members', () => {
      expect(QC_FINDING_DISPOSITION_TYPES).toHaveLength(4);
    });

    it('QC_EVIDENCE_TYPES has 7 members', () => {
      expect(QC_EVIDENCE_TYPES).toHaveLength(7);
    });

    it('QC_APPROVAL_AUTHORITY_TYPES has 5 members', () => {
      expect(QC_APPROVAL_AUTHORITY_TYPES).toHaveLength(5);
    });

    it('QC_ROOT_CAUSE_CATEGORIES has 10 members', () => {
      expect(QC_ROOT_CAUSE_CATEGORIES).toHaveLength(10);
    });

    it('QC_RECURRENCE_CLASSIFICATIONS has 4 members', () => {
      expect(QC_RECURRENCE_CLASSIFICATIONS).toHaveLength(4);
    });

    it('QC_SUBMITTAL_ACTIVATION_STAGES has 2 members', () => {
      expect(QC_SUBMITTAL_ACTIVATION_STAGES).toHaveLength(2);
    });

    it('QC_CURRENTNESS_STATUSES has 4 members', () => {
      expect(QC_CURRENTNESS_STATUSES).toHaveLength(4);
    });

    it('QC_REFERENCE_MATCH_CONFIDENCES has 4 members', () => {
      expect(QC_REFERENCE_MATCH_CONFIDENCES).toHaveLength(4);
    });

    it('QC_SLA_CLASSES has 3 members', () => {
      expect(QC_SLA_CLASSES).toHaveLength(3);
    });

    it('QC_ESCALATION_LEVELS has 4 members', () => {
      expect(QC_ESCALATION_LEVELS).toHaveLength(4);
    });

    it('QC_DEVIATION_EXCEPTION_TYPES has 2 members', () => {
      expect(QC_DEVIATION_EXCEPTION_TYPES).toHaveLength(2);
    });
  });

  describe('label map key counts', () => {
    it('QC_ISSUE_SEVERITY_LABELS has 5 entries', () => {
      expect(Object.keys(QC_ISSUE_SEVERITY_LABELS)).toHaveLength(5);
    });

    it('QC_EVIDENCE_TYPE_LABELS has 7 entries', () => {
      expect(Object.keys(QC_EVIDENCE_TYPE_LABELS)).toHaveLength(7);
    });

    it('QC_ROOT_CAUSE_CATEGORY_LABELS has 10 entries', () => {
      expect(Object.keys(QC_ROOT_CAUSE_CATEGORY_LABELS)).toHaveLength(10);
    });

    it('QC_CURRENTNESS_STATUS_LABELS has 4 entries', () => {
      expect(Object.keys(QC_CURRENTNESS_STATUS_LABELS)).toHaveLength(4);
    });

    it('QC_SLA_CLASS_LABELS has 3 entries', () => {
      expect(Object.keys(QC_SLA_CLASS_LABELS)).toHaveLength(3);
    });

    it('QC_ESCALATION_LEVEL_LABELS has 4 entries', () => {
      expect(Object.keys(QC_ESCALATION_LEVEL_LABELS)).toHaveLength(4);
    });
  });

  describe('definition array lengths', () => {
    it('QC_RECORD_IDENTITY_RULES has 21 rows', () => {
      expect(QC_RECORD_IDENTITY_RULES).toHaveLength(21);
    });

    it('QC_FINDING_TO_ISSUE_REQUIRED_FIELDS has 5 entries', () => {
      expect(QC_FINDING_TO_ISSUE_REQUIRED_FIELDS).toHaveLength(5);
    });

    it('QC_ISSUE_VALID_TRANSITIONS has 11 entries', () => {
      expect(QC_ISSUE_VALID_TRANSITIONS).toHaveLength(11);
    });

    it('QC_CORRECTIVE_ACTION_VALID_TRANSITIONS has 10 entries', () => {
      expect(QC_CORRECTIVE_ACTION_VALID_TRANSITIONS).toHaveLength(10);
    });

    it('QC_DEVIATION_VALID_TRANSITIONS has 11 entries', () => {
      expect(QC_DEVIATION_VALID_TRANSITIONS).toHaveLength(11);
    });

    it('QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY has 10 entries', () => {
      expect(QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY).toHaveLength(10);
    });

    it('QC_SNAPSHOT_IMMUTABLE_FAMILIES has 4 entries', () => {
      expect(QC_SNAPSHOT_IMMUTABLE_FAMILIES).toHaveLength(4);
    });

    it('QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES has 4 entries', () => {
      expect(QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES).toHaveLength(4);
    });

    it('QC_WORK_PACKAGE_SCOPED_FAMILIES has 2 entries', () => {
      expect(QC_WORK_PACKAGE_SCOPED_FAMILIES).toHaveLength(2);
    });
  });

  describe('terminal state array lengths', () => {
    it('QC_ISSUE_TERMINAL_STATES has 2 entries', () => {
      expect(QC_ISSUE_TERMINAL_STATES).toHaveLength(2);
    });

    it('QC_CORRECTIVE_ACTION_TERMINAL_STATES has 2 entries', () => {
      expect(QC_CORRECTIVE_ACTION_TERMINAL_STATES).toHaveLength(2);
    });

    it('QC_DEVIATION_TERMINAL_STATES has 5 entries', () => {
      expect(QC_DEVIATION_TERMINAL_STATES).toHaveLength(5);
    });
  });

  describe('compile-time typing', () => {
    it('IWorkPackageQualityPlan satisfies shape', () => {
      const record: IWorkPackageQualityPlan = {
        workPackageQualityPlanId: 'wpqp-1',
        projectId: 'proj-1',
        workPackageKey: 'WP-001',
        planVersionId: 'pv-1',
        governedStandardRefs: ['GS-001'],
        projectExtensionRefs: [],
        responsibleOrganization: 'ORG-A',
        responsibleIndividual: null,
        verifierDesignationRef: null,
        mandatoryCoverageRefs: ['MC-001'],
        highRiskAdditionRefs: [],
        softGateSet: [],
        evidenceMinimumRefs: ['EM-001'],
        scheduleAwarenessRefs: [],
        downstreamHandoffFlags: [],
        dueDate: null,
        state: 'DRAFT',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(record.workPackageQualityPlanId).toBe('wpqp-1');
    });

    it('IQcIssue satisfies shape', () => {
      const record: IQcIssue = {
        qcIssueId: 'qi-1',
        projectId: 'proj-1',
        issueKey: 'ISS-001',
        issueOrigin: 'FINDING',
        originReviewPackageId: 'rp-1',
        originFindingId: 'rf-1',
        workPackageRef: null,
        responsibleOrganization: 'ORG-A',
        responsibleIndividual: null,
        verifierDesignationRef: null,
        severity: 'HIGH',
        dueDate: null,
        slaClass: 'STANDARD',
        readinessImpact: 'BLOCKS_READINESS',
        rootCausePlaceholder: null,
        rootCauseRecordId: null,
        escalationLevel: 'NONE',
        state: 'OPEN',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(record.qcIssueId).toBe('qi-1');
    });

    it('ISubmittalItemRecord satisfies shape', () => {
      const record: ISubmittalItemRecord = {
        submittalItemRecordId: 'sir-1',
        projectId: 'proj-1',
        itemKey: 'SUB-001',
        specLinkRef: 'spec-1',
        packageLinkRef: 'pkg-1',
        productMaterialSystemIdentity: 'Steel beam',
        responsibleOrganization: 'ORG-A',
        responsibleIndividual: null,
        approvedProjectBasisRef: null,
        activationStage: 'PRELIMINARY_GUIDANCE',
        linkedWorkPackageKey: null,
        state: 'DRAFT',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(record.submittalItemRecordId).toBe('sir-1');
    });

    it('IQualityHealthSnapshot satisfies shape', () => {
      const record: IQualityHealthSnapshot = {
        qualityHealthSnapshotId: 'qhs-1',
        projectId: 'proj-1',
        snapshotAt: '2026-01-01T00:00:00Z',
        planPosture: 'GREEN',
        issueAgingPosture: 'YELLOW',
        correctiveActionPosture: 'GREEN',
        approvalDependencyPosture: 'GREEN',
        advisoryPosture: 'GREEN',
        rootCauseTrend: 'STABLE',
        responsibleOrgRollupSummary: 'All orgs performing',
        readinessSignals: ['READY'],
        state: 'COMPUTED',
        computedAt: '2026-01-01T00:00:00Z',
        publishedAt: null,
        supersededBySnapshotId: null,
      };
      expect(record.qualityHealthSnapshotId).toBe('qhs-1');
    });

    it('IDownstreamHandoffRef satisfies shape', () => {
      const record: IDownstreamHandoffRef = {
        handoffRefId: 'dh-1',
        sourceRecordId: 'src-1',
        targetModule: 'STARTUP',
        handoffContent: 'QC plan completion summary',
        snapshotRef: null,
      };
      expect(record.handoffRefId).toBe('dh-1');
    });
  });
});
