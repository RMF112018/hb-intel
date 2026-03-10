// packages/shell/src/devToolbar/DevToolbar.tsx
// D-PH5C-06: Collapsible dev toolbar with persona switcher and three tabs.
// D-PH5C-02: Gated behind import.meta.env.DEV; excluded from production bundle.
// D-PH4C-13: PH4C.10 UI Kit application for shell dev tooling.

import { useState } from 'react';
import type { LayoutTab } from '@hbc/models';
import { PERSONA_REGISTRY } from '@hbc/auth/dev';
import { makeStyles } from '@griffel/react';
import { HbcButton, HbcStatusBadge, HbcTabs } from '@hbc/ui-kit';
import { PersonaCard } from './PersonaCard.js';
import { useDevAuthBypass } from './useDevAuthBypass.js';
import './devToolbarTokens.css';

type TabType = 'personas' | 'settings' | 'session';

const TABS: LayoutTab[] = [
  { id: 'personas', label: 'Personas' },
  { id: 'settings', label: 'Settings' },
  { id: 'session', label: 'Session' },
];

const useDevToolbarStyles = makeStyles({
  toolbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--hbc-dev-surface-base)',
    borderTop: '2px solid var(--hbc-dev-border-active)',
    color: 'var(--hbc-dev-text-primary)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '12px',
    zIndex: 99999,
    boxShadow: 'var(--hbc-dev-shadow)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    padding: '0 12px',
    background: 'linear-gradient(to bottom, var(--hbc-dev-surface-raised), var(--hbc-dev-surface-base))',
    borderBottom: '1px solid var(--hbc-dev-border)',
  },
  toggleButton: {
    color: 'var(--hbc-dev-accent)',
    padding: '0',
    minHeight: '28px',
    ':hover': {
      color: 'var(--hbc-dev-accent-hover)',
    },
  },
  titleText: {
    fontFamily: "Monaco, 'Courier New', monospace",
    fontWeight: 600,
    fontSize: '12px',
  },
  content: {
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--hbc-dev-surface-base)',
    overflow: 'hidden',
  },
  tabShell: {
    '& [role="tablist"]': {
      borderBottom: '1px solid var(--hbc-dev-border)',
      backgroundColor: 'var(--hbc-dev-surface-raised)',
      height: '40px',
      paddingLeft: '12px',
      paddingRight: '12px',
      gap: '20px',
    },
    '& [role="tab"]': {
      color: 'var(--hbc-dev-text-secondary)',
      fontSize: '12px',
    },
    '& [role="tab"]:hover': {
      color: 'var(--hbc-dev-text-primary)',
      backgroundColor: 'transparent',
    },
    '& [role="tab"][aria-selected="true"]': {
      color: 'var(--hbc-dev-accent)',
      borderBottomColor: 'var(--hbc-dev-accent)',
    },
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
    backgroundColor: 'var(--hbc-dev-surface-base)',
  },
  personasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '8px',
  },
  settingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  settingLabel: {
    fontSize: '11px',
    color: 'var(--hbc-dev-text-secondary)',
  },
  settingCheckbox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--hbc-dev-text-secondary)',
  },
  slider: {
    width: '100%',
    height: '6px',
    cursor: 'pointer',
    accentColor: 'var(--hbc-dev-accent)',
  },
  sessionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sessionStatusRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    backgroundColor: 'var(--hbc-dev-surface-raised)',
    borderRadius: '3px',
    border: '1px solid var(--hbc-dev-border)',
    fontSize: '11px',
  },
  sessionMetaLine: {
    wordBreak: 'break-all',
  },
  sessionJson: {
    backgroundColor: 'var(--hbc-dev-surface-overlay)',
    border: '1px solid var(--hbc-dev-border)',
    borderRadius: '3px',
    padding: '6px',
    overflowX: 'auto',
    flex: 1,
  },
  sessionJsonPre: {
    margin: 0,
    fontFamily: "Monaco, 'Courier New', monospace",
    fontSize: '10px',
    color: 'var(--hbc-dev-text-code)',
    lineHeight: '1.4',
  },
  sessionActions: {
    display: 'flex',
    gap: '8px',
  },
  buttonSecondary: {
    color: 'var(--hbc-dev-text-primary)',
    border: '1px solid var(--hbc-dev-border)',
    backgroundColor: 'var(--hbc-dev-surface-raised)',
  },
  buttonAccent: {
    color: 'var(--hbc-dev-accent-text)',
    backgroundColor: 'var(--hbc-dev-accent)',
  },
  buttonDanger: {
    color: 'var(--hbc-dev-accent-text)',
    backgroundColor: 'var(--hbc-dev-status-expired)',
  },
  noSession: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--hbc-dev-text-muted)',
    fontStyle: 'italic',
  },
});

/**
 * D-PH4C-13 traceability:
 * map dev toolbar runtime status to current HbcStatusBadge API (`variant` + `label`).
 */
function resolveSessionVariant(isActive: boolean): React.ComponentProps<typeof HbcStatusBadge>['variant'] {
  return isActive ? 'onTrack' : 'error';
}

/**
 * DevToolbar
 * ==========
 * D-PH4C-13: migrated to ui-kit controls (`HbcButton`, `HbcTabs`, `HbcStatusBadge`) and
 * makeStyles dark palette with `[data-hbc-dev-toolbar]` scoped token overrides.
 *
 * Production-boundary safety: the runtime DEV guard remains unchanged and is the
 * enforcement point ensuring this module (and `devToolbarTokens.css`) is not loaded in production.
 */
export const DevToolbar = (): JSX.Element | null => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const styles = useDevToolbarStyles();
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
  const sessionExpiresIn = currentSession ? Math.max(0, currentSession.expiresAt - Date.now()) : null;
  const sessionExpiresInMinutes = sessionExpiresIn ? Math.floor(sessionExpiresIn / 1000 / 60) : null;
  const isSessionActive = Boolean(sessionExpiresIn && sessionExpiresIn > 0);

  const panels = [
    {
      tabId: 'personas',
      content: (
        <div className={styles.tabContent}>
          <div className={styles.personasGrid}>
            {allPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isSelected={selectedPersona?.id === persona.id}
                onSelect={() => {
                  void selectPersona(persona);
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      tabId: 'settings',
      content: (
        <div className={styles.tabContent}>
          <div className={styles.settingsContainer}>
            <div className={styles.settingRow}>
              <label className={styles.settingLabel} htmlFor="auth-delay-slider">Auth Delay: {authDelay}ms</label>
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

            <div className={styles.settingRow}>
              <label className={styles.settingCheckbox} htmlFor="audit-logging-toggle">
                <input
                  id="audit-logging-toggle"
                  type="checkbox"
                  checked={auditLoggingEnabled}
                  onChange={(e) => setAuditLoggingEnabled(e.target.checked)}
                />
                Audit Logging
              </label>
            </div>

            <div className={styles.settingRow}>
              <HbcButton
                variant="secondary"
                size="sm"
                className={styles.buttonAccent}
                onClick={() => {
                  sessionStorage.clear();
                  console.log('[HB-AUTH-DEV] Cleared sessionStorage');
                }}
              >
                Clear SessionStorage
              </HbcButton>
            </div>
          </div>
        </div>
      ),
    },
    {
      tabId: 'session',
      content: (
        <div className={styles.tabContent}>
          <div className={styles.sessionContainer}>
            {currentSession ? (
              <>
                <div className={styles.sessionStatusRow}>
                  <strong>Status:</strong>
                  <HbcStatusBadge
                    variant={resolveSessionVariant(isSessionActive)}
                    label={isSessionActive ? 'Active' : 'Expired'}
                    size="small"
                  />
                </div>

                <div className={styles.sessionMeta}>
                  <div className={styles.sessionMetaLine}>
                    <strong>User:</strong> {currentSession.displayName} ({currentSession.email})
                  </div>
                  <div className={styles.sessionMetaLine}>
                    <strong>Session ID:</strong> {currentSession.sessionId.substring(0, 12)}...
                  </div>
                  <div className={styles.sessionMetaLine}>
                    <strong>Roles:</strong> {currentSession.roles.join(', ')}
                  </div>
                  {sessionExpiresInMinutes !== null && (
                    <div className={styles.sessionMetaLine}>
                      <strong>Expires in:</strong> {sessionExpiresInMinutes} minutes
                    </div>
                  )}
                </div>

                <div className={styles.sessionJson}>
                  <pre className={styles.sessionJsonPre}>{JSON.stringify(currentSession, null, 2)}</pre>
                </div>

                <div className={styles.sessionActions}>
                  <HbcButton variant="danger" size="sm" className={styles.buttonDanger} onClick={expireSession}>
                    Expire Session
                  </HbcButton>
                  <HbcButton
                    variant="secondary"
                    size="sm"
                    className={styles.buttonSecondary}
                    onClick={() => {
                      void refreshSession();
                    }}
                  >
                    Refresh Session
                  </HbcButton>
                </div>
              </>
            ) : (
              <div className={styles.noSession}>No active session</div>
            )}
          </div>
        </div>
      ),
    },
  ] as const;

  return (
    <div className={styles.toolbar} data-hbc-shell="dev-toolbar" data-hbc-dev-toolbar>
      <div className={styles.header}>
        <HbcButton
          variant="ghost"
          size="sm"
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          icon={<span aria-hidden="true">{isExpanded ? '▼' : '▲'}</span>}
          iconPosition="after"
        >
          <span className={styles.titleText}>HB-AUTH-DEV</span>
        </HbcButton>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <HbcTabs
            className={styles.tabShell}
            tabs={TABS}
            activeTabId={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            panels={[...panels]}
            isFieldMode
          />
        </div>
      )}
    </div>
  );
};

export default DevToolbar;
