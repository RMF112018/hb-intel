import { describe, expect, it } from 'vitest';
import { computeBusinessKey, computeDuplicateKey } from './duplicateKey.js';

describe('computeDuplicateKey', () => {
  it('produces identical keys for case/whitespace-varying inputs', () => {
    const a = computeDuplicateKey({
      projectNumber: '2024-118',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      checksum: 'ABC123',
    });
    const b = computeDuplicateKey({
      projectNumber: ' 2024-118 ',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      checksum: 'abc123',
    });
    expect(a).toBe(b);
  });

  it('business key ignores checksum', () => {
    const businessA = computeBusinessKey({
      projectNumber: '2024-118',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
    });
    const businessB = computeBusinessKey({
      projectNumber: '2024-118',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
    });
    expect(businessA).toBe(businessB);
  });
});
