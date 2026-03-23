import type { ITimeImpactRecord } from '../src/constraints/delay-ledger/types.js';

export const createMockTimeImpactRecord = (
  overrides?: Partial<ITimeImpactRecord>,
): ITimeImpactRecord => ({
  estimatedCalendarDays: 14,
  estimatedWorkingDays: 10,
  analysisMethod: 'CONTEMPORANEOUS_UPDATE',
  analysisBasis:
    'Based on contemporaneous schedule update dated 2026-02-15, the delay to structural steel delivery impacts the critical path erection sequence by 14 calendar days. Analysis performed using schedule version BL Rev 2.',
  fragnetAvailable: false,
  fragnetReference: null,
  tiaAvailable: false,
  tiaReference: null,
  pwindowStart: null,
  pwindowEnd: null,
  quantificationConfidence: 'Ordered',
  ...overrides,
});
