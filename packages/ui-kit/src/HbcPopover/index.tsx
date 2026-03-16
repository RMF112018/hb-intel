/**
 * HbcPopover — Contextual popover with hover/click trigger
 * PH4.8 §Step 6 | Blueprint §1d
 *
 * Features: auto-position via getBoundingClientRect, viewport edge auto-flip,
 * CSS arrow triangle, sm/md widths, hover (150ms delay) or click trigger.
 * No focus trap (not a modal per spec).
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationLevel2 } from '../theme/elevation.js';
import { Z_INDEX } from '../theme/z-index.js';
import { HBC_RADIUS_XL } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcPopoverProps, PopoverSize } from './types.js';

const SIZE_MAP: Record<PopoverSize, string> = {
  sm: '240px',
  md: '320px',
};

const useStyles = makeStyles({
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  popover: {
    position: 'fixed',
    zIndex: Z_INDEX.popover,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_XL,
    boxShadow: elevationLevel2,
    paddingTop: '12px',
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: '12px',
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  arrow: {
    position: 'absolute',
    width: '0',
    height: '0',
    ...shorthands.borderLeft('6px', 'solid', 'transparent'),
    ...shorthands.borderRight('6px', 'solid', 'transparent'),
    ...shorthands.borderBottom('6px', 'solid', HBC_SURFACE_LIGHT['surface-0']),
    ...shorthands.borderTop('0', 'none', 'transparent'),
    top: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  arrowBottom: {
    top: 'auto',
    bottom: '-6px',
    ...shorthands.borderTop('6px', 'solid', HBC_SURFACE_LIGHT['surface-0']),
    ...shorthands.borderBottom('0', 'none', 'transparent'),
  },
});

export const HbcPopover: React.FC<HbcPopoverProps> = ({
  trigger,
  children,
  size = 'md',
  triggerMode = 'click',
  className,
}) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number; flipUp: boolean }>({
    top: 0,
    left: 0,
    flipUp: false,
  });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popWidth = size === 'sm' ? 240 : 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < 200;

    let left = rect.left + rect.width / 2 - popWidth / 2;
    // Clamp to viewport
    if (left < HBC_SPACE_SM) left = HBC_SPACE_SM;
    if (left + popWidth > window.innerWidth - HBC_SPACE_SM) left = window.innerWidth - popWidth - HBC_SPACE_SM;

    if (flipUp) {
      setPosition({ top: rect.top - HBC_SPACE_SM, left, flipUp: true });
    } else {
      setPosition({ top: rect.bottom + HBC_SPACE_SM, left, flipUp: false });
    }
  }, [size]);

  const open = React.useCallback(() => {
    setIsOpen(true);
    // Position after next render
    requestAnimationFrame(updatePosition);
  }, [updatePosition]);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Click outside handler
  React.useEffect(() => {
    if (!isOpen || triggerMode !== 'click') return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, triggerMode, close]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const handleTriggerClick = () => {
    if (triggerMode !== 'click') return;
    if (isOpen) close();
    else open();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (triggerMode !== 'click') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTriggerClick();
    }
  };

  const handleMouseEnter = () => {
    if (triggerMode !== 'hover') return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(open, 150);
  };

  const handleMouseLeave = () => {
    if (triggerMode !== 'hover') return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(close, 100);
  };

  const popoverStyle: React.CSSProperties = {
    width: SIZE_MAP[size],
    top: position.flipUp ? undefined : `${position.top}px`,
    bottom: position.flipUp ? `${window.innerHeight - position.top}px` : undefined,
    left: `${position.left}px`,
  };

  return (
    <div
      ref={triggerRef}
      className={styles.wrapper}
      onClick={handleTriggerClick}
      onKeyDown={handleTriggerKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={triggerMode === 'click' ? 0 : undefined}
      role={triggerMode === 'click' ? 'button' : undefined}
      aria-expanded={triggerMode === 'click' ? isOpen : undefined}
    >
      {trigger}
      {isOpen && (
        <div
          ref={popoverRef}
          className={mergeClasses(styles.popover, className)}
          style={popoverStyle}
          role="tooltip"
          data-hbc-ui="popover"
          onMouseEnter={triggerMode === 'hover' ? handleMouseEnter : undefined}
          onMouseLeave={triggerMode === 'hover' ? handleMouseLeave : undefined}
        >
          <div
            className={mergeClasses(styles.arrow, position.flipUp && styles.arrowBottom)}
          />
          {children}
        </div>
      )}
    </div>
  );
};

export type { HbcPopoverProps, PopoverSize } from './types.js';
