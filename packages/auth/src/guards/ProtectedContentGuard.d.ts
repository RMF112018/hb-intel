import type { ReactNode } from 'react';
import type { AccessRequestSubmitter, RequestAccessSubmission } from './requestAccess.js';
import type { AuthMode } from '../types.js';
export interface ProtectedContentGuardProps {
    children: ReactNode;
    currentPathname: string;
    requiredRole?: string;
    requiredPermission?: string;
    supportedRuntimeModes?: readonly AuthMode[];
    onCaptureRedirect?: (pathname: string) => void;
    onRequestAccessSubmit?: AccessRequestSubmitter;
    requestAccessSeed?: Omit<RequestAccessSubmission, 'requestedAt'>;
    onSignInAgain?: () => void;
    onRetryBootstrap?: () => void;
    onGoHome?: () => void;
    onGoBack?: () => void;
    onUnsupportedEnvironmentRetry?: () => void;
    loadingSurface?: ReactNode;
    restoreSurface?: ReactNode;
    reauthSurface?: ReactNode;
    unsupportedSurface?: ReactNode;
    fatalSurface?: ReactNode;
    accessDeniedSurface?: ReactNode;
}
/**
 * Centralized pre-render protected-content guard.
 *
 * This component resolves all required runtime/auth/role/permission checks
 * before rendering protected children. It is the canonical guard execution
 * boundary for Phase 5.8.
 */
export declare function ProtectedContentGuard({ children, currentPathname, requiredRole, requiredPermission, supportedRuntimeModes, onCaptureRedirect, onRequestAccessSubmit, requestAccessSeed, onSignInAgain, onRetryBootstrap, onGoHome, onGoBack, onUnsupportedEnvironmentRetry, loadingSurface, restoreSurface, reauthSurface, unsupportedSurface, fatalSurface, accessDeniedSurface, }: ProtectedContentGuardProps): ReactNode;
//# sourceMappingURL=ProtectedContentGuard.d.ts.map