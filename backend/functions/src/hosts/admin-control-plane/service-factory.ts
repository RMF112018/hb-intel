import type { ITableStorageService } from '../../services/table-storage-service.js';
import type { IManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import type { IGraphService } from '../../services/graph-service.js';
import type {
  IAdminRunService,
  IAdminAdapterRegistry,
  IAdminConfigService,
  IAdminAuditService,
  IAdminPreflightService,
  IAdminActorContextResolver,
} from '../../services/admin-control-plane/index.js';
import { MockTableStorageService, RealTableStorageService } from '../../services/table-storage-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import { MockGraphService, GraphService } from '../../services/graph-service.js';
import {
  InMemoryAdminRunService,
  AdminAdapterRegistry,
  registerPhase3Adapters,
  StubAdminConfigService,
  StubAdminAuditService,
  StubAdminPreflightService,
  StubAdminActorContextResolver,
} from '../../services/admin-control-plane/index.js';
import { validateAdminControlPlaneStartupConfig } from '../../utils/validate-config.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';

/**
 * Admin Control Plane domain host service container.
 *
 * Contains the services needed for the Admin Control Plane domain boundary.
 * Infrastructure services (tableStorage, managedIdentity, graph) are reused
 * from the shared service layer. Admin-specific services provide the run
 * lifecycle, adapter registry, config, audit, preflight, and actor resolution
 * capabilities required by admin API routes.
 *
 * Phase 3 service inventory:
 * - Infrastructure (eager): tableStorage, managedIdentity, graph
 * - Admin domain (eager): runService, adapterRegistry, configService,
 *   auditService, preflightService, actorContextResolver
 *
 * Intentionally excludes:
 * - Project Setup services (projectRequests, acknowledgments, signalR push)
 * - Domain CRUD services (leads, projects, estimating, etc.)
 * - Provisioning-specific services (saga orchestrator internals)
 *
 * Later Phase 3 prompts (P3-04 through P3-08) will replace stub implementations
 * with real implementations. The container interface is stable; only the
 * factory instantiation changes.
 *
 * See: Phase 3 Summary Plan, P3-02, P3-03
 */
export interface IAdminControlPlaneServiceContainer {
  // ── Infrastructure (reused from shared service layer) ──────────────────────
  readonly tableStorage: ITableStorageService;
  readonly managedIdentity: IManagedIdentityTokenService;
  readonly graph: IGraphService;

  // ── Admin domain services ──────────────────────────────────────────────────
  readonly runService: IAdminRunService;
  readonly adapterRegistry: IAdminAdapterRegistry;
  readonly configService: IAdminConfigService;
  readonly auditService: IAdminAuditService;
  readonly preflightService: IAdminPreflightService;
  readonly actorContextResolver: IAdminActorContextResolver;
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

  // P3-06: Initialize adapter registry with Phase 3 adapter descriptors.
  const adapterRegistry = new AdminAdapterRegistry();
  registerPhase3Adapters(adapterRegistry);

  const container: IAdminControlPlaneServiceContainer = {
    // Infrastructure services — real or mock based on adapter mode
    tableStorage: isMock ? new MockTableStorageService() : new RealTableStorageService(),
    managedIdentity: isMock ? new MockManagedIdentityTokenService() : new ManagedIdentityTokenService(),
    graph: isMock ? new MockGraphService() : new GraphService(),

    // Admin domain services
    runService: new InMemoryAdminRunService(),  // P3-05: in-memory run lifecycle (Phase 4 → Table Storage)
    adapterRegistry: adapterRegistry,           // P3-06: real adapter registry with Phase 3 descriptors
    configService: new StubAdminConfigService(),
    auditService: new StubAdminAuditService(),
    preflightService: new StubAdminPreflightService(),
    actorContextResolver: new StubAdminActorContextResolver(),
  };

  singletonContainer = container;

  console.log(`[AdminControlPlaneServiceFactory] Initialized services in "${adapterMode}" mode (admin services: stub)`);
  return singletonContainer;
}
