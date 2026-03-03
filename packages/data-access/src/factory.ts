import type { ILeadRepository } from './ports/ILeadRepository.js';
import type { IScheduleRepository } from './ports/IScheduleRepository.js';
import type { IBuyoutRepository } from './ports/IBuyoutRepository.js';
import type { IEstimatingRepository } from './ports/IEstimatingRepository.js';
import type { IComplianceRepository } from './ports/IComplianceRepository.js';
import type { IContractRepository } from './ports/IContractRepository.js';
import type { IRiskRepository } from './ports/IRiskRepository.js';
import type { IScorecardRepository } from './ports/IScorecardRepository.js';
import type { IPmpRepository } from './ports/IPmpRepository.js';
import type { IProjectRepository } from './ports/IProjectRepository.js';
import type { IAuthRepository } from './ports/IAuthRepository.js';
import {
  MockLeadRepository,
  MockScheduleRepository,
  MockBuyoutRepository,
  MockEstimatingRepository,
  MockComplianceRepository,
  MockContractRepository,
  MockRiskRepository,
  MockScorecardRepository,
  MockPmpRepository,
  MockProjectRepository,
  MockAuthRepository,
} from './adapters/mock/index.js';
import { AdapterNotImplementedError } from './errors/index.js';

/** Runtime adapter mode resolved from environment. */
export type AdapterMode = 'mock' | 'sharepoint' | 'proxy' | 'api';

/** Detect current adapter mode from environment variables. */
export function resolveAdapterMode(): AdapterMode {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (globalThis as any).process?.env as Record<string, string> | undefined;
    const mode = env?.HBC_ADAPTER_MODE;
    if (mode === 'sharepoint' || mode === 'proxy' || mode === 'api') {
      return mode;
    }
  } catch {
    // No process available (browser context) — fall through to default
  }
  return 'mock';
}

/**
 * Mode-aware factory: returns the correct adapter implementation
 * based on the runtime environment (SPFx → sharepoint, PWA → proxy, dev → mock).
 *
 * Non-mock adapters will throw until their concrete implementations are added
 * in later phases (Phase 4 for proxy, Phase 5 for sharepoint, Phase 7 for api).
 */

export function createLeadRepository(mode?: AdapterMode): ILeadRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockLeadRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'LeadRepository');
  }
}

export function createScheduleRepository(mode?: AdapterMode): IScheduleRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScheduleRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScheduleRepository');
  }
}

export function createBuyoutRepository(mode?: AdapterMode): IBuyoutRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockBuyoutRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'BuyoutRepository');
  }
}

export function createEstimatingRepository(mode?: AdapterMode): IEstimatingRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockEstimatingRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'EstimatingRepository');
  }
}

export function createComplianceRepository(mode?: AdapterMode): IComplianceRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockComplianceRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ComplianceRepository');
  }
}

export function createContractRepository(mode?: AdapterMode): IContractRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockContractRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ContractRepository');
  }
}

export function createRiskRepository(mode?: AdapterMode): IRiskRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockRiskRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'RiskRepository');
  }
}

export function createScorecardRepository(mode?: AdapterMode): IScorecardRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScorecardRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScorecardRepository');
  }
}

export function createPmpRepository(mode?: AdapterMode): IPmpRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockPmpRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'PmpRepository');
  }
}

export function createProjectRepository(mode?: AdapterMode): IProjectRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockProjectRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ProjectRepository');
  }
}

export function createAuthRepository(mode?: AdapterMode): IAuthRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockAuthRepository();
    case 'sharepoint':
    case 'proxy':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'AuthRepository');
  }
}
