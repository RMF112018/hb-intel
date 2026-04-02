import { describe, it, expect, beforeEach } from 'vitest';
import { AdminEvidenceType } from '@hbc/models/admin-control-plane';
import type { IAdminEvidenceReference } from '@hbc/models/admin-control-plane';
import {
  MockAdminEvidenceStore,
  isEvidenceInlineable,
  generateBlobLocator,
  EVIDENCE_INLINE_MAX_BYTES,
} from '../evidence-service.js';

/**
 * P4-06: Evidence service tests.
 *
 * Validates inline/offload decision logic, evidence metadata persistence,
 * and retrieval behavior.
 */

const TEST_REF: IAdminEvidenceReference = {
  evidenceId: 'ev-001',
  evidenceType: AdminEvidenceType.StepResultDetail,
  label: 'Step 1 result',
  runId: 'run-001',
  stepNumber: 1,
  capturedAt: '2026-04-02T10:00:00.000Z',
  storageLocator: 'inline',
};

describe('P4-06 isEvidenceInlineable', () => {
  it('returns true for null/undefined payload', () => {
    expect(isEvidenceInlineable(null)).toBe(true);
    expect(isEvidenceInlineable(undefined)).toBe(true);
  });

  it('returns true for small payload', () => {
    expect(isEvidenceInlineable({ key: 'small value' })).toBe(true);
  });

  it('returns true for payload exactly at threshold', () => {
    // Create a payload just under 32KB
    const data = 'x'.repeat(EVIDENCE_INLINE_MAX_BYTES - 20);
    expect(isEvidenceInlineable({ data })).toBe(true);
  });

  it('returns false for payload exceeding threshold', () => {
    const data = 'x'.repeat(EVIDENCE_INLINE_MAX_BYTES + 1000);
    expect(isEvidenceInlineable({ data })).toBe(false);
  });

  it('returns false for deeply nested large payload', () => {
    const nested: Record<string, unknown> = {};
    let current = nested;
    for (let i = 0; i < 100; i++) {
      current.data = 'x'.repeat(500);
      current.child = {};
      current = current.child as Record<string, unknown>;
    }
    // 100 levels * ~500 bytes each ≈ 50KB — should exceed threshold
    expect(isEvidenceInlineable(nested)).toBe(false);
  });
});

describe('P4-06 generateBlobLocator', () => {
  it('generates blob:// URI with run and evidence IDs', () => {
    const locator = generateBlobLocator('run-001', 'ev-001');
    expect(locator).toBe('blob://admin-evidence/run-001/ev-001.json');
  });

  it('generates unique locators for different evidence IDs', () => {
    const a = generateBlobLocator('run-001', 'ev-001');
    const b = generateBlobLocator('run-001', 'ev-002');
    expect(a).not.toBe(b);
  });
});

describe('P4-06 MockAdminEvidenceStore', () => {
  let store: MockAdminEvidenceStore;

  beforeEach(() => {
    store = new MockAdminEvidenceStore();
  });

  describe('recordEvidence + getEvidence', () => {
    it('records and retrieves evidence by ID', async () => {
      await store.recordEvidence(TEST_REF, 'compliance', { detail: 'test' });
      const result = await store.getEvidence('ev-001');

      expect(result).not.toBeNull();
      expect(result!.evidenceId).toBe('ev-001');
      expect(result!.evidenceType).toBe(AdminEvidenceType.StepResultDetail);
      expect(result!.label).toBe('Step 1 result');
    });

    it('returns null for unknown evidence ID', async () => {
      const result = await store.getEvidence('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('listByRunId', () => {
    it('returns empty list for unknown run', async () => {
      const results = await store.listByRunId('no-run');
      expect(results).toEqual([]);
    });

    it('returns evidence sorted by capturedAt', async () => {
      await store.recordEvidence(
        { ...TEST_REF, evidenceId: 'ev-002', capturedAt: '2026-04-02T10:02:00Z' },
        'operational',
      );
      await store.recordEvidence(
        { ...TEST_REF, evidenceId: 'ev-001', capturedAt: '2026-04-02T10:01:00Z' },
        'operational',
      );
      await store.recordEvidence(
        { ...TEST_REF, evidenceId: 'ev-003', capturedAt: '2026-04-02T10:03:00Z' },
        'permanent',
      );

      const results = await store.listByRunId('run-001');
      expect(results).toHaveLength(3);
      expect(results[0].evidenceId).toBe('ev-001');
      expect(results[1].evidenceId).toBe('ev-002');
      expect(results[2].evidenceId).toBe('ev-003');
    });

    it('filters evidence by runId', async () => {
      await store.recordEvidence(TEST_REF, 'compliance');
      await store.recordEvidence(
        { ...TEST_REF, evidenceId: 'ev-other', runId: 'run-other' },
        'operational',
      );

      const results = await store.listByRunId('run-001');
      expect(results).toHaveLength(1);
      expect(results[0].evidenceId).toBe('ev-001');
    });
  });

  describe('retention class handling', () => {
    it('accepts all three retention classes', async () => {
      await store.recordEvidence({ ...TEST_REF, evidenceId: 'e1' }, 'operational');
      await store.recordEvidence({ ...TEST_REF, evidenceId: 'e2' }, 'compliance');
      await store.recordEvidence({ ...TEST_REF, evidenceId: 'e3' }, 'permanent');

      expect(await store.getEvidence('e1')).not.toBeNull();
      expect(await store.getEvidence('e2')).not.toBeNull();
      expect(await store.getEvidence('e3')).not.toBeNull();
    });
  });
});
