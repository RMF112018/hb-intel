/**
 * HbcToolboxFlyout — Grid-icon flyout with role-filtered tools
 * PH4.4 §Step 3 | Blueprint §2c
 * Traceability: D-PH4C-26, D-PH4C-27
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { tokens } from '@fluentui/react-components';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { HBC_HEADER_ICON_MUTED, HBC_SURFACE_FIELD } from '../theme/tokens.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import { Toolbox } from '../icons/index.js';
import type { HbcToolboxFlyoutProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  trigger: {
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
  flyout: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '4px',
    minWidth: '320px',
    ...shorthands.borderRadius('8px'),
    boxShadow: elevationLevel2,
    zIndex: Z_INDEX.popover,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  placeholder: {
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  },
  flyoutOffice: {
    // D-PH4C-26: office flyout surfaces use Fluent neutral tokens.
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
  },
  flyoutField: {
    backgroundColor: HBC_SURFACE_FIELD['surface-1'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_FIELD['border-default']),
  },
  placeholderOffice: {
    color: tokens.colorNeutralForeground3,
  },
  placeholderField: {
    color: HBC_SURFACE_FIELD['text-muted'],
  },
});

export const HbcToolboxFlyout: React.FC<HbcToolboxFlyoutProps> = ({ onToolboxOpen }) => {
  const { isFieldMode } = useHbcTheme();
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

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) onToolboxOpen?.();
  };

  return (
    <div className={styles.root} ref={ref}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={handleToggle}
        aria-label="Open toolbox"
        aria-expanded={isOpen}
        type="button"
      >
        <Toolbox size="md" color={HBC_HEADER_ICON_MUTED} />
      </button>
      {isOpen && (
        <div
          className={mergeClasses(styles.flyout, isFieldMode ? styles.flyoutField : styles.flyoutOffice)}
          role="dialog"
          aria-label="Toolbox"
        >
          <p className={mergeClasses(styles.placeholder, isFieldMode ? styles.placeholderField : styles.placeholderOffice)}>
            Tool grid — filtered by role (Phase 5)
          </p>
        </div>
      )}
    </div>
  );
};
