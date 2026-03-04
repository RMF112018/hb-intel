/**
 * HbcAppShell — Orchestrator component
 * PH4.4 §Step 6 | Blueprint §1f, §2c
 *
 * Composes: HbcConnectivityBar + HbcHeader + HbcSidebar + <main>
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { HbcConnectivityBar } from './HbcConnectivityBar.js';
import { HbcHeader } from './HbcHeader.js';
import { HbcSidebar } from './HbcSidebar.js';
import { useSidebarState } from './hooks/useSidebarState.js';
import type { HbcAppShellProps } from './types.js';

const useStyles = makeStyles({
  main: {
    marginTop: '58px',
    minHeight: 'calc(100vh - 58px)',
    transitionProperty: 'margin-left',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
  },
  mainExpanded: {
    marginLeft: '240px',
  },
  mainCollapsed: {
    marginLeft: '56px',
  },
  mainMobile: {
    marginLeft: '0px',
  },
});

export const HbcAppShell: React.FC<HbcAppShellProps> = ({
  children,
  user,
  sidebarGroups,
  mode = 'pwa',
  onSignOut,
  onNavigate,
}) => {
  const { isExpanded, isMobile } = useSidebarState();
  const styles = useStyles();

  const mainClass = mergeClasses(
    styles.main,
    isMobile ? styles.mainMobile : isExpanded ? styles.mainExpanded : styles.mainCollapsed,
  );

  return (
    <div data-hbc-shell="app-shell" data-mode={mode}>
      <HbcConnectivityBar />
      <HbcHeader user={user} onSignOut={onSignOut} />
      <HbcSidebar groups={sidebarGroups} onNavigate={onNavigate} />
      <main className={mainClass}>{children}</main>
    </div>
  );
};
