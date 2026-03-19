import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { IRedisCacheService } from './redis-cache-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IMsalOboService } from './msal-obo-service.js';
import type { IProjectRequestsService } from './project-requests-service.js';
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
import { MockRedisCacheService } from './redis-cache-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { ManagedIdentityOboService, MockMsalOboService } from './msal-obo-service.js';
import { MockProjectRequestsService, RealProjectRequestsService } from './project-requests-service.js';
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
import { validateRequiredConfig } from '../utils/validate-config.js';
import { assertAdapterModeValid } from '../utils/adapter-mode-guard.js';

export interface IServiceContainer {
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  redisCache: IRedisCacheService;
  signalR: ISignalRPushService;
  msalObo: IMsalOboService;
  projectRequests: IProjectRequestsService;
  acknowledgments: IAcknowledgmentService;
  graph: IGraphService;
  notifications: INotificationService;
  // Phase 1 domain services (P1-C1-a)
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
  // P1-D1: Write safety — idempotency record persistence.
  idempotency: IIdempotencyStorageService;
}

let singletonContainer: IServiceContainer | null = null;

export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;

  // B3 Layer 2: Validate and normalize adapter mode; reject invalid/mock-in-production
  const adapterMode = assertAdapterModeValid();

  // P1-C3 §2.1.6: startup.mode.resolved telemetry event (INTEGRATION_READY gate).
  // Uses console.log with structured JSON because InvocationContext is not available
  // at service factory initialization time. Azure Functions host forwards to App Insights.
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

  // G2.6: Fail fast if required config is missing (skips in mock/test mode)
  validateRequiredConfig();
  const msalObo = isMock ? new MockMsalOboService() : new ManagedIdentityOboService();

  singletonContainer = {
    // D-PH6-05: real SharePoint adapter by default; mocks only in explicit mock/test mode.
    sharePoint: isMock ? new MockSharePointService() : new SharePointService(),
    // D-PH6-06: real table persistence in production, in-memory mock for test/mock mode.
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    redisCache: new MockRedisCacheService(),
    signalR: new MockSignalRPushService(),
    // D-PH6-04: Managed Identity in real mode, mock OBO in test/mock mode.
    msalObo,
    // D-PH6-08: Project Setup Request lifecycle persistence adapter.
    projectRequests: isMock ? new MockProjectRequestsService() : new RealProjectRequestsService(),
    // SF04-T06: Acknowledgment event persistence adapter.
    acknowledgments: isMock ? new MockAcknowledgmentService() : new RealAcknowledgmentService(),
    // W0-G1-T02: Entra ID group management via Microsoft Graph.
    graph: isMock ? new MockGraphService() : new GraphService(),
    // W0-G1-T03: Notification delivery via internal SendNotification endpoint.
    notifications: isMock ? new MockNotificationService() : new NotificationService(),
    // P1-C1-a: Domain CRUD services for all 10 Phase 1 domains.
    leads: isMock ? new MockLeadService() : new RealLeadService(),
    projects: isMock ? new MockProjectService() : new RealProjectService(),
    estimating: isMock ? new MockEstimatingService() : new RealEstimatingService(),
    schedule: isMock ? new MockScheduleService() : new RealScheduleService(),
    buyout: isMock ? new MockBuyoutService() : new RealBuyoutService(),
    compliance: isMock ? new MockComplianceService() : new RealComplianceService(),
    contracts: isMock ? new MockContractService() : new RealContractService(),
    risk: isMock ? new MockRiskService() : new RealRiskService(),
    scorecards: isMock ? new MockScorecardService() : new RealScorecardService(),
    pmp: isMock ? new MockPmpService() : new RealPmpService(),
    // P1-D1: idempotency record storage (real Azure Table; in-memory mock for test/mock mode).
    idempotency: isMock ? new MockIdempotencyStorageService() : new RealIdempotencyStorageService(),
  };

  console.log(`[ServiceFactory] Initialized services in "${adapterMode}" mode`);
  return singletonContainer;
}
