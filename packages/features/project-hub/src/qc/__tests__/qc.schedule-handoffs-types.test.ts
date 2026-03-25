import { describe, expect, it } from 'vitest';
import {
  QC_QUALITY_READINESS_SIGNALS,
  QC_SCHEDULE_REF_TYPES,
  QC_HANDOFF_TARGETS,
  QC_HANDOFF_CONTENT_TYPES,
  QC_BASELINE_VISIBLE_SURFACES,
  QC_SCHEDULE_AWARE_RECORD_TYPES,
  QC_DEFERRED_FIELD_CAPABILITIES,
  QC_HANDOFF_LINEAGE_PRESERVATIONS,
  QC_READINESS_PUBLICATION_SCOPES,
  QC_QUALITY_READINESS_SIGNAL_LABELS,
  QC_HANDOFF_TARGET_LABELS,
  QC_BASELINE_VISIBLE_SURFACE_LABELS,
  QC_SCHEDULE_REF_TYPE_LABELS,
  SCHEDULE_AWARE_RECORD_TYPE_LIST,
  HANDOFF_TARGET_CONTENT_MAP,
  BASELINE_VISIBLE_SURFACE_DESCRIPTIONS,
  DEFERRED_FIELD_CAPABILITY_DEFINITIONS,
  HANDOFF_LINEAGE_REQUIREMENTS,
} from '../../index.js';
import type {
  IScheduleContextRef,
  IQualityReadinessPublication,
  IHandoffPayload,
  ICloseoutHandoffContent,
  IStartupHandoffContent,
  IWarrantyHandoffContent,
  ISiteControlsHandoffContent,
} from '../../index.js';

describe('QC schedule-handoffs contract stability', () => {
  describe('enum array lengths', () => {
    it('QC_QUALITY_READINESS_SIGNALS has 5 members', () => {
      expect(QC_QUALITY_READINESS_SIGNALS).toHaveLength(5);
    });

    it('QC_SCHEDULE_REF_TYPES has 4 members', () => {
      expect(QC_SCHEDULE_REF_TYPES).toHaveLength(4);
    });

    it('QC_HANDOFF_TARGETS has 4 members', () => {
      expect(QC_HANDOFF_TARGETS).toHaveLength(4);
    });

    it('QC_HANDOFF_CONTENT_TYPES has 11 members', () => {
      expect(QC_HANDOFF_CONTENT_TYPES).toHaveLength(11);
    });

    it('QC_BASELINE_VISIBLE_SURFACES has 4 members', () => {
      expect(QC_BASELINE_VISIBLE_SURFACES).toHaveLength(4);
    });

    it('QC_SCHEDULE_AWARE_RECORD_TYPES has 10 members', () => {
      expect(QC_SCHEDULE_AWARE_RECORD_TYPES).toHaveLength(10);
    });

    it('QC_DEFERRED_FIELD_CAPABILITIES has 6 members', () => {
      expect(QC_DEFERRED_FIELD_CAPABILITIES).toHaveLength(6);
    });

    it('QC_HANDOFF_LINEAGE_PRESERVATIONS has 3 members', () => {
      expect(QC_HANDOFF_LINEAGE_PRESERVATIONS).toHaveLength(3);
    });

    it('QC_READINESS_PUBLICATION_SCOPES has 4 members', () => {
      expect(QC_READINESS_PUBLICATION_SCOPES).toHaveLength(4);
    });
  });

  describe('label map key counts', () => {
    it('QC_QUALITY_READINESS_SIGNAL_LABELS has 5 entries', () => {
      expect(Object.keys(QC_QUALITY_READINESS_SIGNAL_LABELS)).toHaveLength(5);
    });

    it('QC_HANDOFF_TARGET_LABELS has 4 entries', () => {
      expect(Object.keys(QC_HANDOFF_TARGET_LABELS)).toHaveLength(4);
    });

    it('QC_BASELINE_VISIBLE_SURFACE_LABELS has 4 entries', () => {
      expect(Object.keys(QC_BASELINE_VISIBLE_SURFACE_LABELS)).toHaveLength(4);
    });

    it('QC_SCHEDULE_REF_TYPE_LABELS has 4 entries', () => {
      expect(Object.keys(QC_SCHEDULE_REF_TYPE_LABELS)).toHaveLength(4);
    });
  });

  describe('definition array lengths', () => {
    it('SCHEDULE_AWARE_RECORD_TYPE_LIST has 10 entries', () => {
      expect(SCHEDULE_AWARE_RECORD_TYPE_LIST).toHaveLength(10);
    });

    it('HANDOFF_TARGET_CONTENT_MAP has 4 rows', () => {
      expect(HANDOFF_TARGET_CONTENT_MAP).toHaveLength(4);
    });

    it('BASELINE_VISIBLE_SURFACE_DESCRIPTIONS has 4 entries', () => {
      expect(BASELINE_VISIBLE_SURFACE_DESCRIPTIONS).toHaveLength(4);
    });

    it('DEFERRED_FIELD_CAPABILITY_DEFINITIONS has 6 entries', () => {
      expect(DEFERRED_FIELD_CAPABILITY_DEFINITIONS).toHaveLength(6);
    });

    it('HANDOFF_LINEAGE_REQUIREMENTS has 4 entries', () => {
      expect(HANDOFF_LINEAGE_REQUIREMENTS).toHaveLength(4);
    });
  });

  describe('compile-time typing', () => {
    it('IScheduleContextRef satisfies shape', () => {
      const ref: IScheduleContextRef = {
        scheduleContextRefId: 'scr-1',
        owningRecordId: 'rec-1',
        owningRecordType: 'WORK_PACKAGE_QUALITY_PLAN',
        refType: 'MILESTONE_REF',
        scheduleRefId: 'sched-1',
        windowStartDate: '2026-04-01',
        windowEndDate: '2026-04-15',
        isReadOnly: true,
      };
      expect(ref.scheduleContextRefId).toBe('scr-1');
    });

    it('IQualityReadinessPublication satisfies shape', () => {
      const pub: IQualityReadinessPublication = {
        publicationId: 'pub-1',
        projectId: 'proj-1',
        sourceRecordId: 'rec-1',
        readinessSignal: 'QUALITY_READY',
        scheduleContextRef: 'scr-1',
        milestoneRef: 'ms-1',
        windowRef: null,
        publicationScope: 'PROJECT_HUB_CANVAS',
        publishedAt: '2026-03-25T00:00:00Z',
        supersededByPublicationId: null,
      };
      expect(pub.publicationId).toBe('pub-1');
    });

    it('IHandoffPayload satisfies shape', () => {
      const payload: IHandoffPayload = {
        handoffPayloadId: 'hp-1',
        projectId: 'proj-1',
        target: 'CLOSEOUT',
        snapshotRef: 'snap-1',
        contentTypes: ['TURNOVER_QUALITY_BASIS', 'OPEN_ISSUE_POSTURE'],
        lineagePreservation: 'SNAPSHOT_BASED',
        openIssueCount: 3,
        approvedDeviationCount: 1,
        evidenceRefCount: 12,
        unresolvableBlockerCount: 0,
        assembledAt: '2026-03-25T00:00:00Z',
      };
      expect(payload.handoffPayloadId).toBe('hp-1');
    });

    it('ICloseoutHandoffContent satisfies shape', () => {
      const content: ICloseoutHandoffContent = {
        handoffContentId: 'chc-1',
        handoffPayloadId: 'hp-1',
        turnoverQualityBasis: 'Complete with conditions',
        openIssueRefs: ['issue-1'],
        approvedDeviationRefs: ['dev-1'],
        evidenceRefs: ['ev-1'],
        externalApprovalRefs: ['ea-1'],
        qualityReadinessPosture: 'QUALITY_READY_WITH_CONDITIONS',
      };
      expect(content.handoffContentId).toBe('chc-1');
    });

    it('IStartupHandoffContent satisfies shape', () => {
      const content: IStartupHandoffContent = {
        handoffContentId: 'shc-1',
        handoffPayloadId: 'hp-1',
        qualityPlanSectionRefs: ['qps-1'],
        approvedExceptionRefs: ['ae-1'],
        testWitnessResultRefs: ['twr-1'],
        unresolvedQualityIssueRefs: [],
        commissioningReadinessPosture: 'QUALITY_READY',
        gateExpectationRefs: ['ge-1'],
      };
      expect(content.handoffContentId).toBe('shc-1');
    });

    it('IWarrantyHandoffContent satisfies shape', () => {
      const content: IWarrantyHandoffContent = {
        handoffContentId: 'whc-1',
        handoffPayloadId: 'hp-1',
        acceptedQualityBasis: 'Accepted with waivers',
        evidenceLineageRefs: ['el-1'],
        approvedDeviationWaiverRefs: ['adw-1'],
        recurrenceHistoryRefs: ['rh-1'],
        responsibleOrgHistoryRefs: ['roh-1'],
        qualityPostureAtHandoff: 'QUALITY_READY',
      };
      expect(content.handoffContentId).toBe('whc-1');
    });

    it('ISiteControlsHandoffContent satisfies shape', () => {
      const content: ISiteControlsHandoffContent = {
        handoffContentId: 'schc-1',
        handoffPayloadId: 'hp-1',
        fieldFacingControlExpectations: ['ctrl-1'],
        unresolvedReadinessBlockerRefs: [],
        advisoryDriftAlertRefs: ['ada-1'],
        gateTestMockupWitnessExpectationRefs: ['gtm-1'],
        readinessPosture: 'QUALITY_AT_RISK',
        isDeferredToPhase6: true,
      };
      expect(content.handoffContentId).toBe('schc-1');
    });
  });
});
