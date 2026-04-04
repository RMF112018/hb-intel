/**
 * Admin Control Plane — Observability Telemetry Bridge
 *
 * Fire-and-forget bridge that normalizes provisioning saga and admin-domain
 * events into durable observability records. Follows the same non-blocking
 * pattern as `provisioning-audit-bridge.ts` — errors are logged but never
 * fail the caller.
 *
 * This bridge converts raw operational events into two durable projections:
 * 1. Alert records (from monitor evaluations)
 * 2. Error records (from saga/admin failures)
 *
 * @module admin-control-plane/services
 */

import type {
  IObservabilityAlertIngestionPayload,
  IObservabilityErrorIngestionPayload,
  IObservabilityAlertRecord,
  IObservabilityErrorRecord,
} from '@hbc/models/admin-control-plane';
import {
  AdminDomain,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityAlertSeverity,
} from '@hbc/models/admin-control-plane';
import type { IObservabilityAlertStore, IObservabilityErrorStore } from './types.js';

// ─── Bridge Event Types ─────────────────────────────────────────────────────────

/** Supported bridge event types for observability normalization. */
export type ObservabilityBridgeEventType =
  | 'saga.failed'
  | 'saga.step.failed'
  | 'admin-run.failed'
  | 'admin-run.step.failed'
  | 'alert.evaluated'
  | 'probe.failed';

/** Input payload for bridge normalization. */
export interface IObservabilityBridgeEvent {
  readonly type: ObservabilityBridgeEventType;
  readonly domain: AdminDomain;
  readonly runId: string | null;
  readonly actionKey: string | null;
  readonly stepNumber: number | null;
  readonly title: string;
  readonly message: string;
  readonly details: Readonly<Record<string, string | number | boolean>> | null;
  readonly occurredAt: string;
  /** Failure classification when available (from saga classify-failure) */
  readonly failureClass: string | null;
}

// ─── Classification Mapping ─────────────────────────────────────────────────────

const FAILURE_CLASS_MAP: Record<string, ObservabilityErrorClassification> = {
  transient: ObservabilityErrorClassification.Transient,
  permissions: ObservabilityErrorClassification.Permissions,
  structural: ObservabilityErrorClassification.Structural,
  repeated: ObservabilityErrorClassification.Repeated,
  'admin-class': ObservabilityErrorClassification.AdminClass,
};

function mapFailureClass(raw: string | null): ObservabilityErrorClassification {
  if (!raw) return ObservabilityErrorClassification.Unclassified;
  return FAILURE_CLASS_MAP[raw] ?? ObservabilityErrorClassification.Unclassified;
}

function mapEventSource(type: ObservabilityBridgeEventType): ObservabilityErrorSource {
  if (type.startsWith('saga.')) return ObservabilityErrorSource.ProvisioningSaga;
  if (type.startsWith('admin-run.')) return ObservabilityErrorSource.AdminRun;
  if (type === 'probe.failed') return ObservabilityErrorSource.InfrastructureProbe;
  return ObservabilityErrorSource.AdminRun;
}

// ─── Bridge Implementation ──────────────────────────────────────────────────────

/**
 * Bridge a failure event into a durable error record.
 *
 * Fire-and-forget: errors are logged but never propagated to the caller.
 */
export async function bridgeFailureToErrorStore(
  errorStore: IObservabilityErrorStore,
  event: IObservabilityBridgeEvent,
): Promise<void> {
  try {
    const payload: IObservabilityErrorIngestionPayload = {
      errors: [{
        domain: event.domain,
        source: mapEventSource(event.type),
        classification: mapFailureClass(event.failureClass),
        severity: event.failureClass === 'repeated' || event.failureClass === 'admin-class'
          ? ObservabilityAlertSeverity.High
          : ObservabilityAlertSeverity.Medium,
        title: event.title,
        message: event.message,
        details: event.details,
        runId: event.runId,
        actionKey: event.actionKey,
        stepNumber: event.stepNumber,
        occurredAt: event.occurredAt,
      }],
    };
    await errorStore.ingestErrors(payload);
  } catch (err) {
    console.warn(`[ObservabilityBridge] Failed to bridge error event: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Bridge alert evaluation results into durable alert records.
 *
 * Fire-and-forget: errors are logged but never propagated to the caller.
 */
export async function bridgeAlertEvaluationToStore(
  alertStore: IObservabilityAlertStore,
  payload: IObservabilityAlertIngestionPayload,
): Promise<readonly IObservabilityAlertRecord[]> {
  try {
    return await alertStore.ingestAlerts(payload);
  } catch (err) {
    console.warn(`[ObservabilityBridge] Failed to bridge alert evaluation: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

/**
 * Create a convenience wrapper that binds stores for repeated use.
 */
export function createObservabilityBridge(
  alertStore: IObservabilityAlertStore,
  errorStore: IObservabilityErrorStore,
) {
  return {
    /** Bridge a failure event into the error store. */
    async bridgeFailure(event: IObservabilityBridgeEvent): Promise<void> {
      return bridgeFailureToErrorStore(errorStore, event);
    },
    /** Bridge alert evaluations into the alert store. */
    async bridgeAlerts(payload: IObservabilityAlertIngestionPayload): Promise<readonly IObservabilityAlertRecord[]> {
      return bridgeAlertEvaluationToStore(alertStore, payload);
    },
  };
}
