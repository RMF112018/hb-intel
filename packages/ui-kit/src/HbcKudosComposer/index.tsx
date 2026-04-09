/**
 * HbcKudosComposer — Shared presentation primitives for the People &
 * Culture kudos submission flow.
 *
 * Three sibling components:
 *   - HbcKudosComposerFlyout  — premium right-side sheet shell with
 *     focus trap, escape-to-close, scroll lock, and motion choreography.
 *   - HbcKudosComposerForm    — labeled form grid with validation
 *     and warm focus treatment.
 *   - HbcKudosComposerPreview — preview card mirroring the
 *     spotlight visual register.
 *
 * Pure presentation: state, validation, and submission live in the
 * consumer. Wave 01 follow-on: People & Culture migration to
 * @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Users } from 'lucide-react';
import { HbcAvatarStack } from '../HbcAvatarStack/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './kudos-composer.module.css';

// ---------------------------------------------------------------------------
// Shared types (consumer state shapes)
// ---------------------------------------------------------------------------

export interface KudosComposerDraft {
  recipientNames: string;
  headline: string;
  excerpt: string;
  details: string;
}

export interface KudosComposerValidationErrors {
  recipientNames?: string;
  headline?: string;
  excerpt?: string;
}

// ---------------------------------------------------------------------------
// Flyout
// ---------------------------------------------------------------------------

export interface HbcKudosComposerFlyoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean): void {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const first = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const firstEl = focusable[0]!;
      const lastEl = focusable[focusable.length - 1]!;

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

export function HbcKudosComposerFlyout({
  open,
  onClose,
  title,
  children,
  footer,
}: HbcKudosComposerFlyoutProps): React.JSX.Element | null {
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  useFocusTrap(panelRef, open);

  // Track viewport width for sheet orientation (mobile = bottom slide-up,
  // desktop = right slide-in). SSR-safe: defaults to desktop on first paint.
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

  // Body scroll lock while open
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="kudos-backdrop"
            onClick={onClose}
            aria-hidden="true"
            className={styles.backdrop}
            {...backdropMotion}
          />
          <motion.div
            key="kudos-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={clsx(styles.panel, isMobile ? styles.panelMobile : styles.panelDesktop)}
            {...panelMotion}
          >
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <Users size={isMobile ? 16 : 18} aria-hidden="true" className={styles.panelTitleIcon} />
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={styles.panelClose}
              >
                ✕
              </button>
            </div>

            <div className={styles.panelBody}>{children}</div>

            {footer ? <div className={styles.panelFooter}>{footer}</div> : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export interface HbcKudosComposerFormProps {
  draft: KudosComposerDraft;
  onDraftChange: (patch: Partial<KudosComposerDraft>) => void;
  errors?: KudosComposerValidationErrors;
  disabled?: boolean;
}

export function HbcKudosComposerForm({
  draft,
  onDraftChange,
  errors = {},
  disabled = false,
}: HbcKudosComposerFormProps): React.JSX.Element {
  return (
    <div className={styles.form}>
      <div className={styles.formIntro}>
        Recognize a teammate for great work, a team win, or everyday excellence. Your kudos
        will be reviewed before appearing on the homepage.
      </div>

      {/* Recipients */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-recipients">
          Recipients <span className={styles.requiredMark}>*</span>
        </label>
        <input
          id="hbc-kudos-recipients"
          type="text"
          placeholder="e.g. Riley Brooks, Morgan Chen"
          value={draft.recipientNames}
          onChange={(e) => onDraftChange({ recipientNames: e.target.value })}
          disabled={disabled}
          className={clsx(styles.input, errors.recipientNames && styles.inputError)}
        />
        {errors.recipientNames ? (
          <div className={styles.error}>{errors.recipientNames}</div>
        ) : null}
        <div className={styles.hint}>Separate multiple names with commas</div>
      </div>

      {/* Headline */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-headline">
          Headline <span className={styles.requiredMark}>*</span>
        </label>
        <input
          id="hbc-kudos-headline"
          type="text"
          placeholder="e.g. Outstanding Safety Leadership"
          value={draft.headline}
          onChange={(e) => onDraftChange({ headline: e.target.value })}
          disabled={disabled}
          maxLength={120}
          className={clsx(styles.input, errors.headline && styles.inputError)}
        />
        {errors.headline ? <div className={styles.error}>{errors.headline}</div> : null}
        <div className={styles.hint}>{draft.headline.length}/120 characters</div>
      </div>

      {/* Message */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-message">
          Message <span className={styles.requiredMark}>*</span>
        </label>
        <textarea
          id="hbc-kudos-message"
          placeholder="What did they do that deserves recognition?"
          value={draft.excerpt}
          onChange={(e) => onDraftChange({ excerpt: e.target.value })}
          disabled={disabled}
          rows={4}
          className={clsx(styles.input, styles.textarea, errors.excerpt && styles.inputError)}
        />
        {errors.excerpt ? <div className={styles.error}>{errors.excerpt}</div> : null}
      </div>

      {/* Details */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="hbc-kudos-details">
          Additional details{' '}
          <span className={styles.optionalMark}>(optional)</span>
        </label>
        <textarea
          id="hbc-kudos-details"
          placeholder="Any extra context or background"
          value={draft.details}
          onChange={(e) => onDraftChange({ details: e.target.value })}
          disabled={disabled}
          rows={2}
          className={clsx(styles.input, styles.textarea, styles.textareaShort)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

export interface HbcKudosComposerPreviewProps {
  draft: KudosComposerDraft;
  submitterName?: string;
}

function parseRecipients(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function HbcKudosComposerPreview({
  draft,
  submitterName,
}: HbcKudosComposerPreviewProps): React.JSX.Element {
  const recipients = parseRecipients(draft.recipientNames);
  const headline = draft.headline.trim() || 'Your headline here';
  const excerpt = draft.excerpt.trim() || 'Your recognition message will appear here…';
  const isEmpty =
    !draft.headline.trim() && !draft.excerpt.trim() && recipients.length === 0;

  let recipientLine = '';
  if (recipients.length === 1) recipientLine = recipients[0]!;
  else if (recipients.length === 2) recipientLine = `${recipients[0]} and ${recipients[1]}`;
  else if (recipients.length > 2)
    recipientLine = `${recipients[0]}, ${recipients[1]}, and ${recipients.length - 2} more`;

  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewLabel}>Preview</div>
      <article className={clsx(styles.previewCard, isEmpty && styles.previewCardEmpty)}>
        {recipients.length > 0 ? (
          <div className={styles.previewAvatars}>
            <HbcAvatarStack
              people={recipients.slice(0, 4).map((name, i) => ({ id: `prev-${i}`, name }))}
              size="md"
              max={4}
              overflow={recipients.length > 4 ? 'inline-text' : 'none'}
            />
            {recipients.length > 4 ? (
              <span className={styles.previewOverflow}>+{recipients.length - 4} more</span>
            ) : null}
          </div>
        ) : null}

        <span className={styles.previewEyebrow}>Kudos Spotlight</span>
        <h3 className={styles.previewHeadline}>{headline}</h3>

        {recipientLine ? (
          <span className={styles.previewRecipients}>{recipientLine}</span>
        ) : null}

        <p className={styles.previewExcerpt}>{excerpt}</p>

        <div className={styles.previewSubmitter}>
          <CheckCircle2 size={11} aria-hidden="true" className={styles.previewSubmitterIcon} />
          by {submitterName || 'You'}
        </div>
      </article>
    </div>
  );
}
