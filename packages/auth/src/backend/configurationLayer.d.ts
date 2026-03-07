import type { ShellAuthConfiguration, ShellAuthConfigurationInput } from '../types.js';
/**
 * Canonical default shell/auth configuration used across runtime initialization paths.
 *
 * Traceability:
 * - PH5.10-Auth-Shell-Plan.md §5.10 item 5
 * - PH5-Auth-Shell-Plan.md locked Option C default-deny + centralized policy configuration
 */
export declare const DEFAULT_SHELL_AUTH_CONFIGURATION: ShellAuthConfiguration;
/**
 * Merge partial input into a fully-resolved typed shell/auth configuration object.
 */
export declare function resolveShellAuthConfiguration(input?: ShellAuthConfigurationInput): ShellAuthConfiguration;
/**
 * Validate shell/auth configuration invariants required for safe runtime operation.
 */
export declare function validateShellAuthConfiguration(configuration: ShellAuthConfiguration): void;
/**
 * Resolve + validate in one call for startup/bootstrap consumers.
 */
export declare function loadShellAuthConfiguration(input?: ShellAuthConfigurationInput): ShellAuthConfiguration;
//# sourceMappingURL=configurationLayer.d.ts.map