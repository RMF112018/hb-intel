/**
 * P8-02: Lifecycle verification coverage hardening.
 *
 * Consolidated contract-level tests proving the Project Setup lifecycle
 * behaves correctly across state transitions, ownership, visibility,
 * and notification boundaries.
 *
 * Traceability: Phase 8 Prompt-02 — Lifecycle Verification Coverage Hardening
 * Evidence: docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md
 */
import { describe, expect, it } from 'vitest';
import {
  STATE_TRANSITIONS,
  isValidTransition,
  type ProjectSetupRequestState,
} from './state-machine.js';
import {
  deriveCurrentOwner,
  BIC_ROLE_CONTROLLER,
  BIC_ROLE_REQUESTER,
  BIC_ROLE_ADMIN,
  BIC_ROLE_PROJECT_LEAD,
} from './bic-config.js';
import {
  PROJECT_SETUP_STATUS_LABELS,
  STATE_BADGE_VARIANTS,
} from './summary-field-registry.js';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
import type { IProjectSetupRequest } from '@hbc/models';

// ─── Test helper ────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-p8',
    projectId: 'proj-p8',
    projectName: 'P8 Lifecycle Test Project',
    projectLocation: 'Test Location',
    projectType: 'Ground-Up',
    projectStage: 'Pursuit',
    submittedBy: 'coordinator@example.com',
    submittedAt: '2026-04-01T00:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['member@example.com'],
    department: 'commercial',
    projectManagerUpn: 'lead@example.com',
    retryCount: 0,
    ...overrides,
  };
}

const ALL_STATES: ProjectSetupRequestState[] = [
  'Submitted',
  'UnderReview',
  'NeedsClarification',
  'AwaitingExternalSetup',
  'ReadyToProvision',
  'Provisioning',
  'Completed',
  'Failed',
];

// ─── P8-02-LC-01: Full lifecycle path contracts ─────────────────────────────

describe('P8-02-LC-01: Full lifecycle path contracts', () => {
  it('happy path: Submitted → UnderReview → ReadyToProvision → Provisioning → Completed', () => {
    const chain: ProjectSetupRequestState[] = [
      'Submitted',
      'UnderReview',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
    ];
    for (let i = 0; i < chain.length - 1; i++) {
      expect(isValidTransition(chain[i], chain[i + 1])).toBe(true);
    }
  });

  it('clarification path: UnderReview → NeedsClarification → UnderReview (round-trip)', () => {
    expect(isValidTransition('UnderReview', 'NeedsClarification')).toBe(true);
    expect(isValidTransition('NeedsClarification', 'UnderReview')).toBe(true);
  });

  it('external setup path: UnderReview → AwaitingExternalSetup → ReadyToProvision → Provisioning → Completed', () => {
    const chain: ProjectSetupRequestState[] = [
      'UnderReview',
      'AwaitingExternalSetup',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
    ];
    for (let i = 0; i < chain.length - 1; i++) {
      expect(isValidTransition(chain[i], chain[i + 1])).toBe(true);
    }
  });

  it('failure path: Provisioning → Failed', () => {
    expect(isValidTransition('Provisioning', 'Failed')).toBe(true);
  });

  it('recovery path: Failed → UnderReview (reopen for correction)', () => {
    expect(isValidTransition('Failed', 'UnderReview')).toBe(true);
  });

  it('longest lifecycle: submit → review → hold → resolve → provision → fail → reopen → re-approve → provision → complete', () => {
    const chain: ProjectSetupRequestState[] = [
      'Submitted',
      'UnderReview',
      'AwaitingExternalSetup',
      'ReadyToProvision',
      'Provisioning',
      'Failed',
      'UnderReview',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
    ];
    for (let i = 0; i < chain.length - 1; i++) {
      expect(
        isValidTransition(chain[i], chain[i + 1]),
      ).toBe(true);
    }
  });
});

// ─── P8-02-LC-02: Auto-start guard ─────────────────────────────────────────

describe('P8-02-LC-02: Auto-start guard — only ReadyToProvision may enter Provisioning', () => {
  it('ReadyToProvision → Provisioning is the sole valid entry to Provisioning', () => {
    expect(isValidTransition('ReadyToProvision', 'Provisioning')).toBe(true);
  });

  it('no other state may transition directly to Provisioning', () => {
    const nonReadyStates = ALL_STATES.filter((s) => s !== 'ReadyToProvision');
    for (const state of nonReadyStates) {
      expect(isValidTransition(state, 'Provisioning')).toBe(false);
    }
  });
});

// ─── P8-02-LC-03: Terminal state assertions ─────────────────────────────────

describe('P8-02-LC-03: Terminal and constrained state assertions', () => {
  it('Completed is a terminal state with zero outgoing transitions', () => {
    expect(STATE_TRANSITIONS['Completed']).toEqual([]);
  });

  it('Failed has exactly one outgoing transition: → UnderReview', () => {
    expect(STATE_TRANSITIONS['Failed']).toEqual(['UnderReview']);
  });

  it('NeedsClarification has exactly one outgoing transition: → UnderReview', () => {
    expect(STATE_TRANSITIONS['NeedsClarification']).toEqual(['UnderReview']);
  });
});

// ─── P8-02-LC-04: Ownership continuity across lifecycle ─────────────────────

describe('P8-02-LC-04: Ownership continuity across lifecycle', () => {
  it('happy-path ownership: Controller → Controller → null (system) → null (system) → Project Lead', () => {
    const expectations: Array<{ state: ProjectSetupRequestState; role: string | null }> = [
      { state: 'Submitted', role: BIC_ROLE_CONTROLLER },
      { state: 'UnderReview', role: BIC_ROLE_CONTROLLER },
      { state: 'ReadyToProvision', role: null },
      { state: 'Provisioning', role: null },
      { state: 'Completed', role: BIC_ROLE_PROJECT_LEAD },
    ];
    for (const { state, role } of expectations) {
      const owner = deriveCurrentOwner(makeRequest({ state }));
      if (role === null) {
        expect(owner).toBeNull();
      } else {
        expect(owner).not.toBeNull();
        expect(owner!.role).toBe(role);
      }
    }
  });

  it('NeedsClarification ownership: Requester', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'NeedsClarification' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toBe(BIC_ROLE_REQUESTER);
  });

  it('Failed ownership: Admin', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'Failed' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toBe(BIC_ROLE_ADMIN);
  });

  it('AwaitingExternalSetup ownership: Controller', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'AwaitingExternalSetup' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toBe(BIC_ROLE_CONTROLLER);
  });
});

// ─── P8-02-LC-05: Status label and badge completeness ───────────────────────

describe('P8-02-LC-05: Status label and badge completeness for all 8 states', () => {
  it('every state has a non-empty status label', () => {
    for (const state of ALL_STATES) {
      expect(PROJECT_SETUP_STATUS_LABELS[state]).toBeTruthy();
      expect(typeof PROJECT_SETUP_STATUS_LABELS[state]).toBe('string');
    }
  });

  it('every state has a non-empty badge variant', () => {
    for (const state of ALL_STATES) {
      expect(STATE_BADGE_VARIANTS[state]).toBeTruthy();
      expect(typeof STATE_BADGE_VARIANTS[state]).toBe('string');
    }
  });

  it('terminal-state badge assertions: Completed → completed, Failed → error', () => {
    expect(STATE_BADGE_VARIANTS['Completed']).toBe('completed');
    expect(STATE_BADGE_VARIANTS['Failed']).toBe('error');
  });
});

// ─── P8-02-LC-06: Notification coverage at lifecycle boundaries ─────────────

describe('P8-02-LC-06: Notification coverage at lifecycle boundaries', () => {
  const eventTypes = PROVISIONING_NOTIFICATION_REGISTRATIONS.map((r) => r.eventType);

  it('key lifecycle boundaries have associated notification events', () => {
    const requiredEvents = [
      'provisioning.request-submitted',
      'provisioning.clarification-requested',
      'provisioning.ready-to-provision',
      'provisioning.first-failure',
      'provisioning.completed',
    ];
    for (const event of requiredEvents) {
      expect(eventTypes).toContain(event);
    }
  });

  it('every registration has a non-empty eventType and at least one channel', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(reg.eventType).toBeTruthy();
      expect(reg.channels.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has at least 15 notification registrations (G3-T04 count)', () => {
    expect(PROVISIONING_NOTIFICATION_REGISTRATIONS.length).toBeGreaterThanOrEqual(15);
  });
});
