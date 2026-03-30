import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IManagedIdentityTokenService } from './managed-identity-token-service.js';
import type { IProjectRequestsRepository } from './project-requests-repository.js';
import type { IAcknowledgmentService } from './acknowledgment-service.js';
import type { IGraphService } from './graph-service.js';
import type { INotificationService } from './notification-service.js';
import type { ILeadService } from './lead-service.js';
import type { IProjectService } from './project-service.js';
import type { IEstimatingService } from './estimating-service.js';
import type { IScheduleService } from './schedule-service.js';
import type { IBuyoutService } from './buyout-service.js';
import type { IComplianceService } from './compliance-service.js';
import type { IContractService } from './contract-service.js';
import type { IRiskService } from './risk-service.js';
import type { IScorecardService } from './scorecard-service.js';
import type { IPmpService } from './pmp-service.js';
import type { IIdempotencyStorageService } from './idempotency-storage-service.js';
import { MockSharePointService, SharePointService } from './sharepoint-service.js';
import { MockTableStorageService, RealTableStorageService } from './table-storage-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from './managed-identity-token-service.js';
import { MockProjectRequestsRepository, SharePointProjectRequestsAdapter } from './project-requests-repository.js';
import { MockAcknowledgmentService, RealAcknowledgmentService } from './acknowledgment-service.js';
import { MockGraphService, GraphService } from './graph-service.js';
import { MockNotificationService, NotificationService } from './notification-service.js';
import { MockLeadService, RealLeadService } from './lead-service.js';
import { MockProjectService, RealProjectService } from './project-service.js';
import { MockEstimatingService, RealEstimatingService } from './estimating-service.js';
import { MockScheduleService, RealScheduleService } from './schedule-service.js';
import { MockBuyoutService, RealBuyoutService } from './buyout-service.js';
import { MockComplianceService, RealComplianceService } from './compliance-service.js';
import { MockContractService, RealContractService } from './contract-service.js';
import { MockRiskService, RealRiskService } from './risk-service.js';
import { MockScorecardService, RealScorecardService } from './scorecard-service.js';
import { MockPmpService, RealPmpService } from './pmp-service.js';
import { MockIdempotencyStorageService, RealIdempotencyStorageService } from './idempotency-storage-service.js';
import { validateCoreConfig, validateSharePointConfig } from '../utils/validate-config.js';
import { assertAdapterModeValid } from '../utils/adapter-mode-guard.js';

/**
 * P4-02: Service container interface.
 *
 * Core Project Setup services are eagerly initialized at startup.
 * Domain CRUD services (Phase 1) are lazily initialized on first access
 * to avoid unnecessary dependency coupling for the Project Setup deployment.
 *
 * Redis cache has been removed — it was always mocked and never used.
 */
export interface IServiceContainer {
  // --- Core Project Setup services (eagerly initialized) ---
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  signalR: ISignalRPushService;
  /** P3-04: App-only token acquisition via Managed Identity. */
  managedIdentity: IManagedIdentityTokenService;
  projectRequests: IProjectRequestsRepository;
  acknowledgments: IAcknowledgmentService;
  graph: IGraphService;
  notifications: INotificationService;
  /** P1-D1: Write safety — idempotency record persistence. */
  idempotency: IIdempotencyStorageService;

  // --- Domain CRUD services (P4-02: lazily initialized on first access) ---
  leads: ILeadService;
  projects: IProjectService;
  estimating: IEstimatingService;
  schedule: IScheduleService;
  buyout: IBuyoutService;
  compliance: IComplianceService;
  contracts: IContractService;
  risk: IRiskService;
  scorecards: IScorecardService;
  pmp: IPmpService;
}

let singletonContainer: IServiceContainer | null = null;

export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;

  // B3 Layer 2: Validate and normalize adapter mode; reject invalid/mock-in-production
  const adapterMode = assertAdapterModeValid();

  // P1-C3 §2.1.6: startup.mode.resolved telemetry event (INTEGRATION_READY gate).
  console.log(JSON.stringify({
    level: 'info',
    _telemetryType: 'customEvent',
    name: 'startup.mode.resolved',
    adapterMode,
    environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'Development',
    surface: 'backend',
    timestamp: new Date().toISOString(),
  }));

  const isMock = adapterMode === 'mock' || process.env.NODE_ENV === 'test';

  // P4-02: Tiered validation — core settings validate at startup.
  // SharePoint settings validate on first SP-dependent operation (deferred).
  validateCoreConfig();

  // P4-02: SharePoint config validated here too for backward compatibility,
  // but logged as warning instead of blocking if missing. Full validation
  // still available via validateSharePointConfig() for explicit callers.
  if (!isMock) {
    try {
      validateSharePointConfig();
    } catch (err) {
      console.warn(`[StartupWarning] SharePoint config incomplete — SharePoint-dependent operations may fail at runtime. ${err instanceof Error ? err.message : ''}`);
    }
  }

  // Degraded-mode warnings: settings that have safe fallbacks but reduce functionality
  if (!isMock) {
    if (!process.env.CONTROLLER_UPNS) {
      console.warn('[StartupWarning] CONTROLLER_UPNS not set — role-based state transitions disabled for controllers. Only submitters and admins (if ADMIN_UPNS is set) can advance requests.');
    }
    if (!process.env.ADMIN_UPNS) {
      console.warn('[StartupWarning] ADMIN_UPNS not set — admin role resolution disabled. State transitions limited to submitter resubmit only.');
    }
  }

  const managedIdentity = isMock ? new MockManagedIdentityTokenService() : new ManagedIdentityTokenService();

  // P4-02: Lazy initialization caches for domain CRUD services.
  // These services are not needed for Project Setup core operations
  // and should not block startup or cause coupling issues.
  let _leads: ILeadService | null = null;
  let _projects: IProjectService | null = null;
  let _estimating: IEstimatingService | null = null;
  let _schedule: IScheduleService | null = null;
  let _buyout: IBuyoutService | null = null;
  let _compliance: IComplianceService | null = null;
  let _contracts: IContractService | null = null;
  let _risk: IRiskService | null = null;
  let _scorecards: IScorecardService | null = null;
  let _pmp: IPmpService | null = null;

  const container: IServiceContainer = {
    // --- Core Project Setup services (eagerly initialized) ---
    sharePoint: isMock ? new MockSharePointService() : new SharePointService(),
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    signalR: new MockSignalRPushService(),
    managedIdentity,
    projectRequests: isMock ? new MockProjectRequestsRepository() : new SharePointProjectRequestsAdapter(),
    acknowledgments: isMock ? new MockAcknowledgmentService() : new RealAcknowledgmentService(),
    graph: isMock ? new MockGraphService() : new GraphService(),
    notifications: isMock ? new MockNotificationService() : new NotificationService(),
    idempotency: isMock ? new MockIdempotencyStorageService() : new RealIdempotencyStorageService(),

    // --- Domain CRUD services (P4-02: lazy — created on first property access) ---
    get leads() { return (_leads ??= isMock ? new MockLeadService() : new RealLeadService()); },
    get projects() { return (_projects ??= isMock ? new MockProjectService() : new RealProjectService()); },
    get estimating() { return (_estimating ??= isMock ? new MockEstimatingService() : new RealEstimatingService()); },
    get schedule() { return (_schedule ??= isMock ? new MockScheduleService() : new RealScheduleService()); },
    get buyout() { return (_buyout ??= isMock ? new MockBuyoutService() : new RealBuyoutService()); },
    get compliance() { return (_compliance ??= isMock ? new MockComplianceService() : new RealComplianceService()); },
    get contracts() { return (_contracts ??= isMock ? new MockContractService() : new RealContractService()); },
    get risk() { return (_risk ??= isMock ? new MockRiskService() : new RealRiskService()); },
    get scorecards() { return (_scorecards ??= isMock ? new MockScorecardService() : new RealScorecardService()); },
    get pmp() { return (_pmp ??= isMock ? new MockPmpService() : new RealPmpService()); },
  };

  singletonContainer = container;

  console.log(`[ServiceFactory] Initialized services in "${adapterMode}" mode`);
  return singletonContainer;
}
