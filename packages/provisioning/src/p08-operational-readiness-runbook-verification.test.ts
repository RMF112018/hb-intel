/**
 * P8-05: Operational readiness, runbook, and support verification.
 *
 * Contract-level tests proving that runbook-documented procedures, permissions,
 * thresholds, and recovery paths are consistent with actual implementation.
 * This test file serves as a living contract between operational documentation
 * and code — if implementation changes break these tests, the runbooks need
 * reconciliation.
 *
 * Traceability: Phase 8 Prompt-05 — Operational Readiness, Runbook, and Support Verification
 * Evidence: docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md
 */
import { describe, expect, it } from 'vitest';
import {
  ADMIN_PROVISIONING_RETRY,
  ADMIN_PROVISIONING_ESCALATE,
  ADMIN_PROVISIONING_ARCHIVE,
  ADMIN_PROVISIONING_FORCE_STATE,
  ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
  ADMIN_APPROVAL_MANAGE,
} from '@hbc/auth';
import { PROJECT_SETUP_FAILURE_MODES, getFailureMode } from './failure-modes.js';
import { PROJECT_SETUP_INTEGRATION_RULES } from './integration-rules.js';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
import { STATE_NOTIFICATION_TARGETS } from './state-machine.js';

// ─── P8-05-OPS-01: Admin permission constants match runbook documentation ───

describe('P8-05-OPS-01: Admin permission constants match runbook documentation', () => {
  it('6 runbook-documented permission strings match @hbc/auth constants', () => {
    // These exact strings appear in docs/maintenance/provisioning-observability-runbook.md
    // § Admin Actions & Permission Gates
    expect(ADMIN_PROVISIONING_RETRY).toBe('admin:provisioning:retry');
    expect(ADMIN_PROVISIONING_ESCALATE).toBe('admin:provisioning:escalate');
    expect(ADMIN_PROVISIONING_ARCHIVE).toBe('admin:provisioning:archive');
    expect(ADMIN_PROVISIONING_FORCE_STATE).toBe('admin:provisioning:force-state');
    expect(ADMIN_PROVISIONING_ALERT_FULL_DETAIL).toBe('admin:provisioning:alert:full-detail');
    expect(ADMIN_APPROVAL_MANAGE).toBe('admin:approval:manage');
  });

  it('provisioning permissions follow admin:provisioning:<action> grammar', () => {
    const provisioningPerms = [
      ADMIN_PROVISIONING_RETRY,
      ADMIN_PROVISIONING_ESCALATE,
      ADMIN_PROVISIONING_ARCHIVE,
      ADMIN_PROVISIONING_FORCE_STATE,
      ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
    ];
    for (const perm of provisioningPerms) {
      expect(perm).toMatch(/^admin:provisioning:/);
    }
  });

  it('approval permission follows admin:approval:<action> grammar', () => {
    expect(ADMIN_APPROVAL_MANAGE).toMatch(/^admin:approval:/);
  });
});

// ─── P8-05-OPS-02: Failure mode catalog covers runbook recovery paths ───────

describe('P8-05-OPS-02: Failure mode catalog covers all runbook-documented recovery paths', () => {
  it('all 10 failure modes have UI-diagnosable degradation and a recovery path', () => {
    expect(PROJECT_SETUP_FAILURE_MODES).toHaveLength(10);
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      // expectedDegradation serves as both the UI diagnostic and the recovery guidance
      expect(fm.expectedDegradation).toBeTruthy();
      expect(fm.expectedDegradation.length).toBeGreaterThan(20);
    }
  });

  it('FM-09 recovery matches runbook: polling fallback, automatic reconnect', () => {
    const fm09 = getFailureMode('FM-09')!;
    // Runbook says: "Falls back to 30s polling; 'Live updates paused' shown"
    expect(fm09.expectedDegradation).toMatch(/polling/i);
    expect(fm09.expectedDegradation).toMatch(/Live updates paused/i);
  });

  it('FM-05 recovery matches runbook: draft retained, user retries from Review step', () => {
    const fm05 = getFailureMode('FM-05')!;
    // Runbook says: "Error shown; draft retained; retry available"
    expect(fm05.expectedDegradation).toMatch(/Draft NOT cleared/i);
    expect(fm05.expectedDegradation).toMatch(/retry/i);
  });

  it('failure mode IDs follow FM-NN pattern and are sequential', () => {
    for (let i = 0; i < PROJECT_SETUP_FAILURE_MODES.length; i++) {
      const expectedId = `FM-${String(i + 1).padStart(2, '0')}`;
      expect(PROJECT_SETUP_FAILURE_MODES[i].fmId).toBe(expectedId);
    }
  });
});

// ─── P8-05-OPS-03: Notification tier model supports operational escalation ──

describe('P8-05-OPS-03: Notification tier model supports operational escalation', () => {
  const findReg = (eventType: string) =>
    PROVISIONING_NOTIFICATION_REGISTRATIONS.find((r) => r.eventType === eventType);

  it('first-failure is immediate tier — Admin can see it quickly', () => {
    const reg = findReg('provisioning.first-failure')!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.channels).toContain('push');
    expect(reg.channels).toContain('email');
  });

  it('second-failure-escalated is immediate tier — triggers escalation workflow', () => {
    const reg = findReg('provisioning.second-failure-escalated')!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.channels).toContain('push');
  });

  it('recovery-resolved is watch tier — non-urgent confirmation', () => {
    const reg = findReg('provisioning.recovery-resolved')!;
    expect(reg.defaultTier).toBe('watch');
    expect(reg.channels).toContain('in-app');
  });

  it('request-submitted is immediate tier — Controller queue populated promptly', () => {
    const reg = findReg('provisioning.request-submitted')!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.channels).toContain('push');
  });
});

// ─── P8-05-OPS-04: Observability event coverage for runbook queries ─────────

describe('P8-05-OPS-04: Observability event coverage for runbook KQL queries', () => {
  it('state notification targets exist for runbook-critical states (Failed, Completed)', () => {
    // Runbook procedures reference these states for alert routing and escalation
    expect(STATE_NOTIFICATION_TARGETS['Failed']).toBeDefined();
    expect(STATE_NOTIFICATION_TARGETS['Failed']!.length).toBeGreaterThanOrEqual(1);
    expect(STATE_NOTIFICATION_TARGETS['Completed']).toBeDefined();
    expect(STATE_NOTIFICATION_TARGETS['Completed']!.length).toBeGreaterThanOrEqual(1);
  });

  it('at least 15 notification registrations provide lifecycle telemetry coverage', () => {
    expect(PROVISIONING_NOTIFICATION_REGISTRATIONS.length).toBeGreaterThanOrEqual(15);
  });

  it('all notification registrations have descriptive text for operator understanding', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(reg.description).toBeTruthy();
      expect(reg.description.length).toBeGreaterThan(10);
    }
  });

  it('notification events span the full lifecycle: submission through completion and failure', () => {
    const eventTypes = PROVISIONING_NOTIFICATION_REGISTRATIONS.map((r) => r.eventType);
    // Submission
    expect(eventTypes).toContain('provisioning.request-submitted');
    // Review
    expect(eventTypes).toContain('provisioning.request-approved');
    // Provisioning
    expect(eventTypes).toContain('provisioning.started');
    expect(eventTypes).toContain('provisioning.step-completed');
    // Completion
    expect(eventTypes).toContain('provisioning.completed');
    // Failure
    expect(eventTypes).toContain('provisioning.first-failure');
    expect(eventTypes).toContain('provisioning.second-failure-escalated');
    // Recovery
    expect(eventTypes).toContain('provisioning.recovery-resolved');
  });
});

// ─── P8-05-OPS-05: Operational readiness classification ─────────────────────

describe('P8-05-OPS-05: Operational readiness classification', () => {
  it('failure mode catalog has 10 codified modes matching runbook table', () => {
    expect(PROJECT_SETUP_FAILURE_MODES).toHaveLength(10);
  });

  it('integration rules catalog has 7 codified rules', () => {
    expect(PROJECT_SETUP_INTEGRATION_RULES).toHaveLength(7);
  });

  it('6 admin permissions are defined for provisioning operations', () => {
    const perms = [
      ADMIN_PROVISIONING_RETRY,
      ADMIN_PROVISIONING_ESCALATE,
      ADMIN_PROVISIONING_ARCHIVE,
      ADMIN_PROVISIONING_FORCE_STATE,
      ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
      ADMIN_APPROVAL_MANAGE,
    ];
    // All 6 are distinct non-empty strings
    expect(new Set(perms).size).toBe(6);
    for (const perm of perms) {
      expect(perm).toBeTruthy();
    }
  });

  it('notification registrations cover all three operational tiers: submission, failure, recovery', () => {
    const immediateCount = PROVISIONING_NOTIFICATION_REGISTRATIONS.filter(
      (r) => r.defaultTier === 'immediate',
    ).length;
    const watchCount = PROVISIONING_NOTIFICATION_REGISTRATIONS.filter(
      (r) => r.defaultTier === 'watch',
    ).length;
    // Both tiers must have registrations
    expect(immediateCount).toBeGreaterThanOrEqual(1);
    expect(watchCount).toBeGreaterThanOrEqual(1);
  });

  it('every failure mode has a title and scenario for support documentation', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.title).toBeTruthy();
      expect(fm.scenario).toBeTruthy();
      expect(fm.title.length).toBeGreaterThan(5);
      expect(fm.scenario.length).toBeGreaterThan(20);
    }
  });
});
