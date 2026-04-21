import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './safety-homepage-surface.module.css';

export type HbcSafetyHomepageSurfaceMode = 'standard' | 'compact' | 'minimal';

export type SafetySignalSeverity = 'default' | 'success' | 'warning' | 'danger';

export type SafetyPostureTone = 'info' | 'success' | 'warning' | 'critical' | 'neutral';

export interface SafetySurfaceCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface SafetySurfaceMetaItem {
  label: string;
  icon?: LucideIcon;
}

export interface SafetyPrimarySignal {
  title: string;
  summary?: string;
  compactSummary?: string;
  urgencyLabel?: string;
  severity?: SafetySignalSeverity;
  icon?: LucideIcon;
  badges?: React.ReactNode;
  metaItems?: SafetySurfaceMetaItem[];
  cta?: SafetySurfaceCta;
}

export interface SafetySecondarySignal {
  id: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  severity?: SafetySignalSeverity;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  openInNewTab?: boolean;
}

export interface SafetyPostureSummary {
  label: string;
  summary?: string;
  updatedLabel?: string;
  tone?: SafetyPostureTone;
}

export interface HbcSafetyHomepageSurfaceProps {
  title: string;
  icon?: LucideIcon;
  posture: SafetyPostureSummary;
  primary?: SafetyPrimarySignal;
  secondarySignals: SafetySecondarySignal[];
  action?: SafetySurfaceCta;
  mode?: HbcSafetyHomepageSurfaceMode;
  degradedNotice?: string;
  className?: string;
  'aria-label'?: string;
}

const SEVERITY_CLASS: Record<SafetySignalSeverity, string> = {
  default: styles.severityDefault!,
  success: styles.severitySuccess!,
  warning: styles.severityWarning!,
  danger: styles.severityDanger!,
};

const POSTURE_TONE_CLASS: Record<SafetyPostureTone, string> = {
  info: styles.postureInfo!,
  success: styles.postureSuccess!,
  warning: styles.postureWarning!,
  critical: styles.postureCritical!,
  neutral: styles.postureNeutral!,
};

const SIGNAL_CAP_BY_MODE: Record<HbcSafetyHomepageSurfaceMode, number> = {
  standard: 4,
  compact: 3,
  minimal: 2,
};

const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

function SecondarySignalRow({
  item,
  mode,
}: {
  item: SafetySecondarySignal;
  mode: HbcSafetyHomepageSurfaceMode;
}): React.JSX.Element {
  const Icon = item.icon;
  const severity = item.severity ?? 'default';
  const className = clsx(styles.signalRow, SEVERITY_CLASS[severity], mode !== 'standard' && styles.signalRowCompact);
  const showMeta = mode !== 'minimal' && Boolean(item.meta);
  const showBadge = mode === 'standard' && Boolean(item.badge);
  const content = (
    <>
      {Icon ? (
        <span className={styles.signalIcon} aria-hidden="true">
          <Icon size={15} strokeWidth={2.25} />
        </span>
      ) : null}
      <span className={styles.signalCopy}>
        <span className={styles.signalTitle}>{item.title}</span>
        {showMeta ? <span className={styles.signalMeta}>{item.meta}</span> : null}
      </span>
      {showBadge ? <span className={styles.signalBadge}>{item.badge}</span> : null}
    </>
  );

  if (item.href) {
    return (
      <a
        className={className}
        href={item.href}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={item.onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export function HbcSafetyHomepageSurface({
  title,
  icon: HeaderIcon,
  posture,
  primary,
  secondarySignals,
  action,
  mode = 'standard',
  degradedNotice,
  className,
  'aria-label': ariaLabel,
}: HbcSafetyHomepageSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const visibleSignals = secondarySignals.slice(0, SIGNAL_CAP_BY_MODE[mode]);
  const showPostureSummary = mode !== 'minimal' && Boolean(posture.summary);
  const showPrimarySummary = primary && (mode === 'standard' || (mode === 'compact' && (primary.compactSummary ?? primary.summary)));
  const primarySummary = mode === 'compact' ? primary?.compactSummary ?? primary?.summary : primary?.summary;
  const visibleMeta = primary?.metaItems
    ? mode === 'standard'
      ? primary.metaItems
      : mode === 'compact'
        ? primary.metaItems.slice(0, 2)
        : []
    : [];
  const showPrimaryCta = mode !== 'minimal' && Boolean(primary?.cta);
  const showSurfaceAction = mode === 'standard' || (mode === 'compact' && !showPrimaryCta);
  const primarySeverity = primary?.severity ?? 'default';
  const PrimaryIcon = primary?.icon;
  const primaryMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.34, ease: EASE_OUT },
      };

  return (
    <section
      className={clsx(styles.root, mode === 'compact' && styles.modeCompact, mode === 'minimal' && styles.modeMinimal, className)}
      aria-label={ariaLabel ?? title}
      data-hbc-premium="safety-homepage-surface"
      data-hbc-homepage="operational-safety"
      data-hbc-safety-mode={mode}
    >
      <header className={styles.postureBand}>
        <div className={styles.postureLead}>
          <span className={clsx(styles.postureChip, POSTURE_TONE_CLASS[posture.tone ?? 'info'])}>
            {HeaderIcon ? (
              <span className={styles.postureIcon} aria-hidden="true">
                <HeaderIcon size={14} strokeWidth={2.25} />
              </span>
            ) : null}
            {posture.label}
          </span>
          {posture.updatedLabel && mode !== 'minimal' ? (
            <span className={styles.updatedLabel}>{posture.updatedLabel}</span>
          ) : null}
        </div>
        <h2 className={styles.headline}>{title}</h2>
        {showPostureSummary ? <p className={styles.postureSummary}>{posture.summary}</p> : null}
        {showSurfaceAction && action ? (
          <div className={styles.postureAction}>
            <HbcPremiumCta
              label={action.label}
              href={action.href}
              external={action.openInNewTab}
              variant="ghost"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </header>

      <div className={styles.body}>
        <motion.article
          className={clsx(styles.primaryRegion, SEVERITY_CLASS[primarySeverity])}
          aria-label={primary ? `Primary safety signal: ${primary.title}` : 'Primary safety signal unavailable'}
          {...primaryMotion}
        >
          {degradedNotice ? (
            <p className={styles.degradedNotice} role="status">
              {degradedNotice}
            </p>
          ) : null}
          {primary ? (
            <>
              <div className={styles.primaryHeader}>
                <span className={styles.primaryKicker}>{primary.urgencyLabel ?? 'Primary signal'}</span>
                {PrimaryIcon ? (
                  <span className={styles.primaryIcon} aria-hidden="true">
                    <PrimaryIcon size={18} strokeWidth={2.25} />
                  </span>
                ) : null}
              </div>
              <h3 className={styles.primaryTitle}>{primary.title}</h3>
              {showPrimarySummary && primarySummary ? <p className={styles.primarySummary}>{primarySummary}</p> : null}
              {primary.badges ? <div className={styles.primaryBadges}>{primary.badges}</div> : null}
              {visibleMeta.length > 0 ? (
                <div className={styles.primaryMeta}>
                  {visibleMeta.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <span key={`${item.label}-${idx}`} className={styles.primaryMetaItem}>
                        {Icon ? <Icon size={12} strokeWidth={2.25} aria-hidden="true" /> : null}
                        {item.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              {showPrimaryCta && primary.cta ? (
                <div className={styles.primaryAction}>
                  <HbcPremiumCta
                    label={primary.cta.label}
                    href={primary.cta.href}
                    external={primary.cta.openInNewTab}
                    variant="primary"
                    size="md"
                    arrow
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.primaryFallback}>
              <h3 className={styles.primaryTitle}>Primary signal unavailable</h3>
              <p className={styles.primarySummary}>
                Safety input is currently incomplete. Review authoring inputs to restore the primary signal.
              </p>
            </div>
          )}
        </motion.article>

        <aside className={styles.secondaryRegion} aria-label="Secondary safety signals">
          <div className={styles.secondaryHeader}>
            <span>Secondary signals</span>
            <span className={styles.secondaryRule} aria-hidden="true" />
          </div>
          <div className={styles.secondaryList}>
            {visibleSignals.map((signal) => (
              <SecondarySignalRow key={signal.id} item={signal} mode={mode} />
            ))}
            {visibleSignals.length === 0 ? (
              <p className={styles.secondaryEmpty}>No secondary safety signals are currently active.</p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
