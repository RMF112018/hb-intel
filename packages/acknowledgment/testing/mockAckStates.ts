import type {
  IAcknowledgmentConfig,
  IAcknowledgmentParty,
  IAcknowledgmentState,
} from '../src/types/IAcknowledgment';

// ─── Shared Fixtures ────────────────────────────────────────────────────────

export const PARTY_1: IAcknowledgmentParty = {
  userId: 'user-1',
  displayName: 'Alice',
  role: 'PM',
  order: 1,
  required: true,
};

export const PARTY_2: IAcknowledgmentParty = {
  userId: 'user-2',
  displayName: 'Bob',
  role: 'Engineer',
  order: 2,
  required: true,
};

export const BASE_CONFIG: IAcknowledgmentConfig<unknown> = {
  label: 'Test Ack',
  mode: 'parallel',
  contextType: 'admin-provisioning',
  resolveParties: () => [PARTY_1, PARTY_2],
  resolvePromptMessage: () => 'Please acknowledge.',
};

// ─── Canonical States ────────────────────────────────────────────────────────

export const mockAckStates = {
  /** No events acted upon. */
  pending: {
    config: BASE_CONFIG,
    events: [],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'pending',
  } satisfies IAcknowledgmentState,

  /** PARTY_1 acknowledged, PARTY_2 still pending (parallel context). */
  partialParallel: {
    config: BASE_CONFIG,
    events: [
      {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-08T09:00:00Z',
      },
    ],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'partial',
  } satisfies IAcknowledgmentState,

  /** All required parties acknowledged. */
  complete: {
    config: BASE_CONFIG,
    events: [
      {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-08T09:00:00Z',
      },
      {
        partyUserId: 'user-2',
        partyDisplayName: 'Bob',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-08T09:15:00Z',
      },
    ],
    isComplete: true,
    currentSequentialParty: null,
    overallStatus: 'acknowledged',
  } satisfies IAcknowledgmentState,

  /** PARTY_1 declined with reason — workflow blocked (D-09). */
  declined: {
    config: BASE_CONFIG,
    events: [
      {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'declined',
        acknowledgedAt: '2026-03-08T09:05:00Z',
        declineReason: 'Information is incomplete.',
      },
    ],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'declined',
  } satisfies IAcknowledgmentState,

  /** PARTY_1 bypassed by admin (D-01), PARTY_2 acknowledged — complete. */
  bypassed: {
    config: BASE_CONFIG,
    events: [
      {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'bypassed',
        acknowledgedAt: '2026-03-08T08:45:00Z',
        isBypass: true,
        bypassedBy: 'admin@hbc.com',
      },
      {
        partyUserId: 'user-2',
        partyDisplayName: 'Bob',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-08T09:10:00Z',
      },
    ],
    isComplete: true,
    currentSequentialParty: null,
    overallStatus: 'acknowledged',
  } satisfies IAcknowledgmentState,

  /** PARTY_1 acknowledged with isPendingSync (D-02). */
  offlinePending: {
    config: BASE_CONFIG,
    events: [
      {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-08T09:00:00Z',
        isPendingSync: true,
      },
    ],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'partial',
  } satisfies IAcknowledgmentState,
} as const;
