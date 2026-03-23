import type { IFinancialAccessQuery } from '../src/financial/types/index.js';

/**
 * Pre-built test scenarios covering all cells of the T01 §1.4 access matrix.
 */
export const mockFinancialAccessScenarios = {
  pmWorking: { role: 'PM', versionState: 'Working' } as IFinancialAccessQuery,
  pmConfirmed: { role: 'PM', versionState: 'ConfirmedInternal' } as IFinancialAccessQuery,
  pmPublished: { role: 'PM', versionState: 'PublishedMonthly' } as IFinancialAccessQuery,
  pmSuperseded: { role: 'PM', versionState: 'Superseded' } as IFinancialAccessQuery,
  perWorking: { role: 'PER', versionState: 'Working' } as IFinancialAccessQuery,
  perConfirmed: { role: 'PER', versionState: 'ConfirmedInternal' } as IFinancialAccessQuery,
  perPublished: { role: 'PER', versionState: 'PublishedMonthly' } as IFinancialAccessQuery,
  perSuperseded: { role: 'PER', versionState: 'Superseded' } as IFinancialAccessQuery,
  leadershipWorking: { role: 'Leadership', versionState: 'Working' } as IFinancialAccessQuery,
  leadershipConfirmed: { role: 'Leadership', versionState: 'ConfirmedInternal' } as IFinancialAccessQuery,
  leadershipPublished: { role: 'Leadership', versionState: 'PublishedMonthly' } as IFinancialAccessQuery,
  leadershipSuperseded: { role: 'Leadership', versionState: 'Superseded' } as IFinancialAccessQuery,
} as const;
