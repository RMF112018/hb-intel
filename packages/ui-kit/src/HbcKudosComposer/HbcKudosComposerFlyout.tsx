/**
 * HbcKudosComposerFlyout — Premium right-side sheet shell with focus
 * trap, escape-to-close, scroll lock, motion choreography, and typed
 * primary/secondary/tertiary footer action props.
 *
 * Doctrine §5.2 premium-stack adoptions:
 *   - @radix-ui/react-scroll-area  — polished overflow on the body
 *   - @radix-ui/react-tooltip      — provider scoped inside the flyout
 *     so tooltips from chip-remove buttons (and future additions)
 *     render above the overlay.
 *   - class-variance-authority     — flyoutPanelVariants and
 *     footerButtonVariants govern class composition.
 *   - motion                       — slide-in choreography, reduced-
 *     motion aware.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Sparkles, Users, X as XIcon } from 'lucide-react';
import styles from './styles/flyout.module.css';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import { useFocusTrap } from './internal/useFocusTrap.js';
import { useHostChromeOffset } from './internal/useHostChromeOffset.js';
import { kudosComposerCSSVars } from './tokens.js';
import { flyoutPanelVariants, footerButtonVariants } from './variants.js';
import type { HbcKudosComposerFlyoutProps } from './types.js';

export function HbcKudosComposerFlyout({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  footer,
}: HbcKudosComposerFlyoutProps): React.JSX.Element | null {
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const hostOffset = useHostChromeOffset(open);
  useFocusTrap(panelRef, open, reducedMotion);

  // Track viewport width for sheet orientation. SSR-safe: defaults to
  // desktop on first paint.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Escape to close
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Scroll lock — host-aware. SPFx scrollable container is a
  // workspace div, not <body>.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const spWorkspace =
      document.getElementById('spPageCanvasContent') ??
      document.getElementById('workspaceContainer');
    const target = spWorkspace ?? document.body;
    const previous = target.style.overflow;
    target.style.overflow = 'hidden';
    return () => {
      target.style.overflow = previous;
    };
  }, [open]);

  const panelMotion = reducedMotion
    ? {}
    : isMobile
      ? {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
        }
      : {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
          transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
        };

  const backdropMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  const hasTypedActions = Boolean(primaryAction || secondaryAction);
  const orientation = isMobile ? 'mobile' : 'desktop';

  // Merge the tokenized CSS-var record with the runtime-measured
  // host-chrome offset and the SharePoint host-control clearance. The
  // runtime `top` + `--hbc-host-ctrl-clearance` inline entries are the
  // single sanctioned escape — they are computed per-render from the
  // host environment and cannot be baked into static CSS.
  const panelStyle: React.CSSProperties = {
    ...kudosComposerCSSVars(),
    ...(!isMobile && hostOffset > 0
      ? ({ top: hostOffset, '--hbc-host-ctrl-clearance': '56px' } as React.CSSProperties)
      : {}),
  };

  return (
    <AnimatePresence>
      {open && (
        <Tooltip.Provider delayDuration={400}>
          <motion.div
            key="kudos-backdrop"
            onClick={onClose}
            aria-hidden="true"
            className={styles.backdrop}
            style={kudosComposerCSSVars()}
            {...backdropMotion}
          />
          <motion.div
            key="kudos-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={flyoutPanelVariants({ orientation })}
            style={panelStyle}
            {...panelMotion}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderDots} aria-hidden="true" />
              <div className={styles.panelHeaderCopy}>
                <h2 className={styles.panelTitle}>
                  <span className={styles.panelTitleIcon} aria-hidden="true">
                    <Users size={isMobile ? 16 : 18} strokeWidth={2.25} />
                  </span>
                  {title}
                </h2>
                {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={styles.panelClose}
              >
                <XIcon size={16} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <ScrollArea.Root className={styles.scrollRoot} type="auto">
              <ScrollArea.Viewport className={styles.scrollViewport}>
                <div className={styles.scrollViewportInner}>{children}</div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="vertical"
                className={styles.scrollBar}
              >
                <ScrollArea.Thumb className={styles.scrollThumb} />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {hasTypedActions ? (
              <div className={styles.panelFooter}>
                {secondaryAction ? (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    className={footerButtonVariants({ kind: 'secondary' })}
                  >
                    {secondaryAction.label}
                  </button>
                ) : null}
                {primaryAction ? (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    className={footerButtonVariants({
                      kind: 'primary',
                      loading: Boolean(primaryAction.loading),
                    })}
                  >
                    {primaryAction.loading ? null : (
                      <Sparkles size={14} aria-hidden="true" strokeWidth={2.5} />
                    )}
                    {primaryAction.loading ? 'Sending…' : primaryAction.label}
                  </button>
                ) : null}
              </div>
            ) : footer ? (
              <div className={styles.panelFooter}>{footer}</div>
            ) : null}
          </motion.div>
        </Tooltip.Provider>
      )}
    </AnimatePresence>
  );
}

// `clsx` kept as a convenience re-import for downstream files that
// want the same combinator pattern without pulling a second import.
export { clsx };
