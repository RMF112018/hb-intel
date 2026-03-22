/**
 * HbcHeader — 56px dark header bar
 * PH4.4 §Step 4 | Blueprint §1f, §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Layout: Logo + ProjectSelector | Toolbox + Favorites + Search | Create + M365 + Notifications + UserMenu
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_DARK_HEADER, HBC_HEADER_TEXT, HBC_ACCENT_ORANGE, HBC_HEADER_HEIGHT, HBC_CONNECTIVITY_HEIGHT_ONLINE, HBC_CONNECTIVITY_HEIGHT_OFFLINE } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HBC_BREAKPOINT_SIDEBAR } from '../theme/breakpoints.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import { ViewGrid } from '../icons/index.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { HbcProjectSelector } from './HbcProjectSelector.js';
import { HbcToolboxFlyout } from './HbcToolboxFlyout.js';
import { HbcFavoriteTools } from './HbcFavoriteTools.js';
import { HbcGlobalSearch } from './HbcGlobalSearch.js';
import { HbcCreateButton } from './HbcCreateButton.js';
import { HbcNotificationBell } from './HbcNotificationBell.js';
import { HbcUserMenu } from './HbcUserMenu.js';
import type { HbcHeaderProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: `${HBC_CONNECTIVITY_HEIGHT_ONLINE}px`,
    left: '0px',
    width: '100%',
    height: `${HBC_HEADER_HEIGHT}px`,
    backgroundColor: HBC_DARK_HEADER,
    // Shell-foundation: governed separator between header and page content.
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    boxSizing: 'border-box',
    zIndex: Z_INDEX.header,
  },
  // Header zone rebalance: left anchors identity, center holds search, right holds actions.
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
    minWidth: '160px',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: '480px',
    marginLeft: 'auto',
    marginRight: 'auto',
    // PH4C.12: align toolbar collapse with canonical sidebar boundary.
    [`@media (max-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      display: 'none',
    },
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexShrink: 0,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecorationLine: 'none',
    gap: '8px',
  },
  // Brand lockup: "HB Intel" with accent left border pill.
  logoFallback: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '700',
    fontSize: '0.875rem',
    letterSpacing: '0.02em',
    color: HBC_HEADER_TEXT,
    paddingLeft: '8px',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_ACCENT_ORANGE as string,
  },
  m365Button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '8px',
    paddingBottom: '8px',
    ...shorthands.borderRadius('4px'),
    // Normalized desktop minimum + coarse-pointer bump.
    minWidth: '36px',
    minHeight: '36px',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '@media (pointer: coarse)': {
      minHeight: '44px',
      minWidth: '44px',
    },
  },
});

export const HbcHeader: React.FC<HbcHeaderProps> = ({
  user,
  logo,
  onSignOut,
  onCreateClick,
  onSearchOpen,
  onNotificationsOpen,
  notificationCount = 0,
  onProjectSelect,
  onToolboxOpen,
  userMenuExtra,
  showProjectSelector = true,
  mode = 'pwa',
}) => {
  const styles = useStyles();
  const { isFieldMode, toggleFieldMode } = useHbcTheme();
  const connectivityStatus = useOnlineStatus();
  const topOffset = connectivityStatus === 'online'
    ? `${HBC_CONNECTIVITY_HEIGHT_ONLINE}px`
    : `${HBC_CONNECTIVITY_HEIGHT_OFFLINE}px`;

  const shellUser = user
    ? {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        initials: user.initials,
      }
    : null;

  return (
    <header
      className={styles.root}
      role="banner"
      data-hbc-ui="header"
      style={{ top: topOffset }}
    >
      {/* Left: Brand lockup + Project Selector */}
      <div className={styles.left}>
        <a href="/" className={styles.logoLink} aria-label="HB Intel — Home">
          {logo ?? <span className={styles.logoFallback}>HB Intel</span>}
        </a>
        {showProjectSelector && <HbcProjectSelector onProjectSelect={onProjectSelect} />}
      </div>

      {/* Center: Search (sole center affordance) */}
      <div className={styles.center}>
        <HbcGlobalSearch onSearchOpen={onSearchOpen} />
      </div>

      {/* Right: Toolbox + Favorites + Create + M365 + Notifications + User */}
      <div className={styles.right}>
        <HbcToolboxFlyout onToolboxOpen={onToolboxOpen} />
        <HbcFavoriteTools />
        <HbcCreateButton onClick={onCreateClick} />
        {/* M365 launcher — suppressed in SPFx where the host provides its own. */}
        {mode !== 'spfx' && (
          <button
            className={styles.m365Button}
            aria-label="Microsoft 365 apps"
            title="Microsoft 365 apps"
            type="button"
          >
            <ViewGrid size="lg" color={HBC_HEADER_TEXT} />
          </button>
        )}
        <HbcNotificationBell onClick={onNotificationsOpen} unreadCount={notificationCount} />
        {shellUser && (
          <HbcUserMenu
            user={shellUser}
            isFieldMode={isFieldMode}
            onToggleFieldMode={toggleFieldMode}
            onSignOut={onSignOut}
            userMenuExtra={userMenuExtra}
          />
        )}
      </div>
    </header>
  );
};
