import { useEffect, useMemo } from 'react';
import { usePermissionStore } from '../stores/permissionStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { ExpiredSessionSurface, FatalStartupSurface, SessionRestoreSurface, ShellBootstrapSurface, UnsupportedRuntimeSurface, } from './RecoverySurfaces.js';
import { resolveGuardResolution } from './guardResolution.js';
import { AccessDenied } from './AccessDenied.js';
/**
 * Centralized pre-render protected-content guard.
 *
 * This component resolves all required runtime/auth/role/permission checks
 * before rendering protected children. It is the canonical guard execution
 * boundary for Phase 5.8.
 */
export function ProtectedContentGuard({ children, currentPathname, requiredRole, requiredPermission, supportedRuntimeModes, onCaptureRedirect, onRequestAccessSubmit, requestAccessSeed, onSignInAgain, onRetryBootstrap, onGoHome, onGoBack, onUnsupportedEnvironmentRetry, loadingSurface = null, restoreSurface = null, reauthSurface = null, unsupportedSurface = null, fatalSurface = null, accessDeniedSurface = null, }) {
    const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
    const runtimeMode = useAuthStore((s) => s.runtimeMode);
    const resolvedRoles = useAuthStore((s) => s.session?.resolvedRoles ?? []);
    const structuredError = useAuthStore((s) => s.structuredError);
    const hasPermission = usePermissionStore((s) => requiredPermission ? s.hasPermission(requiredPermission) : true);
    const guardResult = useMemo(() => resolveGuardResolution({
        lifecyclePhase,
        runtimeMode,
        resolvedRoles,
        requiredRole,
        requiredPermission,
        hasPermission,
        supportedRuntimeModes,
    }), [
        hasPermission,
        lifecyclePhase,
        requiredPermission,
        requiredRole,
        resolvedRoles,
        runtimeMode,
        supportedRuntimeModes,
    ]);
    useEffect(() => {
        if (guardResult.shouldCaptureRedirect && onCaptureRedirect) {
            onCaptureRedirect(currentPathname);
        }
    }, [currentPathname, guardResult.shouldCaptureRedirect, onCaptureRedirect]);
    if (lifecyclePhase === 'bootstrapping') {
        return loadingSurface ?? <ShellBootstrapSurface onRetry={onRetryBootstrap}/>;
    }
    if (lifecyclePhase === 'restoring') {
        return restoreSurface ?? <SessionRestoreSurface onRetry={onRetryBootstrap}/>;
    }
    if (structuredError) {
        return fatalSurface ?? <FatalStartupSurface onRetry={onRetryBootstrap}/>;
    }
    if (guardResult.allow) {
        return children;
    }
    return resolveFailureSurface({
        failureKind: guardResult.failureKind,
        reauthSurface,
        unsupportedSurface,
        accessDeniedSurface,
        onSignInAgain,
        onUnsupportedEnvironmentRetry,
        onGoHome,
        onGoBack,
        onRequestAccessSubmit,
        requestAccessSeed,
    });
}
function resolveFailureSurface(params) {
    if (params.failureKind === 'reauth-required' || params.failureKind === 'unauthenticated') {
        return params.reauthSurface ?? <ExpiredSessionSurface onSignInAgain={params.onSignInAgain}/>;
    }
    if (params.failureKind === 'runtime-unsupported') {
        return (params.unsupportedSurface ?? (<UnsupportedRuntimeSurface onRetry={params.onUnsupportedEnvironmentRetry}/>));
    }
    return (params.accessDeniedSurface ?? (<AccessDenied onGoHome={params.onGoHome} onGoBack={params.onGoBack} onSubmitAccessRequest={params.onRequestAccessSubmit} requestAccessSeed={params.requestAccessSeed}/>));
}
//# sourceMappingURL=ProtectedContentGuard.jsx.map