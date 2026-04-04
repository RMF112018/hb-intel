/**
 * Admin Control Plane — Observability Error Emitter
 *
 * Fire-and-forget helper for emitting observability error records from
 * API route catch blocks. Follows the provisioning-audit-bridge pattern:
 * errors are logged but never propagated to the caller.
 *
 * Usage in a route handler catch block:
 * ```ts
 * } catch (err) {
 *   emitRouteError(services, { domain: AdminDomain.ProvisioningRollout, ... }, err);
 *   return errorResponse(409, 'INVALID_STATE', message, reqId);
 * }
 * ```
 *
 * @module admin-api/observability
 */

import {
  AdminDomain,
  ObservabilityErrorClassification,
  ObservabilityAlertSeverity,
} from '@hbc/models/admin-control-plane';
import type { ObservabilityErrorSource } from '@hbc/models/admin-control-plane';
import type { IAdminControlPlaneServiceContainer } from '../../hosts/admin-control-plane/service-factory.js';

/**
 * Context for emitting an observability error from a route handler.
 */
export interface IRouteErrorContext {
  /** Admin domain this error belongs to */
  readonly domain: AdminDomain;
  /** Error source classification */
  readonly source: ObservabilityErrorSource;
  /** Operation that failed (e.g., 'cancelRun', 'retryRun') */
  readonly operation: string;
  /** Correlated run ID, null if not tied to a run */
  readonly runId: string | null;
  /** Correlated action key, null if not applicable */
  readonly actionKey: string | null;
}

/**
 * Emit an observability error record from a route handler catch block.
 *
 * Fire-and-forget: errors are logged via console.warn but never
 * propagated back to the caller.
 */
export function emitRouteError(
  services: IAdminControlPlaneServiceContainer,
  ctx: IRouteErrorContext,
  err: unknown,
): void {
  const message = err instanceof Error ? err.message : String(err);
  const title = `${ctx.operation} failed`;

  // Classify based on error message heuristics
  const classification = classifyRouteError(message);
  const severity = classification === ObservabilityErrorClassification.Permissions
    ? ObservabilityAlertSeverity.High
    : ObservabilityAlertSeverity.Medium;

  services.observabilityErrorStore.ingestErrors({
    errors: [{
      domain: ctx.domain,
      source: ctx.source,
      classification,
      severity,
      title,
      message,
      details: null,
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      stepNumber: null,
      occurredAt: new Date().toISOString(),
    }],
  }).catch(bridgeErr => {
    console.warn(
      `[ObservabilityEmitter] Failed to emit error record for ${ctx.operation}: ${bridgeErr instanceof Error ? bridgeErr.message : String(bridgeErr)}`,
    );
  });
}

/**
 * Classify a route error based on message content.
 */
function classifyRouteError(message: string): ObservabilityErrorClassification {
  const lower = message.toLowerCase();
  if (lower.includes('not found')) return ObservabilityErrorClassification.Structural;
  if (lower.includes('permission') || lower.includes('unauthorized') || lower.includes('forbidden'))
    return ObservabilityErrorClassification.Permissions;
  if (lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('network'))
    return ObservabilityErrorClassification.Transient;
  if (lower.includes('invalid state') || lower.includes('conflict'))
    return ObservabilityErrorClassification.AdminClass;
  return ObservabilityErrorClassification.Unclassified;
}
