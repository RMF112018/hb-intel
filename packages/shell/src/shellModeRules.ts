import type { ShellEnvironment, ShellModeRules } from './types.js';

/**
 * Resolve centralized shell mode rules for the current runtime environment.
 *
 * Alignment notes:
 * - PH5.5 locked Option C: one shared shell core with explicit extension points.
 * - D-10: centralized rule resolution prevents feature-level shell branching.
 */
export function resolveShellModeRules(environment: ShellEnvironment): ShellModeRules {
  switch (environment) {
    case 'pwa':
      return {
        environment,
        mode: 'full',
        supportsProjectPicker: true,
        supportsAppLauncher: true,
        supportsContextualSidebar: true,
        supportsRedirectRestore: true,
      };
    case 'dev-override':
      return {
        environment,
        mode: 'full',
        supportsProjectPicker: true,
        supportsAppLauncher: true,
        supportsContextualSidebar: true,
        supportsRedirectRestore: true,
      };
    case 'spfx':
      return {
        environment,
        mode: 'simplified',
        supportsProjectPicker: false,
        supportsAppLauncher: false,
        supportsContextualSidebar: true,
        supportsRedirectRestore: false,
      };
    case 'hb-site-control':
      return {
        environment,
        mode: 'simplified',
        supportsProjectPicker: false,
        supportsAppLauncher: false,
        supportsContextualSidebar: false,
        supportsRedirectRestore: false,
      };
    default: {
      const exhaustive: never = environment;
      throw new Error(`Unsupported shell environment: ${String(exhaustive)}`);
    }
  }
}
