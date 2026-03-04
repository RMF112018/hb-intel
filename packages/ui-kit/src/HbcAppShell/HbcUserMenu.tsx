/**
 * HbcUserMenu — Avatar dropdown with Field Mode toggle
 * PH4.4 §Step 3 | Blueprint §2c
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { HBC_HEADER_TEXT, HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { Z_INDEX } from '../theme/z-index.js';
import type { HbcUserMenuProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    ...shorthands.borderRadius('50%'),
    backgroundColor: HBC_PRIMARY_BLUE,
    color: HBC_HEADER_TEXT,
    fontSize: '0.75rem',
    fontWeight: '600',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    overflow: 'hidden',
  },
  avatar: {
    width: '32px',
    height: '32px',
    ...shorthands.borderRadius('50%'),
    objectFit: 'cover' as const,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: '0px',
    marginTop: '8px',
    minWidth: '200px',
    backgroundColor: '#FFFFFF',
    ...shorthands.borderRadius('8px'),
    boxShadow: elevationLevel2,
    zIndex: Z_INDEX.popover,
    paddingTop: '4px',
    paddingBottom: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  toggle: {
    width: '36px',
    height: '20px',
    ...shorthands.borderRadius('10px'),
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
    position: 'relative',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ...shorthands.borderStyle('none'),
  },
  toggleActive: {
    backgroundColor: HBC_PRIMARY_BLUE,
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    ...shorthands.borderRadius('50%'),
    backgroundColor: '#FFFFFF',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
  },
  toggleKnobActive: {
    transform: 'translateX(16px)',
  },
  divider: {
    height: '1px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
    marginTop: '4px',
    marginBottom: '4px',
  },
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const HbcUserMenu: React.FC<HbcUserMenuProps> = ({
  user,
  isFieldMode,
  onToggleFieldMode,
  onSignOut,
  onProfileClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const styles = useStyles();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen]);

  const initials = user.initials ?? getInitials(user.displayName);

  return (
    <div className={styles.root} ref={ref}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`User menu for ${user.displayName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        type="button"
      >
        {user.avatarUrl ? (
          <img className={styles.avatar} src={user.avatarUrl} alt={user.displayName} />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu" aria-label="User menu">
          <button className={styles.menuItem} role="menuitem" onClick={onProfileClick} type="button">
            Profile
          </button>

          <button
            className={styles.menuItem}
            role="menuitem"
            onClick={onToggleFieldMode}
            type="button"
          >
            <span>Field Mode</span>
            <span
              className={mergeClasses(styles.toggle, isFieldMode && styles.toggleActive)}
              aria-hidden="true"
            >
              <span
                className={mergeClasses(styles.toggleKnob, isFieldMode && styles.toggleKnobActive)}
              />
            </span>
          </button>

          <div className={styles.divider} />

          <button className={styles.menuItem} role="menuitem" onClick={onSignOut} type="button">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
