/**
 * HbcConnectivityBar — 2px ambient connectivity strip
 * PH4.4 §Step 2 | Blueprint §2c
 *
 * Online: 2px solid green | Syncing: 4px amber + pulse 2s | Offline: 4px red + pulse 1.5s
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { HBC_CONNECTIVITY } from '../theme/tokens.js';
import { keyframes } from '../theme/animations.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import type { HbcConnectivityBarProps, ConnectivityStatus } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    width: '100%',
    zIndex: 10001,
    transitionProperty: 'height, background-color',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease-in-out',
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
  },
  offline: {
    height: '4px',
    backgroundColor: HBC_CONNECTIVITY.offline,
    animationName: keyframes.pulse,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
});

const ariaLabels: Record<ConnectivityStatus, string> = {
  online: 'Connected',
  syncing: 'Syncing data',
  offline: 'No connection',
};

export const HbcConnectivityBar: React.FC<HbcConnectivityBarProps> = ({ status: statusOverride }) => {
  const detectedStatus = useOnlineStatus();
  const status = statusOverride ?? detectedStatus;
  const styles = useStyles();

  return (
    <div
      className={mergeClasses(styles.root, styles[status])}
      role="status"
      aria-live="polite"
      aria-label={ariaLabels[status]}
      data-hbc-ui="connectivity-bar"
      data-hbc-status={status}
    />
  );
};
