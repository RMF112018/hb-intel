import type { ILeadRepository } from './ports/ILeadRepository.js';
import type { IScheduleRepository } from './ports/IScheduleRepository.js';
import type { IBuyoutRepository } from './ports/IBuyoutRepository.js';
import { MockLeadRepository, MockScheduleRepository, MockBuyoutRepository } from './adapters/mock/index.js';

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
      throw new Error(`LeadRepository adapter "${resolved}" not yet implemented`);
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
      throw new Error(`ScheduleRepository adapter "${resolved}" not yet implemented`);
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
      throw new Error(`BuyoutRepository adapter "${resolved}" not yet implemented`);
  }
}
