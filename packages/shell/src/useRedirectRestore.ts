import { useEffect } from 'react';
import type { NormalizedAuthSession } from '@hbc/auth';
import { clearRedirectMemory, resolvePostGuardRedirect, restoreRedirectTarget } from './redirectMemory.js';
import type { ShellEnvironment, ShellModeRules } from './types.js';

/**
 * Redirect restore with double-call semantics hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.7.
 * CRITICAL: restoreRedirectTarget() is called twice per evaluation — once inside
 * resolvePostGuardRedirect (returns path string) and once explicitly (returns full
 * RedirectMemoryRecord for comparison). This exact call sequence must not be collapsed.
 */
export function useRedirectRestore(params: {
  session: NormalizedAuthSession | null;
  rules: ShellModeRules;
  onNavigate?: (pathname: string) => void;
  adapterEnvironment: ShellEnvironment;
  landingPath: string;
  currentPathname: string;
  setLastResolvedLandingPath: (path: string | null) => void;
}): void {
  const {
    session,
    rules,
    onNavigate,
    adapterEnvironment,
    landingPath,
    currentPathname,
    setLastResolvedLandingPath,
  } = params;

  useEffect(() => {
    if (!session || !rules.supportsRedirectRestore || !onNavigate) {
      return;
    }

    // Call 1: inside resolvePostGuardRedirect (returns path string only)
    const resolvedPath = resolvePostGuardRedirect({
      runtimeMode: adapterEnvironment,
      fallbackPath: landingPath,
      isTargetAllowed: (pathname) => pathname !== currentPathname,
    });

    // Call 2: explicit (returns full RedirectMemoryRecord for comparison)
    const restored = restoreRedirectTarget({ runtimeMode: adapterEnvironment });
    if (restored && restored.pathname === resolvedPath) {
      setLastResolvedLandingPath(resolvedPath);
      onNavigate(resolvedPath);
      clearRedirectMemory();
      return;
    }

    if (currentPathname === '/') {
      setLastResolvedLandingPath(resolvedPath);
      onNavigate(resolvedPath);
    }
  }, [
    adapterEnvironment,
    currentPathname,
    landingPath,
    onNavigate,
    rules.supportsRedirectRestore,
    session,
    setLastResolvedLandingPath,
  ]);
}
