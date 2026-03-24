import { describe, expect, it } from 'vitest';

import {
  ADJACENT_MODULE_CODES,
  ADJACENT_MODULE_LABELS,
  BUSINESS_CONCERN_DEFINITIONS,
  BUSINESS_CONCERN_LABELS,
  CASE_ACTIVATION_RULES,
  CASE_ACTIVATION_TRIGGERS,
  CROSS_CONTRACT_POSITIONS,
  CROSS_CONTRACT_ROLES,
  LOCKED_ARCHITECTURE_DECISIONS,
  MODULE_BOUNDARY_DECLARATIONS,
  MODULE_IDENTITY_EXCLUSION_DEFINITIONS,
  MODULE_IDENTITY_EXCLUSION_LABELS,
  MODULE_IDENTITY_EXCLUSIONS,
  OPERATING_LAYER_LABELS,
  OPERATING_OWNERSHIP,
  OWNER_ROLE_LABELS,
  READINESS_AUTHORITY_RULES,
  READINESS_BUSINESS_CONCERNS,
  READINESS_CROSS_CONTRACT_REFS,
  READINESS_OPERATING_LAYER_DEFINITIONS,
  READINESS_OPERATING_LAYERS,
  READINESS_OWNER_ROLES,
  READINESS_RECORD_CLASS_DEFINITIONS,
  READINESS_RECORD_CLASSES,
  READINESS_SURFACE_CODES,
  READINESS_SURFACE_LABELS,
  READINESS_SURFACES,
  RECORD_CLASS_LABELS,
  SOURCE_OF_TRUTH_BOUNDARIES,
} from '../../index.js';

describe('P3-E13-T08 Stage 1 Subcontract Execution Readiness foundation contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('ReadinessSurfaceCode', () => {
    it('has exactly 6 surfaces per T01 §4.1', () => {
      expect(READINESS_SURFACE_CODES).toHaveLength(6);
    });

    it('includes all 6 surface codes', () => {
      const expected = [
        'CASE_REGISTRY', 'CASE_DETAIL_WORKSPACE', 'REQUIREMENT_EVALUATION_WORKBENCH',
        'EXCEPTION_PACKET_WORKSPACE', 'READINESS_DECISION_SURFACE', 'REVIEW_OVERLAY_SURFACE',
      ];
      expect([...READINESS_SURFACE_CODES]).toEqual(expected);
    });
  });

  describe('ReadinessOperatingLayer', () => {
    it('has exactly 3 layers per T01 §4.2', () => {
      expect(READINESS_OPERATING_LAYERS).toHaveLength(3);
    });
  });

  describe('ReadinessRecordClass', () => {
    it('has exactly 3 record classes per P3-E13 master index', () => {
      expect(READINESS_RECORD_CLASSES).toHaveLength(3);
    });
  });

  describe('AdjacentModuleCode', () => {
    it('has exactly 6 adjacent modules per T01 §5', () => {
      expect(ADJACENT_MODULE_CODES).toHaveLength(6);
    });
  });

  describe('ReadinessAuthorityRule', () => {
    it('has exactly 4 authority rules per T01 §8', () => {
      expect(READINESS_AUTHORITY_RULES).toHaveLength(4);
    });
  });

  describe('ReadinessOwnerRole', () => {
    it('has exactly 7 roles per T01 §6', () => {
      expect(READINESS_OWNER_ROLES).toHaveLength(7);
    });
  });

  describe('CaseActivationTrigger', () => {
    it('has exactly 4 triggers per T01 §7', () => {
      expect(CASE_ACTIVATION_TRIGGERS).toHaveLength(4);
    });
  });

  describe('CrossContractRole', () => {
    it('has exactly 4 roles per T01 §9', () => {
      expect(CROSS_CONTRACT_ROLES).toHaveLength(4);
    });
  });

  describe('ModuleIdentityExclusion', () => {
    it('has exactly 6 exclusions per T01 §2', () => {
      expect(MODULE_IDENTITY_EXCLUSIONS).toHaveLength(6);
    });
  });

  describe('ReadinessBusinessConcern', () => {
    it('has exactly 5 concerns per T01 §3', () => {
      expect(READINESS_BUSINESS_CONCERNS).toHaveLength(5);
    });
  });

  // -- Label maps --------------------------------------------------------------

  describe('label maps', () => {
    it('READINESS_SURFACE_LABELS covers all 6 surfaces', () => {
      expect(Object.keys(READINESS_SURFACE_LABELS)).toHaveLength(6);
    });

    it('OPERATING_LAYER_LABELS covers all 3 layers', () => {
      expect(Object.keys(OPERATING_LAYER_LABELS)).toHaveLength(3);
    });

    it('ADJACENT_MODULE_LABELS covers all 6 adjacent modules', () => {
      expect(Object.keys(ADJACENT_MODULE_LABELS)).toHaveLength(6);
    });

    it('OWNER_ROLE_LABELS covers all 7 roles', () => {
      expect(Object.keys(OWNER_ROLE_LABELS)).toHaveLength(7);
    });

    it('RECORD_CLASS_LABELS covers all 3 classes', () => {
      expect(Object.keys(RECORD_CLASS_LABELS)).toHaveLength(3);
    });

    it('MODULE_IDENTITY_EXCLUSION_LABELS covers all 6 exclusions', () => {
      expect(Object.keys(MODULE_IDENTITY_EXCLUSION_LABELS)).toHaveLength(6);
    });

    it('BUSINESS_CONCERN_LABELS covers all 5 concerns', () => {
      expect(Object.keys(BUSINESS_CONCERN_LABELS)).toHaveLength(5);
    });
  });

  // -- Governed constant arrays ------------------------------------------------

  describe('READINESS_SURFACES', () => {
    it('has exactly 6 surface definitions per T01 §4.1', () => {
      expect(READINESS_SURFACES).toHaveLength(6);
    });

    it('every surface has a non-empty purpose', () => {
      for (const s of READINESS_SURFACES) {
        expect(s.purpose.length).toBeGreaterThan(0);
      }
    });

    it('every surface has at least one primary user', () => {
      for (const s of READINESS_SURFACES) {
        expect(s.primaryUsers.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('READINESS_OPERATING_LAYER_DEFINITIONS', () => {
    it('has exactly 3 layer definitions per T01 §4.2', () => {
      expect(READINESS_OPERATING_LAYER_DEFINITIONS).toHaveLength(3);
    });
  });

  describe('READINESS_RECORD_CLASS_DEFINITIONS', () => {
    it('has exactly 3 record class definitions', () => {
      expect(READINESS_RECORD_CLASS_DEFINITIONS).toHaveLength(3);
    });

    it('Class 1 has 4 records', () => {
      const cls1 = READINESS_RECORD_CLASS_DEFINITIONS.find(
        (d) => d.recordClass === 'CLASS_1_PRIMARY_OPERATIONAL',
      );
      expect(cls1?.records).toHaveLength(4);
    });

    it('Class 2 has 5 records', () => {
      const cls2 = READINESS_RECORD_CLASS_DEFINITIONS.find(
        (d) => d.recordClass === 'CLASS_2_EXCEPTION_GOVERNANCE',
      );
      expect(cls2?.records).toHaveLength(5);
    });

    it('Class 3 has 3 records', () => {
      const cls3 = READINESS_RECORD_CLASS_DEFINITIONS.find(
        (d) => d.recordClass === 'CLASS_3_GATE_AND_DOWNSTREAM',
      );
      expect(cls3?.records).toHaveLength(3);
    });
  });

  describe('MODULE_BOUNDARY_DECLARATIONS', () => {
    it('has exactly 6 boundary declarations per T01 §5', () => {
      expect(MODULE_BOUNDARY_DECLARATIONS).toHaveLength(6);
    });

    it('every boundary has a non-empty boundary rule', () => {
      for (const b of MODULE_BOUNDARY_DECLARATIONS) {
        expect(b.boundaryRule.length).toBeGreaterThan(0);
      }
    });
  });

  describe('SOURCE_OF_TRUTH_BOUNDARIES', () => {
    it('has exactly 7 SoT boundary rows per T01 §8', () => {
      expect(SOURCE_OF_TRUTH_BOUNDARIES).toHaveLength(7);
    });

    it('includes the Financial gate enforcement row', () => {
      const financial = SOURCE_OF_TRUTH_BOUNDARIES.find(
        (b) => b.authority === 'Financial',
      );
      expect(financial).toBeDefined();
      expect(financial?.authorityRule).toBe('CONSUMES_READINESS_OUTPUT');
    });

    it('includes the field-annotations review layer row', () => {
      const annotations = SOURCE_OF_TRUTH_BOUNDARIES.find(
        (b) => b.authority === '@hbc/field-annotations',
      );
      expect(annotations).toBeDefined();
      expect(annotations?.authorityRule).toBe('SEPARATE_REVIEW_LAYER');
    });
  });

  describe('OPERATING_OWNERSHIP', () => {
    it('has exactly 5 ownership rows per T01 §6', () => {
      expect(OPERATING_OWNERSHIP).toHaveLength(5);
    });
  });

  describe('CASE_ACTIVATION_RULES', () => {
    it('has exactly 4 activation rules per T01 §7', () => {
      expect(CASE_ACTIVATION_RULES).toHaveLength(4);
    });
  });

  describe('MODULE_IDENTITY_EXCLUSION_DEFINITIONS', () => {
    it('has exactly 6 exclusion definitions per T01 §2', () => {
      expect(MODULE_IDENTITY_EXCLUSION_DEFINITIONS).toHaveLength(6);
    });
  });

  describe('BUSINESS_CONCERN_DEFINITIONS', () => {
    it('has exactly 5 concern definitions per T01 §3', () => {
      expect(BUSINESS_CONCERN_DEFINITIONS).toHaveLength(5);
    });
  });

  describe('CROSS_CONTRACT_POSITIONS', () => {
    it('has exactly 4 positions per T01 §9', () => {
      expect(CROSS_CONTRACT_POSITIONS).toHaveLength(4);
    });
  });

  describe('LOCKED_ARCHITECTURE_DECISIONS', () => {
    it('has exactly 13 decisions per P3-E13 master index', () => {
      expect(LOCKED_ARCHITECTURE_DECISIONS).toHaveLength(13);
    });

    it('decision numbers are sequential 1–13', () => {
      const numbers = LOCKED_ARCHITECTURE_DECISIONS.map((d) => d.decisionNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });
  });

  describe('READINESS_CROSS_CONTRACT_REFS', () => {
    it('has exactly 10 cross-contract references per P3-E13 master index', () => {
      expect(READINESS_CROSS_CONTRACT_REFS).toHaveLength(10);
    });
  });
});
