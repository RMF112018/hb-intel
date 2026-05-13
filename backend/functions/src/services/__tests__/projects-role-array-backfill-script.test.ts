import { describe, expect, it } from 'vitest';
import {
  addWarningSamples,
  parseArgs,
} from '../../../../../scripts/backfill-my-project-role-arrays.js';

describe('backfill-my-project-role-arrays script helpers', () => {
  it('defaults to dry-run without apply flag', () => {
    const args = parseArgs([]);
    expect(args.apply).toBe(false);
    expect(args.json).toBe(false);
    expect(args.limit).toBeNull();
  });

  it('accepts apply/json/limit flags', () => {
    const args = parseArgs(['--apply', '--json', '--limit', '25']);
    expect(args.apply).toBe(true);
    expect(args.json).toBe(true);
    expect(args.limit).toBe(25);
  });

  it('rejects invalid limit values', () => {
    expect(() => parseArgs(['--limit', '0'])).toThrow('--limit must be a positive integer');
    expect(() => parseArgs(['--limit'])).toThrow('Missing value for --limit');
  });

  it('caps warning samples to max size', () => {
    const samples: Array<{ rowId: number; code: string; message: string }> = [];
    addWarningSamples(
      [
        { code: 'legacy-empty', message: 'a', legacyField: 'leadEstimatorUpn', canonicalField: 'leadEstimatorUpns' },
        { code: 'legacy-empty', message: 'b', legacyField: 'projectManagerUpn', canonicalField: 'projectManagerUpns' },
      ],
      10,
      samples,
      1,
    );
    expect(samples).toHaveLength(1);
  });
});
