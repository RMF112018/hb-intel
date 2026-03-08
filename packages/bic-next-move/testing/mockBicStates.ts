import type { IBicNextMoveState } from '../src/types/IBicNextMove';
import { createMockBicOwner } from './createMockBicOwner';

const alice = createMockBicOwner({ userId: 'u-alice', displayName: 'Alice Chen', role: 'BD Manager' });
const bob   = createMockBicOwner({ userId: 'u-bob', displayName: 'Bob Torres', role: 'Director of Preconstruction' });
const carol = createMockBicOwner({ userId: 'u-carol', displayName: 'Carol Kim', role: 'Estimating Coordinator' });
const vp    = createMockBicOwner({ userId: 'u-vp', displayName: 'David Park', role: 'VP Operations' });

const base: IBicNextMoveState = {
  currentOwner: alice,
  expectedAction: 'Complete departmental sections and submit for review',
  dueDate: null,
  isOverdue: false,
  isBlocked: false,
  blockedReason: null,
  previousOwner: null,
  nextOwner: bob,
  escalationOwner: vp,
  transferHistory: [],
  urgencyTier: 'upcoming',
};

/**
 * Canonical IBicNextMoveState fixtures for all 7 BIC states (D-10).
 * Used in component tests and Storybook stories.
 *
 * States covered: upcoming, watch, immediate, overdue, blocked, unassigned, with-full-chain
 */
export const mockBicStates = {

  /** Standard state — owner assigned, due date > 3 business days away */
  upcoming: {
    ...base,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    urgencyTier: 'upcoming' as const,
  },

  /** Due within 3 business days — watch tier */
  watch: {
    ...base,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgencyTier: 'watch' as const,
  },

  /** Due today — immediate tier */
  immediate: {
    ...base,
    dueDate: new Date().toISOString(),
    urgencyTier: 'immediate' as const,
  },

  /** Past due date — overdue */
  overdue: {
    ...base,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: true,
    urgencyTier: 'immediate' as const,
  },

  /** Item is blocked — cannot advance */
  blocked: {
    ...base,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: true,
    blockedReason: 'Waiting on Structural Engineering to complete their section',
    urgencyTier: 'watch' as const,
  },

  /** No owner assigned — D-04 unassigned state */
  unassigned: {
    ...base,
    currentOwner: null,
    urgencyTier: 'immediate' as const, // D-04: forced immediate
  },

  /** Full ownership chain with transfer history — D-08 */
  withFullChain: {
    ...base,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    previousOwner: carol,
    nextOwner: bob,
    escalationOwner: vp,
    urgencyTier: 'upcoming' as const,
    transferHistory: [
      {
        fromOwner: null,
        toOwner: carol,
        transferredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Scorecard created and assigned to Estimating Coordinator',
      },
      {
        fromOwner: carol,
        toOwner: alice,
        transferredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Kickoff meeting scheduled — passed to BD Manager for scorecard completion',
      },
    ],
  },
} satisfies Record<string, IBicNextMoveState>;
