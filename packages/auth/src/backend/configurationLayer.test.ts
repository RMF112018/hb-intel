import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SHELL_AUTH_CONFIGURATION,
  loadShellAuthConfiguration,
  resolveShellAuthConfiguration,
  validateShellAuthConfiguration,
} from './configurationLayer.js';

describe('configurationLayer', () => {
  it('resolves partial configuration against typed defaults', () => {
    const resolved = resolveShellAuthConfiguration({
      sessionWindows: {
        safeRestoreWindowMs: 5 * 60 * 1000,
      },
    });

    expect(resolved.sessionWindows.safeRestoreWindowMs).toBe(5 * 60 * 1000);
    expect(resolved.policySettings.defaultDenyUnregisteredFeatures).toBe(true);
  });

  it('rejects configuration that disables default-deny policy', () => {
    expect(() =>
      validateShellAuthConfiguration({
        ...DEFAULT_SHELL_AUTH_CONFIGURATION,
        policySettings: {
          ...DEFAULT_SHELL_AUTH_CONFIGURATION.policySettings,
          defaultDenyUnregisteredFeatures: false,
        },
      }),
    ).toThrowError(/defaultDenyUnregisteredFeatures/i);
  });

  it('loads and validates merged configuration in one call', () => {
    const loaded = loadShellAuthConfiguration({
      redirectDefaults: {
        defaultSignedInPath: '/dashboard',
      },
    });

    expect(loaded.redirectDefaults.defaultSignedInPath).toBe('/dashboard');
  });
});
