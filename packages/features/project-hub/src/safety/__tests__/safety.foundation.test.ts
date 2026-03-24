import { describe, expect, it } from 'vitest';

import {
  canSafetyRolePerformAction,
  isSafetyManagerOnlyField,
  isSafetyManagerLane,
  isProjectTeamLane,
  getRecordFamilyLaneOwner,
  canViewSafetyWorkspace,
  canEditSafetyManagerContent,
  isExcludedFromAnnotation,
  isSafetyPushToTeamAllowed,
  SAFETY_RECORD_FAMILIES,
  SAFETY_MANAGER_LANE_FAMILIES,
  PROJECT_TEAM_LANE_FAMILIES,
} from '../../index.js';

import { createMockSafetyAuthorityRule } from '../../../testing/createMockSafetyAuthorityRule.js';

describe('P3-E8-T01 Safety foundation business rules', () => {
  // -- Authority Matrix (SS4.1-4.3) ----------------------------------------

  describe('canSafetyRolePerformAction', () => {
    it('Safety Manager can Create SSSPBasePlan', () => {
      expect(canSafetyRolePerformAction('SafetyManager', 'SSSPBasePlan', 'Create')).toBe(true);
    });

    it('Safety Manager can Configure InspectionChecklistTemplate', () => {
      expect(canSafetyRolePerformAction('SafetyManager', 'InspectionChecklistTemplate', 'Configure')).toBe(true);
    });

    it('Safety Manager can Approve SafetyCorrectiveAction', () => {
      expect(canSafetyRolePerformAction('SafetyManager', 'SafetyCorrectiveAction', 'Approve')).toBe(true);
    });

    it('Safety Officer has same authority as Safety Manager for SSSPBasePlan', () => {
      expect(canSafetyRolePerformAction('SafetyOfficer', 'SSSPBasePlan', 'Create')).toBe(true);
      expect(canSafetyRolePerformAction('SafetyOfficer', 'SSSPBasePlan', 'Configure')).toBe(true);
    });

    it('ProjectManager cannot Create InspectionChecklistTemplate', () => {
      expect(canSafetyRolePerformAction('ProjectManager', 'InspectionChecklistTemplate', 'Create')).toBe(false);
    });

    it('ProjectManager can Approve SSSPBasePlan (joint approval)', () => {
      expect(canSafetyRolePerformAction('ProjectManager', 'SSSPBasePlan', 'Approve')).toBe(true);
    });

    it('Superintendent can Create DailyPreTaskPlan', () => {
      expect(canSafetyRolePerformAction('Superintendent', 'DailyPreTaskPlan', 'Create')).toBe(true);
    });

    it('Superintendent can Approve SSSPBasePlan (joint approval)', () => {
      expect(canSafetyRolePerformAction('Superintendent', 'SSSPBasePlan', 'Approve')).toBe(true);
    });

    it('FieldEngineer can only Read InspectionChecklistTemplate', () => {
      expect(canSafetyRolePerformAction('FieldEngineer', 'InspectionChecklistTemplate', 'Read')).toBe(true);
      expect(canSafetyRolePerformAction('FieldEngineer', 'InspectionChecklistTemplate', 'Create')).toBe(false);
      expect(canSafetyRolePerformAction('FieldEngineer', 'InspectionChecklistTemplate', 'Update')).toBe(false);
    });

    it('FieldEngineer can Create DailyPreTaskPlan', () => {
      expect(canSafetyRolePerformAction('FieldEngineer', 'DailyPreTaskPlan', 'Create')).toBe(true);
    });

    it('ProjectManager can Create SSSPAddendum', () => {
      expect(canSafetyRolePerformAction('ProjectManager', 'SSSPAddendum', 'Create')).toBe(true);
    });

    it('returns false for unknown role-family combination', () => {
      expect(canSafetyRolePerformAction('System', 'SSSPBasePlan', 'Create')).toBe(false);
    });
  });

  // -- Safety Manager-Only Fields (SS4.3) ----------------------------------

  describe('isSafetyManagerOnlyField', () => {
    it('SSSPBasePlan hazardIdentification is Safety Manager only', () => {
      expect(isSafetyManagerOnlyField('SSSPBasePlan', 'hazardIdentification')).toBe(true);
    });

    it('SSSPBasePlan emergencyProcedures is Safety Manager only', () => {
      expect(isSafetyManagerOnlyField('SSSPBasePlan', 'emergencyProcedures')).toBe(true);
    });

    it('IncidentCase personsInvolved is Safety Manager only', () => {
      expect(isSafetyManagerOnlyField('IncidentCase', 'personsInvolved')).toBe(true);
    });

    it('DailyPreTaskPlan has no Safety Manager-only fields', () => {
      expect(isSafetyManagerOnlyField('DailyPreTaskPlan', 'anyField')).toBe(false);
    });

    it('non-governed field is not restricted', () => {
      expect(isSafetyManagerOnlyField('SSSPBasePlan', 'projectContacts')).toBe(false);
    });
  });

  // -- Lane Ownership (SS4.1-4.2) -----------------------------------------

  describe('isSafetyManagerLane', () => {
    it('SSSPBasePlan is Safety Manager lane', () => {
      expect(isSafetyManagerLane('SSSPBasePlan')).toBe(true);
    });

    it('CompletedWeeklyInspection is Safety Manager lane', () => {
      expect(isSafetyManagerLane('CompletedWeeklyInspection')).toBe(true);
    });

    it('DailyPreTaskPlan is not Safety Manager lane', () => {
      expect(isSafetyManagerLane('DailyPreTaskPlan')).toBe(false);
    });

    it('SSSPAddendum is not Safety Manager lane (project team creates)', () => {
      expect(isSafetyManagerLane('SSSPAddendum')).toBe(false);
    });
  });

  describe('isProjectTeamLane', () => {
    it('DailyPreTaskPlan is project team lane', () => {
      expect(isProjectTeamLane('DailyPreTaskPlan')).toBe(true);
    });

    it('SSSPAddendum is project team lane', () => {
      expect(isProjectTeamLane('SSSPAddendum')).toBe(true);
    });

    it('SSSPBasePlan is not project team lane', () => {
      expect(isProjectTeamLane('SSSPBasePlan')).toBe(false);
    });
  });

  describe('getRecordFamilyLaneOwner', () => {
    it('returns SafetyManagerLane for Safety Manager-owned families', () => {
      for (const family of SAFETY_MANAGER_LANE_FAMILIES) {
        expect(getRecordFamilyLaneOwner(family)).toBe('SafetyManagerLane');
      }
    });

    it('returns ProjectTeamLane for project team-owned families', () => {
      for (const family of PROJECT_TEAM_LANE_FAMILIES) {
        expect(getRecordFamilyLaneOwner(family)).toBe('ProjectTeamLane');
      }
    });

    it('all 15 record families have a lane mapping', () => {
      for (const family of SAFETY_RECORD_FAMILIES) {
        expect(() => getRecordFamilyLaneOwner(family)).not.toThrow();
      }
    });
  });

  // -- Visibility (SS5.1) -------------------------------------------------

  describe('canViewSafetyWorkspace', () => {
    it('all standard roles can view workspace', () => {
      expect(canViewSafetyWorkspace('SafetyManager')).toBe(true);
      expect(canViewSafetyWorkspace('SafetyOfficer')).toBe(true);
      expect(canViewSafetyWorkspace('ProjectManager')).toBe(true);
      expect(canViewSafetyWorkspace('Superintendent')).toBe(true);
      expect(canViewSafetyWorkspace('FieldEngineer')).toBe(true);
    });
  });

  describe('canEditSafetyManagerContent', () => {
    it('SafetyManager can edit', () => {
      expect(canEditSafetyManagerContent('SafetyManager')).toBe(true);
    });

    it('SafetyOfficer can edit', () => {
      expect(canEditSafetyManagerContent('SafetyOfficer')).toBe(true);
    });

    it('ProjectManager cannot edit Safety Manager content', () => {
      expect(canEditSafetyManagerContent('ProjectManager')).toBe(false);
    });

    it('Superintendent cannot edit Safety Manager content', () => {
      expect(canEditSafetyManagerContent('Superintendent')).toBe(false);
    });

    it('FieldEngineer cannot edit Safety Manager content', () => {
      expect(canEditSafetyManagerContent('FieldEngineer')).toBe(false);
    });
  });

  // -- PER Exclusion (SS5.3, P3-E1 SS9.3) --------------------------------

  describe('isExcludedFromAnnotation', () => {
    it('always returns true per P3-E1 SS9.3', () => {
      expect(isExcludedFromAnnotation()).toBe(true);
    });
  });

  describe('isSafetyPushToTeamAllowed', () => {
    it('always returns false', () => {
      expect(isSafetyPushToTeamAllowed()).toBe(false);
    });
  });

  // -- Mock factory ---------------------------------------------------------

  describe('createMockSafetyAuthorityRule', () => {
    it('creates a valid default authority rule', () => {
      const rule = createMockSafetyAuthorityRule();
      expect(rule.role).toBe('SafetyManager');
      expect(rule.recordFamily).toBe('SSSPBasePlan');
      expect(rule.allowedActions).toContain('Create');
    });

    it('accepts overrides', () => {
      const rule = createMockSafetyAuthorityRule({
        role: 'ProjectManager',
        recordFamily: 'DailyPreTaskPlan',
        allowedActions: ['Read'],
      });
      expect(rule.role).toBe('ProjectManager');
      expect(rule.recordFamily).toBe('DailyPreTaskPlan');
      expect(rule.allowedActions).toEqual(['Read']);
    });
  });
});
