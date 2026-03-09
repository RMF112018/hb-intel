import { describe, it, expect } from 'vitest';
import {
  computeIsComplete,
  computeOverallStatus,
  resolveCurrentSequentialParty,
  deriveAcknowledgmentState,
  isNetworkFailure,
} from '../acknowledgmentLogic';
import type {
  IAcknowledgmentParty,
  IAcknowledgmentEvent,
} from '../../types/IAcknowledgment';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const party1: IAcknowledgmentParty = {
  userId: 'user-1', displayName: 'Alice', role: 'PM', order: 1, required: true,
};
const party2: IAcknowledgmentParty = {
  userId: 'user-2', displayName: 'Bob', role: 'Engineer', order: 2, required: true,
};
const optionalParty: IAcknowledgmentParty = {
  userId: 'user-3', displayName: 'Carol', role: 'Observer', order: 3, required: false,
};

const parties = [party1, party2];

function event(
  userId: string,
  status: IAcknowledgmentEvent['status'],
  extra?: Partial<IAcknowledgmentEvent>,
): IAcknowledgmentEvent {
  return {
    partyUserId: userId,
    partyDisplayName: userId,
    status,
    acknowledgedAt: status !== 'pending' ? '2026-03-08T09:00:00Z' : null,
    ...extra,
  };
}

// ─── computeIsComplete ──────────────────────────────────────────────────────

describe('computeIsComplete', () => {
  it('returns true when all required parties acknowledged', () => {
    const events = [event('user-1', 'acknowledged'), event('user-2', 'acknowledged')];
    expect(computeIsComplete(parties, events)).toBe(true);
  });

  it('returns false when one required party declined (D-09)', () => {
    const events = [event('user-1', 'declined'), event('user-2', 'acknowledged')];
    expect(computeIsComplete(parties, events)).toBe(false);
  });

  it('counts bypassed as complete (D-01)', () => {
    const events = [event('user-1', 'bypassed'), event('user-2', 'acknowledged')];
    expect(computeIsComplete(parties, events)).toBe(true);
  });

  it('returns true when optional party is still pending', () => {
    const allParties = [...parties, optionalParty];
    const events = [event('user-1', 'acknowledged'), event('user-2', 'acknowledged')];
    expect(computeIsComplete(allParties, events)).toBe(true);
  });

  it('returns false when no events exist', () => {
    expect(computeIsComplete(parties, [])).toBe(false);
  });
});

// ─── computeOverallStatus ───────────────────────────────────────────────────

describe('computeOverallStatus', () => {
  it('returns declined when any required party declined', () => {
    const events = [event('user-1', 'declined')];
    expect(computeOverallStatus(parties, events)).toBe('declined');
  });

  it('returns acknowledged when all required acknowledged', () => {
    const events = [event('user-1', 'acknowledged'), event('user-2', 'acknowledged')];
    expect(computeOverallStatus(parties, events)).toBe('acknowledged');
  });

  it('returns partial when some acknowledged', () => {
    const events = [event('user-1', 'acknowledged')];
    expect(computeOverallStatus(parties, events)).toBe('partial');
  });

  it('returns pending when no events exist', () => {
    expect(computeOverallStatus(parties, [])).toBe('pending');
  });

  it('returns acknowledged when bypass + acknowledged (D-01)', () => {
    const events = [event('user-1', 'bypassed'), event('user-2', 'acknowledged')];
    expect(computeOverallStatus(parties, events)).toBe('acknowledged');
  });
});

// ─── resolveCurrentSequentialParty ──────────────────────────────────────────

describe('resolveCurrentSequentialParty', () => {
  it('returns Party 1 when no events exist', () => {
    expect(resolveCurrentSequentialParty(parties, [])).toEqual(party1);
  });

  it('returns Party 2 when Party 1 acknowledged', () => {
    const events = [event('user-1', 'acknowledged')];
    expect(resolveCurrentSequentialParty(parties, events)).toEqual(party2);
  });

  it('returns null when all acknowledged', () => {
    const events = [event('user-1', 'acknowledged'), event('user-2', 'acknowledged')];
    expect(resolveCurrentSequentialParty(parties, events)).toBeNull();
  });

  it('returns null when Party 1 declined (blocked, D-09)', () => {
    const events = [event('user-1', 'declined')];
    expect(resolveCurrentSequentialParty(parties, events)).toBeNull();
  });
});

// ─── deriveAcknowledgmentState ──────────────────────────────────────────────

describe('deriveAcknowledgmentState', () => {
  it('assembles correct composite from config, parties, and events', () => {
    const config = {
      label: 'Test',
      mode: 'sequential' as const,
      contextType: 'admin-provisioning' as const,
      resolveParties: () => parties,
      resolvePromptMessage: () => 'Please acknowledge.',
    };
    const events = [event('user-1', 'acknowledged')];
    const state = deriveAcknowledgmentState(config, parties, events);

    expect(state.isComplete).toBe(false);
    expect(state.overallStatus).toBe('partial');
    expect(state.currentSequentialParty).toEqual(party2);
    expect(state.events).toBe(events);
    expect(state.config).toBe(config);
  });
});

// ─── isNetworkFailure ───────────────────────────────────────────────────────

describe('isNetworkFailure', () => {
  it('returns true for TypeError with "fetch"', () => {
    expect(isNetworkFailure(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('returns false for Response 403', () => {
    expect(isNetworkFailure(new Response('Forbidden', { status: 403 }))).toBe(false);
  });

  it('returns true for Response 503', () => {
    expect(isNetworkFailure(new Response('Unavailable', { status: 503 }))).toBe(true);
  });

  it('returns true for Response 408', () => {
    expect(isNetworkFailure(new Response('Timeout', { status: 408 }))).toBe(true);
  });

  it('returns false for random Error', () => {
    expect(isNetworkFailure(new Error('Something broke'))).toBe(false);
  });
});
