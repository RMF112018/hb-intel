import type { ISharePointService } from '../../services/sharepoint-service.js';
import type { ITableStorageService } from '../../services/table-storage-service.js';
import type { ISignalRPushService } from '../../services/signalr-push-service.js';
import type { IManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import type { IProjectRequestsRepository } from '../../services/project-requests-repository.js';
import type { IAcknowledgmentService } from '../../services/acknowledgment-service.js';
import type { IGraphService } from '../../services/graph-service.js';
import type { INotificationService } from '../../services/notification-service.js';
import type { IIdempotencyStorageService } from '../../services/idempotency-storage-service.js';
import { MockSharePointService, SharePointService } from '../../services/sharepoint-service.js';
import { MockTableStorageService, RealTableStorageService } from '../../services/table-storage-service.js';
import { RealSignalRPushService, NoOpSignalRPushService, MockSignalRPushService } from '../../services/signalr-push-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import { MockProjectRequestsRepository, SharePointProjectRequestsAdapter } from '../../services/project-requests-repository.js';
import { MockAcknowledgmentService, RealAcknowledgmentService } from '../../services/acknowledgment-service.js';
import { MockGraphService, GraphService } from '../../services/graph-service.js';
import { MockNotificationService, NotificationService } from '../../services/notification-service.js';
import { MockIdempotencyStorageService, RealIdempotencyStorageService } from '../../services/idempotency-storage-service.js';
import { validateCoreConfig, validateSharePointConfig } from '../../utils/validate-config.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';

/**
 * Project Setup domain host service container.
 *
 * Contains only the services needed for the Project Setup domain boundary.
 * Domain CRUD services (leads, projects, estimating, schedule, buyout,
 * compliance, contracts, risk, scorecards, pmp) are intentionally excluded.
 *
 * See: ADR-0124, Phase-1_Backend-Boundary-Freeze.md (AC-2)
 */
export interface IProjectSetupServiceContainer {
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  signalR: ISignalRPushService;
  managedIdentity: IManagedIdentityTokenService;
  projectRequests: IProjectRequestsRepository;
  acknowledgments: IAcknowledgmentService;
  graph: IGraphService;
  notifications: INotificationService;
  idempotency: IIdempotencyStorageService;
}

let singletonContainer: IProjectSetupServiceContainer | null = null;

export function createProjectSetupServiceFactory(): IProjectSetupServiceContainer {
  if (singletonContainer) return singletonContainer;

  const adapterMode = assertAdapterModeValid();

  console.log(JSON.stringify({
    level: 'info',
    _telemetryType: 'customEvent',
    name: 'startup.mode.resolved',
    adapterMode,
    environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'Development',
    surface: 'project-setup-host',
    timestamp: new Date().toISOString(),
  }));

  const isMock = adapterMode === 'mock' || process.env.NODE_ENV === 'test';

  validateCoreConfig();

  if (!isMock) {
    try {
      validateSharePointConfig();
    } catch (err) {
      console.warn(`[StartupWarning] SharePoint config incomplete — SharePoint-dependent operations may fail at runtime. ${err instanceof Error ? err.message : ''}`);
    }
  }

  if (!isMock) {
    if (!process.env.CONTROLLER_UPNS) {
      console.warn('[StartupWarning] CONTROLLER_UPNS not set — role-based state transitions disabled for controllers.');
    }
    if (!process.env.ADMIN_UPNS) {
      console.warn('[StartupWarning] ADMIN_UPNS not set — admin role resolution disabled.');
    }
  }

  const managedIdentity = isMock ? new MockManagedIdentityTokenService() : new ManagedIdentityTokenService();

  const container: IProjectSetupServiceContainer = {
    sharePoint: isMock ? new MockSharePointService() : new SharePointService(),
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    signalR: isMock
      ? new MockSignalRPushService()
      : process.env.AzureSignalRConnectionString
        ? new RealSignalRPushService()
        : new NoOpSignalRPushService(),
    managedIdentity,
    projectRequests: isMock ? new MockProjectRequestsRepository() : new SharePointProjectRequestsAdapter(),
    acknowledgments: isMock ? new MockAcknowledgmentService() : new RealAcknowledgmentService(),
    graph: isMock ? new MockGraphService() : new GraphService(),
    notifications: isMock ? new MockNotificationService() : new NotificationService(),
    idempotency: isMock ? new MockIdempotencyStorageService() : new RealIdempotencyStorageService(),
  };

  singletonContainer = container;

  console.log(`[ProjectSetupServiceFactory] Initialized services in "${adapterMode}" mode`);
  return singletonContainer;
}
