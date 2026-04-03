/**
 * Admin Control Plane services — barrel export.
 *
 * Re-exports all service interfaces and stub implementations for the
 * admin control plane domain host.
 *
 * @module admin-control-plane/services
 */

// Service interfaces
export type {
  IAdminRunService,
  IAdminRunListOptions,
  IAdminRunListResult,
  IAdminAdapterRegistry,
  IAdminConfigService,
  IAdminAuditService,
  IAdminAuditListOptions,
  IAdminPreflightService,
  IAdminEvidenceService,
  EvidenceRetentionClass,
  IAdminActorContextResolver,
  IAdminActorResolverInput,
} from './types.js';

// Durable implementations (Phase 4)
export { DurableAdminRunStore, serializeRunEnvelope, deserializeRunEnvelope } from './admin-run-store.js';
export { DurableAdminAuditStore, MockAdminAuditStore, serializeAuditRecord, deserializeAuditRecord } from './admin-audit-store.js';

// In-memory implementations (Phase 3 — kept for mock/test mode)
export { InMemoryAdminRunService } from './in-memory-run-service.js';

// Adapter registry and Phase 3 adapter set
export { AdminAdapterRegistry } from './adapter-registry.js';
export type { AdapterInvoker } from './adapter-registry.js';
export { registerPhase3Adapters, PHASE_3_ADAPTERS } from './adapters.js';

// Actor context resolver (P3-08)
export { AdminActorContextResolver } from './actor-context-resolver.js';

// Preflight validation service (P6-04)
export { AdminPreflightService } from './preflight-service.js';

// Install checkpoint service (P6-06)
export { getCheckpointInstructions, processCheckpointDecision, resumeAfterCheckpoint } from './install-checkpoint-service.js';
export type { CheckpointInstructions, CheckpointDecisionResult } from './install-checkpoint-service.js';

// Post-install verification service (P6-07)
export { executeVerificationChecks, runPostInstallVerification } from './install-verification-service.js';

// Install/bootstrap orchestrator (P6-05)
export { INSTALL_STEP_CATALOG, buildInitialSteps, executeInstallRun, getInstallStepCatalog } from './install-orchestrator.js';
export type { InstallOrchestratorDeps } from './install-orchestrator.js';

// Evidence service (P4-06)
export { DurableAdminEvidenceStore, MockAdminEvidenceStore, isEvidenceInlineable, generateBlobLocator, EVIDENCE_INLINE_MAX_BYTES } from './evidence-service.js';

// Provisioning audit bridge (P4-04)
export { ProvisioningAuditBridge, createProvisioningAuditBridge } from './provisioning-audit-bridge.js';
export type { ProvisioningBridgeEvent } from './provisioning-audit-bridge.js';

// Orchestration bridge (P3-07)
export {
  mapProvisioningToRunEnvelope,
  mapProvisioningStatus,
  mapProvisioningStepStatus,
  createProvisioningBridgeInvoker,
} from './orchestration-bridge.js';
export type { IProvisioningStatusSnapshot } from './orchestration-bridge.js';

// Stub implementations (mock/test mode and services not yet implemented)
export {
  StubAdminRunService,
  StubAdminAdapterRegistry,
  StubAdminConfigService,
  StubAdminAuditService,
  StubAdminPreflightService,
  StubAdminActorContextResolver,
} from './stubs.js';
