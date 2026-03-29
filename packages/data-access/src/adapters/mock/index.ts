/**
 * @hbc/data-access — Mock adapter barrel.
 *
 * Re-exports all 11 domain mock repositories, shared helpers, and seed data.
 */

import { resetId as _resetId } from './helpers.js';

// Helpers & infrastructure
export { paginate, genId, resetId } from './helpers.js';
export type { MockAdapterConfig } from './types.js';
export { MOCK_DEFAULT_PAGE_SIZE, MOCK_DELAY_MS } from './constants.js';

// Mock repositories (11 domains)
export { MockLeadRepository } from './MockLeadRepository.js';
export { MockScheduleRepository } from './MockScheduleRepository.js';
export { MockBuyoutRepository } from './MockBuyoutRepository.js';
export { MockEstimatingRepository } from './MockEstimatingRepository.js';
export { MockComplianceRepository } from './MockComplianceRepository.js';
export { MockContractRepository } from './MockContractRepository.js';
export { MockRiskRepository } from './MockRiskRepository.js';
export { MockScorecardRepository } from './MockScorecardRepository.js';
export { MockPmpRepository } from './MockPmpRepository.js';
export { MockProjectRepository } from './MockProjectRepository.js';
export { MockAuthRepository } from './MockAuthRepository.js';
export { MockFinancialRepository } from './MockFinancialRepository.js';

// Seed data (for test setup / inspection)
export {
  SEED_LEADS,
  SEED_SCHEDULE_ACTIVITIES,
  SEED_BUYOUT_ENTRIES,
  SEED_ESTIMATING_TRACKERS,
  SEED_ESTIMATING_KICKOFFS,
  SEED_COMPLIANCE_ENTRIES,
  SEED_CONTRACTS,
  SEED_CONTRACT_APPROVALS,
  SEED_RISK_ITEMS,
  SEED_SCORECARDS,
  SEED_SCORECARD_VERSIONS,
  SEED_PMPS,
  SEED_PMP_SIGNATURES,
  SEED_PROJECTS,
  SEED_ROLES,
  SEED_CURRENT_USER,
} from './seedData.js';

/** Reset all mock stores by re-importing. Resets the ID counter. */
export function resetAllMockStores(): void {
  _resetId(1000);
}
