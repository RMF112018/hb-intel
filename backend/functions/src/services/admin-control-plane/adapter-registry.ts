/**
 * Admin Control Plane — adapter registry implementation.
 *
 * Provides registration, resolution, and invocation of platform-specific
 * adapters through a normalized contract. Route handlers and the orchestrator
 * invoke adapters through this single seam instead of calling platform
 * services directly.
 *
 * Design:
 * - Descriptors are stored in a Map keyed by adapterKey.
 * - Invokers are optional functions registered alongside descriptors.
 * - Invocation without a registered invoker returns a Skipped result.
 * - All invocations return normalized IAdminAdapterResult.
 *
 * See: Phase 2 adapter registry contract, Phase 3 Summary Plan (P3-06)
 *
 * @module admin-control-plane/services
 */

import { AdminAdapterOutcome } from '@hbc/models/admin-control-plane';

import type {
  AdminActionKey,
  IAdminAdapterDescriptor,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
} from '@hbc/models/admin-control-plane';

import type { IAdminAdapterRegistry } from './types.js';

/**
 * Function signature for adapter invocation handlers.
 *
 * Each adapter can register an invoker that receives the invocation context
 * and returns a normalized result. Adapters without invokers are treated as
 * planned/placeholder — invocation returns a Skipped result.
 */
export type AdapterInvoker = (context: IAdminAdapterInvocationContext) => Promise<IAdminAdapterResult>;

/**
 * Concrete adapter registry for the admin control plane.
 *
 * Supports:
 * - Registration of adapter descriptors with optional invokers
 * - Resolution by exact adapter key
 * - Listing all registered adapters or filtering by action domain
 * - Normalized invocation with fallback to Skipped for unimplemented adapters
 */
export class AdminAdapterRegistry implements IAdminAdapterRegistry {
  private readonly descriptors = new Map<string, IAdminAdapterDescriptor>();
  private readonly invokers = new Map<string, AdapterInvoker>();

  /**
   * Register an adapter descriptor with an optional invocation handler.
   *
   * If no invoker is provided, the adapter is registered as metadata-only.
   * Invocation will return a Skipped result indicating the adapter is not
   * yet implemented.
   */
  register(descriptor: IAdminAdapterDescriptor, invoker?: AdapterInvoker): void {
    this.descriptors.set(descriptor.adapterKey, descriptor);
    if (invoker) {
      this.invokers.set(descriptor.adapterKey, invoker);
    }
    console.log(
      `[AdminAdapterRegistry] Registered adapter: ${descriptor.adapterKey} ` +
      `(${descriptor.implementationStatus}${invoker ? ', with invoker' : ''})`,
    );
  }

  resolve(adapterKey: string): IAdminAdapterDescriptor | null {
    return this.descriptors.get(adapterKey) ?? null;
  }

  listAll(): readonly IAdminAdapterDescriptor[] {
    return [...this.descriptors.values()];
  }

  /**
   * List adapters available for a specific action key.
   *
   * Matches adapters whose domains include the domain prefix extracted
   * from the action key (e.g., 'provisioning:site:create' → 'provisioning').
   */
  listForAction(actionKey: AdminActionKey): readonly IAdminAdapterDescriptor[] {
    const domainPrefix = String(actionKey).split(':')[0];
    return [...this.descriptors.values()].filter(d =>
      d.domains.some(domain => domain === domainPrefix),
    );
  }

  /**
   * Invoke an adapter by key with the given context.
   *
   * If the adapter has a registered invoker, calls it and returns the result.
   * If no invoker is registered, returns a normalized Skipped result indicating
   * the adapter is not yet implemented.
   *
   * Catches invoker errors and returns a normalized Failed result.
   */
  async invoke(adapterKey: string, context: IAdminAdapterInvocationContext): Promise<IAdminAdapterResult> {
    const descriptor = this.descriptors.get(adapterKey);
    if (!descriptor) {
      return createSkippedResult(adapterKey, `Adapter '${adapterKey}' is not registered`);
    }

    const invoker = this.invokers.get(adapterKey);
    if (!invoker) {
      return createSkippedResult(
        adapterKey,
        `Adapter '${adapterKey}' is registered but has no invoker (status: ${descriptor.implementationStatus})`,
      );
    }

    const startTime = Date.now();
    try {
      const result = await invoker(context);
      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Unknown adapter error';
      return {
        adapterKey,
        outcome: AdminAdapterOutcome.Failed,
        summary: `Adapter invocation failed: ${message}`,
        durationMs,
        warnings: [],
        issues: [{
          code: 'ADAPTER_INVOCATION_ERROR',
          message,
          resource: null,
          transient: false,
        }],
        remediationHints: [],
        evidenceRefs: [],
        adapterSpecificData: null,
        deduplicatedInvocation: false,
      };
    }
  }
}

/** Create a normalized Skipped result for adapters without invokers. */
function createSkippedResult(adapterKey: string, summary: string): IAdminAdapterResult {
  return {
    adapterKey,
    outcome: AdminAdapterOutcome.Skipped,
    summary,
    durationMs: 0,
    warnings: [],
    issues: [],
    remediationHints: [],
    evidenceRefs: [],
    adapterSpecificData: null,
    deduplicatedInvocation: false,
  };
}
