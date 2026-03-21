// packages/shell/src/devToolbar/DevToolbarMenuEntry.tsx
// D-PH5C-06: Menu-entry variant of the dev toolbar — mounts in the user avatar dropdown.
// D-PH5C-02: Gated behind import.meta.env.DEV; excluded from production bundle.
//
// UIF-012: Replaces the fixed bottom-bar DevToolbar with a menu item + floating corner panel so
// the app footer is no longer obstructed during dev evaluation.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { LayoutTab } from '@hbc/models';
import { PERSONA_REGISTRY } from '@hbc/auth/dev';
import { makeStyles, shorthands } from '@griffel/react';
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

const useStyles = makeStyles({
  // Menu item trigger — rendered inside HbcUserMenu dropdown
  menuTrigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: "Monaco, 'Courier New', monospace",
    color: 'var(--hbc-dev-accent, #5aacff)',
    ':hover': {
      backgroundColor: 'rgba(90, 172, 255, 0.08)',
    },
  },
  menuTriggerIcon: {
    fontSize: '0.75rem',
    opacity: '0.7',
  },
  // Floating panel — portaled to document.body, fixed corner position
  panel: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    width: '520px',
    backgroundColor: 'var(--hbc-dev-surface-base)',
    border: '2px solid var(--hbc-dev-border-active)',
    borderRadius: '8px',
    color: 'var(--hbc-dev-text-primary)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '12px',
    // Same governed toast z-index as the old bottom bar (UIF-010 comment preserved)
    zIndex: 1300,
    boxShadow: 'var(--hbc-dev-shadow)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '36px',
    paddingLeft: '12px',
    paddingRight: '8px',
    background: 'linear-gradient(to bottom, var(--hbc-dev-surface-raised), var(--hbc-dev-surface-base))',
    borderBottom: '1px solid var(--hbc-dev-border)',
  },
  panelTitle: {
    fontFamily: "Monaco, 'Courier New', monospace",
    fontWeight: 600,
    fontSize: '12px',
    color: 'var(--hbc-dev-accent)',
  },
  panelCloseButton: {
    color: 'var(--hbc-dev-text-secondary)',
    padding: '0',
    minHeight: '28px',
    ':hover': {
      color: 'var(--hbc-dev-accent-hover)',
    },
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

function resolveSessionVariant(isActive: boolean): React.ComponentProps<typeof HbcStatusBadge>['variant'] {
  return isActive ? 'onTrack' : 'error';
}

/**
 * DevToolbarMenuEntry
 * ===================
 * UIF-012: Replaces the bottom-bar DevToolbar for dev evaluation contexts.
 *
 * Renders two things:
 * 1. A `role="menuitem"` button inserted into HbcUserMenu via the `userMenuExtra` slot.
 * 2. A floating corner panel (portaled to document.body, bottom-right, non-obstructing) that
 *    contains all the same persona/settings/session content as the original DevToolbar.
 *
 * Production safety: the outer DEV guard at the call site (root-route.tsx) ensures this
 * component is never imported or rendered in production.
 */
export const DevToolbarMenuEntry = (): JSX.Element | null => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const styles = useStyles();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
              <label className={styles.settingLabel} htmlFor="dev-entry-auth-delay">
                Auth Delay: {authDelay}ms
              </label>
              <input
                id="dev-entry-auth-delay"
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
              <label className={styles.settingCheckbox} htmlFor="dev-entry-audit-logging">
                <input
                  id="dev-entry-audit-logging"
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
                  <HbcButton
                    variant="danger"
                    size="sm"
                    className={styles.buttonDanger}
                    onClick={expireSession}
                  >
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
    <>
      {/* Menu item trigger — rendered inside HbcUserMenu via userMenuExtra slot */}
      <button
        role="menuitem"
        type="button"
        className={styles.menuTrigger}
        onClick={() => setIsPanelOpen((v) => !v)}
        aria-label="Open dev tools panel"
        aria-expanded={isPanelOpen}
      >
        <span>HB-AUTH-DEV</span>
        <span className={styles.menuTriggerIcon} aria-hidden="true">
          {isPanelOpen ? '✕' : '⚙'}
        </span>
      </button>

      {/* Floating panel — portaled outside the menu DOM to avoid role="menu" nesting issues */}
      {isPanelOpen &&
        createPortal(
          <div
            className={styles.panel}
            data-hbc-shell="dev-toolbar-panel"
            data-hbc-dev-toolbar
            role="dialog"
            aria-label="HB-AUTH-DEV tools"
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>HB-AUTH-DEV</span>
              <HbcButton
                variant="ghost"
                size="sm"
                className={styles.panelCloseButton}
                onClick={() => setIsPanelOpen(false)}
                aria-label="Close dev tools panel"
              >
                ✕
              </HbcButton>
            </div>

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
          </div>,
          document.body,
        )}
    </>
  );
};
