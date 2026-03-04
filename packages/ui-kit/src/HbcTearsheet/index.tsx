/**
 * HbcTearsheet — Full-width multi-step overlay
 * PH4.8 §Step 5 | Blueprint §1d
 *
 * Features: step indicator, Previous/Next/Complete navigation,
 * onValidate per step, focus trap, Escape to close, slideInUp animation.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE, HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { elevationLevel3 } from '../theme/elevation.js';
import { keyframes, TRANSITION_NORMAL } from '../theme/animations.js';
import { heading3 } from '../theme/typography.js';
import { Z_INDEX } from '../theme/z-index.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import type { HbcTearsheetProps } from './types.js';

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
    zIndex: Z_INDEX.tearsheet,
    width: 'calc(100vw - 96px)',
    maxHeight: '90vh',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: '8px',
    boxShadow: elevationLevel3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animationName: keyframes.slideInUp,
    animationDuration: TRANSITION_NORMAL,
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    ...heading3,
    margin: '0',
  },
  stepIndicator: {
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
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
    paddingTop: '24px',
    paddingRight: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    paddingRight: '24px',
    paddingBottom: '16px',
    paddingLeft: '24px',
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  footerRight: {
    display: 'flex',
    gap: '8px',
  },
  cancelButton: {
    paddingTop: '8px',
    paddingRight: '16px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    backgroundColor: 'transparent',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  navButton: {
    paddingTop: '8px',
    paddingRight: '16px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    backgroundColor: HBC_PRIMARY_BLUE,
    ...shorthands.borderStyle('none'),
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#FFFFFF',
    ':hover': {
      opacity: '0.9',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  completeButton: {
    paddingTop: '8px',
    paddingRight: '16px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    backgroundColor: HBC_ACCENT_ORANGE as string,
    ...shorthands.borderStyle('none'),
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#FFFFFF',
    ':hover': {
      opacity: '0.9',
    },
  },
});

export const HbcTearsheet: React.FC<HbcTearsheetProps> = ({
  open,
  onClose,
  title,
  steps,
  onComplete,
  className,
}) => {
  const styles = useStyles();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<Element | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);

  useFocusTrap(dialogRef, open);

  // Reset step on open, store trigger
  React.useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setCurrentStep(0);
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

  if (!open || steps.length === 0) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const step = steps[currentStep];

  const handleNext = async () => {
    if (step.onValidate) {
      const valid = await step.onValidate();
      if (!valid) return;
    }
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) setCurrentStep((s) => s - 1);
  };

  const tearsheet = (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={mergeClasses(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-hbc-ui="tearsheet"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>{title}</h3>
            <span className={styles.stepIndicator}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.body}>{step.content}</div>
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <div className={styles.footerRight}>
            <button
              type="button"
              className={styles.navButton}
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              Previous
            </button>
            {isLastStep ? (
              <button
                type="button"
                className={styles.completeButton}
                onClick={handleNext}
              >
                Complete
              </button>
            ) : (
              <button
                type="button"
                className={styles.navButton}
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(tearsheet, document.body)
    : null;
};

export type { HbcTearsheetProps, TearsheetStep } from './types.js';
