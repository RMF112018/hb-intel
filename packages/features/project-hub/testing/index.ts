/**
 * Public testing surface for @hbc/features-project-hub.
 * Consumers should import SF21 fixtures from this subpath instead of deep internals.
 */

export {
  createMockProjectHealthPulse,
  createMockHealthPulseAdminConfig,
  createMockProjectHealthTelemetry,
} from './createMockProjectHealthPulse.js';

export {
  createMockHealthDimension,
} from './createMockHealthDimension.js';

export {
  createMockHealthMetric,
} from './createMockHealthMetric.js';

export { mockProjectHealthStates } from './mockProjectHealthStates.js';

export {
  createMockProjectHealthPulseSnapshot,
} from './createMockProjectHealthPulseSnapshot.js';

export { createMockFinancialAccessQuery } from './createMockFinancialAccessQuery.js';
export { mockFinancialAccessScenarios } from './mockFinancialScenarios.js';

export { createMockBudgetLineItem } from './createMockBudgetLineItem.js';
export { createMockReconciliationCondition } from './createMockReconciliationCondition.js';
export { createMockBudgetImportRow } from './createMockBudgetImportRow.js';
export {
  cleanImportRows,
  matchedImportRows,
  matchedExistingLines,
  ambiguousImportRows,
  ambiguousExistingLines,
  validationFailureRows,
} from './mockBudgetImportScenarios.js';

export { createMockForecastVersion } from './createMockForecastVersion.js';
export { createMockChecklistItem } from './createMockChecklistItem.js';
export { mockVersioningScenarios } from './mockVersioningScenarios.js';

export { createMockCashFlowActualRecord } from './createMockCashFlowActualRecord.js';
export { createMockCashFlowForecastRecord } from './createMockCashFlowForecastRecord.js';
export { createMockARAgingRecord } from './createMockARAgingRecord.js';
export {
  surplusActualRecords,
  surplusForecastRecords,
  deficitForecastRecords,
} from './mockCashFlowScenarios.js';
