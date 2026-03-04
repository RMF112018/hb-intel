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
    borderRadius: '8px',
    boxShadow: elevationLevel3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animationName: keyframes.scaleIn,
    animationDuration: TRANSITION_FAST,
    animationFillMode: 'forwards',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    paddingRight: '24px',
    paddingBottom: '16px',
    paddingLeft: '24px',
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
    borderRadius: '4px',
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
    paddingTop: '24px',
    paddingRight: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    paddingRight: '24px',
    paddingBottom: '16px',
    paddingLeft: '24px',
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
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
}) => {
  const styles = useStyles();
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
        className={mergeClasses(styles.dialog, className)}
        style={{ width: SIZE_MAP[size] }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-hbc-ui="modal"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modal, document.body)
    : null;
};

export type { HbcModalProps, ModalSize } from './types.js';
