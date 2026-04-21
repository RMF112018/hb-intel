/**
 * HbcOperationalSurface — Signature operational command surface family.
 *
 * Purpose-built surface for the Safety & Field Excellence zone and any
 * other operational-credibility homepage module that needs strong
 * severity readability. Renders a safety-register nameplate masthead,
 * a persistent severity spectrum strip, a dominant featured signal
 * with severity-aware accent and iconography, and a list of signal
 * rows with per-severity left accents.
 *
 * W01r-P20 — Safety & Field Excellence rebuild. View-model stays
 * backward compatible; consumers can opt into the richer featured
 * treatment via new typed props (`featured.severity`, `featured.icon`,
 * `featured.eyebrow`, `featured.metaItems`, `featured.cta`). Legacy
 * ReactNode slots (`featured.badge`, `featured.meta`, `headerAction`)
 * continue to work.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './operational-surface.module.css';

// ---------------------------------------------------------------------------
// View-model contract
// ---------------------------------------------------------------------------

export type OperationalSignalSeverity =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger';

const SEVERITY_ICON_CLASS: Record<OperationalSignalSeverity, string> = {
  default: styles.signalIconDefault!,
  success: styles.signalIconSuccess!,
  warning: styles.signalIconWarning!,
  danger: styles.signalIconDanger!,
};

const SEVERITY_TILE_CLASS: Record<OperationalSignalSeverity, string> = {
  default: styles.signalDefault!,
  success: styles.signalSuccess!,
  warning: styles.signalWarning!,
  danger: styles.signalDanger!,
};

const SEVERITY_FEATURED_CLASS: Record<OperationalSignalSeverity, string> = {
  default: styles.featuredDefault!,
  success: styles.featuredSuccess!,
  warning: styles.featuredWarning!,
  danger: styles.featuredDanger!,
};

const SEVERITY_FEATURED_ICON_CLASS: Record<OperationalSignalSeverity, string> = {
  default: '',
  success: styles.featuredIconSuccess!,
  warning: styles.featuredIconWarning!,
  danger: styles.featuredIconDanger!,
};

const SEVERITY_FEATURED_EYEBROW_CLASS: Record<OperationalSignalSeverity, string> = {
  default: styles.featuredEyebrowDefault!,
  success: styles.featuredEyebrowSuccess!,
  warning: styles.featuredEyebrowWarning!,
  danger: styles.featuredEyebrowDanger!,
};

const SEVERITY_FEATURED_EYEBROW_DOT_CLASS: Record<OperationalSignalSeverity, string> = {
  default: '',
  success: styles.featuredEyebrowDotSuccess!,
  warning: styles.featuredEyebrowDotWarning!,
  danger: styles.featuredEyebrowDotDanger!,
};

export interface OperationalCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface OperationalMetaItem {
  label: string;
  icon?: LucideIcon;
}

export interface OperationalFeatured {
  title: string;
  description?: string;
  /** Small-caps eyebrow above the featured title. Defaults to the severity name. */
  eyebrow?: string;
  /** Lucide icon rendered in the severity badge. */
  icon?: LucideIcon;
  /** Severity driving color + icon classes. Defaults to `default` (blue). */
  severity?: OperationalSignalSeverity;
  /** Badge row (e.g. HbcPremiumBadge children). Keeps legacy consumers working. */
  badge?: React.ReactNode;
  /**
   * Legacy free-form meta slot. Prefer `metaItems` when authoring new
   * surfaces; `meta` is kept for backward compatibility.
   */
  meta?: React.ReactNode;
  /** Typed meta row (icon + label pairs). */
  metaItems?: OperationalMetaItem[];
  /** Typed primary CTA rendered inside the featured card. */
  cta?: OperationalCta;
}

export interface OperationalSignal {
  id: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  severity?: OperationalSignalSeverity;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  openInNewTab?: boolean;
}

export type HbcOperationalSurfaceMode = 'standard' | 'compact' | 'minimal';

export const HBC_OPERATIONAL_SURFACE_MODE_CONTRACT = {
  standard: {
    narrowestStableWidth: 640,
    behavior:
      'Full masthead dateline/action, full featured narrative/meta/cta, and full signal metadata with badges.',
  },
  compact: {
    narrowestStableWidth: 420,
    behavior:
      'Preserve spotlight and active signals with shortened descriptions, capped meta rows, and reduced signal ornamentation.',
  },
  minimal: {
    narrowestStableWidth: 320,
    behavior:
      'Spotlight-first essentials: hide non-critical masthead metadata, collapse featured/supporting extras, and cap signal depth.',
  },
} as const;

/**
 * Layout variant. `"safety-homepage"` opts into a scoped homepage-fit
 * refinement designed for the Safety & Field Excellence webpart's
 * narrow SharePoint section (tighter masthead padding, severity
 * strip, and content padding; compact featured card and signal
 * rows). Default is the wider authored operational scale used by
 * other consumers.
 */
export type HbcOperationalSurfaceVariant = 'default' | 'safety-homepage';

export interface HbcOperationalSurfaceProps {
  title: string;
  icon?: LucideIcon;
  /** Masthead eyebrow. Defaults to "Field Safety". */
  mastheadEyebrow?: string;
  /** Masthead dateline (e.g. "Updated 2026-04-07"). */
  latestUpdated?: string;
  /** Legacy action slot rendered in the masthead. Preferred: use `action` below. */
  headerAction?: React.ReactNode;
  /** Typed ghost-variant action rendered in the masthead. */
  action?: OperationalCta;
  featured?: OperationalFeatured;
  signals?: OperationalSignal[];
  /**
   * Layout variant. Use `"safety-homepage"` from SafetyFieldExcellence
   * to opt into the homepage-fit refinement. Defaults to `"default"`.
   */
  variant?: HbcOperationalSurfaceVariant;
  /**
   * Application-level shell-fit mode contract.
   * - standard: full fidelity
   * - compact: reduced but complete
   * - minimal: essentials only for narrow nested slots
   */
  mode?: HbcOperationalSurfaceMode;
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const SEVERITY_LABELS: Record<OperationalSignalSeverity, string> = {
  default: 'Highlight',
  success: 'Recognition',
  warning: 'Reminder',
  danger: 'Notice',
};

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface MastheadProps {
  title: string;
  icon?: LucideIcon;
  eyebrow: string;
  latestUpdated?: string;
  headerAction?: React.ReactNode;
  action?: OperationalCta;
  mode: HbcOperationalSurfaceMode;
}

function Masthead({
  title,
  icon: HeaderIcon,
  eyebrow,
  latestUpdated,
  headerAction,
  action,
  mode,
}: MastheadProps): React.JSX.Element {
  const showDateline = mode !== 'minimal';
  const showAction = mode === 'standard' || mode === 'compact';
  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadEyebrow}>
        {HeaderIcon ? (
          <span className={styles.mastheadEyebrowIcon} aria-hidden="true">
            <HeaderIcon size={14} strokeWidth={2.25} />
          </span>
        ) : null}
        <span>{eyebrow}</span>
        <span className={styles.mastheadEyebrowRule} aria-hidden="true" />
        {showDateline && latestUpdated ? (
          <span className={styles.mastheadEyebrowDate}>{latestUpdated}</span>
        ) : null}
      </div>
      <div className={styles.mastheadRow}>
        <h2 className={styles.mastheadHeadline}>{title}</h2>
        {showAction && headerAction ? (
          <div className={styles.mastheadAction}>{headerAction}</div>
        ) : showAction && action ? (
          <div className={styles.mastheadAction}>
            <HbcPremiumCta
              label={action.label}
              href={action.href}
              variant="ghost"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SeverityStrip(): React.JSX.Element {
  return (
    <div className={styles.severityStrip} aria-hidden="true">
      <div className={clsx(styles.severityStripSegment, styles.severityStripDanger)} />
      <div className={clsx(styles.severityStripSegment, styles.severityStripWarning)} />
      <div className={clsx(styles.severityStripSegment, styles.severityStripDefault)} />
      <div className={clsx(styles.severityStripSegment, styles.severityStripSuccess)} />
    </div>
  );
}

interface FeaturedBlockProps {
  item: OperationalFeatured;
  reducedMotion: boolean;
  mode: HbcOperationalSurfaceMode;
}

function FeaturedBlock({ item, reducedMotion, mode }: FeaturedBlockProps): React.JSX.Element {
  const severity: OperationalSignalSeverity = item.severity ?? 'default';
  const FeaturedIcon = item.icon;
  const eyebrow = item.eyebrow ?? SEVERITY_LABELS[severity];
  const metaItems = item.metaItems ?? [];
  const showDescription = Boolean(item.description) && mode !== 'minimal';
  const descriptionClassName =
    mode === 'compact'
      ? clsx(styles.featuredDescription, styles.featuredDescriptionCompact)
      : styles.featuredDescription;
  const visibleMetaItems =
    mode === 'standard' ? metaItems : mode === 'compact' ? metaItems.slice(0, 3) : metaItems.slice(0, 1);
  const showBadge = mode !== 'minimal';
  const showMeta = mode !== 'minimal' && visibleMetaItems.length > 0;
  const showLegacyMeta = mode !== 'minimal' && !visibleMetaItems.length && Boolean(item.meta);
  const showCta = mode === 'standard' && Boolean(item.cta);
  const featuredCta = item.cta;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.article
      className={clsx(styles.featured, SEVERITY_FEATURED_CLASS[severity])}
      aria-label={`Featured signal: ${item.title}`}
      {...motionProps}
    >
      {FeaturedIcon ? (
        <span
          className={clsx(styles.featuredIcon, SEVERITY_FEATURED_ICON_CLASS[severity])}
          aria-hidden="true"
        >
          <FeaturedIcon size={22} strokeWidth={2.25} />
        </span>
      ) : null}

      <div className={styles.featuredBody}>
        <span
          className={clsx(
            styles.featuredEyebrow,
            SEVERITY_FEATURED_EYEBROW_CLASS[severity],
          )}
        >
          <span
            className={clsx(
              styles.featuredEyebrowDot,
              SEVERITY_FEATURED_EYEBROW_DOT_CLASS[severity],
            )}
            aria-hidden="true"
          />
          {eyebrow}
        </span>

        <h3 className={styles.featuredTitle}>{item.title}</h3>

        {showDescription ? (
          <p className={descriptionClassName}>{item.description}</p>
        ) : null}

        {showBadge && item.badge ? <div className={styles.featuredBadgeRow}>{item.badge}</div> : null}

        {showMeta ? (
          <div className={styles.featuredMeta}>
            {visibleMetaItems.map((entry, idx) => {
              const Icon = entry.icon;
              return (
                <span key={`${entry.label}-${idx}`} className={styles.featuredMetaItem}>
                  {Icon ? (
                    <Icon
                      size={12}
                      aria-hidden="true"
                      strokeWidth={2.25}
                      className={styles.featuredMetaIcon}
                    />
                  ) : null}
                  {entry.label}
                </span>
              );
            })}
          </div>
        ) : showLegacyMeta ? (
          <div className={styles.featuredMeta}>{item.meta}</div>
        ) : null}

        {showCta && featuredCta ? (
          <div className={styles.featuredCta}>
            <HbcPremiumCta
              label={featuredCta.label}
              href={featuredCta.href}
              variant="primary"
              size="md"
              arrow
            />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

interface SignalRowProps {
  signal: OperationalSignal;
  mode: HbcOperationalSurfaceMode;
}

function SignalRow({ signal, mode }: SignalRowProps): React.JSX.Element {
  const severity: OperationalSignalSeverity = signal.severity ?? 'default';
  const SignalIcon = signal.icon;
  const tileClass = clsx(styles.signal, SEVERITY_TILE_CLASS[severity]);

  const showMeta = mode !== 'minimal' && Boolean(signal.meta);
  const showBadge = mode === 'standard' && Boolean(signal.badge);
  const signalClassName =
    mode === 'compact'
      ? clsx(tileClass, styles.signalCompact)
      : mode === 'minimal'
        ? clsx(tileClass, styles.signalMinimal)
        : tileClass;

  const content = (
    <>
      {SignalIcon ? (
        <span
          className={clsx(styles.signalIcon, SEVERITY_ICON_CLASS[severity])}
          aria-hidden="true"
        >
          <SignalIcon size={15} strokeWidth={2.25} />
        </span>
      ) : null}
      <div className={styles.signalContent}>
        <span className={styles.signalTitle}>{signal.title}</span>
        {showMeta ? <span className={styles.signalMeta}>{signal.meta}</span> : null}
      </div>
      {showBadge ? <span className={styles.signalBadge}>{signal.badge}</span> : null}
    </>
  );

  if (signal.href) {
    return (
      <a
        className={signalClassName}
        href={signal.href}
        target={signal.openInNewTab ? '_blank' : undefined}
        rel={signal.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  if (signal.onClick) {
    return (
      <div
        className={signalClassName}
        role="button"
        tabIndex={0}
        onClick={signal.onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            signal.onClick!();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return <div className={signalClassName}>{content}</div>;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function HbcOperationalSurface({
  title,
  icon,
  mastheadEyebrow = 'Field Safety',
  latestUpdated,
  headerAction,
  action,
  featured,
  signals,
  variant = 'default',
  mode = 'standard',
  children,
  className,
  'aria-label': ariaLabel,
}: HbcOperationalSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const signalList = signals ?? [];
  const visibleSignals =
    mode === 'standard' ? signalList : mode === 'compact' ? signalList.slice(0, 3) : signalList.slice(0, 2);

  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(
        styles.root,
        variant === 'safety-homepage' && styles.safetyHomepage,
        mode === 'compact' && styles.modeCompact,
        mode === 'minimal' && styles.modeMinimal,
        className,
      )}
      data-hbc-premium="operational-surface"
      data-hbc-homepage="operational-safety"
      data-hbc-operational-variant={variant}
      data-hbc-operational-mode={mode}
    >
      <Masthead
        title={title}
        icon={icon}
        eyebrow={mastheadEyebrow}
        latestUpdated={latestUpdated}
        headerAction={headerAction}
        action={action}
        mode={mode}
      />

      <SeverityStrip />

      <div className={styles.content}>
        {featured ? <FeaturedBlock item={featured} reducedMotion={reducedMotion} mode={mode} /> : null}

        {visibleSignals.length > 0 ? (
          <>
            <div className={styles.signalsHeader}>
              <span>{mode === 'minimal' ? 'Priority signals' : 'Active signals'}</span>
              <span className={styles.signalsHeaderRule} aria-hidden="true" />
            </div>
            <div className={styles.signals}>
              {visibleSignals.map((signal) => (
                <SignalRow key={signal.id} signal={signal} mode={mode} />
              ))}
            </div>
          </>
        ) : null}

        {children}
      </div>
    </section>
  );
}
