/**
 * HbcEditorialSurface — Signature executive editorial surface family.
 *
 * Cohesive presentation-lane surface for the homepage Leadership Message
 * zone and other executive editorial consumers: a nameplate-style masthead,
 * a quote-framed featured block with decorative opening quote mark, a
 * formal signature (leader name + role + dateline), optional framed media,
 * and a subordinate "From the archive" rail for prior entries.
 *
 * W01r-P17 — Leadership Message executive rebuild:
 *   • Nameplate eyebrow ("From Leadership") + dominant title + ghost action
 *   • Warm-accent quote block with formal message title and italic body
 *   • Dedicated signature block (avatar + name + role + dateline)
 *   • Framed 16:9 media slot
 *   • Numbered "From the archive" rail with subordinate register
 *   • Executive-register contrast with the blue Newsroom surface family
 *
 * View-model contract stays backward compatible with earlier consumers:
 * the legacy `featured.meta` / `featured.cta` / `featured.media` / `items`
 * props still work. Leadership Message uses the richer explicit props
 * below (`leaderName`, `leaderRole`, etc.) instead of composing ad-hoc
 * ReactNodes, so the consumer no longer owns any inline styling.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './editorial-surface.module.css';

// ---------------------------------------------------------------------------
// View-model contract
// ---------------------------------------------------------------------------

export interface EditorialMedia {
  src: string;
  alt: string;
}

export interface EditorialCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface EditorialFeaturedItem {
  /** Small-caps eyebrow above the featured title (e.g. "From Leadership"). */
  eyebrow?: string;
  /** Formal message title. */
  title: string;
  /** Body / quote paragraph rendered in the formal italic serif treatment. */
  excerpt?: string;
  /**
   * Legacy free-form meta slot. Prefer the richer `leaderName` / `leaderRole`
   * / `publishDate` props when authoring a signature block; this slot is kept
   * for backward compatibility with existing consumers.
   */
  meta?: React.ReactNode;
  /**
   * Legacy CTA slot. Prefer the richer `cta` object so the surface can own
   * the premium button treatment.
   */
  ctaNode?: React.ReactNode;
  /** Richer, typed CTA. The surface renders an `HbcPremiumCta` internally. */
  cta?: EditorialCta;
  /** Legacy ReactNode media slot. Prefer the richer `mediaImage` prop. */
  media?: React.ReactNode;
  /** Richer typed media slot rendered in the framed 16:9 slot. */
  mediaImage?: EditorialMedia;
  /** Leader name for the signature block. */
  leaderName?: string;
  /** Leader role shown subordinate to `leaderName`. */
  leaderRole?: string;
  /** Optional avatar URL. Falls back to initials when absent. */
  leaderAvatarUrl?: string;
  /** Publish date shown in the masthead eyebrow and signature dateline. */
  publishDate?: string;
}

export interface EditorialSecondaryItem {
  id: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  openInNewTab?: boolean;
}

/**
 * Narrow-section refinement variant. `"leadership"` opts into a tuned
 * rhythm designed for the Leadership Message webpart's narrow
 * SharePoint column (tighter masthead padding, reduced featured
 * interior whitespace, smaller decorative quote mark, compact archive
 * rail, quieter footer). Default is the wider authored editorial
 * layout used by other consumers.
 */
export type HbcEditorialSurfaceVariant = 'default' | 'leadership';

export interface HbcEditorialSurfaceProps {
  /** Dominant masthead title. */
  title: string;
  /** Optional masthead icon. */
  icon?: LucideIcon;
  /**
   * Optional header-row action. Kept for backward compatibility; new
   * consumers should prefer the typed `archiveHref` prop below so the
   * surface can render an `HbcPremiumCta` itself.
   */
  headerAction?: React.ReactNode;
  /** Archive href shown in the masthead "See all" and footer strip. */
  archiveHref?: string;
  /** Override the masthead action label. Defaults to "See all". */
  archiveLabel?: string;
  /** Override the footer archive label. Defaults to "Read the archive". */
  footerArchiveLabel?: string;
  /** Override the masthead eyebrow tag. Defaults to "Editorial". */
  mastheadEyebrow?: string;
  /** Override the archive rail header. Defaults to "From the archive". */
  archiveTitle?: string;
  /** Featured quote / message block. */
  featured?: EditorialFeaturedItem;
  /** Archive / secondary entries. */
  items?: EditorialSecondaryItem[];
  /**
   * Layout variant. Use `"leadership"` from the Leadership Message
   * webpart to opt into the narrow-section refinement. Defaults to
   * `"default"` so other editorial consumers are unaffected.
   */
  variant?: HbcEditorialSurfaceVariant;
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

function getFeaturedMotion(reducedMotion: boolean) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  } as const;
}

function getArchiveMotion(reducedMotion: boolean) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: 0.2, ease: EASE_OUT_EXPO },
  } as const;
}

/** Format 1-based index as zero-padded editorial numeral ("01", "02"). */
function formatArchiveIndex(index: number): string {
  return index < 10 ? `0${index}` : String(index);
}

/** Derive initials from a full name (e.g. "Alex Carter" → "AC"). */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return '';
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface MastheadProps {
  title: string;
  icon?: LucideIcon;
  mastheadEyebrow: string;
  latestPublishDate?: string;
  archiveHref?: string;
  archiveLabel: string;
  headerAction?: React.ReactNode;
}

function Masthead({
  title,
  icon: HeaderIcon,
  mastheadEyebrow,
  latestPublishDate,
  archiveHref,
  archiveLabel,
  headerAction,
}: MastheadProps): React.JSX.Element {
  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadEyebrow}>
        {HeaderIcon ? (
          <span className={styles.mastheadEyebrowIcon} aria-hidden="true">
            <HeaderIcon size={14} strokeWidth={2} />
          </span>
        ) : null}
        <span>{mastheadEyebrow}</span>
        <span className={styles.mastheadEyebrowRule} aria-hidden="true" />
        {latestPublishDate ? (
          <span className={styles.mastheadEyebrowDate}>Updated {latestPublishDate}</span>
        ) : null}
      </div>
      <div className={styles.mastheadRow}>
        <h2 className={styles.mastheadHeadline}>{title}</h2>
        {headerAction ? (
          <div className={styles.mastheadAction}>{headerAction}</div>
        ) : archiveHref ? (
          <div className={styles.mastheadAction}>
            <HbcPremiumCta
              label={archiveLabel}
              href={archiveHref}
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

interface SignatureProps {
  leaderName?: string;
  leaderRole?: string;
  leaderAvatarUrl?: string;
  publishDate?: string;
  legacyMeta?: React.ReactNode;
}

function Signature({
  leaderName,
  leaderRole,
  leaderAvatarUrl,
  publishDate,
  legacyMeta,
}: SignatureProps): React.JSX.Element | null {
  // Backward-compatible legacy meta path: if no richer props are provided,
  // fall back to the legacy ReactNode meta slot so older consumers still
  // render their attribution block.
  if (!leaderName && !legacyMeta) return null;

  if (!leaderName && legacyMeta) {
    return <div className={styles.signature}>{legacyMeta}</div>;
  }

  return (
    <div className={styles.signature}>
      <div className={styles.signatureAvatar} aria-hidden="true">
        {leaderAvatarUrl ? (
          <img
            src={leaderAvatarUrl}
            alt=""
            className={styles.signatureAvatarImg}
          />
        ) : (
          deriveInitials(leaderName!)
        )}
      </div>
      <div className={styles.signatureBlock}>
        <span className={styles.signatureName}>{leaderName}</span>
        {leaderRole ? (
          <span className={styles.signatureRole}>{leaderRole}</span>
        ) : null}
      </div>
      {publishDate ? <span className={styles.signatureDate}>{publishDate}</span> : null}
    </div>
  );
}

interface FeaturedBlockProps {
  item: EditorialFeaturedItem;
  reducedMotion: boolean;
}

function FeaturedBlock({ item, reducedMotion }: FeaturedBlockProps): React.JSX.Element {
  const mediaImage = item.mediaImage;
  const legacyMedia = !mediaImage && item.media ? item.media : null;

  return (
    <motion.article
      className={styles.featured}
      aria-label={`Featured: ${item.title}`}
      {...getFeaturedMotion(reducedMotion)}
    >
      <span className={styles.featuredQuoteMark} aria-hidden="true">
        &ldquo;
      </span>

      {item.eyebrow ? (
        <span className={styles.featuredEyebrow}>{item.eyebrow}</span>
      ) : null}

      <h3 className={styles.featuredTitle}>{item.title}</h3>

      {item.excerpt ? <p className={styles.featuredExcerpt}>{item.excerpt}</p> : null}

      {mediaImage ? (
        <div className={styles.featuredMedia}>
          <img
            src={mediaImage.src}
            alt={mediaImage.alt}
            loading="lazy"
            decoding="async"
            className={styles.featuredMediaImg}
          />
        </div>
      ) : legacyMedia ? (
        <div className={styles.featuredMedia}>{legacyMedia}</div>
      ) : null}

      <Signature
        leaderName={item.leaderName}
        leaderRole={item.leaderRole}
        leaderAvatarUrl={item.leaderAvatarUrl}
        publishDate={item.publishDate}
        legacyMeta={item.meta}
      />

      {item.cta ? (
        <div className={styles.featuredCta}>
          <HbcPremiumCta
            label={item.cta.label}
            href={item.cta.href}
            variant="primary"
            size="md"
            arrow
          />
        </div>
      ) : item.ctaNode ? (
        <div className={styles.featuredCta}>{item.ctaNode}</div>
      ) : null}
    </motion.article>
  );
}

interface ArchiveRailProps {
  items: EditorialSecondaryItem[];
  header: string;
  reducedMotion: boolean;
}

function ArchiveRail({
  items,
  header,
  reducedMotion,
}: ArchiveRailProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <motion.div className={styles.archive} {...getArchiveMotion(reducedMotion)}>
      <div className={styles.archiveHeader}>
        <span>{header}</span>
        <span className={styles.archiveHeaderRule} aria-hidden="true" />
      </div>
      <div className={styles.archiveList}>
        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 ? <hr className={styles.archiveDivider} /> : null}
            <ArchiveItem item={item} index={i + 1} />
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

interface ArchiveItemProps {
  item: EditorialSecondaryItem;
  index: number;
}

function ArchiveItem({ item, index }: ArchiveItemProps): React.JSX.Element {
  const isClickable = Boolean(item.href) || Boolean(item.onClick);
  const label = formatArchiveIndex(index);
  const content = (
    <>
      <span className={styles.archiveItemIndex} aria-hidden="true">
        {label}
      </span>
      <div className={styles.archiveItemContent}>
        <span className={styles.archiveItemTitle}>{item.title}</span>
        {item.meta ? <span className={styles.archiveItemMeta}>{item.meta}</span> : null}
      </div>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        className={styles.archiveItem}
      >
        {content}
      </a>
    );
  }

  if (isClickable && item.onClick) {
    return (
      <div
        className={styles.archiveItem}
        role="button"
        tabIndex={0}
        onClick={item.onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            item.onClick!();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return <div className={styles.archiveItemStatic}>{content}</div>;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function HbcEditorialSurface({
  title,
  icon,
  headerAction,
  archiveHref,
  archiveLabel = 'See all',
  footerArchiveLabel = 'Read the archive',
  mastheadEyebrow = 'Editorial',
  archiveTitle = 'From the archive',
  featured,
  items,
  variant = 'default',
  children,
  className,
  'aria-label': ariaLabel,
}: HbcEditorialSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const archiveItems = items ?? [];

  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(
        styles.root,
        variant === 'leadership' && styles.leadership,
        className,
      )}
      data-hbc-premium="editorial-surface"
      data-hbc-homepage="leadership-message"
      data-hbc-editorial-variant={variant}
    >
      <Masthead
        title={title}
        icon={icon}
        mastheadEyebrow={mastheadEyebrow}
        latestPublishDate={featured?.publishDate}
        archiveHref={archiveHref}
        archiveLabel={archiveLabel}
        headerAction={headerAction}
      />

      <hr className={styles.separator} />

      <div className={styles.content}>
        {featured ? <FeaturedBlock item={featured} reducedMotion={reducedMotion} /> : null}
        <ArchiveRail
          items={archiveItems}
          header={archiveTitle}
          reducedMotion={reducedMotion}
        />
        {children}
      </div>

      {archiveHref ? (
        <div className={styles.footer}>
          <HbcPremiumCta
            label={footerArchiveLabel}
            href={archiveHref}
            variant="ghost"
            size="sm"
            arrow
          />
        </div>
      ) : (
        <div className={styles.bottomSpacer} aria-hidden="true" />
      )}
    </section>
  );
}
