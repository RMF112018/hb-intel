/**
 * @hbc/data-access — Ports/adapters data-access layer for HB Intel.
 *
 * This package provides domain-scoped repository interfaces (ports) and
 * swappable adapter implementations (mock, SharePoint, proxy, API).
 *
 * @example
 * ```ts
 * // Import a factory function to get the correct adapter for the runtime mode
 * import { createLeadRepository, createProjectRepository } from '@hbc/data-access';
 *
 * const leads = createLeadRepository();       // defaults to mock in dev
 * const projects = createProjectRepository();
 *
 * // Import types only (zero runtime cost)
 * import type { ILeadRepository, AdapterMode } from '@hbc/data-access';
 * ```
 *
 * **Adapter modes:**
 *
 * | Mode          | Env value     | Use case                  | Status       |
 * |---------------|---------------|---------------------------|--------------|
 * | `mock`        | (default)     | Dev harness / tests       | Implemented  |
 * | `sharepoint`  | `sharepoint`  | SPFx webparts (PnPjs)     | Stub         |
 * | `proxy`       | `proxy`       | PWA (Azure Functions)     | Implemented  |
 * | `api`         | `api`         | Direct REST API           | Stub         |
 *
 * Set `HBC_ADAPTER_MODE` environment variable to switch modes.
 */

// ---------------------------------------------------------------------------
// Ports (type-only re-exports — 11 domains)
// ---------------------------------------------------------------------------
export type { ILeadRepository } from './ports/ILeadRepository.js';
export type { IEstimatingRepository } from './ports/IEstimatingRepository.js';
export type { IScheduleRepository } from './ports/IScheduleRepository.js';
export type { IBuyoutRepository } from './ports/IBuyoutRepository.js';
export type { IComplianceRepository } from './ports/IComplianceRepository.js';
export type { IContractRepository } from './ports/IContractRepository.js';
export type { IRiskRepository } from './ports/IRiskRepository.js';
export type { IScorecardRepository } from './ports/IScorecardRepository.js';
export type { IPmpRepository } from './ports/IPmpRepository.js';
export type { IProjectRepository } from './ports/IProjectRepository.js';
export type { IAuthRepository } from './ports/IAuthRepository.js';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export {
  HbcDataAccessError,
  NotFoundError,
  ValidationError,
  AdapterNotImplementedError,
  wrapError,
} from './errors/index.js';

// ---------------------------------------------------------------------------
// Base repository
// ---------------------------------------------------------------------------
export { BaseRepository } from './adapters/base.js';

// ---------------------------------------------------------------------------
// Mock adapters (11 concrete implementations)
// ---------------------------------------------------------------------------
export {
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
  resetAllMockStores,
} from './adapters/mock/index.js';

// ---------------------------------------------------------------------------
// Factory (11 create functions + adapter mode utilities)
// ---------------------------------------------------------------------------
export {
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
  resolveAdapterMode,
  setProxyContext,
} from './factory.js';
export type { AdapterMode } from './factory.js';
