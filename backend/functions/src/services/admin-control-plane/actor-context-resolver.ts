/**
 * Admin Control Plane — actor context resolver.
 *
 * Resolves the admin actor context from authenticated JWT claims for
 * audit-quality operator identification. Used by all admin endpoints
 * that perform state-changing operations.
 *
 * See: Phase 3 Summary Plan (P3-08)
 *
 * @module admin-control-plane/services
 */

import type { IAdminActorContext } from '@hbc/models/admin-control-plane';
import type { IAdminActorContextResolver, IAdminActorResolverInput } from './types.js';

/**
 * Production actor context resolver.
 *
 * Extracts actor identity from validated JWT claims and timestamps it
 * for audit traceability. The captured context is immutable once created —
 * it represents the operator's identity at the moment of the request.
 */
export class AdminActorContextResolver implements IAdminActorContextResolver {
  resolve(claims: IAdminActorResolverInput): IAdminActorContext {
    return {
      upn: claims.upn,
      objectId: claims.oid,
      displayName: claims.displayName || claims.upn,
      capturedAt: new Date().toISOString(),
    };
  }
}
