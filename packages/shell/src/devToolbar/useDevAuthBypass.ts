// packages/shell/src/devToolbar/useDevAuthBypass.ts
// D-PH5C-02, D-PH5C-03: Custom hook for dev auth state management
// D-PH5C-06: Collapsible toolbar state persistence with localStorage

import { useEffect, useState } from 'react';
import {
  DevAuthBypassAdapter,
  PERSONA_REGISTRY,
  type IPersona,
  type ISessionData,
} from '@hbc/auth/dev';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import {
  sessionDataToCurrentUser,
  extractGrantedPermissions,
} from './sessionDataToCurrentUser.js';

const STATE_KEY = 'hb-auth-dev-toolbar-state';
const DELAY_KEY = 'hb-auth-dev-delay';

interface IStoredToolbarState {
  selectedPersonaId: string | null;
  auditLoggingEnabled: boolean;
}

export interface IDevAuthBypassState {
  currentSession: ISessionData | null;
  selectedPersona: IPersona | null;
  authDelay: number;
  auditLoggingEnabled: boolean;
  selectPersona: (persona: IPersona) => Promise<void>;
  setAuthDelay: (ms: number) => void;
  setAuditLoggingEnabled: (enabled: boolean) => void;
  expireSession: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * useDevAuthBypass
 * ================
 * D-PH5C-03: Manages persona selection, auth delay, and session lifecycle controls.
 * D-PH5C-06: Persists toolbar state to localStorage and restores it on mount.
 */
export function useDevAuthBypass(): IDevAuthBypassState {
  const [currentSession, setCurrentSession] = useState<ISessionData | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<IPersona | null>(null);
  const [authDelay, setAuthDelayState] = useState(500);
  const [auditLoggingEnabled, setAuditLoggingEnabledState] = useState(true);
  const [adapter, setAdapter] = useState<DevAuthBypassAdapter | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const savedDelay = localStorage.getItem(DELAY_KEY);
    if (savedDelay) {
      setAuthDelayState(Number(savedDelay));
    }

    const savedStateRaw = localStorage.getItem(STATE_KEY);
    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as IStoredToolbarState;
        setAuditLoggingEnabledState(savedState.auditLoggingEnabled);
        if (savedState.selectedPersonaId) {
          const persona = PERSONA_REGISTRY.getById(savedState.selectedPersonaId) ?? null;
          setSelectedPersona(persona);
        }
      } catch (error) {
        console.warn('[HB-AUTH-DEV] Failed to parse toolbar persisted state', error);
      }
    }

    const restoredDelay = Number(savedDelay ?? 500);
    const newAdapter = new DevAuthBypassAdapter(restoredDelay);
    setAdapter(newAdapter);

    // D-PH5C-03: Restores any persisted session for immediate Session tab visibility.
    void newAdapter.restoreSession().then((session) => {
      if (session) {
        setCurrentSession(session);
        // D-PH6F-01: Sync restored session to global auth/permission stores
        useAuthStore.getState().setUser(sessionDataToCurrentUser(session));
        usePermissionStore
          .getState()
          .setPermissions(extractGrantedPermissions(session.permissions));
      }
    });
  }, []);

  // D-PH5C-06: Persist selected persona and toolbar toggles for fast dev iteration.
  useEffect(() => {
    const stored: IStoredToolbarState = {
      selectedPersonaId: selectedPersona?.id ?? null,
      auditLoggingEnabled,
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(stored));
  }, [auditLoggingEnabled, selectedPersona]);

  const selectPersona = async (persona: IPersona): Promise<void> => {
    if (!adapter) {
      return;
    }

    setSelectedPersona(persona);

    try {
      const identity = await adapter.acquireIdentity();
      // D-PH6F-01: Use normalizeSessionWithPermissions so persona.permissions override role defaults
      const enrichedSession = await adapter.normalizeSessionWithPermissions(
        {
          ...identity,
          userId: persona.id,
          displayName: persona.name,
          email: persona.email,
          roles: persona.roles,
        },
        persona.permissions,
      );
      setCurrentSession(enrichedSession);

      // D-PH6F-01: Sync to global auth and permission stores so feature gates react
      useAuthStore.getState().setUser(sessionDataToCurrentUser(enrichedSession));
      usePermissionStore
        .getState()
        .setPermissions(extractGrantedPermissions(enrichedSession.permissions));

      if (auditLoggingEnabled) {
        console.log(`[HB-AUTH-DEV] Persona selected: ${persona.id}`);
      }
    } catch (error) {
      console.error('[HB-AUTH-DEV] Failed to select persona:', error);
    }
  };

  const setAuthDelay = (ms: number): void => {
    setAuthDelayState(ms);
    localStorage.setItem(DELAY_KEY, String(ms));
  };

  const setAuditLoggingEnabled = (enabled: boolean): void => {
    setAuditLoggingEnabledState(enabled);
  };

  const expireSession = (): void => {
    sessionStorage.removeItem('hb-auth-dev-session');
    setCurrentSession(null);
    setSelectedPersona(null);
    // D-PH6F-01: Clear global auth/permission stores on session expiry
    useAuthStore.getState().signOut();
    usePermissionStore.getState().clear();

    if (auditLoggingEnabled) {
      console.log('[HB-AUTH-DEV] Session expired from toolbar action');
    }
  };

  const refreshSession = async (): Promise<void> => {
    if (!adapter) {
      return;
    }

    const session = await adapter.restoreSession();
    setCurrentSession(session);

    // D-PH6F-01: Sync refreshed session to global stores (or clear if null)
    if (session) {
      useAuthStore.getState().setUser(sessionDataToCurrentUser(session));
      usePermissionStore
        .getState()
        .setPermissions(extractGrantedPermissions(session.permissions));
    } else {
      useAuthStore.getState().signOut();
      usePermissionStore.getState().clear();
    }

    if (auditLoggingEnabled) {
      console.log('[HB-AUTH-DEV] Session refresh triggered from toolbar action');
    }
  };

  return {
    currentSession,
    selectedPersona,
    authDelay,
    auditLoggingEnabled,
    selectPersona,
    setAuthDelay,
    setAuditLoggingEnabled,
    expireSession,
    refreshSession,
  };
}
