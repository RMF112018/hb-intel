import { describe, expect, it } from 'vitest';
import {
  addWarningSamples,
  parseArgs,
} from '../../../../../../scripts/backfill-my-project-legacy-registry-fields.js';

describe('backfill-my-project-legacy-registry-fields script helpers', () => {
  it('defaults to dry-run', () => {
    const args = parseArgs([]);
    expect(args.apply).toBe(false);
    expect(args.json).toBe(false);
    expect(args.limit).toBeNull();
  });

  it('parses apply/json/limit flags', () => {
    const args = parseArgs(['--apply', '--json', '--limit', '20']);
    expect(args.apply).toBe(true);
    expect(args.json).toBe(true);
    expect(args.limit).toBe(20);
  });

  it('rejects invalid --limit values', () => {
    expect(() => parseArgs(['--limit'])).toThrow('Missing value for --limit');
    expect(() => parseArgs(['--limit', '-1'])).toThrow('--limit must be a positive integer');
  });

  it('caps warning samples', () => {
    const samples: Array<{ rowId: number; code: string; message: string }> = [];
    addWarningSamples(
      42,
      [
        { code: 'missing-linkage', message: 'one' },
        { code: 'missing-project-authority', message: 'two' },
      ],
      samples,
      1,
    );
    expect(samples).toHaveLength(1);
  });
});
