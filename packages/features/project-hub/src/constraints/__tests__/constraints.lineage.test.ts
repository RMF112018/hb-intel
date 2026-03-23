import { describe, expect, it } from 'vitest';

import {
  getSpawnPathConfig,
  getSpawnSeedData,
  canSpawnFromRisk,
  canSpawnFromConstraint,
  createLineageRecord,
  createCrossLedgerLink,
  validateBidirectionalConsistency,
} from '../../index.js';

import { createMockRiskRecord } from '../../../testing/createMockRiskRecord.js';
import { createMockConstraintRecord } from '../../../testing/createMockConstraintRecord.js';

describe('P3-E6-T05 Cross-Ledger Lineage rules', () => {
  // ── getSpawnPathConfig ──────────────────────────────────────────────

  describe('getSpawnPathConfig', () => {
    it('returns config for RiskToConstraint', () => {
      const config = getSpawnPathConfig('RiskToConstraint');
      expect(config?.parentLedger).toBe('Risk');
      expect(config?.childLedger).toBe('Constraint');
    });

    it('returns config for ConstraintToDelay', () => {
      const config = getSpawnPathConfig('ConstraintToDelay');
      expect(config?.parentLedger).toBe('Constraint');
      expect(config?.childLedger).toBe('Delay');
    });

    it('returns config for ConstraintToChange', () => {
      const config = getSpawnPathConfig('ConstraintToChange');
      expect(config?.parentLedger).toBe('Constraint');
      expect(config?.childLedger).toBe('Change');
    });
  });

  // ── getSpawnSeedData ────────────────────────────────────────────────

  describe('getSpawnSeedData', () => {
    it('extracts seed data from Risk for RiskToConstraint spawn', () => {
      const risk = createMockRiskRecord();
      const seed = getSpawnSeedData('RiskToConstraint', risk as unknown as Record<string, unknown>);
      expect(seed.inheritedFields).toContain('category');
      expect(seed.inheritedFields).toContain('description');
      expect(seed.inheritedFields).toContain('owner');
      expect(seed.inheritedFields).toContain('bic');
      expect(seed.inheritedFields).toContain('projectId');
      expect(seed.inheritedValues['projectId']).toBe('proj-001');
    });

    it('extracts seed data from Constraint for ConstraintToDelay spawn', () => {
      const constraint = createMockConstraintRecord();
      const seed = getSpawnSeedData('ConstraintToDelay', constraint as unknown as Record<string, unknown>);
      expect(seed.inheritedFields).toContain('projectId');
      expect(seed.inheritedFields).toContain('owner');
      expect(seed.inheritedFields).toContain('description');
      expect(seed.inheritedValues['projectId']).toBe('proj-001');
    });

    it('extracts seed data from Constraint for ConstraintToChange spawn', () => {
      const constraint = createMockConstraintRecord();
      const seed = getSpawnSeedData('ConstraintToChange', constraint as unknown as Record<string, unknown>);
      expect(seed.inheritedFields).toContain('projectId');
      expect(seed.inheritedFields).toContain('identifiedBy');
    });
  });

  // ── canSpawnFromRisk (L-01) ─────────────────────────────────────────

  describe('canSpawnFromRisk', () => {
    it('allows spawn from non-terminal risk', () => {
      const result = canSpawnFromRisk({ status: 'Identified' });
      expect(result.eligible).toBe(true);
    });

    it('allows spawn from UnderAssessment risk', () => {
      const result = canSpawnFromRisk({ status: 'UnderAssessment' });
      expect(result.eligible).toBe(true);
    });

    it('rejects spawn from Closed risk', () => {
      const result = canSpawnFromRisk({ status: 'Closed' });
      expect(result.eligible).toBe(false);
      expect(result.reasons).toHaveLength(1);
    });

    it('rejects spawn from Void risk', () => {
      const result = canSpawnFromRisk({ status: 'Void' });
      expect(result.eligible).toBe(false);
    });
  });

  // ── canSpawnFromConstraint ──────────────────────────────────────────

  describe('canSpawnFromConstraint', () => {
    it('allows spawn from non-terminal constraint', () => {
      const result = canSpawnFromConstraint({ status: 'Identified' });
      expect(result.eligible).toBe(true);
    });

    it('allows spawn from UnderAction constraint (L-04)', () => {
      const result = canSpawnFromConstraint({ status: 'UnderAction' });
      expect(result.eligible).toBe(true);
    });

    it('rejects spawn from Resolved constraint', () => {
      const result = canSpawnFromConstraint({ status: 'Resolved' });
      expect(result.eligible).toBe(false);
    });

    it('rejects spawn from Superseded constraint', () => {
      const result = canSpawnFromConstraint({ status: 'Superseded' });
      expect(result.eligible).toBe(false);
    });
  });

  // ── createLineageRecord (L-02) ─────────────────────────────────────

  describe('createLineageRecord', () => {
    it('creates immutable lineage record with correct fields', () => {
      const record = createLineageRecord({
        lineageId: 'lin-test',
        projectId: 'proj-001',
        spawnAction: 'RiskToConstraint',
        parentRecordId: 'risk-005',
        parentRecordNumber: 'RISK-005',
        childRecordId: 'con-010',
        childRecordNumber: 'CON-010',
        spawnedAt: '2026-03-15T10:00:00Z',
        spawnedBy: 'user-001',
        inheritedFields: ['category', 'description'],
        inheritedValues: { category: 'SITE_CONDITIONS', description: 'Test' },
      });

      expect(record.lineageId).toBe('lin-test');
      expect(record.parentLedger).toBe('Risk');
      expect(record.childLedger).toBe('Constraint');
      expect(record.spawnAction).toBe('RiskToConstraint');
      expect(record.inheritedFields).toEqual(['category', 'description']);
    });

    it('creates lineage for ConstraintToDelay spawn', () => {
      const record = createLineageRecord({
        lineageId: 'lin-test-2',
        projectId: 'proj-001',
        spawnAction: 'ConstraintToDelay',
        parentRecordId: 'con-008',
        parentRecordNumber: 'CON-008',
        childRecordId: 'del-012',
        childRecordNumber: 'DEL-012',
        spawnedAt: '2026-03-15T10:00:00Z',
        spawnedBy: 'user-001',
        inheritedFields: ['projectId'],
        inheritedValues: { projectId: 'proj-001' },
      });

      expect(record.parentLedger).toBe('Constraint');
      expect(record.childLedger).toBe('Delay');
    });
  });

  // ── createCrossLedgerLink ───────────────────────────────────────────

  describe('createCrossLedgerLink', () => {
    it('creates link with all required fields', () => {
      const link = createCrossLedgerLink({
        linkId: 'link-test',
        projectId: 'proj-001',
        sourceRecordId: 'del-003',
        sourceLedger: 'Delay',
        targetRecordId: 'ce-004',
        targetLedger: 'Change',
        linkedAt: '2026-03-15T10:00:00Z',
        linkedBy: 'user-001',
      });

      expect(link.linkId).toBe('link-test');
      expect(link.sourceLedger).toBe('Delay');
      expect(link.targetLedger).toBe('Change');
    });
  });

  // ── validateBidirectionalConsistency (L-05) ─────────────────────────

  describe('validateBidirectionalConsistency', () => {
    it('passes when both sides have the reference', () => {
      const result = validateBidirectionalConsistency(
        ['ce-004'],
        ['del-003'],
        'del-003',
        'ce-004',
      );
      expect(result.consistent).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('fails when delay has reference but change event does not', () => {
      const result = validateBidirectionalConsistency(
        ['ce-004'],
        [],
        'del-003',
        'ce-004',
      );
      expect(result.consistent).toBe(false);
      expect(result.issues).toHaveLength(1);
    });

    it('fails when change event has reference but delay does not', () => {
      const result = validateBidirectionalConsistency(
        [],
        ['del-003'],
        'del-003',
        'ce-004',
      );
      expect(result.consistent).toBe(false);
      expect(result.issues).toHaveLength(1);
    });

    it('passes when neither side has a reference', () => {
      const result = validateBidirectionalConsistency(
        [],
        [],
        'del-003',
        'ce-004',
      );
      expect(result.consistent).toBe(true);
    });
  });
});
