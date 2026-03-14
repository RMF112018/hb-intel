import { describe, it, expect } from 'vitest';
import { HB_INTEL_LIST_DEFINITIONS } from '../config/list-definitions.js';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from '../config/workflow-list-definitions.js';
import {
  validatePidContract,
  validateParentChildLookups,
  validateListCompleteness,
  validateNoDuplicateTitles,
} from './list-validation.js';

describe('W0-G2-T08: List validation helpers', () => {
  describe('validatePidContract', () => {
    it('passes for all 26 workflow lists', () => {
      const results = validatePidContract(HB_INTEL_WORKFLOW_LIST_DEFINITIONS);
      expect(results).toHaveLength(26);
      for (const r of results) {
        expect(r.passed, `${r.message}`).toBe(true);
      }
    });

    it('fails on a synthetic list missing pid', () => {
      const badList = [
        {
          title: 'Bad List',
          description: 'Missing pid',
          template: 100,
          fields: [{ internalName: 'Title', displayName: 'Title', type: 'Text' as const }],
        },
      ];
      const results = validatePidContract(badList);
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toContain('missing the pid field');
    });

    it('fails on pid with wrong properties', () => {
      const badList = [
        {
          title: 'Wrong PID',
          description: 'Bad pid config',
          template: 100,
          fields: [
            { internalName: 'pid', displayName: 'Project ID', type: 'Number' as const, required: false },
          ],
        },
      ];
      const results = validatePidContract(badList);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toContain('type is "Number"');
    });
  });

  describe('validateParentChildLookups', () => {
    it('passes for all parent/child relationships in workflow lists', () => {
      const results = validateParentChildLookups(HB_INTEL_WORKFLOW_LIST_DEFINITIONS);
      // Only lists with parentListTitle produce results
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.passed, `${r.message}`).toBe(true);
      }
    });
  });

  describe('validateListCompleteness', () => {
    it('passes for all 8 core lists', () => {
      const results = validateListCompleteness(HB_INTEL_LIST_DEFINITIONS);
      expect(results).toHaveLength(8);
      for (const r of results) {
        expect(r.passed, `${r.message}`).toBe(true);
      }
    });

    it('passes for all 26 workflow lists', () => {
      const results = validateListCompleteness(HB_INTEL_WORKFLOW_LIST_DEFINITIONS);
      expect(results).toHaveLength(26);
      for (const r of results) {
        expect(r.passed, `${r.message}`).toBe(true);
      }
    });
  });

  describe('validateNoDuplicateTitles', () => {
    it('passes across core + workflow (34 total)', () => {
      const results = validateNoDuplicateTitles(
        HB_INTEL_LIST_DEFINITIONS,
        HB_INTEL_WORKFLOW_LIST_DEFINITIONS
      );
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].details?.totalLists).toBe(34);
    });
  });
});
