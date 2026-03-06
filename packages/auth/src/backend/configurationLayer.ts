import type {
  AccessControlPolicySettings,
  AuthRuntimeRuleSet,
  RedirectDefaultPolicy,
  SessionPolicyWindowSettings,
  ShellAuthConfiguration,
  ShellAuthConfigurationInput,
} from '../types.js';

/**
 * Canonical default shell/auth configuration used across runtime initialization paths.
 *
 * Traceability:
 * - PH5.10-Auth-Shell-Plan.md §5.10 item 5
 * - PH5-Auth-Shell-Plan.md locked Option C default-deny + centralized policy configuration
 */
export const DEFAULT_SHELL_AUTH_CONFIGURATION: ShellAuthConfiguration = {
  runtimeRules: {
    allowDevOverrideInProduction: false,
    supportedRuntimeModes: ['pwa-msal', 'spfx-context', 'mock', 'dev-override'],
  },
  redirectDefaults: {
    defaultSignedInPath: '/workspace',
    defaultSignedOutPath: '/auth/sign-in',
    preserveIntendedRoute: true,
    unsafeRouteFallbackPath: '/workspace',
  },
  sessionWindows: {
    safeRestoreWindowMs: 15 * 60 * 1000,
    hardSessionMaxAgeMs: 8 * 60 * 60 * 1000,
    idleTimeoutMs: 60 * 60 * 1000,
  },
  policySettings: {
    defaultDenyUnregisteredFeatures: true,
    requireOverrideApproval: true,
    requireReasonForOverride: true,
    emergencyOverrideMaxHours: 4,
  },
};

/**
 * Merge partial input into a fully-resolved typed shell/auth configuration object.
 */
export function resolveShellAuthConfiguration(
  input: ShellAuthConfigurationInput = {},
): ShellAuthConfiguration {
  return {
    runtimeRules: {
      ...DEFAULT_SHELL_AUTH_CONFIGURATION.runtimeRules,
      ...(input.runtimeRules ?? {}),
    },
    redirectDefaults: {
      ...DEFAULT_SHELL_AUTH_CONFIGURATION.redirectDefaults,
      ...(input.redirectDefaults ?? {}),
    },
    sessionWindows: {
      ...DEFAULT_SHELL_AUTH_CONFIGURATION.sessionWindows,
      ...(input.sessionWindows ?? {}),
    },
    policySettings: {
      ...DEFAULT_SHELL_AUTH_CONFIGURATION.policySettings,
      ...(input.policySettings ?? {}),
    },
  };
}

/**
 * Validate shell/auth configuration invariants required for safe runtime operation.
 */
export function validateShellAuthConfiguration(configuration: ShellAuthConfiguration): void {
  validateRuntimeRules(configuration.runtimeRules);
  validateRedirectDefaults(configuration.redirectDefaults);
  validateSessionWindows(configuration.sessionWindows);
  validatePolicySettings(configuration.policySettings);
}

/**
 * Resolve + validate in one call for startup/bootstrap consumers.
 */
export function loadShellAuthConfiguration(
  input: ShellAuthConfigurationInput = {},
): ShellAuthConfiguration {
  const resolved = resolveShellAuthConfiguration(input);
  validateShellAuthConfiguration(resolved);
  return resolved;
}

function validateRuntimeRules(runtimeRules: AuthRuntimeRuleSet): void {
  if (runtimeRules.supportedRuntimeModes.length === 0) {
    throw new Error('At least one supported runtime mode is required.');
  }
}

function validateRedirectDefaults(redirectDefaults: RedirectDefaultPolicy): void {
  if (!redirectDefaults.defaultSignedInPath.startsWith('/')) {
    throw new Error('defaultSignedInPath must be an absolute route path.');
  }

  if (!redirectDefaults.defaultSignedOutPath.startsWith('/')) {
    throw new Error('defaultSignedOutPath must be an absolute route path.');
  }

  if (!redirectDefaults.unsafeRouteFallbackPath.startsWith('/')) {
    throw new Error('unsafeRouteFallbackPath must be an absolute route path.');
  }
}

function validateSessionWindows(sessionWindows: SessionPolicyWindowSettings): void {
  if (sessionWindows.safeRestoreWindowMs <= 0) {
    throw new Error('safeRestoreWindowMs must be greater than zero.');
  }

  if (sessionWindows.hardSessionMaxAgeMs < sessionWindows.safeRestoreWindowMs) {
    throw new Error('hardSessionMaxAgeMs must be >= safeRestoreWindowMs.');
  }

  if (sessionWindows.idleTimeoutMs <= 0) {
    throw new Error('idleTimeoutMs must be greater than zero.');
  }
}

function validatePolicySettings(policySettings: AccessControlPolicySettings): void {
  if (!policySettings.defaultDenyUnregisteredFeatures) {
    throw new Error('defaultDenyUnregisteredFeatures must remain enabled for Option C.');
  }

  if (policySettings.emergencyOverrideMaxHours <= 0) {
    throw new Error('emergencyOverrideMaxHours must be greater than zero.');
  }
}
