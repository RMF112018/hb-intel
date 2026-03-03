import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { IRedisCacheService } from './redis-cache-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IMsalOboService } from './msal-obo-service.js';
import { MockSharePointService } from './sharepoint-service.js';
import { MockTableStorageService } from './table-storage-service.js';
import { MockRedisCacheService } from './redis-cache-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { MockMsalOboService } from './msal-obo-service.js';
import { getEnv } from '../utils/env.js';

export interface IServiceContainer {
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  redisCache: IRedisCacheService;
  signalR: ISignalRPushService;
  msalObo: IMsalOboService;
}

let singletonContainer: IServiceContainer | null = null;

export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;

  const mode = getEnv('HBC_SERVICE_MODE', 'mock');

  if (mode === 'azure') {
    // Future: instantiate real Azure implementations
    // For now, fall through to mock
    console.warn('[ServiceFactory] Azure mode requested but not yet implemented — falling back to mock');
  }

  singletonContainer = {
    sharePoint: new MockSharePointService(),
    tableStorage: new MockTableStorageService(),
    redisCache: new MockRedisCacheService(),
    signalR: new MockSignalRPushService(),
    msalObo: new MockMsalOboService(),
  };

  console.log(`[ServiceFactory] Initialized services in "${mode}" mode`);
  return singletonContainer;
}
