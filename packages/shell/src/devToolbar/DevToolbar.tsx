// packages/shell/src/devToolbar/DevToolbar.tsx
// D-PH5C-06: Collapsible dev toolbar with persona switcher, three tabs
// D-PH5C-02: Gated behind import.meta.env.DEV; excluded from production
// Version: 1.0
// Last Updated: 2026-03-07

import { useState } from 'react';
import { PERSONA_REGISTRY } from '@hbc/auth/dev';
import { useDevAuthBypass } from './useDevAuthBypass.js';
import { PersonaCard } from './PersonaCard.js';
import styles from './DevToolbar.module.css';

type TabType = 'personas' | 'settings' | 'session';

/**
 * DevToolbar
 * ===========
 * Development-only toolbar for persona switching, auth configuration, and session inspection.
 * D-PH5C-06: Fixed-bottom docked, three-tab interface, collapsible.
 * D-PH5C-02: Runtime guard ensures the toolbar cannot render in production mode.
 */
export const DevToolbar = (): JSX.Element | null => {
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

  // D-PH5C-06: PERSONA_REGISTRY.all() is expected to return base personas first, then supplemental.
  const allPersonas = PERSONA_REGISTRY.all();
  const sessionExpiresIn = currentSession ? Math.max(0, currentSession.expiresAt - Date.now()) : null;
  const sessionExpiresInMinutes = sessionExpiresIn ? Math.floor(sessionExpiresIn / 1000 / 60) : null;

  // ALIGNMENT: DevToolbar Integration PH5C.4
  // D-PH5C-06: This toolbar integrates with ShellCore.tsx only when DEV mode is enabled.

  return (
    <div className={styles.toolbar} data-hbc-shell="dev-toolbar">
      <div className={styles.header}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse dev toolbar' : 'Expand dev toolbar'}
          type="button"
        >
          <span className={styles.title}>HB-AUTH-DEV</span>
          <span className={styles.icon}>{isExpanded ? '▼' : '▲'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.tabNavigation}>
            {/* D-PH5C-06: Three-tab state machine is centralized in activeTab. */}
            <button
              className={`${styles.tab} ${activeTab === 'personas' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('personas')}
              type="button"
            >
              Personas
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('settings')}
              type="button"
            >
              Settings
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'session' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('session')}
              type="button"
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
                      onSelect={() => {
                        // D-PH5C-03: Selecting a persona triggers the simulated auth lifecycle.
                        void selectPersona(persona);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsTab}>
                <div className={styles.setting}>
                  <label htmlFor="auth-delay-slider">Auth Delay: {authDelay}ms</label>
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
                      // D-PH5C-03: Allows test operators to force a clean restoreSession path.
                      sessionStorage.clear();
                      console.log('[HB-AUTH-DEV] Cleared sessionStorage');
                    }}
                    type="button"
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
                      <span className={styles.statusBadge}>{sessionExpiresIn && sessionExpiresIn > 0 ? 'Active' : 'Expired'}</span>
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
                      <button className={styles.button} onClick={expireSession} type="button">
                        Expire Session
                      </button>
                      <button
                        className={styles.button}
                        onClick={() => {
                          // D-PH5C-03: Manual restore trigger for lifecycle validation.
                          void refreshSession();
                        }}
                        type="button"
                      >
                        Refresh Session
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.noSession}>No active session</div>
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
