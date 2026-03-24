import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_RECORD_FAMILIES,
  CLOSEOUT_SURFACE_CLASSES,
  CLOSEOUT_OPERATIONAL_SURFACES,
  CLOSEOUT_DERIVED_INDEXES,
  CLOSEOUT_CONSUMPTION_POINTS,
  CLOSEOUT_AUTHORITY_ROLES,
  CLOSEOUT_AUTHORITY_ACTIONS,
  CLOSEOUT_LIFECYCLE_PHASES,
  CLOSEOUT_FUNCTIONS,
  CLOSEOUT_CROSS_MODULE_SOURCES,
  CLOSEOUT_SURFACE_CLASS_1_SURFACES,
  CLOSEOUT_SURFACE_CLASS_2_INDEXES,
  CLOSEOUT_SURFACE_CLASS_3_POINTS,
  CLOSEOUT_RECORD_FAMILY_DEFINITIONS,
  CLOSEOUT_SOT_BOUNDARY_MATRIX,
  CLOSEOUT_CROSS_CONTRACT_REFS,
  CLOSEOUT_ACTIVATION_MODEL,
  CLOSEOUT_CROSS_MODULE_READS,
  CLOSEOUT_EXCLUSIONS,
  CLOSEOUT_LOCKED_DECISIONS,
  CLOSEOUT_SHARED_PACKAGE_REQUIREMENTS,
  CLOSEOUT_OPERATING_PRINCIPLES,
  CLOSEOUT_RECORD_FAMILY_LABELS,
  CLOSEOUT_AUTHORITY_ROLE_LABELS,
  CLOSEOUT_LIFECYCLE_PHASE_LABELS,
  CLOSEOUT_OPERATIONAL_SURFACE_LABELS,
  CLOSEOUT_DERIVED_INDEX_LABELS,
} from '../../index.js';

describe('P3-E10-T01 Closeout foundation contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('CloseoutRecordFamily', () => {
    it('has exactly 16 record families per §3.1', () => {
      expect(CLOSEOUT_RECORD_FAMILIES).toHaveLength(16);
    });

    it('includes all 16 record families', () => {
      const expected = [
        'CloseoutChecklist', 'CloseoutChecklistSection', 'CloseoutChecklistItem',
        'ChecklistTemplate', 'CloseoutMilestone', 'SubcontractorScorecard',
        'ScorecardSection', 'ScorecardCriterion', 'LessonEntry',
        'LessonsLearningReport', 'AutopsyRecord', 'AutopsySection',
        'AutopsyFinding', 'AutopsyAction', 'AutopsyPreSurveyResponse',
        'LearningLegacyOutput',
      ];
      expect([...CLOSEOUT_RECORD_FAMILIES]).toEqual(expected);
    });
  });

  describe('CloseoutSurfaceClass', () => {
    it('has exactly 3 surface classes per §2.1', () => {
      expect(CLOSEOUT_SURFACE_CLASSES).toHaveLength(3);
    });
  });

  describe('CloseoutOperationalSurface', () => {
    it('has exactly 4 operational surfaces per §2.2 Class 1', () => {
      expect(CLOSEOUT_OPERATIONAL_SURFACES).toHaveLength(4);
    });
  });

  describe('CloseoutDerivedIndex', () => {
    it('has exactly 3 derived indexes per §2.2 Class 2', () => {
      expect(CLOSEOUT_DERIVED_INDEXES).toHaveLength(3);
    });
  });

  describe('CloseoutConsumptionPoint', () => {
    it('has exactly 3 consumption points per §2.2 Class 3', () => {
      expect(CLOSEOUT_CONSUMPTION_POINTS).toHaveLength(3);
    });
  });

  describe('CloseoutAuthorityRole', () => {
    it('has exactly 6 roles per §5', () => {
      expect(CLOSEOUT_AUTHORITY_ROLES).toHaveLength(6);
    });
  });

  describe('CloseoutAuthorityAction', () => {
    it('has exactly 5 actions', () => {
      expect(CLOSEOUT_AUTHORITY_ACTIONS).toHaveLength(5);
    });
  });

  describe('CloseoutLifecyclePhase', () => {
    it('has exactly 5 phases per §4', () => {
      expect(CLOSEOUT_LIFECYCLE_PHASES).toHaveLength(5);
    });
  });

  describe('CloseoutFunction', () => {
    it('has exactly 2 functions per §1', () => {
      expect(CLOSEOUT_FUNCTIONS).toHaveLength(2);
    });
  });

  describe('CloseoutCrossModuleSource', () => {
    it('has exactly 5 sources per §3.2', () => {
      expect(CLOSEOUT_CROSS_MODULE_SOURCES).toHaveLength(5);
    });
  });

  // -- Surface definitions ---------------------------------------------------

  describe('Surface definitions', () => {
    it('Class 1 has 4 operational surface definitions', () => {
      expect(CLOSEOUT_SURFACE_CLASS_1_SURFACES).toHaveLength(4);
    });

    it('Class 2 has 3 derived index definitions', () => {
      expect(CLOSEOUT_SURFACE_CLASS_2_INDEXES).toHaveLength(3);
    });

    it('Class 3 has 3 consumption point definitions', () => {
      expect(CLOSEOUT_SURFACE_CLASS_3_POINTS).toHaveLength(3);
    });
  });

  // -- Record families -------------------------------------------------------

  describe('Record family definitions', () => {
    it('has exactly 16 definitions per §3.1', () => {
      expect(CLOSEOUT_RECORD_FAMILY_DEFINITIONS).toHaveLength(16);
    });

    it('each definition has family, key, and notes', () => {
      for (const def of CLOSEOUT_RECORD_FAMILY_DEFINITIONS) {
        expect(def.family).toBeTruthy();
        expect(def.key).toBeTruthy();
        expect(def.notes).toBeTruthy();
      }
    });
  });

  // -- SoT boundary matrix ---------------------------------------------------

  describe('SoT boundary matrix', () => {
    it('has exactly 11 rows per §5', () => {
      expect(CLOSEOUT_SOT_BOUNDARY_MATRIX).toHaveLength(11);
    });

    it('each row has all required fields', () => {
      for (const row of CLOSEOUT_SOT_BOUNDARY_MATRIX) {
        expect(row.dataConcern).toBeTruthy();
        expect(row.sotOwner).toBeTruthy();
        expect(row.whoWrites).toBeTruthy();
        expect(row.whoReads).toBeTruthy();
      }
    });
  });

  // -- Cross-contract refs ---------------------------------------------------

  describe('Cross-contract refs', () => {
    it('has exactly 12 references per §6', () => {
      expect(CLOSEOUT_CROSS_CONTRACT_REFS).toHaveLength(12);
    });
  });

  // -- Activation model ------------------------------------------------------

  describe('Activation model', () => {
    it('has exactly 5 phases per §4', () => {
      expect(CLOSEOUT_ACTIVATION_MODEL).toHaveLength(5);
    });
  });

  // -- Cross-module reads ----------------------------------------------------

  describe('Cross-module reads', () => {
    it('has exactly 5 sources per §3.2', () => {
      expect(CLOSEOUT_CROSS_MODULE_READS).toHaveLength(5);
    });

    it('all sources have mutationPermitted === false', () => {
      expect(CLOSEOUT_CROSS_MODULE_READS.every((r) => r.mutationPermitted === false)).toBe(true);
    });
  });

  // -- Exclusions ------------------------------------------------------------

  describe('Exclusions', () => {
    it('has exactly 8 exclusions per §3.3', () => {
      expect(CLOSEOUT_EXCLUSIONS).toHaveLength(8);
    });
  });

  // -- Locked decisions ------------------------------------------------------

  describe('Locked decisions', () => {
    it('has exactly 14 decisions from master index', () => {
      expect(CLOSEOUT_LOCKED_DECISIONS).toHaveLength(14);
    });

    it('has decision IDs 1 through 14', () => {
      const ids = CLOSEOUT_LOCKED_DECISIONS.map((d) => d.decisionId);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    });
  });

  // -- Shared package requirements -------------------------------------------

  describe('Shared package requirements', () => {
    it('has exactly 7 requirements per T10', () => {
      expect(CLOSEOUT_SHARED_PACKAGE_REQUIREMENTS).toHaveLength(7);
    });

    it('all have B-CLO blocker IDs', () => {
      for (const req of CLOSEOUT_SHARED_PACKAGE_REQUIREMENTS) {
        expect(req.blockerId).toMatch(/^B-CLO-0[1-7]$/);
      }
    });
  });

  // -- Operating principles --------------------------------------------------

  describe('Operating principles', () => {
    it('has exactly 5 principles', () => {
      expect(CLOSEOUT_OPERATING_PRINCIPLES).toHaveLength(5);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 16 record families', () => {
      expect(Object.keys(CLOSEOUT_RECORD_FAMILY_LABELS)).toHaveLength(16);
    });

    it('labels all 6 authority roles', () => {
      expect(Object.keys(CLOSEOUT_AUTHORITY_ROLE_LABELS)).toHaveLength(6);
    });

    it('labels all 5 lifecycle phases', () => {
      expect(Object.keys(CLOSEOUT_LIFECYCLE_PHASE_LABELS)).toHaveLength(5);
    });

    it('labels all 4 operational surfaces', () => {
      expect(Object.keys(CLOSEOUT_OPERATIONAL_SURFACE_LABELS)).toHaveLength(4);
    });

    it('labels all 3 derived indexes', () => {
      expect(Object.keys(CLOSEOUT_DERIVED_INDEX_LABELS)).toHaveLength(3);
    });
  });
});
