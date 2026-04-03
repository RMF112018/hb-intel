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
  IAdminEvidenceService,
  IAdminAppBindingService,
} from '../../services/admin-control-plane/index.js';
import { MockTableStorageService, RealTableStorageService } from '../../services/table-storage-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import { MockGraphService, GraphService } from '../../services/graph-service.js';
import {
  InMemoryAdminRunService,
  DurableAdminRunStore,
  DurableAdminAuditStore,
  MockAdminAuditStore,
  DurableAdminEvidenceStore,
  MockAdminEvidenceStore,
  DurableAdminAppBindingStore,
  MockAdminAppBindingStore,
  AdminAdapterRegistry,
  registerPhase3Adapters,
  AdminActorContextResolver,
  StubAdminConfigService,
  StubAdminPreflightService,
  AdminPreflightService,
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
  readonly evidenceService: IAdminEvidenceService;
  readonly preflightService: IAdminPreflightService;
  readonly actorContextResolver: IAdminActorContextResolver;
  readonly bindingService: IAdminAppBindingService;
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
    runService: isMock ? new InMemoryAdminRunService() : new DurableAdminRunStore(),  // P4-03: durable Table Storage in prod, in-memory for test
    adapterRegistry: adapterRegistry,           // P3-06: real adapter registry with Phase 3 descriptors
    configService: new StubAdminConfigService(),
    auditService: isMock ? new MockAdminAuditStore() : new DurableAdminAuditStore(),  // P4-03: durable Table Storage in prod
    evidenceService: isMock ? new MockAdminEvidenceStore() : new DurableAdminEvidenceStore(),  // P4-06: evidence metadata
    preflightService: isMock ? new StubAdminPreflightService() : new AdminPreflightService(),  // P6-04: real preflight in prod, stub for mock/test
    actorContextResolver: new AdminActorContextResolver(),  // P3-08: real actor resolver
    bindingService: isMock ? new MockAdminAppBindingStore() : new DurableAdminAppBindingStore(),  // P6A-04: app-binding persistence
  };

  singletonContainer = container;

  console.log(`[AdminControlPlaneServiceFactory] Initialized services in "${adapterMode}" mode (admin services: stub)`);
  return singletonContainer;
}
