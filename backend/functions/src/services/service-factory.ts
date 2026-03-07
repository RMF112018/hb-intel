import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { IRedisCacheService } from './redis-cache-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IMsalOboService } from './msal-obo-service.js';
import type { IProjectRequestsService } from './project-requests-service.js';
import { MockSharePointService, SharePointService } from './sharepoint-service.js';
import { MockTableStorageService, RealTableStorageService } from './table-storage-service.js';
import { MockRedisCacheService } from './redis-cache-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { ManagedIdentityOboService, MockMsalOboService } from './msal-obo-service.js';
import { MockProjectRequestsService, RealProjectRequestsService } from './project-requests-service.js';

export interface IServiceContainer {
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  redisCache: IRedisCacheService;
  signalR: ISignalRPushService;
  msalObo: IMsalOboService;
  projectRequests: IProjectRequestsService;
}

let singletonContainer: IServiceContainer | null = null;

export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;

  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'real';
  const isMock = adapterMode === 'mock' || process.env.NODE_ENV === 'test';
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
  };

  console.log(`[ServiceFactory] Initialized services in "${isMock ? 'mock' : 'real'}" mode`);
  return singletonContainer;
}
