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
  });

  it('passes for tightened posture when required flags are confirmed', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('fails tightened posture when permission model is broad', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
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
});
