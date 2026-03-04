/**
 * HbcFavoriteTools — Up to 6 starred tool icons
 * PH4.4 §Step 3 | Blueprint §2c
 *
 * Hidden if items array is empty.
 */
import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_HEADER_TEXT } from '../theme/tokens.js';
import type { HbcFavoriteToolsProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingTop: '6px',
    paddingBottom: '6px',
    ...shorthands.borderRadius('4px'),
    color: HBC_HEADER_TEXT,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
});

export const HbcFavoriteTools: React.FC<HbcFavoriteToolsProps> = ({ items = [] }) => {
  const styles = useStyles();
  const favorites = items.filter((i) => i.isFavorite).slice(0, 6);

  if (favorites.length === 0) return null;

  return (
    <div className={styles.root} aria-label="Favorite tools" role="toolbar">
      {favorites.map((item) => (
        <button
          key={item.id}
          className={styles.iconButton}
          aria-label={item.label}
          title={item.label}
          type="button"
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};
