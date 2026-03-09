import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
  IUseAcknowledgmentGateReturn,
} from '../types';

/**
 * Determines whether the current user can acknowledge — and whether it is their turn.
 * Pure selector over IAcknowledgmentState — does not fetch independently.
 *
 * Mode logic:
 * - single:     canAcknowledge if user is the listed party and status is pending
 * - parallel:   canAcknowledge if user is a required party, pending, and state is not declined
 * - sequential: canAcknowledge ONLY if user is the currentSequentialParty (D-01)
 */
export function useAcknowledgmentGate<T>(
  config: IAcknowledgmentConfig<T>,
  state: IAcknowledgmentState | undefined,
  item: T,
  currentUserId: string
): IUseAcknowledgmentGateReturn {
  if (!state) {
    return { canAcknowledge: false, isCurrentTurn: false, party: null };
  }

  const parties = config.resolveParties(item);
  const party = parties.find((p) => p.userId === currentUserId) ?? null;

  if (!party) {
    return { canAcknowledge: false, isCurrentTurn: false, party: null };
  }

  const existingEvent = state.events.find((e) => e.partyUserId === currentUserId);
  const alreadyActed =
    existingEvent?.status === 'acknowledged' ||
    existingEvent?.status === 'declined' ||
    existingEvent?.status === 'bypassed';

  // Workflow is blocked by a decline — no further acknowledgments possible (D-09)
  if (state.overallStatus === 'declined') {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  // Workflow is already complete
  if (state.isComplete) {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  if (alreadyActed) {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  if (config.mode === 'sequential') {
    // Sequential: only the currentSequentialParty can act (D-01)
    const isCurrentTurn =
      state.currentSequentialParty?.userId === currentUserId;
    return {
      canAcknowledge: isCurrentTurn && party.required,
      isCurrentTurn,
      party,
    };
  }

  // single / parallel: any pending required party can act
  const isCurrentTurn = party.required;
  return {
    canAcknowledge: party.required,
    isCurrentTurn,
    party,
  };
}
