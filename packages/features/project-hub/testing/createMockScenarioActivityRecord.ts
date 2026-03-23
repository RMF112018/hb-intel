import type { IScenarioActivityRecord } from '../src/schedule/types/index.js';

export const createMockScenarioActivityRecord = (
  overrides?: Partial<IScenarioActivityRecord>,
): IScenarioActivityRecord => ({
  scenarioActivityId: 'sa-001',
  scenarioId: 'scenario-001',
  externalActivityKey: 'src-001::A1000',
  scenarioStartDate: null,
  scenarioFinishDate: null,
  scenarioFloatHrs: null,
  scenarioCausationCode: null,
  assumptions: null,
  ...overrides,
});
