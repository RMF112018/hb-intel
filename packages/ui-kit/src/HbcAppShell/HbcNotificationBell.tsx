/**
 * HbcNotificationBell — Bell icon with unread count badge
 * PH4.4 §Step 3 | Blueprint §2c
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_TEXT, HBC_STATUS_COLORS } from '../theme/tokens.js';
import { HBC_RADIUS_MD, HBC_RADIUS_XL } from '../theme/radii.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { Notifications } from '../icons/index.js';
import type { HbcNotificationBellProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderRadius(HBC_RADIUS_MD),
    // Normalized desktop minimum + coarse-pointer bump.
    minWidth: '36px',
    minHeight: '36px',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '@media (pointer: coarse)': {
      minWidth: '44px',
      minHeight: '44px',
    },
  },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    minWidth: '16px',
    height: '16px',
    backgroundColor: HBC_STATUS_COLORS.error,
    color: HBC_HEADER_TEXT,
    fontSize: '0.625rem',
    fontWeight: '700',
    ...shorthands.borderRadius(HBC_RADIUS_XL),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});

export const HbcNotificationBell: React.FC<HbcNotificationBellProps> = ({
  unreadCount = 0,
  onClick,
}) => {
  const styles = useStyles();

  return (
    <button
      className={styles.root}
      onClick={onClick}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      type="button"
    >
      <Notifications size="md" color={HBC_HEADER_TEXT} />
      {unreadCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
