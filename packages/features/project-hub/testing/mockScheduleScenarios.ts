import type {
  IScheduleAccessQuery,
  ScheduleAuthorityRole,
  ScheduleLayerAccess,
} from '../src/schedule/types/index.js';
import {
  SCHEDULE_AUTHORITY_ROLES,
  SCHEDULE_LAYERS,
} from '../src/schedule/constants/index.js';

/**
 * Pre-built access scenarios for all 24 role × layer combinations.
 * Used by governance tests to validate the full access matrix.
 */
export const mockScheduleAccessScenarios: Record<string, IScheduleAccessQuery> =
  Object.fromEntries(
    SCHEDULE_AUTHORITY_ROLES.flatMap((role: ScheduleAuthorityRole) =>
      SCHEDULE_LAYERS.map((layer: ScheduleLayerAccess) => [
        `${role}_${layer}`,
        { role, layer } as IScheduleAccessQuery,
      ]),
    ),
  );

/**
 * Import validation test data.
 */
export const importValidationScenarios = {
  /** A clean activity snapshot that passes all rules. */
  cleanActivity: {
    sourceActivityCode: 'A1000',
    targetStartDate: '2026-02-01T00:00:00Z',
    targetFinishDate: '2026-04-01T00:00:00Z',
    targetDurationHrs: 240,
    totalFloatHrs: 80,
    baselineStartDate: '2026-02-01T00:00:00Z',
    baselineFinishDate: '2026-04-01T00:00:00Z',
  },
  /** Missing required target dates — should trigger error. */
  missingTargetDates: {
    sourceActivityCode: 'A2000',
    targetStartDate: undefined,
    targetFinishDate: undefined,
    targetDurationHrs: 120,
  },
  /** Negative duration — should trigger warning. */
  negativeDuration: {
    sourceActivityCode: 'A3000',
    targetStartDate: '2026-02-01T00:00:00Z',
    targetFinishDate: '2026-04-01T00:00:00Z',
    targetDurationHrs: -10,
  },
  /** Missing baseline dates — warning only, parse succeeds. */
  missingBaselineDates: {
    sourceActivityCode: 'A4000',
    targetStartDate: '2026-02-01T00:00:00Z',
    targetFinishDate: '2026-04-01T00:00:00Z',
    targetDurationHrs: 100,
    baselineStartDate: undefined,
    baselineFinishDate: undefined,
  },
  /** Missing float — warning only, parse succeeds. */
  missingFloat: {
    sourceActivityCode: 'A5000',
    targetStartDate: '2026-02-01T00:00:00Z',
    targetFinishDate: '2026-04-01T00:00:00Z',
    targetDurationHrs: 200,
    totalFloatHrs: undefined,
  },
} as const;
