import { describe, expect, it } from 'vitest';

import {
  SAFETY_RECORD_FAMILIES,
  SAFETY_AUTHORITY_ROLES,
  SAFETY_AUTHORITY_ACTIONS,
  SAFETY_LANE_OWNERS,
  INCIDENT_PRIVACY_TIERS,
  PER_VISIBILITY_TIERS,
  COMPOSITE_SCORECARD_DIMENSIONS,
  SAFETY_T01_LOCKED_DECISIONS,
  SAFETY_OPERATING_PRINCIPLES,
  SAFETY_SHARED_PACKAGE_REQUIREMENTS,
  SAFETY_CROSS_CONTRACT_REFS,
  SAFETY_LANE_MAPPINGS,
  SAFETY_AUTHORITY_MATRIX,
  SAFETY_MANAGER_ONLY_FIELDS,
  SAFETY_VISIBILITY_RULES,
  COMPOSITE_SCORECARD_SIGNALS,
  PER_SAFETY_PROJECTIONS,
  INCIDENT_PRIVACY_RULES,
  SAFETY_RECORD_FAMILY_LABELS,
  SAFETY_AUTHORITY_ROLE_LABELS,
  INCIDENT_PRIVACY_TIER_LABELS,
  COMPOSITE_SCORECARD_DIMENSION_LABELS,
} from '../../index.js';

describe('P3-E8-T01 Safety foundation contract stability', () => {
  // -- Enum arrays (SS3) ---------------------------------------------------

  describe('SafetyRecordFamily', () => {
    it('has exactly 15 record families per SS3', () => {
      expect(SAFETY_RECORD_FAMILIES).toHaveLength(15);
    });

    it('includes all 15 record families', () => {
      const expected = [
        'SSSPBasePlan', 'SSSPAddendum', 'InspectionChecklistTemplate',
        'CompletedWeeklyInspection', 'SafetyCorrectiveAction', 'IncidentCase',
        'JobHazardAnalysis', 'DailyPreTaskPlan', 'ToolboxTalkPrompt',
        'WeeklyToolboxTalkRecord', 'WorkerOrientationRecord',
        'SubcontractorSafetySubmission', 'CertificationQualificationRecord',
        'HazComSdsRecord', 'CompetentPersonDesignation',
      ];
      expect([...SAFETY_RECORD_FAMILIES]).toEqual(expected);
    });
  });

  describe('SafetyAuthorityRole', () => {
    it('has exactly 6 roles per SS4', () => {
      expect(SAFETY_AUTHORITY_ROLES).toHaveLength(6);
    });
  });

  describe('SafetyAuthorityAction', () => {
    it('has exactly 6 actions', () => {
      expect(SAFETY_AUTHORITY_ACTIONS).toHaveLength(6);
    });
  });

  describe('SafetyLaneOwner', () => {
    it('has exactly 2 lanes per SS4', () => {
      expect(SAFETY_LANE_OWNERS).toHaveLength(2);
    });
  });

  describe('IncidentPrivacyTier', () => {
    it('has exactly 3 tiers per SS5.4', () => {
      expect(INCIDENT_PRIVACY_TIERS).toHaveLength(3);
    });
  });

  describe('PERVisibilityTier', () => {
    it('has exactly 3 tiers per SS5.3', () => {
      expect(PER_VISIBILITY_TIERS).toHaveLength(3);
    });
  });

  describe('CompositeScorecardDimension', () => {
    it('has exactly 5 dimensions per SS5.2', () => {
      expect(COMPOSITE_SCORECARD_DIMENSIONS).toHaveLength(5);
    });
  });

  // -- Authority matrix (SS4.1-4.3) ----------------------------------------

  describe('Authority matrix', () => {
    it('covers all 15 record families for SafetyManager', () => {
      const smRules = SAFETY_AUTHORITY_MATRIX.filter((r) => r.role === 'SafetyManager');
      expect(smRules).toHaveLength(15);
    });

    it('covers all 15 record families for SafetyOfficer', () => {
      const soRules = SAFETY_AUTHORITY_MATRIX.filter((r) => r.role === 'SafetyOfficer');
      expect(soRules).toHaveLength(15);
    });

    it('covers all 15 record families for ProjectManager', () => {
      const pmRules = SAFETY_AUTHORITY_MATRIX.filter((r) => r.role === 'ProjectManager');
      expect(pmRules).toHaveLength(15);
    });

    it('covers all 15 record families for Superintendent', () => {
      const supRules = SAFETY_AUTHORITY_MATRIX.filter((r) => r.role === 'Superintendent');
      expect(supRules).toHaveLength(15);
    });

    it('covers all 15 record families for FieldEngineer', () => {
      const feRules = SAFETY_AUTHORITY_MATRIX.filter((r) => r.role === 'FieldEngineer');
      expect(feRules).toHaveLength(15);
    });
  });

  // -- Lane mappings (SS4.1-4.2) -------------------------------------------

  describe('Lane mappings', () => {
    it('maps all 15 record families', () => {
      expect(SAFETY_LANE_MAPPINGS).toHaveLength(15);
    });

    it('assigns 13 families to SafetyManagerLane', () => {
      const smLane = SAFETY_LANE_MAPPINGS.filter((m) => m.lane === 'SafetyManagerLane');
      expect(smLane).toHaveLength(13);
    });

    it('assigns 2 families to ProjectTeamLane', () => {
      const ptLane = SAFETY_LANE_MAPPINGS.filter((m) => m.lane === 'ProjectTeamLane');
      expect(ptLane).toHaveLength(2);
    });
  });

  // -- Safety Manager-only fields (SS4.3) -----------------------------------

  describe('Safety Manager-only fields', () => {
    it('declares governed fields for SSSPBasePlan', () => {
      const decl = SAFETY_MANAGER_ONLY_FIELDS.find((d) => d.recordFamily === 'SSSPBasePlan');
      expect(decl).toBeDefined();
      expect(decl!.fieldNames).toContain('hazardIdentification');
      expect(decl!.fieldNames).toContain('emergencyProcedures');
    });

    it('declares governed fields for IncidentCase', () => {
      const decl = SAFETY_MANAGER_ONLY_FIELDS.find((d) => d.recordFamily === 'IncidentCase');
      expect(decl).toBeDefined();
      expect(decl!.fieldNames).toContain('personsInvolved');
      expect(decl!.fieldNames).toContain('privacyTier');
    });
  });

  // -- Visibility (SS5) ---------------------------------------------------

  describe('Visibility rules', () => {
    it('defines rules for all 6 roles', () => {
      expect(SAFETY_VISIBILITY_RULES).toHaveLength(6);
    });

    it('allows all roles to view workspace per SS5.1', () => {
      expect(SAFETY_VISIBILITY_RULES.every((r) => r.canViewWorkspace)).toBe(true);
    });

    it('restricts Safety Manager content editing to SafetyManager and SafetyOfficer only', () => {
      const canEdit = SAFETY_VISIBILITY_RULES.filter((r) => r.canEditSafetyManagerContent);
      expect(canEdit).toHaveLength(2);
      expect(canEdit.map((r) => r.role)).toEqual(['SafetyManager', 'SafetyOfficer']);
    });
  });

  // -- Composite scorecard (SS5.2) ----------------------------------------

  describe('Composite scorecard signals', () => {
    it('defines exactly 5 signals per SS5.2', () => {
      expect(COMPOSITE_SCORECARD_SIGNALS).toHaveLength(5);
    });
  });

  // -- PER projections (SS5.3) -------------------------------------------

  describe('PER projections', () => {
    it('defines 3 tiers per SS5.3', () => {
      expect(PER_SAFETY_PROJECTIONS).toHaveLength(3);
    });

    it('all projections are excluded from annotation', () => {
      expect(PER_SAFETY_PROJECTIONS.every((p) => p.excludedFromAnnotation === true)).toBe(true);
    });

    it('no projection allows push-to-team', () => {
      expect(PER_SAFETY_PROJECTIONS.every((p) => p.pushToTeamAllowed === false)).toBe(true);
    });
  });

  // -- Incident privacy (SS5.4) -------------------------------------------

  describe('Incident privacy rules', () => {
    it('defines 3 tiers per SS5.4', () => {
      expect(INCIDENT_PRIVACY_RULES).toHaveLength(3);
    });

    it('RESTRICTED is visible only to SafetyManager and SafetyOfficer', () => {
      const restricted = INCIDENT_PRIVACY_RULES.find((r) => r.tier === 'RESTRICTED');
      expect(restricted!.visibleToRoles).toEqual(['SafetyManager', 'SafetyOfficer']);
    });

    it('SENSITIVE excludes Superintendent and FieldEngineer', () => {
      const sensitive = INCIDENT_PRIVACY_RULES.find((r) => r.tier === 'SENSITIVE');
      expect(sensitive!.visibleToRoles).not.toContain('Superintendent');
      expect(sensitive!.visibleToRoles).not.toContain('FieldEngineer');
    });
  });

  // -- Governance (SS6-SS8) ------------------------------------------------

  describe('Shared package requirements', () => {
    it('declares 6 shared packages per T10 SS1', () => {
      expect(SAFETY_SHARED_PACKAGE_REQUIREMENTS).toHaveLength(6);
    });
  });

  describe('Cross-contract references', () => {
    it('declares 14 cross-contract references per SS6', () => {
      expect(SAFETY_CROSS_CONTRACT_REFS).toHaveLength(14);
    });
  });

  describe('Operating principles', () => {
    it('declares 6 principles per SS7', () => {
      expect(SAFETY_OPERATING_PRINCIPLES).toHaveLength(6);
    });
  });

  describe('Locked decisions', () => {
    it('reinforces 7 decisions per SS8', () => {
      expect(SAFETY_T01_LOCKED_DECISIONS).toHaveLength(7);
    });

    it('includes decision IDs 1, 3, 7, 16, 22, 37, 39', () => {
      const ids = SAFETY_T01_LOCKED_DECISIONS.map((d) => d.decisionId);
      expect(ids).toEqual([1, 3, 7, 16, 22, 37, 39]);
    });
  });

  // -- Label maps ----------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 15 record families', () => {
      expect(Object.keys(SAFETY_RECORD_FAMILY_LABELS)).toHaveLength(15);
    });

    it('labels all 6 authority roles', () => {
      expect(Object.keys(SAFETY_AUTHORITY_ROLE_LABELS)).toHaveLength(6);
    });

    it('labels all 3 privacy tiers', () => {
      expect(Object.keys(INCIDENT_PRIVACY_TIER_LABELS)).toHaveLength(3);
    });

    it('labels all 5 scorecard dimensions', () => {
      expect(Object.keys(COMPOSITE_SCORECARD_DIMENSION_LABELS)).toHaveLength(5);
    });
  });
});
