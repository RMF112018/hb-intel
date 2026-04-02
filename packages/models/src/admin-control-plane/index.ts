/**
 * Admin Control Plane domain models — canonical action vocabulary,
 * risk levels, execution modes, and action descriptors for the
 * IT Control Center generalized admin domain model.
 *
 * @module admin-control-plane
 */

export { AdminDomain, AdminRiskLevel, AdminExecutionMode } from './AdminEnums.js';

export type { AdminActionKey, IAdminActionDescriptor } from './types.js';
