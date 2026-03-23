import type { IScenarioActivityRecord } from '../src/schedule/types/index.js';

/**
 * Pre-built scenario activity records for promotion validation testing.
 */
export const scenarioActivityOverrides = {
  /** Activity with date override — counts as an override. */
  withDateOverride: {
    scenarioActivityId: 'sa-001',
    scenarioId: 'scenario-001',
    externalActivityKey: 'src-001::A1000',
    scenarioStartDate: '2026-05-01T00:00:00Z',
    scenarioFinishDate: '2026-07-15T00:00:00Z',
    scenarioFloatHrs: null,
    scenarioCausationCode: 'WEATHER',
    assumptions: 'Extended due to weather delay',
  } satisfies IScenarioActivityRecord,

  /** Activity with float override only. */
  withFloatOverride: {
    scenarioActivityId: 'sa-002',
    scenarioId: 'scenario-001',
    externalActivityKey: 'src-001::A2000',
    scenarioStartDate: null,
    scenarioFinishDate: null,
    scenarioFloatHrs: 40,
    scenarioCausationCode: null,
    assumptions: null,
  } satisfies IScenarioActivityRecord,

  /** Activity with no overrides — inherits all from source. */
  noOverride: {
    scenarioActivityId: 'sa-003',
    scenarioId: 'scenario-001',
    externalActivityKey: 'src-001::A3000',
    scenarioStartDate: null,
    scenarioFinishDate: null,
    scenarioFloatHrs: null,
    scenarioCausationCode: null,
    assumptions: null,
  } satisfies IScenarioActivityRecord,
};
