import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
import type {
  AuthBootstrapSelectorResult,
  AuthFailure,
  AuthLifecycleSelectorResult,
  AuthPermissionSummarySelectorResult,
  AuthSessionSummarySelectorResult,
  AuthStoreSlice,
  NormalizedAuthSession,
  SessionRestoreResult,
} from '../types.js';
import {
  buildBootstrapEndMetadata,
  buildBootstrapStartMetadata,
  buildCompatSession,
  buildRestoreAuditPayload,
  buildSignInAuditPayload,
  buildSignOutAuditPayload,
  mapRestoreOutcomeToLifecycle,
} from './helpers/authStoreHelpers.js';

// ALIGNMENT: authStore v1.0 - PH5C.2, PH5C.3 - Session storage & normalization
/**
 * Side-effect boundary rule for Phase 5.3:
 * - This store owns central auth/session/permission truth state only.
 * - Provider SDK calls (MSAL/SPFx/bootstrap) must stay outside this file and
 *   call atomic actions with normalized payloads.
 *
 * Alignment notes:
 * - D-04: narrow selector slices + shallow subscriptions reduce broad rerenders.
 * - D-07: structured lifecycle/error state supports deterministic guarded flows.
 * - D-10: central store ownership helps prevent feature-level auth drift.
 */
export const useAuthStore = create<AuthStoreSlice>((set) => ({
  lifecyclePhase: 'idle',
  session: null,
  runtimeMode: null,
  restoreState: {
    inFlight: false,
    outcome: null,
    shellTransition: null,
    lastAttemptedAt: null,
    lastResolvedAt: null,
  },
  structuredError: null,
  shellBootstrap: {
    authReady: false,
    permissionsReady: false,
    shellReadyToRender: false,
  },

  // Compatibility fields retained for existing app consumers.
  currentUser: null,
  isLoading: false,
  error: null,

  beginBootstrap: (runtimeMode) =>
    set((state) => {
      const resolvedRuntime = runtimeMode ?? state.runtimeMode;
      startStartupPhase('auth-bootstrap', buildBootstrapStartMetadata(resolvedRuntime ?? undefined));

      return {
        ...state,
        lifecyclePhase: 'bootstrapping',
        runtimeMode: resolvedRuntime,
        isLoading: true,
        structuredError: null,
        error: null,
        shellBootstrap: {
          ...state.shellBootstrap,
          authReady: false,
          shellReadyToRender: false,
        },
      };
    }),

  // ALIGNMENT: Session normalization per D-PH5C-03
  // Session state moves into centralized normalized store for shell/auth consistency.
  completeBootstrap: (params) =>
    set((state) => {
      const session = params?.session ?? state.session;
      const permissionsReady = params?.permissionsReady ?? state.shellBootstrap.permissionsReady;
      const hasSession = Boolean(session);
      endStartupPhase('auth-bootstrap', buildBootstrapEndMetadata(session, state.runtimeMode, permissionsReady));

      return {
        ...state,
        lifecyclePhase: hasSession ? 'authenticated' : 'signed-out',
        session,
        runtimeMode: session?.runtimeMode ?? state.runtimeMode,
        currentUser: session?.user ?? null,
        isLoading: false,
        shellBootstrap: {
          authReady: true,
          permissionsReady,
          shellReadyToRender: hasSession && permissionsReady,
        },
      };
    }),

  beginRestore: () =>
    set((state) => ({
      ...state,
      lifecyclePhase: 'restoring',
      isLoading: true,
      structuredError: null,
      error: null,
      restoreState: {
        ...state.restoreState,
        inFlight: true,
        shellTransition: 'restore-started',
        lastAttemptedAt: new Date().toISOString(),
      },
    })),

  resolveRestore: (result: SessionRestoreResult) =>
    set((state) => {
      const nextSession = result.session ?? state.session;
      const hasSession = Boolean(nextSession);
      const permissionsReady = hasSession;

      recordStructuredAuditEvent(
        buildRestoreAuditPayload(result, nextSession, state.session, state.restoreState.lastAttemptedAt),
      );

      return {
        ...state,
        lifecyclePhase: mapRestoreOutcomeToLifecycle(result.outcome),
        session: hasSession ? nextSession : null,
        runtimeMode: nextSession?.runtimeMode ?? state.runtimeMode,
        currentUser: nextSession?.user ?? null,
        structuredError: result.failure ?? null,
        error: result.failure?.message ?? null,
        isLoading: false,
        restoreState: {
          inFlight: false,
          outcome: result.outcome,
          shellTransition: result.shellStatusTransition,
          lastAttemptedAt: state.restoreState.lastAttemptedAt,
          lastResolvedAt: new Date().toISOString(),
        },
        shellBootstrap: {
          authReady: result.outcome !== 'fatal',
          permissionsReady,
          shellReadyToRender: hasSession && permissionsReady,
        },
      };
    }),

  signInSuccess: (session: NormalizedAuthSession) =>
    set((state) => {
      recordStructuredAuditEvent(buildSignInAuditPayload(session));

      return {
        ...state,
        lifecyclePhase: 'authenticated',
        session,
        runtimeMode: session.runtimeMode,
        currentUser: session.user,
        isLoading: false,
        structuredError: null,
        error: null,
        shellBootstrap: {
          authReady: true,
          permissionsReady: true,
          shellReadyToRender: true,
        },
      };
    }),

  signOut: () =>
    set((state) => {
      recordStructuredAuditEvent(
        buildSignOutAuditPayload(state.session?.user.id, state.currentUser?.id, state.session?.runtimeMode),
      );

      return {
        ...state,
        lifecyclePhase: 'signed-out',
        session: null,
        currentUser: null,
        structuredError: null,
        error: null,
        isLoading: false,
        restoreState: {
          ...state.restoreState,
          inFlight: false,
        },
        shellBootstrap: {
          authReady: true,
          permissionsReady: false,
          shellReadyToRender: false,
        },
      };
    }),

  // ALIGNMENT: Guard resolution per D-PH5C-04
  // Lifecycle + permission state in this store drives centralized guard evaluation.
  markReauthRequired: (failure: AuthFailure | null = null) =>
    set((state) => ({
      ...state,
      lifecyclePhase: 'reauth-required',
      structuredError: failure,
      error: failure?.message ?? null,
      isLoading: false,
      shellBootstrap: {
        ...state.shellBootstrap,
        authReady: true,
        shellReadyToRender: false,
      },
    })),

  setStructuredError: (structuredError: AuthFailure | null) =>
    set((state) => ({
      ...state,
      lifecyclePhase: structuredError ? 'error' : state.lifecyclePhase,
      structuredError,
      error: structuredError?.message ?? null,
      isLoading: false,
      shellBootstrap: {
        ...state.shellBootstrap,
        shellReadyToRender: false,
      },
    })),

  clearStructuredError: () =>
    set((state) => ({
      ...state,
      structuredError: null,
      error: null,
      lifecyclePhase: state.session ? 'authenticated' : 'idle',
    })),

  // Compatibility wrappers retained to avoid app breakage while migrating.
  setUser: (user) =>
    set((state) => {
      if (!user) {
        return {
          ...state,
          session: null,
          currentUser: null,
          lifecyclePhase: 'signed-out',
          shellBootstrap: {
            authReady: true,
            permissionsReady: false,
            shellReadyToRender: false,
          },
        };
      }

      const session = buildCompatSession(user, state.runtimeMode);

      return {
        ...state,
        lifecyclePhase: 'authenticated',
        session,
        runtimeMode: session.runtimeMode,
        currentUser: user,
        structuredError: null,
        error: null,
        shellBootstrap: {
          authReady: true,
          permissionsReady: true,
          shellReadyToRender: true,
        },
      };
    }),

  setLoading: (loading) =>
    set((state) => ({
      ...state,
      isLoading: loading,
      lifecyclePhase: loading ? 'bootstrapping' : state.lifecyclePhase,
    })),

  setError: (errorMessage) =>
    set((state) => ({
      ...state,
      error: errorMessage,
      structuredError: errorMessage
        ? {
            code: 'unknown-fatal-initialization-failure',
            message: errorMessage,
            recoverable: false,
          }
        : null,
      lifecyclePhase: errorMessage ? 'error' : state.lifecyclePhase,
      isLoading: false,
    })),

  clear: () =>
    set((state) => ({
      ...state,
      lifecyclePhase: 'idle',
      session: null,
      currentUser: null,
      runtimeMode: null,
      restoreState: {
        inFlight: false,
        outcome: null,
        shellTransition: null,
        lastAttemptedAt: null,
        lastResolvedAt: null,
      },
      structuredError: null,
      shellBootstrap: {
        authReady: false,
        permissionsReady: false,
        shellReadyToRender: false,
      },
      isLoading: false,
      error: null,
    })),
}));

/**
 * Backward-compatible alias retained for existing type imports.
 */
export type AuthState = AuthStoreSlice;

/**
 * Selector function for lifecycle/runtime state.
 */
export const selectAuthLifecycle = (state: AuthStoreSlice): AuthLifecycleSelectorResult => ({
  lifecyclePhase: state.lifecyclePhase,
  runtimeMode: state.runtimeMode,
  isLoading: state.isLoading,
});

/**
 * Selector function for shell bootstrap readiness.
 */
export const selectAuthBootstrapReadiness = (
  state: AuthStoreSlice,
): AuthBootstrapSelectorResult => ({
  authReady: state.shellBootstrap.authReady,
  permissionsReady: state.shellBootstrap.permissionsReady,
  shellReadyToRender: state.shellBootstrap.shellReadyToRender,
});

/**
 * Selector function for session summary data.
 */
export const selectAuthSessionSummary = (
  state: AuthStoreSlice,
): AuthSessionSummarySelectorResult => ({
  userId: state.session?.user.id ?? null,
  runtimeMode: state.runtimeMode,
  resolvedRoles: state.session?.resolvedRoles ?? [],
});

/**
 * Selector function for permission summary data.
 */
export const selectAuthPermissionSummary = (
  state: AuthStoreSlice,
): AuthPermissionSummarySelectorResult => ({
  grants: state.session?.permissionSummary.grants ?? [],
  overrides: state.session?.permissionSummary.overrides ?? [],
});

/**
 * Shallow-subscribed hook for lifecycle/runtime state.
 */
export function useAuthLifecycleSelector(): AuthLifecycleSelectorResult {
  return useAuthStore(useShallow(selectAuthLifecycle));
}

/**
 * Shallow-subscribed hook for shell bootstrap readiness state.
 */
export function useAuthBootstrapSelector(): AuthBootstrapSelectorResult {
  return useAuthStore(useShallow(selectAuthBootstrapReadiness));
}

/**
 * Shallow-subscribed hook for session summary state.
 */
export function useAuthSessionSummarySelector(): AuthSessionSummarySelectorResult {
  return useAuthStore(useShallow(selectAuthSessionSummary));
}

/**
 * Shallow-subscribed hook for permission summary state.
 */
export function useAuthPermissionSummarySelector(): AuthPermissionSummarySelectorResult {
  return useAuthStore(useShallow(selectAuthPermissionSummary));
}
