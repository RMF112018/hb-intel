import type { ISharePointService } from './sharepoint-service.js';
import type { ITableStorageService } from './table-storage-service.js';
import type { IRedisCacheService } from './redis-cache-service.js';
import type { ISignalRPushService } from './signalr-push-service.js';
import type { IMsalOboService } from './msal-obo-service.js';
import { MockSharePointService } from './sharepoint-service.js';
import { MockTableStorageService } from './table-storage-service.js';
import { MockRedisCacheService } from './redis-cache-service.js';
import { MockSignalRPushService } from './signalr-push-service.js';
import { ManagedIdentityOboService, MockMsalOboService } from './msal-obo-service.js';
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
  const msalObo = mode === 'azure' ? new ManagedIdentityOboService() : new MockMsalOboService();

  singletonContainer = {
    sharePoint: new MockSharePointService(),
    tableStorage: new MockTableStorageService(),
    redisCache: new MockRedisCacheService(),
    signalR: new MockSignalRPushService(),
    // D-PH6-04: azure mode uses Managed Identity; mock mode keeps deterministic dev behavior.
    msalObo,
  };

  console.log(`[ServiceFactory] Initialized services in "${mode}" mode`);
  return singletonContainer;
}
