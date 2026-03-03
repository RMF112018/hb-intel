import type { ReactNode } from 'react';
import { usePermissionStore } from '../stores/permissionStore.js';

export interface FeatureGateProps {
  /** Feature flag key to check. */
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the specified feature flag is enabled.
 * Blueprint §1e — feature-flag guard.
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps): ReactNode {
  const enabled = usePermissionStore((s) => s.hasFeatureFlag(feature));
  return enabled ? children : fallback;
}
