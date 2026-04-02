import type { ITableStorageService } from '../../services/table-storage-service.js';
import type { IManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import type { IGraphService } from '../../services/graph-service.js';
import { MockTableStorageService, RealTableStorageService } from '../../services/table-storage-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import { MockGraphService, GraphService } from '../../services/graph-service.js';
import { validateAdminControlPlaneStartupConfig } from '../../utils/validate-config.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';

/**
 * Admin Control Plane domain host service container.
 *
 * Contains only the services needed for the Admin Control Plane domain boundary.
 * This is the minimal foundation — later Phase 3 prompts will expand the
 * container as admin API routes, adapter registry, and orchestration bridge
 * are introduced.
 *
 * Intentionally excludes:
 * - Project Setup services (projectRequests, acknowledgments, signalR push)
 * - Domain CRUD services (leads, projects, estimating, etc.)
 * - Provisioning-specific services (saga orchestrator internals)
 *
 * See: Phase 3 Summary Plan, P3-02
 */
export interface IAdminControlPlaneServiceContainer {
  tableStorage: ITableStorageService;
  managedIdentity: IManagedIdentityTokenService;
  graph: IGraphService;
}

let singletonContainer: IAdminControlPlaneServiceContainer | null = null;

export function createAdminControlPlaneServiceFactory(): IAdminControlPlaneServiceContainer {
  if (singletonContainer) return singletonContainer;

  const adapterMode = assertAdapterModeValid();

  console.log(JSON.stringify({
    level: 'info',
    _telemetryType: 'customEvent',
    name: 'startup.mode.resolved',
    adapterMode,
    environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'Development',
    surface: 'admin-control-plane-host',
    timestamp: new Date().toISOString(),
  }));

  const isMock = adapterMode === 'mock' || process.env.NODE_ENV === 'test';

  // P3-02: Domain-scoped startup validation — only core tier required.
  // Admin-specific prerequisites are validated at execution time, not startup.
  validateAdminControlPlaneStartupConfig();

  const container: IAdminControlPlaneServiceContainer = {
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    managedIdentity: isMock ? new MockManagedIdentityTokenService() : new ManagedIdentityTokenService(),
    graph: isMock ? new MockGraphService() : new GraphService(),
  };

  singletonContainer = container;

  console.log(`[AdminControlPlaneServiceFactory] Initialized services in "${adapterMode}" mode`);
  return singletonContainer;
}
