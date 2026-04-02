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
  IAdminActorContextResolver,
  IAdminActorResolverInput,
} from './types.js';

// In-memory implementations (Phase 3 — replaced by durable implementations in Phase 4)
export { InMemoryAdminRunService } from './in-memory-run-service.js';

// Stub implementations (mock/test mode and services not yet implemented)
export {
  StubAdminRunService,
  StubAdminAdapterRegistry,
  StubAdminConfigService,
  StubAdminAuditService,
  StubAdminPreflightService,
  StubAdminActorContextResolver,
} from './stubs.js';
