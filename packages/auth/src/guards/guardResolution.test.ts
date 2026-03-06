import { describe, expect, it } from 'vitest';
import { resolveGuardResolution } from './guardResolution.js';

describe('resolveGuardResolution', () => {
  it('fails runtime guard before auth/role/permission checks', () => {
    const result = resolveGuardResolution({
      lifecyclePhase: 'authenticated',
      runtimeMode: 'spfx',
      resolvedRoles: ['Administrator'],
      requiredRole: 'Administrator',
      requiredPermission: 'settings:write',
      hasPermission: true,
      supportedRuntimeModes: ['pwa-msal'],
    });

    expect(result.allow).toBe(false);
    expect(result.failureKind).toBe('runtime-unsupported');
  });

  it('returns reauth-required for explicit lifecycle phase', () => {
    const result = resolveGuardResolution({
      lifecyclePhase: 'reauth-required',
      runtimeMode: 'pwa-msal',
      resolvedRoles: [],
    });
    expect(result.failureKind).toBe('reauth-required');
    expect(result.shouldCaptureRedirect).toBe(true);
  });

  it('returns role-denied when required role is missing', () => {
    const result = resolveGuardResolution({
      lifecyclePhase: 'authenticated',
      runtimeMode: 'pwa-msal',
      resolvedRoles: ['Member'],
      requiredRole: 'Administrator',
    });
    expect(result.failureKind).toBe('role-denied');
  });

  it('returns permission-denied when permission check fails', () => {
    const result = resolveGuardResolution({
      lifecyclePhase: 'authenticated',
      runtimeMode: 'pwa-msal',
      resolvedRoles: ['Administrator'],
      requiredPermission: 'settings:write',
      hasPermission: false,
    });
    expect(result.failureKind).toBe('permission-denied');
  });
});
