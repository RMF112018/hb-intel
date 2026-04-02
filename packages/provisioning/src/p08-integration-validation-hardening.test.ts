/**
 * P8-03: Integration and cross-surface workflow validation hardening.
 *
 * Contract-level tests proving that handoffs between surfaces (Estimating →
 * Accounting → Admin → Provisioning) are consistent: state visibility,
 * notification routing, failure catalogs, and ownership transitions agree
 * across all shared registries.
 *
 * Traceability: Phase 8 Prompt-03 — Integration and End-to-End Workflow Validation Hardening
 * Evidence: docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md
 */
import { describe, expect, it } from 'vitest';
import {
  STATE_TRANSITIONS,
  STATE_NOTIFICATION_TARGETS,
  type ProjectSetupRequestState,
} from './state-machine.js';
import {
  deriveCurrentOwner,
  PROJECT_SETUP_ACTION_MAP,
} from './bic-config.js';
import {
  PROJECT_SETUP_STATUS_LABELS,
  STATE_BADGE_VARIANTS,
} from './summary-field-registry.js';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
import { PROJECT_SETUP_FAILURE_MODES, getFailureMode } from './failure-modes.js';
import { PROJECT_SETUP_INTEGRATION_RULES, getIntegrationRule } from './integration-rules.js';
import type { IProjectSetupRequest } from '@hbc/models';

// ─── Test helper ────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-p8-int',
    projectId: 'proj-p8-int',
    projectName: 'P8 Integration Test Project',
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

const ALL_STATES: ProjectSetupRequestState[] = Object.keys(
  STATE_TRANSITIONS,
) as ProjectSetupRequestState[];

// ─── P8-03-INT-01: Cross-surface state visibility contract ──────────────────

describe('P8-03-INT-01: Cross-surface state visibility contract', () => {
  it('all 8 states have entries in status labels, badge variants, and action map', () => {
    expect(ALL_STATES).toHaveLength(8);
    for (const state of ALL_STATES) {
      expect(PROJECT_SETUP_STATUS_LABELS[state]).toBeTruthy();
      expect(STATE_BADGE_VARIANTS[state]).toBeTruthy();
      expect(PROJECT_SETUP_ACTION_MAP[state]).toBeTruthy();
    }
  });

  it('every action string is a non-empty human-readable description', () => {
    for (const state of ALL_STATES) {
      const action = PROJECT_SETUP_ACTION_MAP[state];
      expect(action.length).toBeGreaterThan(10);
    }
  });

  it('multi-surface states have notification targets defined', () => {
    const multiSurfaceStates: ProjectSetupRequestState[] = [
      'Submitted',
      'UnderReview',
      'NeedsClarification',
      'Failed',
      'Completed',
    ];
    for (const state of multiSurfaceStates) {
      expect(STATE_NOTIFICATION_TARGETS[state]).toBeDefined();
      expect(STATE_NOTIFICATION_TARGETS[state]!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('system-owned states return null from deriveCurrentOwner; human-owned states return a role', () => {
    const systemOwned: ProjectSetupRequestState[] = ['ReadyToProvision', 'Provisioning'];
    const humanOwned: ProjectSetupRequestState[] = [
      'Submitted',
      'UnderReview',
      'NeedsClarification',
      'AwaitingExternalSetup',
      'Completed',
      'Failed',
    ];

    for (const state of systemOwned) {
      expect(deriveCurrentOwner(makeRequest({ state }))).toBeNull();
    }
    for (const state of humanOwned) {
      const owner = deriveCurrentOwner(makeRequest({ state }));
      expect(owner).not.toBeNull();
      expect(owner!.role).toBeTruthy();
    }
  });
});

// ─── P8-03-INT-02: Notification routing aligns with state ownership ─────────

describe('P8-03-INT-02: Notification routing aligns with state ownership', () => {
  it('NeedsClarification notifies submitter — matches Requester ownership', () => {
    expect(STATE_NOTIFICATION_TARGETS['NeedsClarification']).toContain('submitter');
    const owner = deriveCurrentOwner(makeRequest({ state: 'NeedsClarification' }));
    expect(owner!.role).toMatch(/requester/i);
  });

  it('Failed notifies both controller and submitter — matches Admin ownership with multi-party awareness', () => {
    const targets = STATE_NOTIFICATION_TARGETS['Failed']!;
    expect(targets).toContain('controller');
    expect(targets).toContain('submitter');
  });

  it('Completed notifies group — matches Project Lead ownership', () => {
    expect(STATE_NOTIFICATION_TARGETS['Completed']).toContain('group');
    const owner = deriveCurrentOwner(makeRequest({ state: 'Completed' }));
    expect(owner!.role).toMatch(/project lead/i);
  });

  it('every notification registration has a provisioning. prefix and at least one channel', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(reg.eventType).toMatch(/^provisioning\./);
      expect(reg.channels.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── P8-03-INT-03: Failure mode and integration rule catalog completeness ───

describe('P8-03-INT-03: Failure mode and integration rule catalog completeness', () => {
  it('all 10 failure modes (FM-01–FM-10) have required fields', () => {
    expect(PROJECT_SETUP_FAILURE_MODES).toHaveLength(10);
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.fmId).toBeTruthy();
      expect(fm.scenario).toBeTruthy();
      expect(fm.expectedDegradation).toBeTruthy();
      expect(fm.affectedPackages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('getFailureMode retrieves each FM by ID', () => {
    for (let i = 1; i <= 10; i++) {
      const id = `FM-${String(i).padStart(2, '0')}`;
      const fm = getFailureMode(id);
      expect(fm).toBeDefined();
      expect(fm!.fmId).toBe(id);
    }
  });

  it('all 7 integration rules (IR-01–IR-07) have required fields', () => {
    expect(PROJECT_SETUP_INTEGRATION_RULES).toHaveLength(7);
    for (const ir of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(ir.ruleId).toBeTruthy();
      expect(ir.rule).toBeTruthy();
      expect(ir.antiPattern).toBeTruthy();
      expect(ir.correctPattern).toBeTruthy();
    }
  });

  it('getIntegrationRule retrieves each IR by ID', () => {
    for (let i = 1; i <= 7; i++) {
      const id = `IR-${String(i).padStart(2, '0')}`;
      const ir = getIntegrationRule(id);
      expect(ir).toBeDefined();
      expect(ir!.ruleId).toBe(id);
    }
  });
});

// ─── P8-03-INT-04: Cross-surface handoff data contracts ─────────────────────

describe('P8-03-INT-04: Cross-surface handoff data contracts', () => {
  it('approval handoff: ReadyToProvision is system-owned — proves handoff to provisioning runtime', () => {
    expect(STATE_TRANSITIONS['UnderReview']).toContain('ReadyToProvision');
    const owner = deriveCurrentOwner(makeRequest({ state: 'ReadyToProvision' }));
    expect(owner).toBeNull();
  });

  it('failure handoff: Failed state ownership is Admin — proves handoff to exception handling', () => {
    expect(STATE_TRANSITIONS['Provisioning']).toContain('Failed');
    const owner = deriveCurrentOwner(makeRequest({ state: 'Failed' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toMatch(/admin/i);
  });

  it('recovery handoff: Failed → UnderReview restores Controller ownership', () => {
    expect(STATE_TRANSITIONS['Failed']).toContain('UnderReview');
    const owner = deriveCurrentOwner(makeRequest({ state: 'UnderReview' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toMatch(/controller/i);
  });

  it('clarification round-trip flips ownership correctly: Controller → Requester → Controller', () => {
    const reviewOwner = deriveCurrentOwner(makeRequest({ state: 'UnderReview' }));
    const clarOwner = deriveCurrentOwner(makeRequest({ state: 'NeedsClarification' }));
    const backToReview = deriveCurrentOwner(makeRequest({ state: 'UnderReview' }));

    expect(reviewOwner!.role).toMatch(/controller/i);
    expect(clarOwner!.role).toMatch(/requester/i);
    expect(backToReview!.role).toMatch(/controller/i);
  });

  it('every ownership-changing transition has a notification target on the destination state', () => {
    for (const [fromStr, destinations] of Object.entries(STATE_TRANSITIONS)) {
      const from = fromStr as ProjectSetupRequestState;
      const fromOwner = deriveCurrentOwner(makeRequest({ state: from }));

      for (const to of destinations) {
        const toOwner = deriveCurrentOwner(makeRequest({ state: to }));
        const ownerChanged =
          (fromOwner === null) !== (toOwner === null) ||
          (fromOwner !== null && toOwner !== null && fromOwner.role !== toOwner.role);

        if (ownerChanged && toOwner !== null) {
          // Non-system destination states with ownership changes should have notification targets
          expect(
            STATE_NOTIFICATION_TARGETS[to],
          ).toBeDefined();
        }
      }
    }
  });
});

// ─── P8-03-INT-05: Environment-gated validation register ────────────────────

describe('P8-03-INT-05: Environment-gated validation register (structural assertions)', () => {
  it('state model has exactly 8 members', () => {
    expect(ALL_STATES).toHaveLength(8);
  });

  it('every state in STATE_TRANSITIONS is covered by status labels', () => {
    for (const state of ALL_STATES) {
      expect(state in PROJECT_SETUP_STATUS_LABELS).toBe(true);
    }
  });

  it('every state in STATE_TRANSITIONS is covered by badge variants', () => {
    for (const state of ALL_STATES) {
      expect(state in STATE_BADGE_VARIANTS).toBe(true);
    }
  });

  it('notification registrations total at least 15 (G1-T03 8 + G3-T04 7)', () => {
    expect(PROVISIONING_NOTIFICATION_REGISTRATIONS.length).toBeGreaterThanOrEqual(15);
  });

  it('failure mode and integration rule catalogs are non-empty', () => {
    expect(PROJECT_SETUP_FAILURE_MODES.length).toBe(10);
    expect(PROJECT_SETUP_INTEGRATION_RULES.length).toBe(7);
  });
});
