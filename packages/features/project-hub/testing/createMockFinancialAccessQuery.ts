import type { IFinancialAccessQuery } from '../src/financial/types/index.js';

export const createMockFinancialAccessQuery = (
  overrides?: Partial<IFinancialAccessQuery>,
): IFinancialAccessQuery => ({
  role: 'PM',
  versionState: 'Working',
  ...overrides,
});
