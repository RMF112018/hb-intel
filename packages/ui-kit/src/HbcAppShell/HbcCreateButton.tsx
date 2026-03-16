/**
 * HbcCreateButton — Orange + Create CTA
 * PH4.4 §Step 3 | Blueprint §2c
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_ACCENT_ORANGE, HBC_ACCENT_ORANGE_HOVER, HBC_ACCENT_ORANGE_PRESSED, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { label } from '../theme/typography.js';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import { CloudOffline, Create } from '../icons/index.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import type { HbcCreateButtonProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: HBC_ACCENT_ORANGE,
    color: HBC_HEADER_TEXT,
    ...label,
    ...shorthands.borderStyle('none'),
    ...shorthands.borderRadius(HBC_RADIUS_MD),
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: '8px',
    paddingBottom: '8px',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: HBC_ACCENT_ORANGE_HOVER,
    },
    ':active': {
      backgroundColor: HBC_ACCENT_ORANGE_PRESSED,
    },
  },
});

export const HbcCreateButton: React.FC<HbcCreateButtonProps> = ({ onClick }) => {
  const styles = useStyles();
  const status = useOnlineStatus();
  const isOffline = status === 'offline';
  const tooltip = isOffline
    ? 'This action requires a network connection and will sync when you reconnect.'
    : undefined;

  const handleClick = () => {
    if (isOffline) return;
    onClick?.();
  };

  return (
    <button
      className={styles.root}
      onClick={handleClick}
      aria-label={isOffline ? 'Create new item (offline unavailable)' : 'Create new item'}
      type="button"
      title={tooltip}
    >
      {isOffline ? <CloudOffline size="sm" color={HBC_HEADER_TEXT} /> : <Create size="sm" color={HBC_HEADER_TEXT} />}
      <span>Create</span>
    </button>
  );
};
