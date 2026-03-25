import { describe, expect, it } from 'vitest';

import type {
  IGovernedUpdateNotice,
  IProjectQcSnapshot,
} from '../../index.js';

import {
  ADVISORY_EXCEPTION_STATES,
  ADVISORY_VERDICT_STATES,
  CORRECTIVE_ACTION_STATES,
  DEVIATION_STATES,
  DOC_INVENTORY_STATES,
  EVIDENCE_REF_STATES,
  EXTERNAL_APPROVAL_STATES,
  GOVERNED_STANDARD_STATES,
  GOVERNED_UPDATE_NOTICE_STATES,
  PROJECT_EXTENSION_STATES,
  PROJECT_QC_SNAPSHOT_STATES,
  QC_ADJACENT_MODULE_BOUNDARIES,
  QC_ADJACENT_MODULE_LABELS,
  QC_ADJACENT_MODULES,
  QC_ADVISORY_LINEAGE_CHAIN,
  QC_ANTI_GOAL_DEFINITIONS,
  QC_ANTI_GOALS,
  QC_CROSS_CONTRACT_REFS,
  QC_DOWNSTREAM_HANDOFFS,
  QC_GOVERNED_CORE_CONCERN_DEFINITIONS,
  QC_GOVERNED_CORE_CONCERN_LABELS,
  QC_GOVERNED_CORE_CONCERNS,
  QC_ISSUE_ORIGINS,
  QC_ISSUE_STATES,
  QC_KEY_ACTOR_LABELS,
  QC_KEY_ACTORS,
  QC_LANE_CAPABILITIES,
  QC_LANE_CAPABILITY_DEFINITIONS,
  QC_LANE_CAPABILITY_LABELS,
  QC_LIFECYCLE_HANDOFF_TARGETS,
  QC_LOCKED_INVARIANTS,
  QC_MAIN_LINEAGE_CHAIN,
  QC_OPERATIONAL_OWNERSHIP_AREA_LABELS,
  QC_OPERATIONAL_OWNERSHIP_AREAS,
  QC_OPERATIONAL_OWNERSHIP_DEFINITIONS,
  QC_OUT_OF_SCOPE_DEFINITIONS,
  QC_OUT_OF_SCOPE_ITEMS,
  QC_OUT_OF_SCOPE_LABELS,
  QC_PHASE3_ACCESS_POSTURES,
  QC_PROJECT_EXTENSION_RULES,
  QC_PROMOTION_DECISION_OUTCOMES,
  QC_RECORD_FAMILIES,
  QC_RECORD_FAMILY_DEFINITIONS,
  QC_RECORD_FAMILY_LABELS,
  QC_ROLE_ACTION_MATRIX,
  QC_SHARED_PACKAGE_REQUIREMENTS,
  QC_SOT_AUTHORITIES,
  QC_SOT_AUTHORITY_LABELS,
  QC_SOT_BOUNDARIES,
  QC_SOT_RELATIONSHIPS,
  QC_SUPPORTING_REF_FAMILIES,
  QC_UPDATE_NOTICE_ADOPTION_STATES,
  QC_VERIFIER_DESIGNATION_RULES,
  QUALITY_HEALTH_SNAPSHOT_STATES,
  RESPONSIBLE_PARTY_STATES,
  REVIEW_FINDING_STATES,
  REVIEW_PACKAGE_STATES,
  ROLLUP_INPUT_STATES,
  ROOT_CAUSE_STATES,
  SUBMITTAL_ITEM_STATES,
  VERSION_DRIFT_ALERT_STATES,
  WORK_PACKAGE_PLAN_STATES,
} from '../../index.js';

describe('P3-E15-T10 Stage 1 QC foundation contract stability', () => {
  // -- Enum array lengths -------------------------------------------------------

  describe('QcKeyActor', () => {
    it('has exactly 7 actors per T01 §3/§5', () => { expect(QC_KEY_ACTORS).toHaveLength(7); });
  });
  describe('QcPhase3AccessPosture', () => {
    it('has exactly 6 postures per T01 §3', () => { expect(QC_PHASE3_ACCESS_POSTURES).toHaveLength(6); });
  });
  describe('QcAntiGoal', () => {
    it('has exactly 6 anti-goals per T01 §1.2', () => { expect(QC_ANTI_GOALS).toHaveLength(6); });
  });
  describe('QcLifecycleHandoffTarget', () => {
    it('has exactly 4 targets per T01 §2.2', () => { expect(QC_LIFECYCLE_HANDOFF_TARGETS).toHaveLength(4); });
  });
  describe('QcAdjacentModule', () => {
    it('has exactly 8 modules per T01 §6', () => { expect(QC_ADJACENT_MODULES).toHaveLength(8); });
  });
  describe('QcOutOfScopeItem', () => {
    it('has exactly 9 items per T01 §7.1', () => { expect(QC_OUT_OF_SCOPE_ITEMS).toHaveLength(9); });
  });
  describe('QcOperationalOwnershipArea', () => {
    it('has exactly 4 areas per T01 §5', () => { expect(QC_OPERATIONAL_OWNERSHIP_AREAS).toHaveLength(4); });
  });
  describe('QcLaneCapability', () => {
    it('has exactly 3 capabilities per T01 §7', () => { expect(QC_LANE_CAPABILITIES).toHaveLength(3); });
  });
  describe('GovernedCoreConcern', () => {
    it('has exactly 11 concerns per T02 §2', () => { expect(QC_GOVERNED_CORE_CONCERNS).toHaveLength(11); });
  });
  describe('PromotionDecisionOutcome', () => {
    it('has exactly 4 outcomes per T02 §3.2', () => { expect(QC_PROMOTION_DECISION_OUTCOMES).toHaveLength(4); });
  });
  describe('UpdateNoticeAdoptionState', () => {
    it('has exactly 5 states per T02 §6.2', () => { expect(QC_UPDATE_NOTICE_ADOPTION_STATES).toHaveLength(5); });
  });
  describe('QcRecordFamily', () => {
    it('has exactly 21 families per T03 §1', () => { expect(QC_RECORD_FAMILIES).toHaveLength(21); });
  });
  describe('QcSupportingRefFamily', () => {
    it('has exactly 5 ref families per T03 §1', () => { expect(QC_SUPPORTING_REF_FAMILIES).toHaveLength(5); });
  });
  describe('QcSoTAuthority', () => {
    it('has exactly 13 authorities per T03 §3', () => { expect(QC_SOT_AUTHORITIES).toHaveLength(13); });
  });
  describe('QcSoTRelationship', () => {
    it('has exactly 4 relationships per T03 §3', () => { expect(QC_SOT_RELATIONSHIPS).toHaveLength(4); });
  });

  // -- State lifecycle enum array lengths ----------------------------------------

  describe('state lifecycle enums', () => {
    it('GovernedStandardState has 5', () => { expect(GOVERNED_STANDARD_STATES).toHaveLength(5); });
    it('ProjectExtensionState has 6', () => { expect(PROJECT_EXTENSION_STATES).toHaveLength(6); });
    it('WorkPackagePlanState has 6', () => { expect(WORK_PACKAGE_PLAN_STATES).toHaveLength(6); });
    it('ReviewPackageState has 7', () => { expect(REVIEW_PACKAGE_STATES).toHaveLength(7); });
    it('ReviewFindingState has 5', () => { expect(REVIEW_FINDING_STATES).toHaveLength(5); });
    it('QcIssueState has 7', () => { expect(QC_ISSUE_STATES).toHaveLength(7); });
    it('CorrectiveActionState has 7', () => { expect(CORRECTIVE_ACTION_STATES).toHaveLength(7); });
    it('DeviationState has 6', () => { expect(DEVIATION_STATES).toHaveLength(6); });
    it('EvidenceRefState has 5', () => { expect(EVIDENCE_REF_STATES).toHaveLength(5); });
    it('ExternalApprovalState has 7', () => { expect(EXTERNAL_APPROVAL_STATES).toHaveLength(7); });
    it('ResponsiblePartyState has 3', () => { expect(RESPONSIBLE_PARTY_STATES).toHaveLength(3); });
    it('RootCauseState has 4', () => { expect(ROOT_CAUSE_STATES).toHaveLength(4); });
    it('QualityHealthSnapshotState has 3', () => { expect(QUALITY_HEALTH_SNAPSHOT_STATES).toHaveLength(3); });
    it('ProjectQcSnapshotState has 4', () => { expect(PROJECT_QC_SNAPSHOT_STATES).toHaveLength(4); });
    it('GovernedUpdateNoticeState has 3', () => { expect(GOVERNED_UPDATE_NOTICE_STATES).toHaveLength(3); });
    it('RollupInputState has 3', () => { expect(ROLLUP_INPUT_STATES).toHaveLength(3); });
    it('SubmittalItemState has 7', () => { expect(SUBMITTAL_ITEM_STATES).toHaveLength(7); });
    it('DocInventoryState has 5', () => { expect(DOC_INVENTORY_STATES).toHaveLength(5); });
    it('AdvisoryVerdictState has 2', () => { expect(ADVISORY_VERDICT_STATES).toHaveLength(2); });
    it('AdvisoryExceptionState has 5', () => { expect(ADVISORY_EXCEPTION_STATES).toHaveLength(5); });
    it('VersionDriftAlertState has 5', () => { expect(VERSION_DRIFT_ALERT_STATES).toHaveLength(5); });
    it('QcIssueOrigin has 4', () => { expect(QC_ISSUE_ORIGINS).toHaveLength(4); });
  });

  // -- Label maps ---------------------------------------------------------------

  describe('label maps', () => {
    it('QC_KEY_ACTOR_LABELS covers 7', () => { expect(Object.keys(QC_KEY_ACTOR_LABELS)).toHaveLength(7); });
    it('QC_ADJACENT_MODULE_LABELS covers 8', () => { expect(Object.keys(QC_ADJACENT_MODULE_LABELS)).toHaveLength(8); });
    it('QC_OUT_OF_SCOPE_LABELS covers 9', () => { expect(Object.keys(QC_OUT_OF_SCOPE_LABELS)).toHaveLength(9); });
    it('QC_RECORD_FAMILY_LABELS covers 21', () => { expect(Object.keys(QC_RECORD_FAMILY_LABELS)).toHaveLength(21); });
    it('QC_GOVERNED_CORE_CONCERN_LABELS covers 11', () => { expect(Object.keys(QC_GOVERNED_CORE_CONCERN_LABELS)).toHaveLength(11); });
    it('QC_SOT_AUTHORITY_LABELS covers 13', () => { expect(Object.keys(QC_SOT_AUTHORITY_LABELS)).toHaveLength(13); });
    it('QC_LANE_CAPABILITY_LABELS covers 3', () => { expect(Object.keys(QC_LANE_CAPABILITY_LABELS)).toHaveLength(3); });
    it('QC_OPERATIONAL_OWNERSHIP_AREA_LABELS covers 4', () => { expect(Object.keys(QC_OPERATIONAL_OWNERSHIP_AREA_LABELS)).toHaveLength(4); });
  });

  // -- Definition array lengths --------------------------------------------------

  describe('definition arrays', () => {
    it('QC_SOT_BOUNDARIES has 9 per T03 §3', () => { expect(QC_SOT_BOUNDARIES).toHaveLength(9); });
    it('QC_ADJACENT_MODULE_BOUNDARIES has 8 per T01 §6', () => { expect(QC_ADJACENT_MODULE_BOUNDARIES).toHaveLength(8); });
    it('QC_ANTI_GOAL_DEFINITIONS has 6 per T01 §1.2', () => { expect(QC_ANTI_GOAL_DEFINITIONS).toHaveLength(6); });
    it('QC_OUT_OF_SCOPE_DEFINITIONS has 9 per T01 §7.1', () => { expect(QC_OUT_OF_SCOPE_DEFINITIONS).toHaveLength(9); });
    it('QC_OPERATIONAL_OWNERSHIP_DEFINITIONS has 4 per T01 §5', () => { expect(QC_OPERATIONAL_OWNERSHIP_DEFINITIONS).toHaveLength(4); });
    it('QC_LANE_CAPABILITY_DEFINITIONS has 3 per T01 §7', () => { expect(QC_LANE_CAPABILITY_DEFINITIONS).toHaveLength(3); });
    it('QC_ROLE_ACTION_MATRIX has 9 per T02 §4', () => { expect(QC_ROLE_ACTION_MATRIX).toHaveLength(9); });
    it('QC_GOVERNED_CORE_CONCERN_DEFINITIONS has 11 per T02 §2', () => { expect(QC_GOVERNED_CORE_CONCERN_DEFINITIONS).toHaveLength(11); });
    it('QC_PROJECT_EXTENSION_RULES has 5 per T02 §2.1', () => { expect(QC_PROJECT_EXTENSION_RULES).toHaveLength(5); });
    it('QC_VERIFIER_DESIGNATION_RULES has 2 per T02 §4.1', () => { expect(QC_VERIFIER_DESIGNATION_RULES).toHaveLength(2); });
    it('QC_RECORD_FAMILY_DEFINITIONS has 21 per T03 §2', () => { expect(QC_RECORD_FAMILY_DEFINITIONS).toHaveLength(21); });
    it('QC_MAIN_LINEAGE_CHAIN has 8 per T03 §5.2', () => { expect(QC_MAIN_LINEAGE_CHAIN).toHaveLength(8); });
    it('QC_ADVISORY_LINEAGE_CHAIN has 7 per T03 §5.2', () => { expect(QC_ADVISORY_LINEAGE_CHAIN).toHaveLength(7); });
    it('QC_SHARED_PACKAGE_REQUIREMENTS has 10 per T02 §9 / T03 §8', () => { expect(QC_SHARED_PACKAGE_REQUIREMENTS).toHaveLength(10); });
    it('QC_DOWNSTREAM_HANDOFFS has 5 per T03 §7', () => { expect(QC_DOWNSTREAM_HANDOFFS).toHaveLength(5); });
    it('QC_LOCKED_INVARIANTS has 6', () => { expect(QC_LOCKED_INVARIANTS).toHaveLength(6); });
    it('QC_CROSS_CONTRACT_REFS has 12', () => { expect(QC_CROSS_CONTRACT_REFS).toHaveLength(12); });
  });

  // -- SoT boundary correctness -------------------------------------------------

  describe('SoT boundary correctness', () => {
    it('QC owns quality standards (sotOwner starts with QC_)', () => {
      const row = QC_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Quality standards'));
      expect(row?.sotOwner).toMatch(/^QC_/);
      expect(row?.qcRelationship).toBe('AUTHOR_AND_MAINTAIN');
    });
    it('Startup module owns startup commissioning', () => {
      const row = QC_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Startup commissioning'));
      expect(row?.sotOwner).toBe('STARTUP_MODULE');
      expect(row?.qcRelationship).toBe('CONSUME_AS_REFERENCE');
    });
    it('Closeout module owns closeout turnover', () => {
      const row = QC_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Closeout turnover'));
      expect(row?.sotOwner).toBe('CLOSEOUT_MODULE');
      expect(row?.qcRelationship).toBe('CONSUME_AS_REFERENCE');
    });
    it('Warranty module owns warranty case lifecycle', () => {
      const row = QC_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('Warranty case'));
      expect(row?.sotOwner).toBe('WARRANTY_MODULE');
      expect(row?.qcRelationship).toBe('CONSUME_AS_REFERENCE');
    });
    it('Schedule module owns detailed schedule network', () => {
      const row = QC_SOT_BOUNDARIES.find((b) => b.dataConcern.includes('schedule network'));
      expect(row?.sotOwner).toBe('SCHEDULE_MODULE');
      expect(row?.qcRelationship).toBe('CONSUME_AS_REFERENCE');
    });
  });

  // -- Type contract stability (satisfies checks) --------------------------------

  describe('type contract stability', () => {
    it('IProjectQcSnapshot can be typed correctly', () => {
      const snapshot: IProjectQcSnapshot = {
        projectQcSnapshotId: 'snap-1',
        projectId: 'proj-1',
        snapshotVersionId: 'v1',
        state: 'WORKING',
        governedVersionRefs: ['gv-1'],
        activePlanRefs: ['plan-1'],
        issuePosture: 'clean',
        deviationPosture: 'clean',
        approvalPosture: 'clean',
        advisoryPosture: 'clean',
        rollupPosture: 'clean',
        handoffRefs: [],
        createdAt: '2026-01-01T00:00:00Z',
        publishedAt: null,
      } satisfies IProjectQcSnapshot;
      expect(snapshot.state).toBe('WORKING');
    });

    it('IGovernedUpdateNotice can be typed correctly', () => {
      const notice: IGovernedUpdateNotice = {
        governedUpdateNoticeId: 'notice-1',
        governedChangeKey: 'change-1',
        publishedVersionId: 'v1',
        state: 'PUBLISHED',
        changedFamily: 'GovernedQualityStandard',
        impactDescription: 'Updated minimum evidence rules',
        adoptionRequirement: 'mandatory',
        effectiveDate: '2026-04-01',
        recheckInstruction: 'Review and adopt',
        affectedRecords: ['rec-1'],
        publishedAt: '2026-03-15T00:00:00Z',
      } satisfies IGovernedUpdateNotice;
      expect(notice.state).toBe('PUBLISHED');
    });
  });
});
