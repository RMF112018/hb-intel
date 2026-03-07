import type { ReactNode } from 'react';
interface RecoveryActionProps {
    onRetry?: () => void;
}
/**
 * Dedicated shell surface for bootstrap/loading state.
 */
export declare function ShellBootstrapSurface({ onRetry }: RecoveryActionProps): ReactNode;
/**
 * Dedicated shell surface for active session restoration.
 */
export declare function SessionRestoreSurface({ onRetry }: RecoveryActionProps): ReactNode;
/**
 * Dedicated shell surface for reauthentication-required outcomes.
 */
export declare function ExpiredSessionSurface({ onSignInAgain }: {
    onSignInAgain?: () => void;
}): ReactNode;
/**
 * Dedicated shell surface for unsupported runtime/environment requirements.
 */
export declare function UnsupportedRuntimeSurface({ onRetry }: RecoveryActionProps): ReactNode;
/**
 * Dedicated shell surface for fatal startup failures.
 */
export declare function FatalStartupSurface({ onRetry }: RecoveryActionProps): ReactNode;
export {};
//# sourceMappingURL=RecoverySurfaces.d.ts.map