import type { ReactNode } from 'react';
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
export declare function FeatureGate({ feature, action, children, fallback, lockedFallback, }: FeatureGateProps): ReactNode;
//# sourceMappingURL=FeatureGate.d.ts.map