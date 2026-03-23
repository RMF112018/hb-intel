import { describe, expect, it } from 'vitest';

import {
  SCHEDULE_AUTHORITY_ROLES,
  SCHEDULE_LAYERS,
  IMPORT_VALIDATION_RULES,
} from '../constants/index.js';
import {
  detectCalendarAssumptionDivergence,
  deriveExternalActivityKey,
  resolveScheduleLayerAccess,
  runImportValidation,
  validateBaselineApproval,
  validateCanonicalSourceDesignation,
  validateVersionActivation,
} from '../governance/index.js';
import { createMockBaselineRecord } from '../../../testing/createMockBaselineRecord.js';
import { createMockCalendarRule, createMockOperatingCalendar } from '../../../testing/createMockCalendarRule.js';
import { createMockScheduleSource } from '../../../testing/createMockScheduleSource.js';
import { createMockScheduleVersion } from '../../../testing/createMockScheduleVersion.js';
import { importValidationScenarios, mockScheduleAccessScenarios } from '../../../testing/mockScheduleScenarios.js';

describe('P3-E5-T01 schedule governance', () => {
  describe('resolveScheduleLayerAccess', () => {
    it('covers all 24 role × layer combinations', () => {
      const totalCombinations = SCHEDULE_AUTHORITY_ROLES.length * SCHEDULE_LAYERS.length;
      expect(totalCombinations).toBe(24);
      expect(Object.keys(mockScheduleAccessScenarios)).toHaveLength(24);
    });

    it('returns a valid result for every combination', () => {
      for (const [key, query] of Object.entries(mockScheduleAccessScenarios)) {
        const result = resolveScheduleLayerAccess(query);
        expect(result, `Failed for scenario: ${key}`).toBeDefined();
        expect(Array.isArray(result.allowed), key).toBe(true);
        expect(Array.isArray(result.denied), key).toBe(true);
        expect(typeof result.hidden, key).toBe('boolean');
      }
    });

    describe('PM access', () => {
      it('grants read on master-schedule', () => {
        const result = resolveScheduleLayerAccess({ role: 'PM', layer: 'master-schedule' });
        expect(result.allowed).toContain('read');
        expect(result.denied).toContain('write');
        expect(result.hidden).toBe(false);
      });

      it('grants read, write, publish on operating', () => {
        const result = resolveScheduleLayerAccess({ role: 'PM', layer: 'operating' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('write');
        expect(result.allowed).toContain('publish');
        expect(result.hidden).toBe(false);
      });

      it('grants read on field-execution (oversight only)', () => {
        const result = resolveScheduleLayerAccess({ role: 'PM', layer: 'field-execution' });
        expect(result.allowed).toContain('read');
        expect(result.denied).toContain('write');
      });

      it('grants read and publish on published-forecast', () => {
        const result = resolveScheduleLayerAccess({ role: 'PM', layer: 'published-forecast' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('publish');
      });
    });

    describe('PE access', () => {
      it('grants read and approve on master-schedule', () => {
        const result = resolveScheduleLayerAccess({ role: 'PE', layer: 'master-schedule' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('approve');
        expect(result.denied).toContain('write');
      });

      it('grants read and approve on published-forecast', () => {
        const result = resolveScheduleLayerAccess({ role: 'PE', layer: 'published-forecast' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('approve');
      });
    });

    describe('Scheduler access', () => {
      it('grants read and write on master-schedule (future state)', () => {
        const result = resolveScheduleLayerAccess({ role: 'Scheduler', layer: 'master-schedule' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('write');
      });

      it('hides field-execution layer', () => {
        const result = resolveScheduleLayerAccess({ role: 'Scheduler', layer: 'field-execution' });
        expect(result.hidden).toBe(true);
        expect(result.allowed).toHaveLength(0);
      });
    });

    describe('Superintendent access', () => {
      it('grants read and write on field-execution', () => {
        const result = resolveScheduleLayerAccess({ role: 'Superintendent', layer: 'field-execution' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('write');
        expect(result.hidden).toBe(false);
      });

      it('grants read-only on operating layer', () => {
        const result = resolveScheduleLayerAccess({ role: 'Superintendent', layer: 'operating' });
        expect(result.allowed).toContain('read');
        expect(result.denied).toContain('write');
      });
    });

    describe('Foreman access', () => {
      it('grants read and write on field-execution only', () => {
        const result = resolveScheduleLayerAccess({ role: 'Foreman', layer: 'field-execution' });
        expect(result.allowed).toContain('read');
        expect(result.allowed).toContain('write');
        expect(result.hidden).toBe(false);
      });

      it('hides master-schedule, operating, and published-forecast', () => {
        for (const layer of ['master-schedule', 'operating', 'published-forecast'] as const) {
          const result = resolveScheduleLayerAccess({ role: 'Foreman', layer });
          expect(result.hidden, `Foreman should be hidden from ${layer}`).toBe(true);
        }
      });
    });

    describe('MOE access', () => {
      it('grants read and configure on all layers', () => {
        for (const layer of SCHEDULE_LAYERS) {
          const result = resolveScheduleLayerAccess({ role: 'MOE', layer });
          expect(result.allowed, `MOE on ${layer}`).toContain('read');
          expect(result.allowed, `MOE on ${layer}`).toContain('configure');
          expect(result.denied, `MOE on ${layer}`).toContain('write');
          expect(result.hidden, `MOE on ${layer}`).toBe(false);
        }
      });
    });
  });

  describe('validateCanonicalSourceDesignation (§1.1)', () => {
    it('passes with a single canonical source', () => {
      const sources = [createMockScheduleSource({ isCanonical: true })];
      const result = validateCanonicalSourceDesignation(sources);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('fails with multiple canonical sources', () => {
      const sources = [
        createMockScheduleSource({ sourceId: 'src-001', isCanonical: true }),
        createMockScheduleSource({ sourceId: 'src-002', isCanonical: true }),
      ];
      const result = validateCanonicalSourceDesignation(sources);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Multiple canonical sources');
    });

    it('passes with zero canonical sources (project without schedule)', () => {
      const sources = [createMockScheduleSource({ isCanonical: false })];
      const result = validateCanonicalSourceDesignation(sources);
      expect(result.valid).toBe(true);
    });

    it('ignores deregistered sources', () => {
      const sources = [
        createMockScheduleSource({ sourceId: 'src-001', isCanonical: true }),
        createMockScheduleSource({
          sourceId: 'src-002',
          isCanonical: true,
          deregisteredAt: '2026-03-01T00:00:00Z',
        }),
      ];
      const result = validateCanonicalSourceDesignation(sources);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateVersionActivation (§1.2)', () => {
    it('allows activation of a parsed version with no prior active', () => {
      const candidate = createMockScheduleVersion({ status: 'Parsed' });
      const result = validateVersionActivation(candidate, []);
      expect(result.canActivate).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('requires parentVersionId when a prior active version exists', () => {
      const existing = createMockScheduleVersion({
        versionId: 'ver-old',
        status: 'Active',
      });
      const candidate = createMockScheduleVersion({
        versionId: 'ver-new',
        status: 'Parsed',
        parentVersionId: null,
      });
      const result = validateVersionActivation(candidate, [existing]);
      expect(result.canActivate).toBe(false);
      expect(result.blockers[0]).toContain('parentVersionId');
    });

    it('rejects activation of a non-Parsed version', () => {
      const candidate = createMockScheduleVersion({ status: 'Failed' });
      const result = validateVersionActivation(candidate, []);
      expect(result.canActivate).toBe(false);
      expect(result.blockers[0]).toContain("status 'Failed'");
    });
  });

  describe('validateBaselineApproval (§1.3)', () => {
    it('allows approval with PE and basis', () => {
      const baseline = createMockBaselineRecord();
      const result = validateBaselineApproval(baseline, []);
      expect(result.canApprove).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('blocks when approvedBy is empty', () => {
      const baseline = createMockBaselineRecord({ approvedBy: '' });
      const result = validateBaselineApproval(baseline, []);
      expect(result.canApprove).toBe(false);
      expect(result.blockers[0]).toContain('PE approval');
    });

    it('blocks when approval basis is empty', () => {
      const baseline = createMockBaselineRecord({ approvalBasis: '' });
      const result = validateBaselineApproval(baseline, []);
      expect(result.canApprove).toBe(false);
      expect(result.blockers[0]).toContain('approval basis');
    });

    it('requires causation code when superseding existing primary', () => {
      const existingPrimary = createMockBaselineRecord({
        baselineId: 'bl-old',
        isPrimary: true,
        supersededAt: null,
      });
      const newPrimary = createMockBaselineRecord({
        baselineId: 'bl-new',
        isPrimary: true,
        causationCode: null,
      });
      const result = validateBaselineApproval(newPrimary, [existingPrimary]);
      expect(result.canApprove).toBe(false);
      expect(result.blockers[0]).toContain('causation code');
    });

    it('allows supersession with causation code provided', () => {
      const existingPrimary = createMockBaselineRecord({
        baselineId: 'bl-old',
        isPrimary: true,
        supersededAt: null,
      });
      const newPrimary = createMockBaselineRecord({
        baselineId: 'bl-new',
        isPrimary: true,
        causationCode: 'CO-14',
      });
      const result = validateBaselineApproval(newPrimary, [existingPrimary]);
      expect(result.canApprove).toBe(true);
    });
  });

  describe('runImportValidation (§1.6)', () => {
    it('passes all rules for a clean activity', () => {
      const results = runImportValidation(
        importValidationScenarios.cleanActivity,
        IMPORT_VALIDATION_RULES,
      );
      expect(results).toHaveLength(10);
      expect(results.every((r) => r.passed)).toBe(true);
    });

    it('fails target date check for missing target dates', () => {
      const results = runImportValidation(
        importValidationScenarios.missingTargetDates,
        IMPORT_VALIDATION_RULES,
      );
      const targetDateResult = results.find((r) => r.rule.check === 'Target dates valid');
      expect(targetDateResult?.passed).toBe(false);
    });

    it('fails duration check for negative duration', () => {
      const results = runImportValidation(
        importValidationScenarios.negativeDuration,
        IMPORT_VALIDATION_RULES,
      );
      const durationResult = results.find((r) => r.rule.check === 'Duration >= 0');
      expect(durationResult?.passed).toBe(false);
    });
  });

  describe('deriveExternalActivityKey (§1.5)', () => {
    it('derives key in {sourceId}::{sourceActivityCode} format', () => {
      const key = deriveExternalActivityKey('src-001', 'A1000');
      expect(key).toBe('src-001::A1000');
    });

    it('throws when sourceId is empty', () => {
      expect(() => deriveExternalActivityKey('', 'A1000')).toThrow(
        'Both sourceId and sourceActivityCode are required',
      );
    });

    it('throws when sourceActivityCode is empty', () => {
      expect(() => deriveExternalActivityKey('src-001', '')).toThrow(
        'Both sourceId and sourceActivityCode are required',
      );
    });

    it('disambiguates same activity code across different sources', () => {
      const key1 = deriveExternalActivityKey('src-001', 'A1000');
      const key2 = deriveExternalActivityKey('src-002', 'A1000');
      expect(key1).not.toBe(key2);
    });
  });

  describe('detectCalendarAssumptionDivergence (§17)', () => {
    it('detects no divergence for matching calendars', () => {
      const source = createMockCalendarRule();
      const operating = createMockCalendarRule({
        calendarRuleId: 'cal-002',
        calendarType: 'OperatingCalendar',
      });
      const result = detectCalendarAssumptionDivergence(source, operating);
      expect(result.diverges).toBe(false);
      expect(result.deltas).toHaveLength(0);
    });

    it('detects hours-per-day divergence', () => {
      const source = createMockCalendarRule({ hoursPerDay: 8 });
      const operating = createMockOperatingCalendar({ hoursPerDay: 10 });
      const result = detectCalendarAssumptionDivergence(source, operating);
      expect(result.diverges).toBe(true);
      expect(result.deltas.some((d) => d.includes('Hours per day'))).toBe(true);
    });

    it('detects work-day divergence', () => {
      const source = createMockCalendarRule({ workDays: [1, 2, 3, 4, 5] });
      const operating = createMockOperatingCalendar({ workDays: [1, 2, 3, 4, 5, 6] });
      const result = detectCalendarAssumptionDivergence(source, operating);
      expect(result.diverges).toBe(true);
      expect(result.deltas.some((d) => d.includes('Work days'))).toBe(true);
    });

    it('detects exception date divergence', () => {
      const source = createMockCalendarRule({
        exceptions: [{ date: '2026-07-04', description: 'Independence Day' }],
      });
      const operating = createMockOperatingCalendar({ exceptions: [] });
      const result = detectCalendarAssumptionDivergence(source, operating);
      expect(result.diverges).toBe(true);
      expect(result.deltas.some((d) => d.includes('2026-07-04'))).toBe(true);
    });
  });
});
