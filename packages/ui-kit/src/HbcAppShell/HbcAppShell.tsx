/**
 * HbcAppShell — Orchestrator component
 * PH4.4 §Step 6 | Blueprint §1f, §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Composes: HbcConnectivityBar + HbcHeader + HbcSidebar + <main>
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useNavStore } from '@hbc/shell';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HbcConnectivityBar } from './HbcConnectivityBar.js';
import { HbcHeader } from './HbcHeader.js';
import { HbcSidebar } from './HbcSidebar.js';
import { HbcBottomNav } from '../HbcBottomNav/index.js';
import { useSidebarState } from './hooks/useSidebarState.js';
import { useIsTablet } from '../hooks/useIsTablet.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { HBC_HEADER_HEIGHT, HBC_CONNECTIVITY_HEIGHT_ONLINE, HBC_CONNECTIVITY_HEIGHT_OFFLINE, HBC_SIDEBAR_WIDTH_COLLAPSED, HBC_SIDEBAR_WIDTH_EXPANDED, HBC_BOTTOM_NAV_HEIGHT } from '../theme/tokens.js';
import type { HbcAppShellProps } from './types.js';
import type { BottomNavItem } from '../HbcBottomNav/types.js';

const FOCUS_EVENT = 'hbc-focus-mode-change';

const useStyles = makeStyles({
  // Shell-foundation: derived from governed tokens instead of magic numbers.
  main: {
    marginTop: `${HBC_HEADER_HEIGHT + HBC_CONNECTIVITY_HEIGHT_ONLINE}px`,
    minHeight: `calc(100vh - ${HBC_HEADER_HEIGHT + HBC_CONNECTIVITY_HEIGHT_ONLINE}px)`,
    transitionProperty: 'margin-left',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    position: 'relative',
  },
  mainExpanded: {
    marginLeft: `${HBC_SIDEBAR_WIDTH_EXPANDED}px`,
  },
  mainCollapsed: {
    marginLeft: `${HBC_SIDEBAR_WIDTH_COLLAPSED}px`,
  },
  mainMobile: {
    marginLeft: '0px',
  },
  mainBottomNav: {
    paddingBottom: `${HBC_BOTTOM_NAV_HEIGHT}px`,
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
  userMenuExtra,
  showProjectSelector = true,
}) => {
  const { isExpanded, isMobile } = useSidebarState();
  const isTablet = useIsTablet();
  const connectivityStatus = useOnlineStatus();
  const { mode: appMode } = useHbcTheme();
  const syncedActiveItemId = useNavStore((s) => s.activeItemId);
  const [isFocusModeActive, setIsFocusModeActive] = React.useState(false);
  const styles = useStyles();
  const shellOffset = connectivityStatus === 'online'
    ? HBC_HEADER_HEIGHT + HBC_CONNECTIVITY_HEIGHT_ONLINE
    : HBC_HEADER_HEIGHT + HBC_CONNECTIVITY_HEIGHT_OFFLINE;
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

  // PH4C.12 / D-PH4C-24: sidebar must never render in tablet/mobile territory.
  const showSidebar = appMode === 'office' && !isTablet && !isFocusModeActive;
  // PH4C.12 / D-PH4C-25: bottom nav owns tablet/mobile and field mode; avoid empty visible rail.
  const showBottomNav = (appMode === 'field' || isTablet) && !isFocusModeActive && bottomNavItems.length > 0;

  const mainClass = mergeClasses(
    styles.main,
    (appMode === 'field' || isTablet)
      ? styles.mainMobile
      : isMobile ? styles.mainMobile : isExpanded && !isFocusModeActive ? styles.mainExpanded : styles.mainCollapsed,
    isFocusModeActive && styles.mainFocusMode,
    showBottomNav && styles.mainBottomNav,
  );

  return (
    <div data-hbc-shell="app-shell" data-mode={mode}>
      <HbcConnectivityBar />
      <HbcHeader user={user} onSignOut={onSignOut} userMenuExtra={userMenuExtra} showProjectSelector={showProjectSelector} mode={mode} />
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
  );
};
