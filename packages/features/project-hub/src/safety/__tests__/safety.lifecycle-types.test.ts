import { describe, expect, it } from 'vitest';

import {
  GOVERNED_SECTION_KEYS,
  INSTANCE_SECTION_KEYS,
  MATERIAL_CHANGE_SECTION_KEYS,
  SSSP_APPROVER_ROLES,
  SSSP_WORK_QUEUE_TRIGGERS,
  BASE_PLAN_REQUIRED_APPROVERS,
  ADDENDUM_ALWAYS_REQUIRED_APPROVERS,
  ADDENDUM_OPERATIONALLY_AFFECTED_APPROVERS,
  SSSP_RENDERED_DOCUMENT_CONFIG,
  SSSP_SECTION_KEYS,
} from '../../index.js';

describe('P3-E8-T03 SSSP lifecycle contract stability', () => {
  describe('Section classification', () => {
    it('GOVERNED_SECTION_KEYS has exactly 7 governed sections per §2.1', () => {
      expect(GOVERNED_SECTION_KEYS).toHaveLength(7);
    });

    it('INSTANCE_SECTION_KEYS has exactly 5 instance sections per §2.2', () => {
      expect(INSTANCE_SECTION_KEYS).toHaveLength(5);
    });

    it('governed + instance keys total 12 (all SSSP section keys)', () => {
      expect(GOVERNED_SECTION_KEYS.length + INSTANCE_SECTION_KEYS.length).toBe(12);
      expect(SSSP_SECTION_KEYS).toHaveLength(12);
    });

    it('governed keys are all valid SSSPSectionKey values', () => {
      for (const key of GOVERNED_SECTION_KEYS) {
        expect(SSSP_SECTION_KEYS).toContain(key);
      }
    });

    it('instance keys are all valid SSSPSectionKey values', () => {
      for (const key of INSTANCE_SECTION_KEYS) {
        expect(SSSP_SECTION_KEYS).toContain(key);
      }
    });

    it('no overlap between governed and instance keys', () => {
      const overlap = GOVERNED_SECTION_KEYS.filter((k) =>
        (INSTANCE_SECTION_KEYS as readonly string[]).includes(k),
      );
      expect(overlap).toHaveLength(0);
    });
  });

  describe('Material change keys', () => {
    it('MATERIAL_CHANGE_SECTION_KEYS has 7 keys per §4.3', () => {
      expect(MATERIAL_CHANGE_SECTION_KEYS).toHaveLength(7);
    });

    it('material change keys are a subset of governed keys', () => {
      for (const key of MATERIAL_CHANGE_SECTION_KEYS) {
        expect(GOVERNED_SECTION_KEYS).toContain(key);
      }
    });
  });

  describe('Approval rules', () => {
    it('SSSP_APPROVER_ROLES has exactly 3 roles', () => {
      expect(SSSP_APPROVER_ROLES).toHaveLength(3);
    });

    it('base plan requires all 3 approvers per §3.1', () => {
      expect(BASE_PLAN_REQUIRED_APPROVERS).toHaveLength(3);
    });

    it('addendum always requires Safety Manager per §3.2', () => {
      expect(ADDENDUM_ALWAYS_REQUIRED_APPROVERS).toHaveLength(1);
      expect(ADDENDUM_ALWAYS_REQUIRED_APPROVERS).toContain('SAFETY_MANAGER');
    });

    it('operationally affected addendum requires all 3 per §3.2', () => {
      expect(ADDENDUM_OPERATIONALLY_AFFECTED_APPROVERS).toHaveLength(3);
    });
  });

  describe('Work queue triggers', () => {
    it('defines 5 work queue triggers per §6', () => {
      expect(SSSP_WORK_QUEUE_TRIGGERS).toHaveLength(5);
    });
  });

  describe('Rendered document config', () => {
    it('uses GENERAL source type per §5.3', () => {
      expect(SSSP_RENDERED_DOCUMENT_CONFIG.sourceRecordType).toBe('GENERAL');
    });

    it('uses STANDARD sensitivity per §5.3', () => {
      expect(SSSP_RENDERED_DOCUMENT_CONFIG.sensitivityTier).toBe('STANDARD');
    });

    it('uses EXTENDED_REGULATORY retention per §5.3', () => {
      expect(SSSP_RENDERED_DOCUMENT_CONFIG.retentionCategory).toBe('EXTENDED_REGULATORY');
    });
  });
});
