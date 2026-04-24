import { useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import {
  resolveSafetyCapabilities,
  type SafetyCapabilities,
} from './safetyCapabilities.js';

/**
 * Reads the canonical normalized session from `@hbc/auth` and resolves the
 * Safety capability state from `resolvedRoles`. Memoized on the role-array
 * reference so consumers can depend on stable identity when roles are static.
 */
export function useSafetyCapabilities(): SafetyCapabilities {
  const session = useCurrentSession();
  const roles = session?.resolvedRoles;
  return useMemo(() => resolveSafetyCapabilities(roles), [roles]);
}
