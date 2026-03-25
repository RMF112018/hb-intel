import { describe, expect, it } from 'vitest';

import type {
  IClosureAuthorityRecord,
  IEscalationEvent,
  IIssueActionCoupling,
  IIssueOriginationRecord,
  IRootCauseQualificationRecord,
  IWorkQueuePublicationItem,
} from '../../index.js';

import {
  CLOSURE_AUTHORITY_RULES,
  CLOSURE_AUTHORITY_TYPES,
  ESCALATION_TRIGGER_DEFINITIONS,
  ESCALATION_TRIGGERS,
  ISSUE_ACTION_RELATIONSHIPS,
  ISSUE_ORIGINATION_MODES,
  ISSUE_ORIGINATION_REQUIRED_REFS,
  ISSUE_PRIORITY_BANDS,
  QC_ESCALATION_TRIGGER_LABELS,
  QC_ISSUE_PRIORITY_BAND_LABELS,
  QC_ROOT_CAUSE_QUALIFICATION_LABELS,
  QC_WORK_QUEUE_PUBLICATION_STATE_LABELS,
  ROOT_CAUSE_QUALIFICATIONS,
  ROOT_CAUSE_REQUIRED_CONDITIONS,
  ROOT_CAUSE_REQUIRED_REASONS,
  WORK_QUEUE_PUBLICATION_EVENT_MAP,
  WORK_QUEUE_PUBLICATION_EVENTS,
  WORK_QUEUE_PUBLICATION_STATES,
  WORK_QUEUE_SOURCE_TYPES,
} from '../../index.js';

describe('P3-E15-T10 Stage 5 QC issues-actions contract stability', () => {
  // -- Enum array lengths -------------------------------------------------------

  describe('enum arrays', () => {
    it('ISSUE_ORIGINATION_MODES has 3', () => { expect(ISSUE_ORIGINATION_MODES).toHaveLength(3); });
    it('CLOSURE_AUTHORITY_TYPES has 2', () => { expect(CLOSURE_AUTHORITY_TYPES).toHaveLength(2); });
    it('WORK_QUEUE_PUBLICATION_STATES has 6', () => { expect(WORK_QUEUE_PUBLICATION_STATES).toHaveLength(6); });
    it('WORK_QUEUE_SOURCE_TYPES has 2', () => { expect(WORK_QUEUE_SOURCE_TYPES).toHaveLength(2); });
    it('ROOT_CAUSE_QUALIFICATIONS has 2', () => { expect(ROOT_CAUSE_QUALIFICATIONS).toHaveLength(2); });
    it('ROOT_CAUSE_REQUIRED_REASONS has 6', () => { expect(ROOT_CAUSE_REQUIRED_REASONS).toHaveLength(6); });
    it('ESCALATION_TRIGGERS has 6', () => { expect(ESCALATION_TRIGGERS).toHaveLength(6); });
    it('ISSUE_PRIORITY_BANDS has 4', () => { expect(ISSUE_PRIORITY_BANDS).toHaveLength(4); });
    it('ISSUE_ACTION_RELATIONSHIPS has 2', () => { expect(ISSUE_ACTION_RELATIONSHIPS).toHaveLength(2); });
    it('WORK_QUEUE_PUBLICATION_EVENTS has 7', () => { expect(WORK_QUEUE_PUBLICATION_EVENTS).toHaveLength(7); });
  });

  // -- Label maps ---------------------------------------------------------------

  describe('label maps', () => {
    it('QC_ISSUE_PRIORITY_BAND_LABELS covers 4', () => { expect(Object.keys(QC_ISSUE_PRIORITY_BAND_LABELS)).toHaveLength(4); });
    it('QC_ESCALATION_TRIGGER_LABELS covers 6', () => { expect(Object.keys(QC_ESCALATION_TRIGGER_LABELS)).toHaveLength(6); });
    it('QC_WORK_QUEUE_PUBLICATION_STATE_LABELS covers 6', () => { expect(Object.keys(QC_WORK_QUEUE_PUBLICATION_STATE_LABELS)).toHaveLength(6); });
    it('QC_ROOT_CAUSE_QUALIFICATION_LABELS covers 2', () => { expect(Object.keys(QC_ROOT_CAUSE_QUALIFICATION_LABELS)).toHaveLength(2); });
  });

  // -- Definition arrays --------------------------------------------------------

  describe('definition arrays', () => {
    it('ISSUE_ORIGINATION_REQUIRED_REFS has 3', () => { expect(ISSUE_ORIGINATION_REQUIRED_REFS).toHaveLength(3); });
    it('WORK_QUEUE_PUBLICATION_EVENT_MAP has 7', () => { expect(WORK_QUEUE_PUBLICATION_EVENT_MAP).toHaveLength(7); });
    it('ROOT_CAUSE_REQUIRED_CONDITIONS has 6', () => { expect(ROOT_CAUSE_REQUIRED_CONDITIONS).toHaveLength(6); });
    it('ESCALATION_TRIGGER_DEFINITIONS has 6', () => { expect(ESCALATION_TRIGGER_DEFINITIONS).toHaveLength(6); });
    it('CLOSURE_AUTHORITY_RULES has 3', () => { expect(CLOSURE_AUTHORITY_RULES).toHaveLength(3); });
  });

  // -- Type contract stability --------------------------------------------------

  describe('type contract stability', () => {
    it('IIssueOriginationRecord can be typed correctly', () => {
      const record: IIssueOriginationRecord = {
        originationRecordId: 'orig-1',
        qcIssueId: 'issue-1',
        mode: 'FINDING_ORIGIN',
        findingContext: {
          reviewPackageId: 'pkg-1',
          findingId: 'finding-1',
          affectedRequirementRefs: ['req-1'],
          findingSeverity: 'HIGH',
          originResponsiblePartyContext: 'org-context',
          governedRequirementRefs: ['gov-1'],
        },
        gateContext: null,
        adHocContext: null,
      } satisfies IIssueOriginationRecord;
      expect(record.mode).toBe('FINDING_ORIGIN');
    });

    it('IClosureAuthorityRecord can be typed correctly', () => {
      const record: IClosureAuthorityRecord = {
        closureRecordId: 'close-1',
        recordId: 'issue-1',
        closureType: 'VERIFIER_CLOSE',
        verifierUserId: 'user-1',
        verifierDesignationRef: 'desg-1',
        closedAt: '2026-01-01T00:00:00Z',
        verificationNotes: 'Verified and closed',
        evidenceRefs: ['ev-1'],
      } satisfies IClosureAuthorityRecord;
      expect(record.closureType).toBe('VERIFIER_CLOSE');
    });

    it('IWorkQueuePublicationItem can be typed correctly', () => {
      const item: IWorkQueuePublicationItem = {
        workItemId: 'wi-1',
        sourceType: 'QC_ISSUE',
        sourceRecordId: 'issue-1',
        projectId: 'proj-1',
        workPackageRef: 'wp-1',
        title: 'Open QC Issue',
        dueDate: '2026-02-01',
        priorityBand: 'HIGH',
        slaClass: 'STANDARD',
        readinessImpact: 'DEGRADES_READINESS',
        ownerOrganization: 'org-1',
        reviewerNeededFlag: false,
        deepLinkRef: '/qc/issues/issue-1',
        publicationState: 'CREATED',
        publishedAt: '2026-01-01T00:00:00Z',
      } satisfies IWorkQueuePublicationItem;
      expect(item.publicationState).toBe('CREATED');
    });

    it('IRootCauseQualificationRecord can be typed correctly', () => {
      const record: IRootCauseQualificationRecord = {
        qualificationRecordId: 'qual-1',
        qcIssueId: 'issue-1',
        qualification: 'REQUIRED',
        requiredReason: 'SEVERITY_EXCEEDS_THRESHOLD',
        notRequiredRationale: null,
        qualifiedByUserId: 'user-1',
        qualifiedAt: '2026-01-01T00:00:00Z',
      } satisfies IRootCauseQualificationRecord;
      expect(record.qualification).toBe('REQUIRED');
    });

    it('IEscalationEvent can be typed correctly', () => {
      const event: IEscalationEvent = {
        escalationEventId: 'esc-1',
        sourceRecordId: 'issue-1',
        sourceType: 'QC_ISSUE',
        trigger: 'OVERDUE',
        previousPriorityBand: 'STANDARD',
        newPriorityBand: 'HIGH',
        escalatedAt: '2026-01-01T00:00:00Z',
        escalatedBySystem: true,
      } satisfies IEscalationEvent;
      expect(event.trigger).toBe('OVERDUE');
    });

    it('IIssueActionCoupling can be typed correctly', () => {
      const coupling: IIssueActionCoupling = {
        couplingId: 'coup-1',
        parentIssueId: 'issue-1',
        childActionId: 'action-1',
        relationship: 'PARENT_ISSUE',
        isChildClosureRequiredForParentClosure: true,
        childReopenTriggersParentReopen: true,
      } satisfies IIssueActionCoupling;
      expect(coupling.relationship).toBe('PARENT_ISSUE');
    });
  });
});
