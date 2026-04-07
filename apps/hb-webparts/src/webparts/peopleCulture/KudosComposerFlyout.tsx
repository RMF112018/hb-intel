/**
 * KudosComposerFlyout — Premium flyout shell for Kudos submission.
 *
 * Desktop: right-side command sheet (~420px).
 * Mobile: full-screen slide-up sheet.
 *
 * Built with inline styles and motion from @hbc/ui-kit/homepage to
 * comply with the hb-webparts import discipline (no root @hbc/ui-kit).
 */
import * as React from 'react';
import { motion, AnimatePresence, Users } from '@hbc/ui-kit/homepage';
import { useResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';

/* ── Props ─────────────────────────────────────────────────────── */

export interface KudosComposerFlyoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/* ── Brand palette (shared with PeopleCultureMerged) ───────────── */

const HB = {
  blue: '#225391',
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
  blueRgb: '34, 83, 145',
} as const;

/* ── Focus trap ────────────────────────────────────────────────── */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useFlyoutFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean): void {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;

    // Auto-focus first focusable element
    const first = el.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [ref, active]);
}

/* ── Component ─────────────────────────────────────────────────── */

export function KudosComposerFlyout({ open, onClose, title, children, footer }: KudosComposerFlyoutProps): React.JSX.Element | null {
  const tier = useResponsiveTier();
  const rm = usePrefersReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  useFlyoutFocusTrap(panelRef, open);

  // Escape to close
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const isMobile = tier === 'mobile';
  const sheetWidth = isMobile ? '100vw' : 420;

  const motionProps = rm
    ? {}
    : isMobile
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const } }
      : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' }, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const } };

  const backdropMotion = rm
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="kudos-backdrop"
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0, zIndex: 1099,
              background: 'rgba(0, 0, 0, 0.35)',
            }}
            {...backdropMotion}
          />

          {/* Panel */}
          <motion.div
            key="kudos-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              position: 'fixed',
              zIndex: 1100,
              ...(isMobile
                ? { inset: 0, display: 'flex', flexDirection: 'column' }
                : { top: 0, right: 0, bottom: 0, width: sheetWidth, display: 'flex', flexDirection: 'column' }
              ),
              background: '#ffffff',
              boxShadow: isMobile ? 'none' : '-4px 0 24px rgba(0, 0, 0, 0.12)',
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
            {...motionProps}
          >
            {/* ── Header ── */}
            <div style={{
              background: `linear-gradient(135deg, ${HB.orange} 0%, #D4693A 45%, ${HB.blue} 100%)`,
              padding: isMobile ? '16px 16px 14px' : '20px 24px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '1.0625rem' : '1.1875rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Users size={isMobile ? 16 : 18} aria-hidden="true" style={{ opacity: 0.9 }} />
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                ✕
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: isMobile ? 16 : 24,
            }}>
              {children}
            </div>

            {/* ── Footer ── */}
            {footer && (
              <div style={{
                flexShrink: 0,
                padding: isMobile ? '12px 16px' : '14px 24px',
                borderTop: `1px solid rgba(${HB.orangeRgb}, 0.1)`,
                background: '#ffffff',
                display: 'flex', justifyContent: 'flex-end', gap: 10,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
