# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.4: DevToolbar Component

**Version:** 2.0 (Collapsible dev toolbar with persona switcher, three tabs)
**Purpose:** This document defines the complete implementation steps to create a production-grade DevToolbar component with collapsible state, three-tab interface (Personas / Settings / Session), localStorage persistence, and integration into ShellCore.tsx behind `import.meta.env.DEV` guard.
**Audience:** Implementation agent(s), frontend developers, QA engineers
**Implementation Objective:** Deliver a fully functional developer toolbar that enables seamless persona switching, auth configuration, and session inspection during development, with intuitive UI and persistent state management.

---

## 5.C.4 DevToolbar Implementation

1. **Create `packages/shell/src/devToolbar/DevToolbar.tsx`** (D-PH5C-06)
   - Implement React component for collapsible dev toolbar docked to bottom of screen
   - Collapsed state: 36px height with title and expand icon
   - Expanded state: 300–400px height with three tabs and content area
   - Implement tab system: Personas / Settings / Session (D-PH5C-06)
   - Use state management (Zustand or React hooks) for expanded/collapsed state
   - Gate entire component behind `import.meta.env.DEV` check (D-PH5C-02)
   - Style with `DevToolbar.module.css` for scoped CSS (D-PH5C-06)

2. **Implement Personas Tab** (D-PH5C-04, D-PH5C-06)
   - Display list of all 11 personas from PersonaRegistry
   - Use PersonaCard sub-component to show persona details
   - Implement persona selection (click to select, trigger auth refresh)
   - Display currently active persona with visual indicator
   - Show persona metadata: name, email, roles, primary permissions
   - Include persona description as tooltip or expandable detail
   - Sort by category: base personas first, then supplemental

3. **Implement Settings Tab** (D-PH5C-03, D-PH5C-06)
   - Add configurable delay slider for auth simulation (default 500ms, range 0–5000ms)
   - Add toggle for audit logging (default on)
   - Add toggle for event logging (default on)
   - Add button to clear sessionStorage (clear all sessions)
   - Display current configuration values
   - Persist settings to localStorage under key `hb-auth-dev-config`

4. **Implement Session Tab** (D-PH5C-06)
   - Display current session JSON (if exists, else "No active session")
   - Show session metadata: sessionId, userId, email, roles, expiresAt
   - Display remaining time until session expires (countdown)
   - Add button to expire session immediately (for testing expiration)
   - Add button to refresh session (trigger restoreSession)
   - Display session status: Active / Expired / Not Authenticated

5. **Create PersonaCard sub-component** (D-PH5C-06)
   - Display persona information in card format
   - Show persona name, email, roles (as tags)
   - Show primary permissions (first 5–8)
   - Implement click handler to select persona
   - Highlight selected persona with background color
   - Include persona description as expandable detail

6. **Create useDevAuthBypass hook** (D-PH5C-02, D-PH5C-03, D-PH5C-06)
   - Custom hook to manage dev auth state and configuration
   - Expose `currentPersona`, `selectedPersona`, `setSelectedPersona`
   - Expose `authDelay`, `setAuthDelay`
   - Expose `auditLoggingEnabled`, `setAuditLoggingEnabled`
   - Expose `currentSession`, `expireSession()`, `refreshSession()`
   - Implement localStorage persistence: `hb-auth-dev-toolbar-state`
   - Subscribe to session changes from DevAuthBypassAdapter
   - Restore state from localStorage on mount

7. **Style DevToolbar with CSS module** (D-PH5C-06)
   - Create `DevToolbar.module.css` with styles for:
     - Container (fixed bottom dock)
     - Collapsed state (36px, small header with icon)
     - Expanded state (300–400px, smooth transition)
     - Tab navigation (three buttons)
     - Tab content area
     - PersonaCard styling (grid layout, hover effects)
     - Settings controls (sliders, toggles, buttons)
     - Session display (code-like formatting)
   - Use CSS Grid or Flexbox for layout
   - Implement smooth transitions for expand/collapse
   - Dark theme with contrasting text for visibility

8. **Integrate DevToolbar into `packages/shell/src/ShellCore.tsx`** (D-PH5C-06)
   - Import DevToolbar component and guard with `import.meta.env.DEV`
   - Render DevToolbar at bottom of ShellCore layout (after main content)
   - Ensure DevToolbar doesn't interfere with main content (z-index, positioning)
   - Add alignment marker comment: `<!-- ALIGNMENT: DevToolbar Integration PH5C.4 -->`

9. **Export DevToolbar and hooks** (D-PH5C-06)
   - Create `packages/shell/src/devToolbar/index.ts` with exports:
     - `DevToolbar` component
     - `useDevAuthBypass` hook
     - `PersonaCard` component
   - Export types: `IDevAuthBypassState`
   - Make exports conditional: only available in DEV mode

10. **Create unit tests for DevToolbar** (D-PH5C-05)
    - Test component renders when `import.meta.env.DEV` is true
    - Test component doesn't render when DEV is false
    - Test expand/collapse toggle works
    - Test persona selection changes currentPersona
    - Test auth delay slider updates correctly
    - Test session display shows correct data
    - Test localStorage persistence works
    - Test event handlers fire correctly
    - Achieve ≥95% code coverage

---

## Production-Ready Code: `packages/shell/src/devToolbar/DevToolbar.tsx`

```typescript
// packages/shell/src/devToolbar/DevToolbar.tsx
// D-PH5C-06: Collapsible dev toolbar with persona switcher, three tabs
// D-PH5C-02: Gated behind import.meta.env.DEV; excluded from production
// Version: 1.0
// Last Updated: 2026-03-07

import React, { useState } from 'react';
import { PERSONA_REGISTRY, type IPersona } from '@hbc/auth/dev';
import { useDevAuthBypass } from './useDevAuthBypass';
import { PersonaCard } from './PersonaCard';
import styles from './DevToolbar.module.css';

type TabType = 'personas' | 'settings' | 'session';

/**
 * DevToolbar
 * ===========
 * Development-only toolbar for persona switching, auth configuration, session inspection
 * D-PH5C-06: Fixed-bottom docked, three-tab interface, collapsible
 */
export const DevToolbar: React.FC = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personas');
  const {
    currentSession,
    authDelay,
    setAuthDelay,
    auditLoggingEnabled,
    setAuditLoggingEnabled,
    selectPersona,
    selectedPersona,
    expireSession,
    refreshSession,
  } = useDevAuthBypass();

  const allPersonas = PERSONA_REGISTRY.all();
  const sessionExpiresIn = currentSession
    ? Math.max(0, currentSession.expiresAt - Date.now())
    : null;
  const sessionExpiresInMinutes = sessionExpiresIn ? Math.floor(sessionExpiresIn / 1000 / 60) : null;

  // ALIGNMENT: DevToolbar Integration PH5C.4
  // This toolbar component integrates with ShellCore.tsx in dev mode

  return (
    <div className={styles.toolbar}>
      <div className={styles.header}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse dev toolbar' : 'Expand dev toolbar'}
        >
          <span className={styles.title}>HB-AUTH-DEV</span>
          <span className={styles.icon}>
            {isExpanded ? '▼' : '▲'}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tab} ${
                activeTab === 'personas' ? styles.tabActive : ''
              }`}
              onClick={() => setActiveTab('personas')}
            >
              Personas
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'session' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('session')}
            >
              Session
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'personas' && (
              <div className={styles.personasTab}>
                <div className={styles.personasGrid}>
                  {allPersonas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      isSelected={selectedPersona?.id === persona.id}
                      onSelect={() => selectPersona(persona)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsTab}>
                <div className={styles.setting}>
                  <label htmlFor="auth-delay-slider">
                    Auth Delay: {authDelay}ms
                  </label>
                  <input
                    id="auth-delay-slider"
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={authDelay}
                    onChange={(e) => setAuthDelay(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.setting}>
                  <label htmlFor="audit-logging-toggle">
                    <input
                      id="audit-logging-toggle"
                      type="checkbox"
                      checked={auditLoggingEnabled}
                      onChange={(e) => setAuditLoggingEnabled(e.target.checked)}
                    />
                    Audit Logging
                  </label>
                </div>

                <div className={styles.setting}>
                  <button
                    className={styles.button}
                    onClick={() => {
                      sessionStorage.clear();
                      console.log('[HB-AUTH-DEV] Cleared sessionStorage');
                    }}
                  >
                    Clear SessionStorage
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'session' && (
              <div className={styles.sessionTab}>
                {currentSession ? (
                  <>
                    <div className={styles.sessionStatus}>
                      <strong>Status:</strong>
                      <span className={styles.statusBadge}>
                        {sessionExpiresIn && sessionExpiresIn > 0
                          ? 'Active'
                          : 'Expired'}
                      </span>
                    </div>

                    <div className={styles.sessionMeta}>
                      <div>
                        <strong>User:</strong> {currentSession.displayName} ({currentSession.email})
                      </div>
                      <div>
                        <strong>Session ID:</strong> {currentSession.sessionId.substring(0, 12)}...
                      </div>
                      <div>
                        <strong>Roles:</strong> {currentSession.roles.join(', ')}
                      </div>
                      {sessionExpiresInMinutes !== null && (
                        <div>
                          <strong>Expires in:</strong> {sessionExpiresInMinutes} minutes
                        </div>
                      )}
                    </div>

                    <div className={styles.sessionJson}>
                      <pre>{JSON.stringify(currentSession, null, 2)}</pre>
                    </div>

                    <div className={styles.sessionActions}>
                      <button
                        className={styles.button}
                        onClick={expireSession}
                      >
                        Expire Session
                      </button>
                      <button
                        className={styles.button}
                        onClick={refreshSession}
                      >
                        Refresh Session
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.noSession}>
                    No active session
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevToolbar;
```

---

## Production-Ready Code: `packages/shell/src/devToolbar/PersonaCard.tsx`

```typescript
// packages/shell/src/devToolbar/PersonaCard.tsx
// Sub-component for displaying persona information in card format

import React from 'react';
import type { IPersona } from '@hbc/auth/dev';
import styles from './PersonaCard.module.css';

export interface PersonaCardProps {
  persona: IPersona;
  isSelected: boolean;
  onSelect: () => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
      title={persona.description}
    >
      <div className={styles.name}>{persona.name}</div>
      <div className={styles.email}>{persona.email}</div>
      <div className={styles.roles}>
        {persona.roles.slice(0, 3).map((role) => (
          <span key={role} className={styles.role}>
            {role}
          </span>
        ))}
      </div>
    </button>
  );
};
```

---

## Production-Ready Code: `packages/shell/src/devToolbar/useDevAuthBypass.ts`

```typescript
// packages/shell/src/devToolbar/useDevAuthBypass.ts
// D-PH5C-02, D-PH5C-03: Custom hook for dev auth state management
// D-PH5C-06: Collapsible toolbar state persistence with localStorage

import { useState, useEffect } from 'react';
import { DevAuthBypassAdapter, type IPersona, PERSONA_REGISTRY, type ISessionData } from '@hbc/auth/dev';

const CONFIG_KEY = 'hb-auth-dev-toolbar-state';
const DELAY_KEY = 'hb-auth-dev-delay';

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
 * Custom hook for managing dev auth toolbar state
 * D-PH5C-03: Manages persona selection, auth delay, session lifecycle
 * D-PH5C-06: Persists state to localStorage
 */
export function useDevAuthBypass(): IDevAuthBypassState {
  const [currentSession, setCurrentSession] = useState<ISessionData | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<IPersona | null>(null);
  const [authDelay, setAuthDelay] = useState(500);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);
  const [adapter, setAdapter] = useState<DevAuthBypassAdapter | null>(null);

  // Initialize adapter and restore state from localStorage
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const savedDelay = localStorage.getItem(DELAY_KEY);
    if (savedDelay) {
      setAuthDelay(Number(savedDelay));
    }

    const newAdapter = new DevAuthBypassAdapter(authDelay);
    setAdapter(newAdapter);

    // Restore session on mount
    newAdapter.restoreSession().then((session) => {
      if (session) {
        setCurrentSession(session);
      }
    });
  }, []);

  // Select persona and trigger auth flow
  const selectPersona = async (persona: IPersona) => {
    if (!adapter) return;

    setSelectedPersona(persona);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(persona));

    try {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);
      setCurrentSession(session);
    } catch (err) {
      console.error('[HB-AUTH-DEV] Failed to select persona:', err);
    }
  };

  // Update auth delay
  const handleSetAuthDelay = (ms: number) => {
    setAuthDelay(ms);
    localStorage.setItem(DELAY_KEY, String(ms));
  };

  // Expire session
  const expireSession = () => {
    sessionStorage.removeItem('hb-auth-dev-session');
    setCurrentSession(null);
  };

  // Refresh session
  const refreshSession = async () => {
    if (!adapter) return;
    const session = await adapter.restoreSession();
    setCurrentSession(session);
  };

  return {
    currentSession,
    selectedPersona,
    authDelay,
    auditLoggingEnabled,
    selectPersona,
    setAuthDelay: handleSetAuthDelay,
    setAuditLoggingEnabled,
    expireSession,
    refreshSession,
  };
}
```

---

## Production-Ready Code: `packages/shell/src/devToolbar/DevToolbar.module.css`

```css
/* packages/shell/src/devToolbar/DevToolbar.module.css */
/* D-PH5C-06: Styling for collapsible dev toolbar */

.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 2px solid #00a0e9;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  z-index: 99999;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  background: linear-gradient(to bottom, #222, #1a1a1a);
  border-bottom: 1px solid #333;
}

.toggleButton {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #00a0e9;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  font-size: 12px;
}

.toggleButton:hover {
  color: #00d4ff;
}

.title {
  font-family: 'Monaco', 'Courier New', monospace;
}

.icon {
  display: inline-block;
  font-size: 10px;
}

.content {
  height: 300px;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: 300px;
    opacity: 1;
  }
}

.tabNavigation {
  display: flex;
  border-bottom: 1px solid #333;
  background: #222;
  gap: 0;
}

.tab {
  flex: 1;
  padding: 8px 12px;
  background: none;
  border: none;
  border-right: 1px solid #333;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.tab:last-child {
  border-right: none;
}

.tab:hover {
  background: #333;
  color: #b0b0b0;
}

.tabActive {
  color: #00a0e9;
  background: #1a1a1a;
  border-bottom: 2px solid #00a0e9;
  padding-bottom: 6px;
}

.tabContent {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  background: #1a1a1a;
}

/* Personas Tab */
.personasTab {
  height: 100%;
  overflow-y: auto;
}

.personasGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

/* Settings Tab */
.settingsTab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting label {
  font-size: 11px;
  color: #b0b0b0;
}

.setting input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.slider {
  width: 100%;
  height: 6px;
  cursor: pointer;
  accent-color: #00a0e9;
}

.button {
  padding: 6px 12px;
  background: #00a0e9;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.2s;
}

.button:hover {
  background: #00d4ff;
}

/* Session Tab */
.sessionTab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sessionStatus {
  display: flex;
  gap: 8px;
  align-items: center;
}

.statusBadge {
  padding: 2px 6px;
  background: #00a0e9;
  color: #fff;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.sessionMeta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #222;
  border-radius: 3px;
  border: 1px solid #333;
  font-size: 11px;
}

.sessionMeta div {
  word-break: break-all;
}

.sessionJson {
  background: #000;
  border: 1px solid #333;
  border-radius: 3px;
  padding: 6px;
  overflow-x: auto;
  flex: 1;
}

.sessionJson pre {
  margin: 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 10px;
  color: #00a0e9;
  line-height: 1.4;
}

.sessionActions {
  display: flex;
  gap: 8px;
}

.noSession {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}
```

---

## Production-Ready Code: `packages/shell/src/devToolbar/index.ts`

```typescript
// packages/shell/src/devToolbar/index.ts
// D-PH5C-06: DevToolbar exports (dev mode only)

if (!import.meta.env.DEV) {
  throw new Error('devToolbar is only available in development mode');
}

export { DevToolbar } from './DevToolbar';
export { PersonaCard, type PersonaCardProps } from './PersonaCard';
export { useDevAuthBypass, type IDevAuthBypassState } from './useDevAuthBypass';
```

---

## Production-Ready Code: Updated `packages/shell/src/ShellCore.tsx` (integration snippet)

```typescript
// packages/shell/src/ShellCore.tsx
// Relevant section showing DevToolbar integration

import React from 'react';
import { ShellHeader } from './header/ShellHeader';
import { ShellContent } from './content/ShellContent';

// ALIGNMENT: DevToolbar Integration PH5C.4
// Dev toolbar is integrated here for development mode persona switching
let DevToolbar: React.ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbar = React.lazy(() =>
    import('./devToolbar/DevToolbar').then((m) => ({ default: m.DevToolbar }))
  );
}

export const ShellCore: React.FC = () => {
  return (
    <div className="shell-container">
      <ShellHeader />
      <ShellContent />

      {/* Dev toolbar rendered at bottom when DEV mode is enabled */}
      {import.meta.env.DEV && DevToolbar && (
        <React.Suspense fallback={null}>
          <DevToolbar />
        </React.Suspense>
      )}
    </div>
  );
};
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar (this task)
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## 5.C.4 Success Criteria Checklist (Task 5C.4)

- [x] 5.C.4.1 `DevToolbar.tsx` created with three tabs (Personas / Settings / Session)
- [x] 5.C.4.2 Collapsible behavior: 36px collapsed, 300–400px expanded with smooth transition
- [x] 5.C.4.3 Personas tab displays all 11 personas with persona cards and selection capability
- [x] 5.C.4.4 Settings tab includes auth delay slider, audit logging toggle, clear sessionStorage button
- [x] 5.C.4.5 Session tab displays current session JSON, expiration countdown, action buttons
- [x] 5.C.4.6 `useDevAuthBypass.ts` hook manages state and localStorage persistence
- [x] 5.C.4.7 `PersonaCard.tsx` component displays persona details and handles selection
- [x] 5.C.4.8 `DevToolbar.module.css` provides complete styling with dark theme
- [x] 5.C.4.9 DevToolbar integrated into `ShellCore.tsx` with `import.meta.env.DEV` guard
- [x] 5.C.4.10 DevToolbar absent from production bundle; ≥95% test coverage

---

## Phase 5.C.4 Progress Notes

- 5.C.4.1 [COMPLETED] — DevToolbar component implementation
- 5.C.4.2 [COMPLETED] — Tab navigation and content
- 5.C.4.3 [COMPLETED] — useDevAuthBypass hook
- 5.C.4.4 [COMPLETED] — CSS styling and layout
- 5.C.4.5 [COMPLETED] — ShellCore.tsx integration

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/shell` - [PASS]
- `pnpm turbo run test --filter=@hbc/shell` - [PASS]
- `pnpm --filter @hbc/dev-harness build` + `rg -n "HB-AUTH-DEV|DevToolbar|devToolbar" apps/dev-harness/dist --glob "*.js"` - [PASS: no matches in production app bundle]
- `pnpm exec vitest run --workspace vitest.workspace.ts packages/shell/src/devToolbar --coverage --coverage.include='packages/shell/src/devToolbar/**' --coverage.exclude='**/*.test.*' --coverage.all=false` - [PASS: devToolbar coverage 95.39%]
- Visual inspection: Toolbar appears in dev mode, functions correctly - [PARTIAL: validated via interaction tests; manual browser inspection not performed in this session]

---

**End of Task PH5C.4**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.4 created: 2026-03-07
DevToolbar specification complete with all three tabs and state management.
PH5C.4 completed: 2026-03-07
D-PH5C-06/D-PH5C-02/D-PH5C-03 traceability closed: DevToolbar, PersonaCard, useDevAuthBypass, and DevToolbar CSS module implemented with DEV-only ShellCore lazy integration and localStorage/session controls.
PH5C.4 verification evidence: `pnpm turbo run build --filter=@hbc/shell` PASS; `pnpm turbo run test --filter=@hbc/shell` PASS; devToolbar interaction suites added (`src/devToolbar/DevToolbar.test.tsx`, `src/devToolbar/useDevAuthBypass.test.tsx` via wrapper test entries); targeted devToolbar coverage command PASS at 95.39%.
PH5C.4 production-boundary evidence: `pnpm --filter @hbc/dev-harness build` PASS and production asset grep (`HB-AUTH-DEV|DevToolbar|devToolbar`) returned no matches.
PH5C.4 remediation note: resolved `@hbc/auth/dev` TypeScript workspace boundary conflict for shell builds by introducing a shell-local type shim path mapping and updating auth dev subpath build/export consistency (`packages/auth/package.json`, `packages/auth/tsconfig.json`, `packages/auth/src/mock/personaRegistry.ts`).
Next: PH5C.5 (Developer How-To Guide)
-->
