/**
 * HbcHeader — 56px dark header bar
 * PH4.4 §Step 4 | Blueprint §1f, §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Layout: Logo + ProjectSelector | Toolbox + Favorites + Search | Create + M365 + Notifications + UserMenu
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_DARK_HEADER, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HBC_BREAKPOINT_SIDEBAR } from '../theme/breakpoints.js';
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
    top: '2px',
    left: '0px',
    width: '100%',
    height: '56px',
    backgroundColor: HBC_DARK_HEADER,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '16px',
    paddingRight: '16px',
    boxSizing: 'border-box',
    zIndex: Z_INDEX.header,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexGrow: 1,
    justifyContent: 'center',
    // PH4C.12: align toolbar collapse with canonical sidebar boundary.
    [`@media (max-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      display: 'none',
    },
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecorationLine: 'none',
  },
  logoFallback: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    color: HBC_HEADER_TEXT,
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
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  onProjectSelect,
  onToolboxOpen,
}) => {
  const styles = useStyles();
  const { isFieldMode, toggleFieldMode } = useHbcTheme();
  const connectivityStatus = useOnlineStatus();
  const topOffset = connectivityStatus === 'online' ? '2px' : '4px';

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
      {/* Left: Logo + Project Selector */}
      <div className={styles.left}>
        <a href="/" className={styles.logoLink} aria-label="Project Home">
          {logo ?? <span className={styles.logoFallback}>HB</span>}
        </a>
        <HbcProjectSelector onProjectSelect={onProjectSelect} />
      </div>

      {/* Center: Toolbox + Favorites + Search */}
      <div className={styles.center}>
        <HbcToolboxFlyout onToolboxOpen={onToolboxOpen} />
        <HbcFavoriteTools />
        <HbcGlobalSearch onSearchOpen={onSearchOpen} />
      </div>

      {/* Right: Create + M365 + Notifications + User */}
      <div className={styles.right}>
        <HbcCreateButton onClick={onCreateClick} />
        <button className={styles.m365Button} aria-label="Microsoft 365 apps" type="button">
          <ViewGrid size="lg" color={HBC_HEADER_TEXT} />
        </button>
        <HbcNotificationBell onClick={onNotificationsOpen} />
        {shellUser && (
          <HbcUserMenu
            user={shellUser}
            isFieldMode={isFieldMode}
            onToggleFieldMode={toggleFieldMode}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </header>
  );
};
