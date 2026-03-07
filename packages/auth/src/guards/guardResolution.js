import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * Resolve guard outcomes in strict precedence:
 * 1) runtime support
 * 2) auth/session state
 * 3) role authorization
 * 4) permission authorization
 *
 * This ordering ensures protected content never renders before central gate
 * evaluation has resolved all required constraints.
 */
export function resolveGuardResolution(input) {
    // Phase 5.15 startup instrumentation:
    // Permission-resolution timing is captured at the centralized guard decision
    // seam so both PWA and SPFx protected render flows are measured uniformly.
    startStartupPhase('permission-resolution', {
        source: 'guard-resolution',
        runtimeMode: input.runtimeMode ?? undefined,
        outcome: 'pending',
    });
    if (input.supportedRuntimeModes &&
        input.runtimeMode &&
        !input.supportedRuntimeModes.includes(input.runtimeMode)) {
        endStartupPhase('permission-resolution', {
            source: 'guard-resolution',
            runtimeMode: input.runtimeMode,
            outcome: 'failure',
            details: {
                failureKind: 'runtime-unsupported',
            },
        });
        return {
            allow: false,
            failureKind: 'runtime-unsupported',
            shouldCaptureRedirect: false,
        };
    }
    if (input.lifecyclePhase === 'reauth-required') {
        endStartupPhase('permission-resolution', {
            source: 'guard-resolution',
            runtimeMode: input.runtimeMode ?? undefined,
            outcome: 'failure',
            details: {
                failureKind: 'reauth-required',
            },
        });
        return {
            allow: false,
            failureKind: 'reauth-required',
            shouldCaptureRedirect: true,
        };
    }
    if (input.lifecyclePhase !== 'authenticated') {
        endStartupPhase('permission-resolution', {
            source: 'guard-resolution',
            runtimeMode: input.runtimeMode ?? undefined,
            outcome: 'failure',
            details: {
                failureKind: 'unauthenticated',
            },
        });
        return {
            allow: false,
            failureKind: 'unauthenticated',
            shouldCaptureRedirect: true,
        };
    }
    // ALIGNMENT: Persona-based permissions per D-PH5C-04
    // Role evaluation executes before permission checks to enforce deterministic precedence.
    if (input.requiredRole && !input.resolvedRoles.includes(input.requiredRole)) {
        endStartupPhase('permission-resolution', {
            source: 'guard-resolution',
            runtimeMode: input.runtimeMode ?? undefined,
            outcome: 'failure',
            details: {
                failureKind: 'role-denied',
            },
        });
        return {
            allow: false,
            failureKind: 'role-denied',
            shouldCaptureRedirect: false,
        };
    }
    // ALIGNMENT: Permission matching per D-PH5C-04
    // Permission checks are centralized to prevent feature-level authorization drift.
    if (input.requiredPermission && input.hasPermission !== true) {
        endStartupPhase('permission-resolution', {
            source: 'guard-resolution',
            runtimeMode: input.runtimeMode ?? undefined,
            outcome: 'failure',
            details: {
                failureKind: 'permission-denied',
            },
        });
        return {
            allow: false,
            failureKind: 'permission-denied',
            shouldCaptureRedirect: false,
        };
    }
    endStartupPhase('permission-resolution', {
        source: 'guard-resolution',
        runtimeMode: input.runtimeMode ?? undefined,
        outcome: 'success',
        details: {
            failureKind: null,
        },
    });
    return {
        allow: true,
        failureKind: null,
        shouldCaptureRedirect: false,
    };
}
//# sourceMappingURL=guardResolution.js.map