import { useEffect, useState } from 'react';
import type { ShellEnvironmentAdapter, ShellRouteEnforcementDecision, WorkspaceId } from './types.js';

/**
 * Route evaluation and access-decision hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.4.
 * Calls adapter.enforceRoute asynchronously when present, defaults to { allow: true }.
 */
export function useRouteEnforcement(params: {
  adapter: ShellEnvironmentAdapter;
  currentPathname: string;
  intendedPathname: string | null;
  activeWorkspace: WorkspaceId | null;
  resolvedRoles: readonly string[];
}): ShellRouteEnforcementDecision | null {
  const { adapter, currentPathname, intendedPathname, activeWorkspace, resolvedRoles } = params;
  const [routeDecision, setRouteDecision] = useState<ShellRouteEnforcementDecision | null>(null);

  useEffect(() => {
    const evaluateRoute = async (): Promise<void> => {
      if (!adapter.enforceRoute) {
        setRouteDecision({ allow: true });
        return;
      }

      const decision = await adapter.enforceRoute({
        pathname: currentPathname,
        intendedPathname,
        activeWorkspace,
        resolvedRoles: [...resolvedRoles],
      });
      setRouteDecision(decision);
    };

    void evaluateRoute();
  }, [activeWorkspace, adapter, currentPathname, intendedPathname, resolvedRoles]);

  return routeDecision;
}
