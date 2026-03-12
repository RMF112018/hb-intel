import type { IHeritageSnapshot } from '../src/types/index.js';
import { createHeritageSnapshot } from '../src/model/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockHeritageSnapshot = (
  overrides?: Partial<IHeritageSnapshot>
): IHeritageSnapshot =>
  merge(createHeritageSnapshot(), {
    snapshotId: 'heritage-snapshot-mock',
    scorecardId: 'scorecard-mock',
    capturedAt: '2026-03-12T00:00:00.000Z',
    capturedBy: 'strategic-intelligence-system',
    decision: 'GO',
    immutable: true,
    ...overrides,
  });
