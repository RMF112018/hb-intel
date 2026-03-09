import { describe, it, expect } from 'vitest';
import { useAcknowledgmentGate } from '../useAcknowledgmentGate';
import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
  IAcknowledgmentParty,
  IAcknowledgmentEvent,
} from '../../types';

// ─── Self-contained test fixtures ────────────────────────────────────────────
// Inline mocks since @hbc/acknowledgment/testing utilities are stubs (SF04-T08)

const PARTY_1_ID = 'user-1';
const PARTY_2_ID = 'user-2';
const NON_PARTY_ID = 'user-999';

const party1: IAcknowledgmentParty = {
  userId: PARTY_1_ID,
  displayName: 'Alice',
  role: 'PM',
  order: 1,
  required: true,
};

const party2: IAcknowledgmentParty = {
  userId: PARTY_2_ID,
  displayName: 'Bob',
  role: 'Super',
  order: 2,
  required: true,
};

const optionalParty: IAcknowledgmentParty = {
  userId: 'user-optional',
  displayName: 'Charlie',
  role: 'Observer',
  order: 3,
  required: false,
};

function createConfig(
  mode: 'single' | 'parallel' | 'sequential'
): IAcknowledgmentConfig<unknown> {
  return {
    label: 'Test Acknowledgment',
    mode,
    contextType: 'project-hub-turnover',
    resolveParties: () =>
      mode === 'single' ? [party1] : [party1, party2, optionalParty],
    resolvePromptMessage: () => 'Please acknowledge',
  };
}

function createState(
  overrides: Partial<IAcknowledgmentState> & {
    mode?: 'single' | 'parallel' | 'sequential';
  } = {}
): IAcknowledgmentState {
  const { mode = 'sequential', ...rest } = overrides;
  return {
    config: createConfig(mode),
    events: [],
    isComplete: false,
    currentSequentialParty: party1,
    overallStatus: 'pending',
    ...rest,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useAcknowledgmentGate', () => {
  // The hook is a pure function (no React hooks used), so we call it directly.

  // ── Truth Table Row 1: single — party, required, not acted, not declined ──
  it('single: returns canAcknowledge true for the single required party', () => {
    const config = createConfig('single');
    const state = createState({
      mode: 'single',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(true);
    expect(result.isCurrentTurn).toBe(true);
    expect(result.party).toEqual(party1);
  });

  // ── Truth Table Row 2: single — party, already acted ──
  it('single: returns canAcknowledge false when already acknowledged', () => {
    const config = createConfig('single');
    const event: IAcknowledgmentEvent = {
      partyUserId: PARTY_1_ID,
      partyDisplayName: 'Alice',
      status: 'acknowledged',
      acknowledgedAt: '2026-03-09T00:00:00Z',
    };
    const state = createState({
      mode: 'single',
      events: [event],
      isComplete: true,
      overallStatus: 'acknowledged',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(false);
  });

  // ── Truth Table Row 3: single — non-party user ──
  it('single: returns canAcknowledge false for non-party user', () => {
    const config = createConfig('single');
    const state = createState({
      mode: 'single',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, NON_PARTY_ID);
    expect(result.canAcknowledge).toBe(false);
    expect(result.party).toBeNull();
  });

  // ── Truth Table Row 4: parallel — party, required, not acted, not declined ──
  it('parallel: returns canAcknowledge true for pending required party', () => {
    const config = createConfig('parallel');
    const state = createState({
      mode: 'parallel',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(true);
    expect(result.isCurrentTurn).toBe(true);
  });

  // ── Truth Table Row 5: parallel — declined state (D-09) ──
  it('parallel: returns canAcknowledge false when state is declined (D-09)', () => {
    const config = createConfig('parallel');
    const declineEvent: IAcknowledgmentEvent = {
      partyUserId: PARTY_2_ID,
      partyDisplayName: 'Bob',
      status: 'declined',
      acknowledgedAt: '2026-03-09T00:00:00Z',
      declineReason: 'Not ready',
    };
    const state = createState({
      mode: 'parallel',
      events: [declineEvent],
      overallStatus: 'declined',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(false);
  });

  // ── Truth Table Row 6: parallel — optional party ──
  it('parallel: returns canAcknowledge false for optional (non-required) party', () => {
    const config = createConfig('parallel');
    const state = createState({
      mode: 'parallel',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(
      config,
      state,
      undefined,
      optionalParty.userId
    );
    expect(result.canAcknowledge).toBe(false);
  });

  // ── Truth Table Row 7: sequential — current party's turn ──
  it('sequential: returns canAcknowledge true for current sequential party', () => {
    const config = createConfig('sequential');
    const state = createState({
      mode: 'sequential',
      currentSequentialParty: party1,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(true);
    expect(result.isCurrentTurn).toBe(true);
  });

  // ── Truth Table Row 8: sequential — not current party's turn ──
  it('sequential: returns canAcknowledge false for non-current party', () => {
    const config = createConfig('sequential');
    const state = createState({
      mode: 'sequential',
      currentSequentialParty: party1,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_2_ID);
    expect(result.canAcknowledge).toBe(false);
    expect(result.isCurrentTurn).toBe(false);
  });

  // ── Truth Table Row 9: sequential — declined state (D-09) ──
  it('sequential: returns canAcknowledge false when state is declined (D-09)', () => {
    const config = createConfig('sequential');
    const declineEvent: IAcknowledgmentEvent = {
      partyUserId: PARTY_1_ID,
      partyDisplayName: 'Alice',
      status: 'declined',
      acknowledgedAt: '2026-03-09T00:00:00Z',
      declineReason: 'Scope issue',
    };
    const state = createState({
      mode: 'sequential',
      events: [declineEvent],
      overallStatus: 'declined',
      currentSequentialParty: party1,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(false);
  });

  // ── Edge: undefined state ──
  it('returns canAcknowledge false when state is undefined', () => {
    const config = createConfig('parallel');
    const result = useAcknowledgmentGate(
      config,
      undefined,
      undefined,
      PARTY_1_ID
    );
    expect(result.canAcknowledge).toBe(false);
    expect(result.isCurrentTurn).toBe(false);
    expect(result.party).toBeNull();
  });

  // ── Edge: isComplete ──
  it('returns canAcknowledge false when workflow isComplete', () => {
    const config = createConfig('parallel');
    const events: IAcknowledgmentEvent[] = [
      {
        partyUserId: PARTY_1_ID,
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-09T00:00:00Z',
      },
      {
        partyUserId: PARTY_2_ID,
        partyDisplayName: 'Bob',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-09T00:01:00Z',
      },
    ];
    const state = createState({
      mode: 'parallel',
      events,
      isComplete: true,
      overallStatus: 'acknowledged',
      currentSequentialParty: null,
    });
    const result = useAcknowledgmentGate(config, state, undefined, PARTY_1_ID);
    expect(result.canAcknowledge).toBe(false);
  });
});
