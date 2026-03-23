/**
 * SF28-T03 — Event normalization pipeline.
 *
 * Transforms IActivityEmissionInput (module-provided) into IActivityEvent
 * (canonical normalized form). Generates event ID, completes actor
 * attribution, assigns timestamps, sets initial confidence/sync state.
 *
 * Governing: SF28-T03, L-02 (append-only truth)
 */

import type {
  IActivityEmissionInput,
  IActivityEvent,
  IActivityActorAttribution,
  IActivityContextStamp,
} from '../types/index.js';

const MAX_SUMMARY_LENGTH = 280;

/**
 * Normalize an emission input into a canonical IActivityEvent.
 *
 * Pure function — no side effects. Caller handles persistence.
 *
 * @param input - Module-provided emission input
 * @param now - Reference time (defaults to current time)
 * @returns Normalized IActivityEvent ready for append-only storage
 * @throws Error if validation fails (missing required fields, summary too long)
 */
export function normalizeActivityEvent(
  input: IActivityEmissionInput,
  now: Date = new Date(),
): IActivityEvent {
  // Validation
  if (!input.summary || input.summary.length > MAX_SUMMARY_LENGTH) {
    throw new Error(
      `Summary is required and must be ≤ ${MAX_SUMMARY_LENGTH} characters (got ${input.summary?.length ?? 0}).`,
    );
  }

  if (!input.primaryRef.moduleKey || !input.primaryRef.recordId) {
    throw new Error('Primary reference must have moduleKey and recordId.');
  }

  if (!input.actor.initiatedByUpn || !input.actor.initiatedByName) {
    throw new Error('Actor must have initiatedByUpn and initiatedByName.');
  }

  // Complete actor attribution
  const actor: IActivityActorAttribution = {
    type: input.actor.type ?? 'user',
    initiatedByUpn: input.actor.initiatedByUpn,
    initiatedByName: input.actor.initiatedByName,
    executedByUpn: input.actor.executedByUpn,
    executedByName: input.actor.executedByName,
    onBehalfOfUpn: input.actor.onBehalfOfUpn,
    onBehalfOfName: input.actor.onBehalfOfName,
    serviceIdentity: input.actor.serviceIdentity,
  };

  // Build context stamp
  const context: IActivityContextStamp = {
    sourceModuleKey: input.primaryRef.moduleKey,
    emission: 'remote',
    correlationId: input.correlationId,
  };

  const timestampIso = now.toISOString();

  return {
    eventId: crypto.randomUUID(),
    type: input.type,
    actor,
    primaryRef: input.primaryRef,
    relatedRefs: input.relatedRefs ?? [],
    timestampIso,
    summary: input.summary,
    details: input.details ?? null,
    diffEntries: input.diffEntries ?? [],
    context,
    confidence: 'trusted-authoritative',
    syncState: 'authoritative',
    recommendedOpenAction: null,
    dedupe: null,
  };
}
