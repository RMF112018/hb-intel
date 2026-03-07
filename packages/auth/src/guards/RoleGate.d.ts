import type { ReactNode } from 'react';
export interface RoleGateProps {
    /** Role name the user must have to see children. */
    requiredRole: string;
    children: ReactNode;
    fallback?: ReactNode;
}
/**
 * Renders children only if the current user holds the required role.
 * Blueprint §1e — role-based access guard.
 */
export declare function RoleGate({ requiredRole, children, fallback }: RoleGateProps): ReactNode;
//# sourceMappingURL=RoleGate.d.ts.map