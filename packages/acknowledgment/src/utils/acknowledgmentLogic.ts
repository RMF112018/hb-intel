import type {
  IAcknowledgmentParty,
  IAcknowledgmentEvent,
  IAcknowledgmentState,
} from '../types/IAcknowledgment';

/**
 * Determines the current sequential party given the party list and event history.
 * Returns null when all required parties have acknowledged (or sequencing is complete).
 */
export function resolveCurrentSequentialParty(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentParty | null {
  const ordered = [...parties]
    .filter((p) => p.required)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const party of ordered) {
    const event = events.find((e) => e.partyUserId === party.userId);
    if (!event || event.status === 'pending') return party;
    if (event.status === 'declined') return null; // blocked (D-09)
  }
  return null; // all acknowledged
}

/**
 * Computes isComplete for a given mode and event set.
 * parallel/single: all required parties acknowledged.
 * sequential: all required parties acknowledged in order (no declines).
 * Any required decline → false (D-09).
 */
export function computeIsComplete(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): boolean {
  const required = parties.filter((p) => p.required);
  return required.every((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'acknowledged' || event?.status === 'bypassed';
  });
}

/**
 * Computes the aggregate overallStatus.
 *
 * Priority order:
 * 1. 'declined'  — any required party has declined (D-09)
 * 2. 'acknowledged' — all required parties acknowledged/bypassed
 * 3. 'partial'   — some (but not all) required parties acknowledged
 * 4. 'pending'   — no acknowledgments yet
 */
export function computeOverallStatus(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentState['overallStatus'] {
  const required = parties.filter((p) => p.required);

  const hasDecline = required.some((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'declined';
  });
  if (hasDecline) return 'declined';

  const acknowledgedCount = required.filter((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'acknowledged' || event?.status === 'bypassed';
  }).length;

  if (acknowledgedCount === required.length) return 'acknowledged';
  if (acknowledgedCount > 0) return 'partial';
  return 'pending';
}

/**
 * Derives a complete IAcknowledgmentState from raw API data.
 * Used in useAcknowledgment to transform API responses into typed state.
 */
export function deriveAcknowledgmentState(
  config: IAcknowledgmentState['config'],
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentState {
  const isComplete = computeIsComplete(parties, events);
  const overallStatus = computeOverallStatus(parties, events);
  const currentSequentialParty =
    config.mode === 'sequential'
      ? resolveCurrentSequentialParty(parties, events)
      : null;

  return {
    config,
    events,
    isComplete,
    currentSequentialParty,
    overallStatus,
  };
}

/**
 * Detects whether a submission failure is a network failure
 * (vs. a logical/server rejection). Network failures are queued
 * offline; logical failures are shown as error toasts. (D-02)
 */
export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof Response) {
    return [0, 408, 503, 504].includes(error.status);
  }
  return false;
}

/** Default confirmation phrase (D-03). */
export const DEFAULT_CONFIRMATION_PHRASE = 'I CONFIRM';

/** Minimum characters for free-text decline reason (D-04). */
export const DECLINE_REASON_MIN_LENGTH = 10;
