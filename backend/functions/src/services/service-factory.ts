import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { IRedisCacheService } from './redis-cache-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IMsalOboService } from './msal-obo-service.js';
import type { IProjectRequestsService } from './project-requests-service.js';
import type { IAcknowledgmentService } from './acknowledgment-service.js';
import type { IGraphService } from './graph-service.js';
import type { INotificationService } from './notification-service.js';
import { MockSharePointService, SharePointService } from './sharepoint-service.js';
import { MockTableStorageService, RealTableStorageService } from './table-storage-service.js';
import { MockRedisCacheService } from './redis-cache-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { ManagedIdentityOboService, MockMsalOboService } from './msal-obo-service.js';
import { MockProjectRequestsService, RealProjectRequestsService } from './project-requests-service.js';
import { MockAcknowledgmentService, RealAcknowledgmentService } from './acknowledgment-service.js';
import { MockGraphService, GraphService } from './graph-service.js';
import { MockNotificationService, NotificationService } from './notification-service.js';
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
}

let singletonContainer: IServiceContainer | null = null;

export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;

  // B3 Layer 2: Validate and normalize adapter mode; reject invalid/mock-in-production
  const adapterMode = assertAdapterModeValid();
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
  };

  console.log(`[ServiceFactory] Initialized services in "${adapterMode}" mode`);
  return singletonContainer;
}
