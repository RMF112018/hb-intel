import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resolveSafetyPermissionPosture,
  validateSafetyPermissionPosture,
} from './safety-permission-posture.js';

describe('resolveSafetyPermissionPosture', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to pre-rollout-tightened outside production', () => {
    vi.stubEnv('AZURE_FUNCTIONS_ENVIRONMENT', 'Development');
    delete process.env.SAFETY_PERMISSION_POSTURE;
    expect(resolveSafetyPermissionPosture()).toBe('pre-rollout-tightened');
  });

  it('defaults to steady-state in production', () => {
    vi.stubEnv('AZURE_FUNCTIONS_ENVIRONMENT', 'Production');
    delete process.env.SAFETY_PERMISSION_POSTURE;
    expect(resolveSafetyPermissionPosture()).toBe('steady-state');
  });

  it('honors explicit posture value', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    expect(resolveSafetyPermissionPosture()).toBe('staging-broad');
  });
});

describe('validateSafetyPermissionPosture', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  function setTightenedProofBundle(date = '2026-04-22T13:00:00Z'): void {
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID', 'safety-proof-run-001');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC', date);
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL', 'sites-selected');
  }

  function setRolloutGate(): void {
    vi.stubEnv('SAFETY_ROLLOUT_GATE_ENABLED', 'true');
    vi.stubEnv('SAFETY_ROLLOUT_CHECKPOINT_ID', 'safety-rollout-2026-04-23');
  }

  it('passes for tightened posture when required flags and rollout gate are satisfied', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T15:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    setTightenedProofBundle();
    setRolloutGate();
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.proof.passed).toBe(true);
    expect(result.proof.stale).toBe(false);
    expect(result.gate.passed).toBe(true);
    expect(result.gate.enabled).toBe(true);
    expect(result.gate.checkpointId).toBe('safety-rollout-2026-04-23');
  });

  it('fails tightened posture when SAFETY_ROLLOUT_GATE_ENABLED is not true', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T15:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    setTightenedProofBundle();
    vi.stubEnv('SAFETY_ROLLOUT_CHECKPOINT_ID', 'safety-rollout-2026-04-23');
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.gate.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_ROLLOUT_GATE_NOT_ENABLED');
  });

  it('fails tightened posture when rollout checkpoint id is malformed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T15:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    setTightenedProofBundle();
    vi.stubEnv('SAFETY_ROLLOUT_GATE_ENABLED', 'true');
    vi.stubEnv('SAFETY_ROLLOUT_CHECKPOINT_ID', 'short');
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_ROLLOUT_CHECKPOINT_ID_INVALID');
  });

  it('fails tightened posture when the rollout gate is expired', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T00:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    setTightenedProofBundle('2026-06-01T00:00:00Z');
    setRolloutGate();
    vi.stubEnv('SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC', '2026-06-15T00:00:00Z');
    const result = validateSafetyPermissionPosture();
    expect(result.gate.expired).toBe(true);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_ROLLOUT_GATE_EXPIRED');
  });

  it('rejects tightened proof with an executed-at in the future', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T15:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    setTightenedProofBundle('2027-01-01T00:00:00Z');
    setRolloutGate();
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain(
      'SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_IN_FUTURE',
    );
  });

  it('does not enforce the rollout gate for staging-broad posture', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_REASON', 'Temporary staging until 2026-05-15');
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;
    delete process.env.SAFETY_ROLLOUT_CHECKPOINT_ID;
    const result = validateSafetyPermissionPosture();
    expect(result.gate.passed).toBe(true);
    expect(result.gate.issues).toHaveLength(0);
  });

  it('fails tightened posture when permission model is broad', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    setTightenedProofBundle();
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED');
  });

  it('fails staging-broad without exception confirmation metadata', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    delete process.env.SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED;
    delete process.env.SAFETY_STAGING_BROAD_EXCEPTION_REASON;
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_STAGING_BROAD_EXCEPTION_NOT_CONFIRMED');
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_STAGING_BROAD_EXCEPTION_REASON_MISSING');
  });

  it('fails tightened posture when proof bundle metadata is missing', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    delete process.env.SAFETY_TIGHTENED_PROOF_EVIDENCE_ID;
    delete process.env.SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC;
    delete process.env.SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL;

    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.proof.passed).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING');
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_MISSING');
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_MISSING');
  });

  it('fails steady-state when proof is stale beyond max age', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T10:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'steady-state');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_MAX_AGE_DAYS', '30');
    setTightenedProofBundle('2026-05-01T00:00:00Z');

    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.proof.stale).toBe(true);
    expect(result.issues.map((i) => i.code)).toContain('SAFETY_TIGHTENED_PROOF_STALE');
  });
});
