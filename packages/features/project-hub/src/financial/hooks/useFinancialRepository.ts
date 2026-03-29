/**
 * useFinancialRepository — singleton facade provider for Financial surfaces.
 *
 * Instantiates `IFinancialRepository` via the standard composition root
 * (`createFinancialRepository()`) and memoizes it for the component tree.
 *
 * All Financial surface hooks should call this to get the facade instance
 * rather than creating their own inline mock data.
 *
 * Currently returns MockFinancialRepository (Stage 3 scaffold).
 * When a real adapter is registered, this hook automatically switches.
 */

import { useMemo } from 'react';
import { createFinancialRepository } from '@hbc/data-access';
import type { IFinancialRepository } from '@hbc/data-access';

let cachedInstance: IFinancialRepository | null = null;

function getFinancialRepository(): IFinancialRepository {
  if (!cachedInstance) {
    cachedInstance = createFinancialRepository();
  }
  return cachedInstance;
}

/**
 * Returns the singleton Financial repository facade.
 *
 * @example
 * ```ts
 * const repo = useFinancialRepository();
 * const posture = await repo.getModulePosture(projectId, period);
 * ```
 */
export function useFinancialRepository(): IFinancialRepository {
  return useMemo(() => getFinancialRepository(), []);
}

/** Reset the cached instance (for testing). */
export function resetFinancialRepositoryCache(): void {
  cachedInstance = null;
}
