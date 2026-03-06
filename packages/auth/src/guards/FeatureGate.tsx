import type { ReactNode } from 'react';
import { usePermissionStore } from '../stores/permissionStore.js';
import { useAuthStore } from '../stores/authStore.js';
import type { StandardActionPermission } from '../types.js';

export interface FeatureGateProps {
  /** Feature key (legacy feature-flag key and default feature registration id). */
  feature: string;
  /** Optional action for registration-aware access evaluation. */
  action?: StandardActionPermission;
  children: ReactNode;
  fallback?: ReactNode;
  lockedFallback?: ReactNode;
}

/**
 * Renders children only if the specified feature flag is enabled.
 * Blueprint §1e — feature-flag guard.
 */
export function FeatureGate({
  feature,
  action = 'view',
  children,
  fallback = null,
  lockedFallback = fallback,
}: FeatureGateProps): ReactNode {
  const runtimeMode = useAuthStore((s) => s.runtimeMode);
  const registration = usePermissionStore((s) => s.featureRegistrations[feature]);
  const enabled = usePermissionStore((s) => s.hasFeatureFlag(feature));
  const access = usePermissionStore((s) => s.getFeatureAccess(feature, action, runtimeMode));

  // Backward compatibility: feature-flag-only behavior remains for unregistered
  // features while new protected features use registration + default-deny rules.
  if (!registration) {
    return enabled ? children : fallback;
  }

  if (access.allowed) {
    return children;
  }

  if (access.locked) {
    return lockedFallback;
  }

  return fallback;
}
