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
import { ProxyHttpClient } from './adapters/proxy/ProxyHttpClient.js';
import { ProxyLeadRepository } from './adapters/proxy/ProxyLeadRepository.js';
import { ProxyScheduleRepository } from './adapters/proxy/ProxyScheduleRepository.js';
import { ProxyBuyoutRepository } from './adapters/proxy/ProxyBuyoutRepository.js';
import { ProxyEstimatingRepository } from './adapters/proxy/ProxyEstimatingRepository.js';
import { ProxyComplianceRepository } from './adapters/proxy/ProxyComplianceRepository.js';
import { ProxyContractRepository } from './adapters/proxy/ProxyContractRepository.js';
import { ProxyRiskRepository } from './adapters/proxy/ProxyRiskRepository.js';
import { ProxyScorecardRepository } from './adapters/proxy/ProxyScorecardRepository.js';
import { ProxyPmpRepository } from './adapters/proxy/ProxyPmpRepository.js';
import { ProxyProjectRepository } from './adapters/proxy/ProxyProjectRepository.js';
import type { ProxyConfig } from './adapters/proxy/types.js';

/** Lazy singleton proxy client — initialized on first proxy-mode factory call. */
let proxyClient: ProxyHttpClient | null = null;

function getProxyClient(): ProxyHttpClient {
  if (proxyClient) return proxyClient;
  const config: ProxyConfig = {
    baseUrl: getProxyBaseUrl(),
    accessToken: undefined, // Token set per-request by caller; not at construction time
  };
  proxyClient = new ProxyHttpClient(config);
  return proxyClient;
}

function getProxyBaseUrl(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (globalThis as any).process?.env as Record<string, string> | undefined;
    return env?.HBC_PROXY_BASE_URL ?? env?.VITE_API_BASE_URL ?? 'http://localhost:7071/api';
  } catch {
    return 'http://localhost:7071/api';
  }
}

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
 * Proxy mode (B1): 10 of 11 domain repos implemented (Lead, Schedule, Buyout,
 * Estimating, Compliance, Contract, Risk, Scorecard, PMP, Project).
 * Auth proxy remains blocked on A9 (route paths unresolved).
 * SharePoint and API modes will be added in later phases.
 */

export function createLeadRepository(mode?: AdapterMode): ILeadRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockLeadRepository();
    case 'proxy':
      return new ProxyLeadRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'LeadRepository');
  }
}

export function createScheduleRepository(mode?: AdapterMode): IScheduleRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScheduleRepository();
    case 'proxy':
      return new ProxyScheduleRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScheduleRepository');
  }
}

export function createBuyoutRepository(mode?: AdapterMode): IBuyoutRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockBuyoutRepository();
    case 'proxy':
      return new ProxyBuyoutRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'BuyoutRepository');
  }
}

export function createEstimatingRepository(mode?: AdapterMode): IEstimatingRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockEstimatingRepository();
    case 'proxy':
      return new ProxyEstimatingRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'EstimatingRepository');
  }
}

export function createComplianceRepository(mode?: AdapterMode): IComplianceRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockComplianceRepository();
    case 'proxy':
      return new ProxyComplianceRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ComplianceRepository');
  }
}

export function createContractRepository(mode?: AdapterMode): IContractRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockContractRepository();
    case 'proxy':
      return new ProxyContractRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ContractRepository');
  }
}

export function createRiskRepository(mode?: AdapterMode): IRiskRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockRiskRepository();
    case 'proxy':
      return new ProxyRiskRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'RiskRepository');
  }
}

export function createScorecardRepository(mode?: AdapterMode): IScorecardRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScorecardRepository();
    case 'proxy':
      return new ProxyScorecardRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScorecardRepository');
  }
}

export function createPmpRepository(mode?: AdapterMode): IPmpRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockPmpRepository();
    case 'proxy':
      return new ProxyPmpRepository(getProxyClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'PmpRepository');
  }
}

export function createProjectRepository(mode?: AdapterMode): IProjectRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockProjectRepository();
    case 'proxy':
      return new ProxyProjectRepository(getProxyClient());
    case 'sharepoint':
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
