/**
 * QuickActionsSheet — UIF-049-addl: Mobile bottom sheet for Quick Actions.
 *
 * Full-screen overlay with bottom-anchored sheet panel.
 * Supports: scrim dismiss, Escape dismiss, swipe-to-dismiss, focus trap.
 * Uses existing animation tokens and z-index system.
 */
import { useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { tokens } from '@fluentui/react-components';
import { useRouter } from '@tanstack/react-router';
import { HbcButton, heading4, Create, ViewList, ViewGrid } from '@hbc/ui-kit';

const SHEET_Z = 1200; // Above bottomNav (300), below modal (1300)
const DISMISS_THRESHOLD = 80; // px drag distance to dismiss

const useStyles = makeStyles({
  scrim: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: `${SHEET_Z}`,
    animationName: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animationDuration: '200ms',
    animationFillMode: 'both',
  },
  sheet: {
    position: 'fixed',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('16px', '16px', '0', '0'),
    ...shorthands.padding('0', '20px', '20px'),
    paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
    zIndex: `${SHEET_Z + 1}`,
    animationName: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    animationDuration: '250ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  dragHandle: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '12px',
    paddingBottom: '12px',
    cursor: 'grab',
  },
  dragBar: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  heading: {
    ...heading4,
    color: tokens.colorNeutralForeground1,
    margin: '0 0 12px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  btnStart: {
    justifyContent: 'flex-start',
  },
});

export interface QuickActionsSheetProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function QuickActionsSheet({ isOpen, onDismiss }: QuickActionsSheetProps): ReactNode {
  const styles = useStyles();
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  // Focus trap: focus the sheet when opened
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.focus();
    }
  }, [isOpen]);

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onDismiss]);

  // Swipe-to-dismiss handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    const deltaY = Math.max(0, e.touches[0].clientY - dragStartY.current);
    sheetRef.current.style.transform = `translateY(${deltaY}px)`;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    const deltaY = e.changedTouches[0].clientY - dragStartY.current;
    sheetRef.current.style.transition = 'transform 200ms ease';
    if (deltaY > DISMISS_THRESHOLD) {
      sheetRef.current.style.transform = 'translateY(100%)';
      setTimeout(onDismiss, 200);
    } else {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  }, [onDismiss]);

  const handleAction = useCallback((to: string, search?: Record<string, string>) => {
    onDismiss();
    router.navigate({ to, search } as Parameters<typeof router.navigate>[0]);
  }, [onDismiss, router]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.scrim} onClick={onDismiss} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Quick Actions"
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.dragHandle}>
          <div className={styles.dragBar} />
        </div>
        <h3 className={styles.heading}>Quick Actions</h3>
        <div className={styles.actions}>
          <HbcButton
            variant="ghost"
            size="md"
            fullWidth
            className={styles.btnStart}
            icon={<Create size="sm" />}
            onClick={() => handleAction('/project-setup', { mode: 'new-request' })}
          >
            Create project request
          </HbcButton>
          <HbcButton
            variant="ghost"
            size="md"
            fullWidth
            className={styles.btnStart}
            icon={<ViewList size="sm" />}
            onClick={() => handleAction('/projects')}
          >
            View my requests
          </HbcButton>
          <HbcButton
            variant="ghost"
            size="md"
            fullWidth
            className={styles.btnStart}
            icon={<ViewGrid size="sm" />}
            onClick={() => handleAction('/project-hub')}
          >
            Go to Project Hub
          </HbcButton>
        </div>
      </div>
    </>
  );
}
