/**
 * useRepository — Type-safe repository resolver hook.
 *
 * Maps domain keys to their port interfaces and dispatches to
 * the correct `@hbc/data-access` factory function.
 *
 * Supports DI via `setRepositoryOverride()` / `clearRepositoryOverrides()`
 * for testing and dev-harness scenarios.
 *
 * Reference: PH3 §3.1 Step 4, Blueprint §2g
 */

import { useMemo } from 'react';
import type {
  ILeadRepository,
  IScheduleRepository,
  IBuyoutRepository,
  IEstimatingRepository,
  IComplianceRepository,
  IContractRepository,
  IRiskRepository,
  IScorecardRepository,
  IPmpRepository,
  IProjectRepository,
  IAuthRepository,
} from '@hbc/data-access';
import {
  createLeadRepository,
  createScheduleRepository,
  createBuyoutRepository,
  createEstimatingRepository,
  createComplianceRepository,
  createContractRepository,
  createRiskRepository,
  createScorecardRepository,
  createPmpRepository,
  createProjectRepository,
  createAuthRepository,
} from '@hbc/data-access';

// ---------------------------------------------------------------------------
// Repository map — maps domain keys → port interfaces
// ---------------------------------------------------------------------------

export interface RepositoryMap {
  leads: ILeadRepository;
  schedule: IScheduleRepository;
  buyout: IBuyoutRepository;
  estimating: IEstimatingRepository;
  compliance: IComplianceRepository;
  contracts: IContractRepository;
  risk: IRiskRepository;
  scorecard: IScorecardRepository;
  pmp: IPmpRepository;
  project: IProjectRepository;
  auth: IAuthRepository;
}

export type RepositoryKey = keyof RepositoryMap;

// ---------------------------------------------------------------------------
// Factory dispatch — each key maps to its create* function
// ---------------------------------------------------------------------------

const factoryMap: { [K in RepositoryKey]: () => RepositoryMap[K] } = {
  leads: createLeadRepository,
  schedule: createScheduleRepository,
  buyout: createBuyoutRepository,
  estimating: createEstimatingRepository,
  compliance: createComplianceRepository,
  contracts: createContractRepository,
  risk: createRiskRepository,
  scorecard: createScorecardRepository,
  pmp: createPmpRepository,
  project: createProjectRepository,
  auth: createAuthRepository,
};

// ---------------------------------------------------------------------------
// DI overrides for testing
// ---------------------------------------------------------------------------

const overrides = new Map<RepositoryKey, RepositoryMap[RepositoryKey]>();

/** Override a repository instance for testing / dev-harness. */
export function setRepositoryOverride<K extends RepositoryKey>(
  key: K,
  repo: RepositoryMap[K],
): void {
  overrides.set(key, repo);
}

/** Clear all repository overrides. */
export function clearRepositoryOverrides(): void {
  overrides.clear();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns a stable repository instance for the given domain.
 *
 * @param key - Domain key (e.g. 'leads', 'schedule', 'auth')
 * @returns The repository port implementation (mock, proxy, etc.)
 */
export function useRepository<K extends RepositoryKey>(key: K): RepositoryMap[K] {
  return useMemo(() => {
    const override = overrides.get(key) as RepositoryMap[K] | undefined;
    if (override) return override;
    return factoryMap[key]() as RepositoryMap[K];
  }, [key]);
}
