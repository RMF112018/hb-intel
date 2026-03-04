/**
 * HbcPanel — Fluent v9 OverlayDrawer wrapper
 * Blueprint §1d — size (sm/md/lg), header/body/footer, slideInRight animation
 * PH4.6 §Step 9 — cubic-bezier animation + mobile bottom-sheet + focus trap
 */
import * as React from 'react';
import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  mergeClasses,
} from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationDialog } from '../theme/elevation.js';
import type { HbcPanelProps } from './types.js';

const MOBILE_BREAKPOINT = 767;

const useStyles = makeStyles({
  body: {
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  // Mobile bottom-sheet styles
  bottomSheet: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 10000,
    maxHeight: '80vh',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationDialog,
    display: 'flex',
    flexDirection: 'column',
    animationName: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    animationDuration: '250ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'forwards',
  },
  bottomSheetBackdrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dragHandle: {
    width: '36px',
    height: '4px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    borderRadius: '2px',
    margin: '8px auto',
  },
  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  sheetTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0',
  },
  sheetBody: {
    flex: '1 1 auto',
    overflowY: 'auto',
    padding: '16px',
  },
  sheetFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1.25rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    padding: '4px 8px',
    borderRadius: '4px',
  },
});

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

/** Focus trap: cycle Tab within container */
function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);
    first.focus();
    return () => container.removeEventListener('keydown', handler);
  }, [ref, active]);
}

export const HbcPanel: React.FC<HbcPanelProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  className,
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const sheetRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(sheetRef, open && isMobile);

  // Mobile bottom-sheet rendering
  if (isMobile) {
    if (!open) return null;

    return (
      <>
        <div
          className={styles.bottomSheetBackdrop}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={sheetRef}
          className={mergeClasses(styles.bottomSheet, className)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-hbc-ui="panel"
        >
          <div className={styles.dragHandle} />
          <div className={styles.sheetHeader}>
            <h3 className={styles.sheetTitle}>{title}</h3>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className={styles.sheetBody}>{children}</div>
          {footer && <div className={styles.sheetFooter}>{footer}</div>}
        </div>
      </>
    );
  }

  // Desktop: Fluent OverlayDrawer with cubic-bezier animation
  return (
    <OverlayDrawer
      data-hbc-ui="panel"
      open={open}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose();
      }}
      position="end"
      size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
      className={className}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '250ms',
      }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </Button>
          }
        >
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        {children}
      </DrawerBody>
      {footer && (
        <DrawerFooter className={styles.footer}>
          {footer}
        </DrawerFooter>
      )}
    </OverlayDrawer>
  );
};

export type { HbcPanelProps, PanelSize } from './types.js';
