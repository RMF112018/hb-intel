/**
 * HbcKudosComposer — Shared presentation primitives for the People &
 * Culture kudos submission flow.
 *
 * Five sibling components that compose a premium kudos submission
 * experience coherent with `HbcPeopleCultureSurface`:
 *   - HbcKudosComposerFlyout   — premium right-side sheet shell with
 *     focus trap, escape-to-close, scroll lock, motion choreography,
 *     and typed primary/secondary/tertiary footer action props.
 *   - HbcKudosComposerForm     — labeled form grid with validation
 *     and warm focus treatment; warm intro callout.
 *   - HbcKudosComposerPreview  — live preview card mirroring the
 *     spotlight visual register.
 *   - HbcKudosComposerSuccess  — post-submit confirmation pane with
 *     celebratory gradient icon, matching the surface register.
 *   - HbcKudosComposerError    — inline error banner for submission
 *     failures.
 *
 * Pure presentation: state, validation, and submission live in the
 * consumer. W01r-P18 — recognition rebuild.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Building2, CheckCircle2, FolderKanban, Sparkles, User, Users, X as XIcon, type LucideIcon } from 'lucide-react';
import { HbcAvatarStack } from '../HbcAvatarStack/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import type { PersonEntry, PeopleSearchFn } from '../HbcPeoplePicker/types.js';
import styles from './kudos-composer.module.css';

// ---------------------------------------------------------------------------
// Shared types (consumer state shapes)
// ---------------------------------------------------------------------------

/**
 * Typed recipient bucket draft for the kudos composer. Phase-14 kudos/
 * Prompt-02 introduces this alongside the legacy `recipientNames`
 * string field so HB Kudos can build against the typed People Culture
 * Kudos schema (four recipient fields) while the transitional merged
 * People & Culture webpart keeps its existing text-mode composer.
 *
 * Convention:
 *   - `individualEmails` holds typed-in email addresses (or resolved
 *     people-picker selections once that primitive lands). Writers
 *     resolve these via ensureUser to `IndividualRecipientsId` on
 *     `People Culture Kudos`.
 *   - `teamLabels`, `departmentLabels`, `projectGroupLabels` hold
 *     taxonomy labels. Writers resolve these once a term-store lookup
 *     is wired. Until then, consumers may pass them through as
 *     moderator hints on the item.
 */
export interface KudosComposerRecipientBucketsDraft {
  individualEmails: string[];
  teamLabels: string[];
  departmentLabels: string[];
  projectGroupLabels: string[];
}

export const EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS: KudosComposerRecipientBucketsDraft = {
  individualEmails: [],
  teamLabels: [],
  departmentLabels: [],
  projectGroupLabels: [],
};

/**
 * Bucket kind discriminator used by the typed recipient chip input.
 */
export type KudosComposerRecipientBucketKind =
  | 'individualEmails'
  | 'teamLabels'
  | 'departmentLabels'
  | 'projectGroupLabels';

export interface KudosComposerDraft {
  /**
   * Legacy text recipient field. Kept as an explicit fallback so the
   * transitional merged People & Culture webpart continues to work
   * unchanged. New consumers should set `recipientsMode='typed'` and
   * populate `recipients` instead.
   */
  recipientNames: string;
  /** Typed recipient buckets — final-state shape for HB Kudos. */
  recipients?: KudosComposerRecipientBucketsDraft;
  headline: string;
  excerpt: string;
  details: string;
}

export interface KudosComposerValidationErrors {
  recipientNames?: string;
  /** Typed-mode aggregate error (any bucket problem). */
  recipients?: string;
  headline?: string;
  excerpt?: string;
}

export type KudosComposerRecipientsMode = 'text' | 'typed';

// ---------------------------------------------------------------------------
// Flyout — typed footer actions
// ---------------------------------------------------------------------------

export interface HbcKudosComposerActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface HbcKudosComposerFlyoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional sub-caption under the title in the gradient header. */
  subtitle?: string;
  children: React.ReactNode;
  /**
   * Primary action (warm gradient button). Shows "Sending…" when
   * `loading` is true. Preferred over the legacy `footer` slot.
   */
  primaryAction?: HbcKudosComposerActionProps;
  /** Secondary action (ghost button, typically "Cancel" / "Send Another"). */
  secondaryAction?: HbcKudosComposerActionProps;
  /** Legacy custom footer slot — retained for backward compatibility. */
  footer?: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useFocusTrap(
  ref: React.RefObject<HTMLDivElement | null>,
  active: boolean,
  reducedMotion: boolean,
): void {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;

    // Delay initial focus until after the slide-in animation (280ms)
    // so the first focusable element is on-screen when focused.
    // When reduced-motion is active, focus immediately.
    const delay = reducedMotion ? 0 : 300;
    const timer = setTimeout(() => {
      const first = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }, delay);

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
    return () => {
      clearTimeout(timer);
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active, reducedMotion]);
}

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
  useFocusTrap(panelRef, open, reducedMotion);

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

  const hasTypedActions = Boolean(primaryAction || secondaryAction);

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

            <div className={styles.panelBody}>{children}</div>

            {hasTypedActions ? (
              <div className={styles.panelFooter}>
                {secondaryAction ? (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    className={styles.footerSecondary}
                  >
                    {secondaryAction.label}
                  </button>
                ) : null}
                {primaryAction ? (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    className={clsx(
                      styles.footerPrimary,
                      primaryAction.loading && styles.footerPrimaryLoading,
                    )}
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
  /**
   * Recipient input mode. Defaults to `'text'` for backward compat
   * with the legacy merged People & Culture composer. The HB Kudos
   * webpart passes `'typed'` to render four explicit recipient
   * buckets aligned to the People Culture Kudos schema.
   */
  recipientsMode?: KudosComposerRecipientsMode;
  /**
   * People search adapter for the People bucket. When provided, the
   * individualEmails bucket renders as a true people picker with
   * search, selection, and chips instead of freeform text entry.
   * Pass `useGraphPeopleSearch(getToken)` from the consumer or a
   * SharePoint-aware people search function.
   */
  searchPeople?: PeopleSearchFn;
}

const BUCKET_CONFIG: Record<
  KudosComposerRecipientBucketKind,
  { label: string; placeholder: string; icon: LucideIcon }
> = {
  individualEmails: {
    label: 'People',
    placeholder: 'person@hedrickbrothers.com',
    icon: User,
  },
  teamLabels: {
    label: 'Teams',
    placeholder: 'e.g. Field Safety',
    icon: Users,
  },
  departmentLabels: {
    label: 'Departments',
    placeholder: 'e.g. Construction Operations',
    icon: Building2,
  },
  projectGroupLabels: {
    label: 'Projects',
    placeholder: 'e.g. Downtown Mixed-Use Tower',
    icon: FolderKanban,
  },
};

function HbcKudosComposerTypedRecipients({
  buckets,
  onChange,
  disabled,
  errorMessage,
  searchPeople,
}: {
  buckets: KudosComposerRecipientBucketsDraft;
  onChange: (patch: Partial<KudosComposerRecipientBucketsDraft>) => void;
  disabled: boolean;
  errorMessage?: string;
  searchPeople?: PeopleSearchFn;
}): React.JSX.Element {
  // Individuals always expanded; other buckets expand on click or when populated.
  const [expanded, setExpanded] = React.useState<Set<KudosComposerRecipientBucketKind>>(
    () => new Set<KudosComposerRecipientBucketKind>(['individualEmails']),
  );

  const toggleExpand = React.useCallback((kind: KudosComposerRecipientBucketKind) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const allKinds = Object.keys(BUCKET_CONFIG) as KudosComposerRecipientBucketKind[];
  const primaryKind: KudosComposerRecipientBucketKind = 'individualEmails';
  const secondaryKinds = allKinds.filter((k) => k !== primaryKind);

  return (
    <>
      {/* Primary bucket — people picker when searchPeople provided, text otherwise */}
      {searchPeople ? (
        <HbcKudosComposerPeopleBucket
          values={buckets[primaryKind]}
          onChange={(next) => onChange({ [primaryKind]: next } as Partial<KudosComposerRecipientBucketsDraft>)}
          disabled={disabled}
          searchPeople={searchPeople}
          errorMessage={errorMessage}
        />
      ) : (
        <div className={styles.field}>
          <label className={styles.label}>
            Recipients <span className={styles.requiredMark}>*</span>
          </label>
          <HbcKudosComposerRecipientBucket
            kind={primaryKind}
            values={buckets[primaryKind]}
            onChange={(next) => onChange({ [primaryKind]: next } as Partial<KudosComposerRecipientBucketsDraft>)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Secondary buckets — progressive disclosure */}
      <div className={styles.bucketSecondaryRow}>
        {secondaryKinds.map((kind) => {
          const hasValues = buckets[kind].length > 0;
          const isExpanded = expanded.has(kind) || hasValues;
          const BucketIcon = BUCKET_CONFIG[kind].icon;

          if (isExpanded) {
            return (
              <HbcKudosComposerRecipientBucket
                key={kind}
                kind={kind}
                values={buckets[kind]}
                onChange={(next) => onChange({ [kind]: next } as Partial<KudosComposerRecipientBucketsDraft>)}
                disabled={disabled}
              />
            );
          }

          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggleExpand(kind)}
              disabled={disabled}
              aria-expanded="false"
              className={styles.bucketAddButton}
            >
              <BucketIcon size={13} strokeWidth={2.2} aria-hidden="true" />
              {BUCKET_CONFIG[kind].label}
            </button>
          );
        })}
      </div>

      {!searchPeople && errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}
      {!searchPeople ? <div className={styles.hint}>Press Enter to add each entry.</div> : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// People picker bucket (search-select for individualEmails)
// ---------------------------------------------------------------------------

interface HbcKudosComposerPeopleBucketProps {
  values: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
  searchPeople: PeopleSearchFn;
  errorMessage?: string;
}

function HbcKudosComposerPeopleBucket({
  values,
  onChange,
  disabled,
  searchPeople,
  errorMessage,
}: HbcKudosComposerPeopleBucketProps): React.JSX.Element {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<PersonEntry[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  // Cache display names for selected people so chips show names, not UPNs.
  const [nameCache, setNameCache] = React.useState<Map<string, string>>(() => new Map());
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = React.useId();

  // Debounced search
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const hits = await searchPeople(query.trim());
        const selectedUpns = new Set(values.map((v) => v.toLowerCase()));
        setResults(hits.filter((h) => !selectedUpns.has(h.upn.toLowerCase())));
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchPeople, values]);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectPerson(person: PersonEntry): void {
    setNameCache((prev) => {
      const next = new Map(prev);
      next.set(person.upn.toLowerCase(), person.displayName);
      return next;
    });
    onChange([...values, person.upn]);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function removeAt(index: number): void {
    onChange(values.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'ArrowDown' && isOpen && results.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp' && isOpen && results.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && results[activeIndex]) {
        selectPerson(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Backspace' && query === '' && values.length > 0) {
      e.preventDefault();
      removeAt(values.length - 1);
    }
  }

  const BucketIcon = BUCKET_CONFIG.individualEmails.icon;

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        Recipients <span className={styles.requiredMark}>*</span>
      </label>
      <div ref={containerRef} className={styles.pickerContainer}>
        <div className={styles.bucket}>
          <div className={styles.bucketLabel}>
            <BucketIcon size={12} strokeWidth={2.2} aria-hidden="true" className={styles.bucketLabelIcon} />
            People
          </div>
          <div className={styles.bucketChips}>
            {values.map((upn, index) => {
              const display = nameCache.get(upn.toLowerCase()) ?? upn;
              return (
                <span key={`${upn}-${index}`} className={clsx(styles.bucketChip, styles.bucketChip_individualEmails)}>
                  <BucketIcon size={10} strokeWidth={2.5} aria-hidden="true" className={styles.bucketChipIcon} />
                  <span className={styles.bucketChipLabel}>{display}</span>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    disabled={disabled}
                    aria-label={`Remove ${display}`}
                    className={styles.bucketChipRemove}
                  >
                    <XIcon size={10} strokeWidth={3} aria-hidden="true" />
                  </button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={values.length === 0 ? 'Search for a person…' : ''}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
              aria-autocomplete="list"
              className={styles.bucketInput}
            />
          </div>
        </div>

        {isOpen ? (
          <div id={listboxId} className={styles.pickerDropdown} role="listbox" aria-label="People search results">
            {isSearching ? (
              <div className={styles.pickerStatus}>Searching…</div>
            ) : null}
            {!isSearching && results.length === 0 && query.trim().length >= 2 ? (
              <div className={styles.pickerStatus}>No people found for &ldquo;{query}&rdquo;</div>
            ) : null}
            {results.map((person, index) => (
              <div
                key={person.upn}
                id={`${listboxId}-opt-${index}`}
                className={clsx(styles.pickerOption, index === activeIndex && styles.pickerOptionActive)}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectPerson(person)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className={styles.pickerOptionName}>{person.displayName}</span>
                <span className={styles.pickerOptionMeta}>
                  {person.upn}
                  {person.jobTitle ? ` · ${person.jobTitle}` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}
      <div className={styles.hint}>Search by name or email. Select from results.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standard bucket (text entry for teams/departments/projects and fallback)
// ---------------------------------------------------------------------------

interface HbcKudosComposerRecipientBucketProps {
  kind: KudosComposerRecipientBucketKind;
  values: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
}

function HbcKudosComposerRecipientBucket({
  kind,
  values,
  onChange,
  disabled,
}: HbcKudosComposerRecipientBucketProps): React.JSX.Element {
  const [draft, setDraft] = React.useState('');
  const config = BUCKET_CONFIG[kind];
  const inputId = `hbc-kudos-bucket-${kind}`;

  function commit(): void {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      e.preventDefault();
      onChange(values.slice(0, -1));
    }
  }

  function removeAt(index: number): void {
    onChange(values.filter((_, i) => i !== index));
  }

  const BucketIcon = config.icon;

  return (
    <div className={styles.bucket}>
      <div className={styles.bucketLabel}>
        <BucketIcon size={12} strokeWidth={2.2} aria-hidden="true" className={styles.bucketLabelIcon} />
        {config.label}
      </div>
      <div className={styles.bucketChips}>
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className={clsx(styles.bucketChip, styles[`bucketChip_${kind}` as keyof typeof styles])}>
            <BucketIcon size={10} strokeWidth={2.5} aria-hidden="true" className={styles.bucketChipIcon} />
            <span className={styles.bucketChipLabel}>{value}</span>
            <button
              type="button"
              onClick={() => removeAt(index)}
              disabled={disabled}
              aria-label={`Remove ${value}`}
              className={styles.bucketChipRemove}
            >
              <XIcon size={10} strokeWidth={3} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          disabled={disabled}
          placeholder={values.length === 0 ? config.placeholder : ''}
          autoComplete="off"
          className={styles.bucketInput}
        />
      </div>
    </div>
  );
}

export function HbcKudosComposerForm({
  draft,
  onDraftChange,
  errors = {},
  disabled = false,
  recipientsMode = 'text',
  searchPeople,
}: HbcKudosComposerFormProps): React.JSX.Element {
  const typedBuckets = draft.recipients ?? EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS;
  const handleTypedChange = React.useCallback(
    (patch: Partial<KudosComposerRecipientBucketsDraft>) => {
      onDraftChange({ recipients: { ...typedBuckets, ...patch } });
    },
    [onDraftChange, typedBuckets],
  );

  const [showDetails, setShowDetails] = React.useState(Boolean(draft.details));

  return (
    <div className={styles.form}>
      <div className={styles.formNotice}>
        Your kudos will be reviewed before appearing on the homepage.
      </div>

      {/* Recipients */}
      {recipientsMode === 'typed' ? (
        <HbcKudosComposerTypedRecipients
          buckets={typedBuckets}
          onChange={handleTypedChange}
          disabled={disabled}
          errorMessage={errors.recipients}
          searchPeople={searchPeople}
        />
      ) : (
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
      )}

      <hr className={styles.formDivider} />

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
        {draft.headline.length > 80 ? (
          <div className={styles.hint}>{draft.headline.length}/120</div>
        ) : null}
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
          rows={3}
          className={clsx(styles.input, styles.textarea, errors.excerpt && styles.inputError)}
        />
        {errors.excerpt ? <div className={styles.error}>{errors.excerpt}</div> : null}
      </div>

      {/* Details — progressive disclosure */}
      {showDetails ? (
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
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          disabled={disabled}
          className={styles.detailsToggle}
        >
          + Add details
        </button>
      )}
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

function flattenTypedRecipients(
  buckets: KudosComposerRecipientBucketsDraft | undefined,
): string[] {
  if (!buckets) return [];
  return [
    ...buckets.individualEmails,
    ...buckets.teamLabels,
    ...buckets.departmentLabels,
    ...buckets.projectGroupLabels,
  ].filter(Boolean);
}

export function HbcKudosComposerPreview({
  draft,
  submitterName,
}: HbcKudosComposerPreviewProps): React.JSX.Element {
  // Typed buckets take precedence when any bucket has entries; otherwise
  // fall back to the legacy comma-delimited text field so the transitional
  // merged People & Culture webpart continues to render correctly.
  const typedFlat = flattenTypedRecipients(draft.recipients);
  const recipients = typedFlat.length > 0 ? typedFlat : parseRecipients(draft.recipientNames);
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
      <div className={styles.previewLabel}>
        <span className={styles.previewLabelDot} aria-hidden="true" />
        Preview
      </div>
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

        <h3 className={styles.previewHeadline}>{headline}</h3>

        {recipientLine ? (
          <span className={styles.previewRecipients}>{recipientLine}</span>
        ) : null}

        <p className={styles.previewExcerpt}>{excerpt}</p>

        <div className={styles.previewSubmitter}>
          <CheckCircle2 size={11} aria-hidden="true" className={styles.previewSubmitterIcon} />
          {submitterName || 'You'}
        </div>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success pane
// ---------------------------------------------------------------------------

export interface HbcKudosComposerSuccessProps {
  title?: string;
  body?: string;
}

export function HbcKudosComposerSuccess({
  title = 'Kudos sent!',
  body = 'Your recognition has been submitted for review. It will appear on the homepage once approved.',
}: HbcKudosComposerSuccessProps): React.JSX.Element {
  return (
    <div className={styles.successPane}>
      <div className={styles.successIcon} aria-hidden="true">
        <CheckCircle2 size={30} strokeWidth={2.2} />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successBody}>{body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error banner
// ---------------------------------------------------------------------------

export interface HbcKudosComposerErrorProps {
  title?: string;
  body: string;
}

export function HbcKudosComposerError({
  title = 'Submission failed',
  body,
}: HbcKudosComposerErrorProps): React.JSX.Element {
  return (
    <div role="alert" className={styles.errorBanner}>
      <span className={styles.errorBannerIcon} aria-hidden="true">
        <AlertCircle size={14} strokeWidth={2.5} />
      </span>
      <div className={styles.errorBannerBody}>
        <div className={styles.errorBannerTitle}>{title}</div>
        <div className={styles.errorBannerMessage}>{body}</div>
      </div>
    </div>
  );
}
