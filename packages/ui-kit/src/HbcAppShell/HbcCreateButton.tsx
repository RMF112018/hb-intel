/**
 * HbcCreateButton — Orange + Create CTA
 * PH4.4 §Step 3 | Blueprint §2c
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { label } from '../theme/typography.js';
import { CloudOffline, Create } from '../icons/index.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import type { HbcCreateButtonProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    ...label,
    ...shorthands.borderStyle('none'),
    ...shorthands.borderRadius('4px'),
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: '#E0641A',
    },
    ':active': {
      backgroundColor: '#CC5A17',
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
      {isOffline ? <CloudOffline size="sm" color="#FFFFFF" /> : <Create size="sm" color="#FFFFFF" />}
      <span>Create</span>
    </button>
  );
};
