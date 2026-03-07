import type { ReactNode } from 'react';
import type { StandardActionPermission } from '../types.js';
export interface PermissionGateProps {
    /** Permission action string (e.g., "project:create"). */
    action?: string;
    /** Optional protected feature identifier for centralized feature access checks. */
    featureId?: string;
    /** Optional standard action for feature-based checks. */
    standardAction?: StandardActionPermission;
    children: ReactNode;
    fallback?: ReactNode;
}
/**
 * Renders children only if the current user has the specified permission.
 * Blueprint §1e — permission-based access guard.
 */
export declare function PermissionGate({ action, featureId, standardAction, children, fallback, }: PermissionGateProps): ReactNode;
//# sourceMappingURL=PermissionGate.d.ts.map