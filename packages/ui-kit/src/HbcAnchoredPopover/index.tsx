import React, { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { Z_INDEX } from '../theme/z-index.js';

export interface HbcAnchoredPopoverProps {
  /** Ref to the element the popover anchors to */
  anchorRef: RefObject<HTMLElement | null>;
  /** Called when user dismisses the popover (click-outside, Escape) */
  onDismiss: () => void;
  /** Preferred placement relative to anchor */
  placement?: 'right-start' | 'bottom-start';
  /** Optional CSS class name */
  className?: string;
  children: React.ReactNode;
  /** Spread-through ARIA attributes */
  role?: string;
  'aria-label'?: string;
}

/**
 * Lightweight anchored popover using `position: fixed` + `getBoundingClientRect()`.
 * No Griffel, no Fluent UI — SPFx-safe (D-06).
 * Supports click-outside dismissal and viewport edge clamping.
 */
export function HbcAnchoredPopover({
  anchorRef,
  onDismiss,
  placement = 'right-start',
  className,
  children,
  role,
  'aria-label': ariaLabel,
}: HbcAnchoredPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Calculate position based on anchor element and placement
  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const popover = popoverRef.current;
    const popoverWidth = popover?.offsetWidth ?? 320;
    const popoverHeight = popover?.offsetHeight ?? 400;

    let top: number;
    let left: number;

    if (placement === 'right-start') {
      top = rect.top;
      left = rect.right + 8;
    } else {
      // bottom-start
      top = rect.bottom + 8;
      left = rect.left;
    }

    // Viewport edge clamping
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + popoverWidth > viewportWidth - 16) {
      // Flip to left side of anchor if right overflows
      left = Math.max(16, rect.left - popoverWidth - 8);
    }

    if (top + popoverHeight > viewportHeight - 16) {
      top = Math.max(16, viewportHeight - popoverHeight - 16);
    }

    setPosition({ top, left });
  }, [anchorRef, placement]);

  // Position on mount and on scroll/resize
  useEffect(() => {
    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  // Click-outside dismissal
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onDismiss, anchorRef]);

  return (
    <div
      ref={popoverRef}
      className={className}
      role={role}
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: Z_INDEX.popover,
        maxWidth: 'min(400px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}
