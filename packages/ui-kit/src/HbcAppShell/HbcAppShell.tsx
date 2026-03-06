/**
 * HbcAppShell — Orchestrator component
 * PH4.4 §Step 6 | Blueprint §1f, §2c
 *
 * Composes: HbcConnectivityBar + HbcHeader + HbcSidebar + <main>
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { FluentProvider } from '@fluentui/react-components';
import { useNavStore } from '@hbc/shell';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HbcConnectivityBar } from './HbcConnectivityBar.js';
import { HbcHeader } from './HbcHeader.js';
import { HbcSidebar } from './HbcSidebar.js';
import { HbcBottomNav } from '../HbcBottomNav/index.js';
import { useSidebarState } from './hooks/useSidebarState.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { useFieldMode } from './hooks/useFieldMode.js';
import type { HbcAppShellProps } from './types.js';
import type { BottomNavItem } from '../HbcBottomNav/types.js';

const FOCUS_EVENT = 'hbc-focus-mode-change';

const useStyles = makeStyles({
  main: {
    marginTop: '58px',
    minHeight: 'calc(100vh - 58px)',
    transitionProperty: 'margin-left',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    position: 'relative',
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
  mainBottomNav: {
    paddingBottom: '56px',
  },
  mainFocusMode: {
    zIndex: Z_INDEX.sidebar,
    position: 'relative',
  },
  focusOverlay: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: Z_INDEX.sidebar - 1,
    pointerEvents: 'none',
    transitionProperty: 'opacity',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'ease-in-out',
  },
  focusOverlayHidden: {
    opacity: '0',
    pointerEvents: 'none',
  },
  focusOverlayVisible: {
    opacity: '1',
  },
});

export const HbcAppShell: React.FC<HbcAppShellProps> = ({
  children,
  user,
  sidebarGroups,
  activeItemId,
  mode = 'pwa',
  onSignOut,
  onNavigate,
}) => {
  const { isExpanded, isMobile } = useSidebarState();
  const connectivityStatus = useOnlineStatus();
  const { mode: appMode, resolvedTheme } = useFieldMode();
  const syncedActiveItemId = useNavStore((s) => s.activeItemId);
  const [isFocusModeActive, setIsFocusModeActive] = React.useState(false);
  const styles = useStyles();
  const shellOffset = connectivityStatus === 'online' ? 58 : 60;
  // D-04: Route-derived nav state in navStore is authoritative when explicit prop is not supplied.
  const resolvedActiveItemId = activeItemId ?? syncedActiveItemId;

  // Listen for Focus Mode CustomEvent from CreateUpdateLayout
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail;
      setIsFocusModeActive(detail.active);
    };
    window.addEventListener(FOCUS_EVENT, handler);
    return () => window.removeEventListener(FOCUS_EVENT, handler);
  }, []);

  // Derive bottom nav items from sidebar groups — PH4.14.5
  const bottomNavItems: BottomNavItem[] = React.useMemo(
    () =>
      sidebarGroups.flatMap((g) =>
        g.items.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          href: item.href,
        })),
      ),
    [sidebarGroups],
  );

  // PH4B.10: Field mode → bottom nav (no sidebar); Office mode → sidebar (no bottom nav)
  const showBottomNav = appMode === 'field' && !isFocusModeActive;
  const showSidebar = appMode === 'office';

  const mainClass = mergeClasses(
    styles.main,
    appMode === 'field'
      ? styles.mainMobile
      : isMobile ? styles.mainMobile : isExpanded && !isFocusModeActive ? styles.mainExpanded : styles.mainCollapsed,
    isFocusModeActive && styles.mainFocusMode,
    showBottomNav && styles.mainBottomNav,
  );

  return (
    <FluentProvider theme={resolvedTheme}>
      <div data-hbc-shell="app-shell" data-mode={mode}>
        <HbcConnectivityBar />
        <HbcHeader user={user} onSignOut={onSignOut} />
        {showSidebar && (
          <HbcSidebar groups={sidebarGroups} activeItemId={resolvedActiveItemId} onNavigate={onNavigate} />
        )}
        {/* Focus Mode overlay */}
        <div
          className={mergeClasses(
            styles.focusOverlay,
            isFocusModeActive ? styles.focusOverlayVisible : styles.focusOverlayHidden,
          )}
          aria-hidden="true"
        />
        <main
          className={mainClass}
          style={{ marginTop: `${shellOffset}px`, minHeight: `calc(100vh - ${shellOffset}px)` }}
        >
          {children}
        </main>
        {/* Bottom navigation — tablet/mobile only (PH4.14.5) */}
        {showBottomNav && (
          <HbcBottomNav
            items={bottomNavItems}
            activeId={resolvedActiveItemId}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </FluentProvider>
  );
};
