/**
 * HbcModal — Accessible modal dialog with focus trap
 * PH4.8 §Step 4 | Blueprint §1d
 *
 * Features: 3 sizes, backdrop click-to-close, Escape to close,
 * focus trap, portal to document.body, scaleIn animation.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationLevel3 } from '../theme/elevation.js';
import { keyframes, TRANSITION_FAST } from '../theme/animations.js';
import { heading3 } from '../theme/typography.js';
import { Z_INDEX } from '../theme/z-index.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { HBC_RADIUS_XL, HBC_RADIUS_MD, HBC_RADIUS_NONE } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import type { HbcModalProps, ModalSize } from './types.js';

const SIZE_MAP: Record<ModalSize, string> = {
  sm: '480px',
  md: '600px',
  lg: '720px',
};

const useStyles = makeStyles({
  backdrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: Z_INDEX.modalBackdrop,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: Z_INDEX.modal,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: '90vh',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_XL,
    boxShadow: elevationLevel3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animationName: keyframes.scaleIn,
    animationDuration: TRANSITION_FAST,
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  title: {
    ...heading3,
    margin: '0',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    cursor: 'pointer',
    borderRadius: HBC_RADIUS_MD,
    fontSize: '1.25rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  body: {
    flex: '1 1 auto',
    overflowY: 'auto',
    maxHeight: '60vh',
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  // Mobile full-screen adaptations — PH4.14.5
  dialogMobile: {
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    transform: 'none',
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    borderRadius: HBC_RADIUS_NONE,
    animationName: keyframes.slideInFromBottom,
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  bodyMobile: {
    maxHeight: 'none',
    flex: '1 1 auto',
  },
  closeButtonMobile: {
    width: '44px',
    height: '44px',
    minWidth: '44px',
    minHeight: '44px',
  },
});

export const HbcModal: React.FC<HbcModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  preventBackdropClose = false,
  className,
  role: dialogRole = 'dialog',
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<Element | null>(null);

  useFocusTrap(dialogRef, open);

  // Store trigger element on open, restore focus on close
  React.useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Escape key handler
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!preventBackdropClose) onClose();
  };

  const modal = (
    <>
      <div
        className={styles.backdrop}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={mergeClasses(styles.dialog, isMobile && styles.dialogMobile, className)}
        style={isMobile ? undefined : { width: SIZE_MAP[size] }}
        role={dialogRole}
        aria-modal="true"
        aria-label={title}
        data-hbc-ui="modal"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            type="button"
            className={mergeClasses(styles.closeButton, isMobile && styles.closeButtonMobile)}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={mergeClasses(styles.body, isMobile && styles.bodyMobile)}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modal, document.body)
    : null;
};

export type { HbcModalProps, ModalSize } from './types.js';
