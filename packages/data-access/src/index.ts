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
export type {
  IFinancialRepository,
  IFinancialModulePosture,
  FinancialOperationResult,
  FinancialPagedResult,
  IFinancialForecastSummaryPort,
  IFinancialVersionPort,
  IFinancialChecklistItemPort,
  IFinancialBudgetLinePort,
  IFinancialGCGRLinePort,
  IFinancialGCGRRollupPort,
  IFinancialCashFlowRecordPort,
  IFinancialCashFlowSummaryPort,
  IFinancialBuyoutLinePort,
  IFinancialBuyoutMetricsPort,
  IFinancialAuditEventPort,
  IFinancialPublicationRecordPort,
  IFinancialExportRunPort,
  IFinancialConfirmationGateResultPort,
} from './ports/IFinancialRepository.js';

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
// P1-D1: Retry policy
// ---------------------------------------------------------------------------
export type { RetryPolicy } from './retry/retry-policy.js';
export {
  DEFAULT_RETRY_POLICY,
  READ_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  withRetry,
} from './retry/retry-policy.js';

// ---------------------------------------------------------------------------
// P1-D1: Idempotency context (frontend key generation)
// ---------------------------------------------------------------------------
export type { IdempotencyContext } from './retry/idempotency.js';
export { generateIdempotencyKey, isExpired } from './retry/idempotency.js';

// ---------------------------------------------------------------------------
// P1-D1: Write failure classification
// ---------------------------------------------------------------------------
export { WriteFailureReason, classifyWriteFailure } from './retry/write-safe-error.js';

// ---------------------------------------------------------------------------
// P1-D1: Audit record interface
// ---------------------------------------------------------------------------
export type { IAuditRecord } from './retry/audit.js';

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
  createFinancialRepository,
  createProjectRegistryService,
  resolveAdapterMode,
  setProxyContext,
} from './factory.js';
export type { AdapterMode } from './factory.js';

// ---------------------------------------------------------------------------
// Registry service (Phase 3 Stage 1.5 — single resolution point)
// ---------------------------------------------------------------------------
export type { IProjectRegistryService } from './services/IProjectRegistryService.js';
export { MockProjectRegistryService } from './services/MockProjectRegistryService.js';
export {
  validateReclassificationAuthority,
  executeDepartmentReclassification,
  RECLASSIFICATION_APPROVER_ROLE,
} from './services/departmentReclassification.js';
export type {
  DepartmentReclassificationInput,
  DepartmentReclassificationResult,
} from './services/departmentReclassification.js';

// ---------------------------------------------------------------------------
// Routing normalization (Phase 3 Stage 1.2 — dual-key project identity)
// ---------------------------------------------------------------------------
export {
  detectProjectIdentifierKind,
  normalizeProjectIdentifier,
} from './routing/normalizeProjectIdentifier.js';
export type {
  ProjectIdentifierKind,
  NormalizeProjectIdentifierResult,
} from './routing/normalizeProjectIdentifier.js';
