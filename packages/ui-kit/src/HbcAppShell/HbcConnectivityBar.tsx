/**
 * HbcConnectivityBar — canonical shell-status rail (Phase 5.6).
 *
 * Legacy compatibility:
 * - Still accepts simple connectivity `status` for pre-5.6 consumers.
 * - Prefers centralized `shellStatus` snapshot when provided.
 *
 * Alignment notes:
 * - Unified shell-status surface per PH5.6 locked Option C.
 * - D-10: no feature-level direct state writes; shell passes centralized snapshot.
 *
 * PH4C.2 remediation:
 * - D-PH4C-07/D-PH4C-08 require tokenized action-rail text/border colors for
 *   dual-theme support (light + field) with no hardcoded hex/rgba values.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { isShellStatusActionAllowed, type ShellStatusAction, type ShellStatusSnapshot } from '@hbc/shell';
import { HBC_CONNECTIVITY } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { keyframes } from '../theme/animations.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import type { HbcConnectivityBarProps, ConnectivityStatus } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    width: '100%',
    zIndex: Z_INDEX.connectivityBar,
    transitionProperty: 'height, background-color, border-color',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease-in-out',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    ...shorthands.padding('0px', '8px'),
    gap: '8px',
  },
  online: {
    height: '2px',
    backgroundColor: HBC_CONNECTIVITY.online,
  },
  syncing: {
    height: '4px',
    backgroundColor: HBC_CONNECTIVITY.syncing,
    animationName: keyframes.pulse,
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  offline: {
    height: '4px',
    backgroundColor: HBC_CONNECTIVITY.offline,
    animationName: keyframes.pulse,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  railExpanded: {
    minHeight: '28px',
    ...shorthands.padding('4px', '8px'),
    // PH4C.2 (D-PH4C-07/D-PH4C-08): semantic contrast token on connectivity surfaces.
    color: 'var(--hbc-text-on-dark)',
    fontSize: '12px',
    lineHeight: '16px',
  },
  message: {
    flexGrow: 1,
    fontWeight: 500,
  },
  actions: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionButton: {
    backgroundColor: 'transparent',
    // PH4C.2 (D-PH4C-07/D-PH4C-08): dual-theme token replacement for button foreground.
    color: 'var(--hbc-text-on-dark)',
    ...shorthands.border('1px', 'solid', 'var(--hbc-text-on-dark-alpha)'),
    ...shorthands.borderRadius('4px'),
    fontSize: '11px',
    lineHeight: '14px',
    ...shorthands.padding('2px', '6px'),
    cursor: 'pointer',
  },
});

const ariaLabels: Record<ConnectivityStatus, string> = {
  online: 'Connected',
  syncing: 'Syncing data',
  offline: 'No connection',
};

/**
 * Phase 5.7 added explicit shell recovery signaling (`recovered`).
 * The connectivity rail keeps recovery semantics as "back online", and this
 * exhaustive Record intentionally fails fast when new shell status kinds are added.
 */
const shellStatusToConnectivityStatus: Record<ShellStatusSnapshot['kind'], ConnectivityStatus> = {
  initializing: 'syncing',
  'restoring-session': 'syncing',
  connected: 'online',
  reconnecting: 'syncing',
  recovered: 'online',
  degraded: 'syncing',
  'access-validation-issue': 'offline',
  'error-failure': 'offline',
};

const actionLabels: Record<ShellStatusAction, string> = {
  retry: 'Retry',
  'sign-in-again': 'Sign in again',
  'learn-more': 'Learn more',
};

export interface ConnectivityBarViewModel {
  status: ConnectivityStatus;
  showExpandedRail: boolean;
  message: string;
  actions: readonly ShellStatusAction[];
}

/**
 * Resolve connectivity-bar rendering model from centralized shell status with a
 * backward-compatible fallback to legacy network-only status.
 */
export function buildConnectivityBarViewModel(params: {
  detectedStatus: ConnectivityStatus;
  statusOverride?: ConnectivityStatus;
  shellStatus?: ShellStatusSnapshot;
}): ConnectivityBarViewModel {
  // Phase 5.6 intentionally keeps a flat status model. Richer feature-specific
  // sub-state contributions are deferred and documented, not implemented here.
  const status = params.shellStatus
    ? shellStatusToConnectivityStatus[params.shellStatus.kind]
    : params.statusOverride ?? params.detectedStatus;
  const showExpandedRail = Boolean(params.shellStatus && params.shellStatus.kind !== 'connected');
  const message = params.shellStatus?.message ?? ariaLabels[status];
  const actions = params.shellStatus?.actions ?? [];

  return {
    status,
    showExpandedRail,
    message,
    actions,
  };
}

export const HbcConnectivityBar: React.FC<HbcConnectivityBarProps> = ({
  status: statusOverride,
  shellStatus,
  onShellAction,
}) => {
  const detectedStatus = useOnlineStatus();
  const viewModel = buildConnectivityBarViewModel({
    detectedStatus,
    statusOverride,
    shellStatus,
  });
  const { status, showExpandedRail, message, actions } = viewModel;
  const styles = useStyles();
  const connectivityHeight = showExpandedRail ? '28px' : status === 'online' ? '2px' : '4px';
  const ariaLabel = shellStatus ? message : ariaLabels[status];

  return (
    <div
      className={mergeClasses(
        styles.root,
        styles[status],
        showExpandedRail ? styles.railExpanded : undefined,
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      data-hbc-ui="connectivity-bar"
      data-hbc-status={status}
      style={{ '--hbc-connectivity-height': connectivityHeight } as React.CSSProperties}
    >
      {showExpandedRail ? (
        <>
          <span className={styles.message}>{message}</span>
          {actions.length > 0 ? (
            <span className={styles.actions}>
              {actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className={styles.actionButton}
                  onClick={() => {
                    if (!shellStatus || !isShellStatusActionAllowed(shellStatus, action)) {
                      return;
                    }
                    onShellAction?.(action);
                  }}
                >
                  {actionLabels[action]}
                </button>
              ))}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
