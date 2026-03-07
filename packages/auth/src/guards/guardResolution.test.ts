import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveGuardResolution } from './guardResolution.js';

describe('resolveGuardResolution', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__;
  });

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

  it('emits startup timing metadata for centralized permission-resolution diagnostics', () => {
    const startPhase = vi.fn();
    const endPhase = vi.fn();
    const recordPhase = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = {
      startPhase,
      endPhase,
      recordPhase,
    };

    resolveGuardResolution({
      lifecyclePhase: 'authenticated',
      runtimeMode: 'pwa-msal',
      resolvedRoles: ['Administrator'],
      requiredPermission: 'settings:write',
      hasPermission: true,
    });

    expect(startPhase).toHaveBeenCalledWith(
      'permission-resolution',
      expect.objectContaining({ source: 'guard-resolution', outcome: 'pending' }),
    );
    expect(endPhase).toHaveBeenCalledWith(
      'permission-resolution',
      expect.objectContaining({ source: 'guard-resolution', outcome: 'success' }),
    );
    expect(recordPhase).not.toHaveBeenCalled();
  });
});
