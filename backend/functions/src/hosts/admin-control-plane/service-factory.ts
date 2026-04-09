import type { ITableStorageService } from '../../services/table-storage-service.js';
import type { IManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import type { IGraphService } from '../../services/graph-service.js';
import type { IADDirectoryService } from '../../services/ad-directory-service.js';
import type { IConnectionRegistryService } from '../../services/connection-registry-service.js';
import type { IWhiteGloveRunService } from '../../services/white-glove/white-glove-run-service.js';
import type { IMicrosoftIdentityService } from '../../services/device-management/microsoft/microsoft-identity-service.js';
import type { IMicrosoftIntuneService } from '../../services/device-management/microsoft/microsoft-intune-service.js';
import type { IMicrosoftAutopilotService } from '../../services/device-management/microsoft/microsoft-autopilot-service.js';
import type { IAppleAbmService } from '../../services/device-management/apple/apple-abm-service.js';
import type { IAppleAdeService } from '../../services/device-management/apple/apple-ade-service.js';
import type { IAppleMdmService } from '../../services/device-management/apple/apple-mdm-service.js';
import type { INinjaOneApiService } from '../../services/device-management/ninjaone/ninjaone-api-service.js';
import type { INinjaOneStandardizationService } from '../../services/device-management/ninjaone/ninjaone-standardization-service.js';
import type {
  IAdminRunService,
  IAdminAdapterRegistry,
  IAdminConfigService,
  IAdminAuditService,
  IAdminPreflightService,
  IAdminActorContextResolver,
  IAdminEvidenceService,
  IPnpOpsOrchestrator,
  IAdminAppBindingService,
  IConfigOverrideStore,
  IConfigVersioningService,
  IConfigResolutionService,
  IConfigSnapshotStore,
  IObservabilityAlertStore,
  IObservabilityProbeSnapshotStore,
  IObservabilityErrorStore,
} from '../../services/admin-control-plane/index.js';
import { MockTableStorageService, RealTableStorageService } from '../../services/table-storage-service.js';
import { ManagedIdentityTokenService, MockManagedIdentityTokenService } from '../../services/managed-identity-token-service.js';
import { MockGraphService, GraphService } from '../../services/graph-service.js';
import { MockADDirectoryService, ADDirectoryService } from '../../services/ad-directory-service.js';
import { MockConnectionRegistryService, ConnectionRegistryService } from '../../services/connection-registry-service.js';
import { WhiteGloveRunService, MockWhiteGloveRunService } from '../../services/white-glove/index.js';
import {
  MicrosoftIdentityService, MockMicrosoftIdentityService,
  MicrosoftIntuneService, MockMicrosoftIntuneService,
  MicrosoftAutopilotService, MockMicrosoftAutopilotService,
} from '../../services/device-management/microsoft/index.js';
import {
  AppleAbmService, MockAppleAbmService,
  AppleAdeService, MockAppleAdeService,
  AppleMdmService, MockAppleMdmService,
} from '../../services/device-management/apple/index.js';
import {
  NinjaOneApiService, MockNinjaOneApiService,
  NinjaOneStandardizationService, MockNinjaOneStandardizationService,
} from '../../services/device-management/ninjaone/index.js';
import {
  InMemoryAdminRunService,
  DurableAdminRunStore,
  DurableAdminAuditStore,
  MockAdminAuditStore,
  DurableAdminEvidenceStore,
  MockAdminEvidenceStore,
  DurableAdminAppBindingStore,
  MockAdminAppBindingStore,
  DurableConfigOverrideStore,
  MockConfigOverrideStore,
  ConfigVersioningService,
  ConfigResolutionService,
  DurableConfigSnapshotStore,
  MockConfigSnapshotStore,
  DurableObservabilityAlertStore,
  MockObservabilityAlertStore,
  DurableObservabilityProbeSnapshotStore,
  MockObservabilityProbeSnapshotStore,
  DurableObservabilityErrorStore,
  MockObservabilityErrorStore,
  AdminAdapterRegistry,
  registerPhase3Adapters,
  AdminActorContextResolver,
  StubAdminConfigService,
  StubAdminPreflightService,
  AdminPreflightService,
  PnpOpsOrchestrator,
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
  readonly configOverrideStore: IConfigOverrideStore;
  readonly configVersioning: IConfigVersioningService;
  readonly configSnapshotStore: IConfigSnapshotStore;
  readonly configResolution: IConfigResolutionService;
  readonly auditService: IAdminAuditService;
  readonly evidenceService: IAdminEvidenceService;
  readonly preflightService: IAdminPreflightService;
  readonly pnpOpsOrchestrator: IPnpOpsOrchestrator;
  readonly actorContextResolver: IAdminActorContextResolver;
  readonly bindingService: IAdminAppBindingService;

  // ── P12-04: Observability stores ────────────────────────────────────────────
  readonly observabilityAlertStore: IObservabilityAlertStore;
  readonly observabilityProbeStore: IObservabilityProbeSnapshotStore;
  readonly observabilityErrorStore: IObservabilityErrorStore;

  // ── P9-04: Hybrid identity services ───────────────────────────────────────
  readonly adDirectory: IADDirectoryService;
  readonly connectionRegistry: IConnectionRegistryService;

  // ── P9.1-04: White-glove device deployment ─────────────────────────────────
  readonly whiteGloveRunService: IWhiteGloveRunService;

  // ── P9.1-05: Microsoft device management ──────────────────────────────────
  readonly microsoftIdentityService: IMicrosoftIdentityService;
  readonly microsoftIntuneService: IMicrosoftIntuneService;
  readonly microsoftAutopilotService: IMicrosoftAutopilotService;

  // ── P9.1-06: Apple device management ──────────────────────────────────────
  readonly appleAbmService: IAppleAbmService;
  readonly appleAdeService: IAppleAdeService;
  readonly appleMdmService: IAppleMdmService;

  // ── P9.1-07: NinjaOne standardization ─────────────────────────────────────
  readonly ninjaOneApiService: INinjaOneApiService;
  readonly ninjaOneStandardizationService: INinjaOneStandardizationService;
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
    configOverrideStore: isMock ? new MockConfigOverrideStore() : new DurableConfigOverrideStore(),  // P10-04: live config override persistence
    configVersioning: null as unknown as IConfigVersioningService,  // P10-05: wired below after configOverrideStore is available
    configSnapshotStore: isMock ? new MockConfigSnapshotStore() : new DurableConfigSnapshotStore(),  // P10-06: snapshot persistence
    configResolution: null as unknown as IConfigResolutionService,  // P10-06: wired below after overrideStore + snapshotStore are available
    auditService: isMock ? new MockAdminAuditStore() : new DurableAdminAuditStore(),  // P4-03: durable Table Storage in prod
    evidenceService: isMock ? new MockAdminEvidenceStore() : new DurableAdminEvidenceStore(),  // P4-06: evidence metadata
    preflightService: isMock ? new StubAdminPreflightService() : new AdminPreflightService(),  // P6-04: real preflight in prod, stub for mock/test
    pnpOpsOrchestrator: null as unknown as IPnpOpsOrchestrator,
    actorContextResolver: new AdminActorContextResolver(),  // P3-08: real actor resolver
    bindingService: isMock ? new MockAdminAppBindingStore() : new DurableAdminAppBindingStore(),  // P6A-04: app-binding persistence

    // P12-04: Observability stores
    observabilityAlertStore: isMock ? new MockObservabilityAlertStore() : new DurableObservabilityAlertStore(),
    observabilityProbeStore: isMock ? new MockObservabilityProbeSnapshotStore() : new DurableObservabilityProbeSnapshotStore(),
    observabilityErrorStore: isMock ? new MockObservabilityErrorStore() : new DurableObservabilityErrorStore(),

    // P9-04: Hybrid identity services
    adDirectory: isMock ? new MockADDirectoryService() : new ADDirectoryService(),
    connectionRegistry: isMock ? new MockConnectionRegistryService() : new ConnectionRegistryService(),

    // P9.1-04: White-glove device deployment — placeholder, wired below after container is initialized
    whiteGloveRunService: null as unknown as IWhiteGloveRunService,

    // P9.1-05: Microsoft device management — placeholder, wired below after container is initialized
    microsoftIdentityService: null as unknown as IMicrosoftIdentityService,
    microsoftIntuneService: null as unknown as IMicrosoftIntuneService,
    microsoftAutopilotService: null as unknown as IMicrosoftAutopilotService,

    // P9.1-06: Apple device management — placeholder, wired below after container is initialized
    appleAbmService: null as unknown as IAppleAbmService,
    appleAdeService: null as unknown as IAppleAdeService,
    appleMdmService: null as unknown as IAppleMdmService,

    // P9.1-07: NinjaOne standardization — placeholder, wired below after container is initialized
    ninjaOneApiService: null as unknown as INinjaOneApiService,
    ninjaOneStandardizationService: null as unknown as INinjaOneStandardizationService,
  };

  // Wire config versioning service with the override store
  (container as { configVersioning: IConfigVersioningService }).configVersioning =
    new ConfigVersioningService(container.configOverrideStore);

  // Wire config resolution service with override store and snapshot store
  // Note: catalog entries will be registered by Prompt-09 seeding; empty catalog is safe for now
  (container as { configResolution: IConfigResolutionService }).configResolution =
    new ConfigResolutionService([], container.configOverrideStore, container.configSnapshotStore);

  // Wire white-glove run service with dependencies from the container
  (container as { pnpOpsOrchestrator: IPnpOpsOrchestrator }).pnpOpsOrchestrator =
    new PnpOpsOrchestrator(container.runService, container.auditService, container.evidenceService);

  // Wire white-glove run service with dependencies from the container
  (container as { whiteGloveRunService: IWhiteGloveRunService }).whiteGloveRunService = isMock
    ? new MockWhiteGloveRunService(container.runService, container.auditService, container.evidenceService)
    : new WhiteGloveRunService(container.runService, container.auditService, container.evidenceService);

  // Wire Microsoft device management services
  (container as { microsoftIdentityService: IMicrosoftIdentityService }).microsoftIdentityService = isMock
    ? new MockMicrosoftIdentityService()
    : new MicrosoftIdentityService(container.graph);
  (container as { microsoftIntuneService: IMicrosoftIntuneService }).microsoftIntuneService = isMock
    ? new MockMicrosoftIntuneService()
    : new MicrosoftIntuneService(container.connectionRegistry);
  (container as { microsoftAutopilotService: IMicrosoftAutopilotService }).microsoftAutopilotService = isMock
    ? new MockMicrosoftAutopilotService()
    : new MicrosoftAutopilotService(container.connectionRegistry);

  // Wire Apple device management services
  (container as { appleAbmService: IAppleAbmService }).appleAbmService = isMock
    ? new MockAppleAbmService()
    : new AppleAbmService(container.connectionRegistry);
  (container as { appleAdeService: IAppleAdeService }).appleAdeService = isMock
    ? new MockAppleAdeService()
    : new AppleAdeService(container.connectionRegistry);
  (container as { appleMdmService: IAppleMdmService }).appleMdmService = isMock
    ? new MockAppleMdmService()
    : new AppleMdmService(container.connectionRegistry);

  // Wire NinjaOne services
  (container as { ninjaOneApiService: INinjaOneApiService }).ninjaOneApiService = isMock
    ? new MockNinjaOneApiService()
    : new NinjaOneApiService(container.connectionRegistry);
  (container as { ninjaOneStandardizationService: INinjaOneStandardizationService }).ninjaOneStandardizationService = isMock
    ? new MockNinjaOneStandardizationService()
    : new NinjaOneStandardizationService(container.connectionRegistry);

  singletonContainer = container;

  console.log(`[AdminControlPlaneServiceFactory] Initialized services in "${adapterMode}" mode (admin services: stub)`);
  return singletonContainer;
}
