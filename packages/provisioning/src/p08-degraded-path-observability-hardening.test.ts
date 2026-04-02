/**
 * P8-04: Degraded-path, failure-mode, and observability validation hardening.
 *
 * Contract-level tests proving that the Project Setup workflow has documented,
 * traceable degradation behavior for each failure mode, that integration rules
 * guard against known anti-patterns, and that observability coverage (notification
 * tiers, channels, severity escalation) is sufficient for support.
 *
 * Traceability: Phase 8 Prompt-04 — Degraded-Path, Failure-Mode, and Observability Validation Hardening
 * Evidence: docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md
 */
import { describe, expect, it } from 'vitest';
import { PROJECT_SETUP_FAILURE_MODES, getFailureMode } from './failure-modes.js';
import { PROJECT_SETUP_INTEGRATION_RULES } from './integration-rules.js';
import { deriveCurrentOwner } from './bic-config.js';
import { STATE_NOTIFICATION_TARGETS } from './state-machine.js';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
import type { IProjectSetupRequest } from '@hbc/models';

// ─── Test helper ────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-p8-dg',
    projectId: 'proj-p8-dg',
    projectName: 'P8 Degraded Path Test',
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

// Known workspace packages referenced by failure modes
const KNOWN_PACKAGES = new Set([
  '@hbc/session-state',
  '@hbc/bic-next-move',
  '@hbc/notification-intelligence',
  '@hbc/workflow-handoff',
  '@hbc/step-wizard',
  '@hbc/complexity',
]);

// ─── P8-04-DG-01: Failure mode catalog degradation contracts ────────────────

describe('P8-04-DG-01: Failure mode catalog degradation contracts', () => {
  it('every failure mode has a non-empty expectedDegradation describing graceful behavior', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.expectedDegradation).toBeTruthy();
      expect(fm.expectedDegradation.length).toBeGreaterThan(20);
    }
  });

  it('FM-09 (SignalR disconnect) documents polling fallback behavior', () => {
    const fm09 = getFailureMode('FM-09')!;
    expect(fm09.title).toMatch(/SignalR/i);
    expect(fm09.expectedDegradation).toMatch(/polling/i);
    expect(fm09.expectedDegradation).toMatch(/Live updates paused/i);
  });

  it('FM-05 (API submission failure) documents draft preservation', () => {
    const fm05 = getFailureMode('FM-05')!;
    expect(fm05.expectedDegradation).toMatch(/Draft NOT cleared/i);
    expect(fm05.expectedDegradation).toMatch(/retry/i);
  });

  it('FM-08 (complexity tier failure) documents essential-tier fallback', () => {
    const fm08 = getFailureMode('FM-08')!;
    expect(fm08.expectedDegradation).toMatch(/essential/i);
  });

  it('FM-02 (BIC null owner) aligns with deriveCurrentOwner returning null for system-owned states', () => {
    const fm02 = getFailureMode('FM-02')!;
    expect(fm02.scenario).toMatch(/ReadyToProvision|Provisioning/);

    // Cross-validate: deriveCurrentOwner returns null for system-owned states
    expect(deriveCurrentOwner(makeRequest({ state: 'ReadyToProvision' }))).toBeNull();
    expect(deriveCurrentOwner(makeRequest({ state: 'Provisioning' }))).toBeNull();
  });
});

// ─── P8-04-DG-02: Failure mode → affected package traceability ──────────────

describe('P8-04-DG-02: Failure mode → affected package traceability', () => {
  it('every failure mode references at least one affected package', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.affectedPackages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all affected packages are known workspace packages', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      for (const pkg of fm.affectedPackages) {
        expect(KNOWN_PACKAGES.has(pkg)).toBe(true);
      }
    }
  });

  it('no two failure modes share the same fmId', () => {
    const ids = PROJECT_SETUP_FAILURE_MODES.map((fm) => fm.fmId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── P8-04-DG-03: Integration rule anti-pattern/correct-pattern contracts ───

describe('P8-04-DG-03: Integration rule anti-pattern/correct-pattern contracts', () => {
  it('every integration rule has both antiPattern and correctPattern', () => {
    for (const ir of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(ir.antiPattern).toBeTruthy();
      expect(ir.correctPattern).toBeTruthy();
    }
  });

  it('every integration rule names two interacting packages', () => {
    for (const ir of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(ir.packageA).toBeTruthy();
      expect(ir.packageB).toBeTruthy();
      expect(ir.packageA).not.toBe(ir.packageB);
    }
  });

  it('IR-01 (Draft Cleared Only on API Success) aligns with FM-05 (API failure preserves draft)', () => {
    const ir01 = PROJECT_SETUP_INTEGRATION_RULES.find((ir) => ir.ruleId === 'IR-01')!;
    const fm05 = getFailureMode('FM-05')!;

    // Both address the same concern: draft must not be cleared on API failure
    expect(ir01.rule).toMatch(/succeed/i);
    expect(fm05.expectedDegradation).toMatch(/Draft NOT cleared/i);
  });
});

// ─── P8-04-DG-04: Alert severity escalation model contracts ─────────────────

describe('P8-04-DG-04: Alert severity escalation model contracts', () => {
  const findReg = (eventType: string) =>
    PROVISIONING_NOTIFICATION_REGISTRATIONS.find((r) => r.eventType === eventType);

  it('Failed state notification targets include both controller and submitter for multi-party awareness', () => {
    const targets = STATE_NOTIFICATION_TARGETS['Failed']!;
    expect(targets).toContain('controller');
    expect(targets).toContain('submitter');
  });

  it('first-failure notification is immediate tier with push channel', () => {
    const reg = findReg('provisioning.first-failure')!;
    expect(reg).toBeDefined();
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.channels).toContain('push');
  });

  it('second-failure-escalated notification is immediate tier (escalation path)', () => {
    const reg = findReg('provisioning.second-failure-escalated')!;
    expect(reg).toBeDefined();
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.channels).toContain('push');
  });

  it('recovery-resolved notification is watch tier (non-urgent recovery confirmation)', () => {
    const reg = findReg('provisioning.recovery-resolved')!;
    expect(reg).toBeDefined();
    expect(reg.defaultTier).toBe('watch');
  });
});

// ─── P8-04-DG-05: Observability coverage classification register ────────────

describe('P8-04-DG-05: Observability coverage classification register', () => {
  it('all notification registrations use either immediate or watch tier', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(['immediate', 'watch']).toContain(reg.defaultTier);
    }
  });

  it('immediate-tier events include push channel for urgent delivery', () => {
    const immediateRegs = PROVISIONING_NOTIFICATION_REGISTRATIONS.filter(
      (r) => r.defaultTier === 'immediate',
    );
    expect(immediateRegs.length).toBeGreaterThanOrEqual(1);
    for (const reg of immediateRegs) {
      expect(reg.channels).toContain('push');
    }
  });

  it('watch-tier events include in-app channel at minimum', () => {
    const watchRegs = PROVISIONING_NOTIFICATION_REGISTRATIONS.filter(
      (r) => r.defaultTier === 'watch',
    );
    expect(watchRegs.length).toBeGreaterThanOrEqual(1);
    for (const reg of watchRegs) {
      expect(reg.channels).toContain('in-app');
    }
  });

  it('failure events are immediate; recovery event is watch', () => {
    const failureEvents = PROVISIONING_NOTIFICATION_REGISTRATIONS.filter((r) =>
      r.eventType.includes('failure') || r.eventType.includes('escalated'),
    );
    for (const reg of failureEvents) {
      expect(reg.defaultTier).toBe('immediate');
    }

    const recoveryEvent = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.recovery-resolved',
    )!;
    expect(recoveryEvent.defaultTier).toBe('watch');
  });

  it('immediate-tier events are not tier-overridable; watch-tier events are overridable', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      if (reg.defaultTier === 'immediate') {
        expect(reg.tierOverridable).toBe(false);
      } else {
        expect(reg.tierOverridable).toBe(true);
      }
    }
  });
});
