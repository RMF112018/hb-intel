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

// Stub implementations (mock/test mode)
export {
  StubAdminRunService,
  StubAdminAdapterRegistry,
  StubAdminConfigService,
  StubAdminAuditService,
  StubAdminPreflightService,
  StubAdminActorContextResolver,
} from './stubs.js';
