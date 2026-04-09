/**
 * HbcNewsroomSurface — Signature internal newsroom / editorial surface family.
 *
 * Cohesive presentation-lane surface for the homepage Company Pulse zone:
 * a premium editorial composition with a dominant image-led lead story,
 * a subordinate supporting headline rail, an optional tertiary quick-read
 * chip zone, and an "archive" sparse-state CTA. Three layout modes
 * (`rich`, `sparse`, `headline-only`) are derived from the view-model via
 * `resolveNewsroomLayout`, preserving the data-driven layout selection
 * from the legacy consumer while moving the structural grammar into the
 * shared layer.
 *
 * Blue-led editorial hierarchy tuned for a newsroom register — cooler and
 * more authoritative than the warm celebratory HbcPeopleCultureSurface,
 * and with a distinct secondary-headline-rail behavior that sets it apart
 * from the image-led HbcProjectSpotlightSurface.
 *
 * Wave 01 follow-on: Company Pulse migration to @hbc/ui-kit/homepage.
 * Mirrors the HbcPeopleCultureSurface / HbcProjectSpotlightSurface pattern
 * (view-model contract, flat directory, CSS-module responsive, internal
 * sub-components). Consumers stay thin — normalization, audience filtering,
 * authoring governance, and webpart integration remain local.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Clock, FileText } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './newsroom-surface.module.css';

// ---------------------------------------------------------------------------
// View-model contract — decoupled from any consumer data shape
// ---------------------------------------------------------------------------

/**
 * Editorial category key accepted by the newsroom surface.
 *
 * Well-known values (`'update'`, `'safety'`, `'recognition'`, `'milestone'`)
 * ship with built-in swatches. Any other string is accepted and falls back
 * to the default blue editorial swatch.
 */
export type HbcNewsroomCategoryKey = string;

/** Well-known newsroom categories the surface ships swatch mapping for. */
export const HBC_NEWSROOM_WELL_KNOWN_CATEGORIES = [
  'update',
  'safety',
  'recognition',
  'milestone',
] as const;

export interface HbcNewsroomMedia {
  src: string;
  alt: string;
}

export interface HbcNewsroomCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface HbcNewsroomFeaturedItem {
  id: string;
  title: string;
  summary: string;
  category?: HbcNewsroomCategoryKey;
  byline?: string;
  publishDate?: string;
  media?: HbcNewsroomMedia;
  cta?: HbcNewsroomCta;
}

export interface HbcNewsroomHeadlineItem {
  id: string;
  title: string;
  category?: HbcNewsroomCategoryKey;
  byline?: string;
  publishDate?: string;
  cta?: HbcNewsroomCta;
}

export interface HbcNewsroomTertiaryItem {
  id: string;
  title: string;
  category?: HbcNewsroomCategoryKey;
}

export interface HbcNewsroomSurfaceModel {
  heading: string;
  lead?: HbcNewsroomFeaturedItem;
  secondary: HbcNewsroomHeadlineItem[];
  tertiary?: HbcNewsroomTertiaryItem[];
  /** href for the header "See all" and sparse-state / tertiary archive CTAs. */
  archiveHref?: string;
  /** Override the header action label. Defaults to "See all". */
  headerSeeAllLabel?: string;
  /** Override the rail header. Defaults to a layout-appropriate label. */
  secondaryHeader?: string;
  /** Override the sparse-footer / tertiary archive label. Defaults to "View all news". */
  archiveLabel?: string;
}

export type HbcNewsroomLayoutMode = 'rich' | 'sparse' | 'headline-only';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HbcNewsroomSurfaceProps {
  model: HbcNewsroomSurfaceModel;
  className?: string;
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Layout resolution — pure presentation-layer helper
// ---------------------------------------------------------------------------

/**
 * Derive the layout mode from the view-model. Consumers pass the full model
 * into the surface; the surface decides the composition.
 *
 * - `rich`: lead story + supporting headline rail (+ optional tertiary zone)
 * - `sparse`: lead story only, with an archive-footer CTA
 * - `headline-only`: full-width headline stack, no lead (+ optional tertiary zone)
 */
export function resolveNewsroomLayout(
  model: HbcNewsroomSurfaceModel,
): HbcNewsroomLayoutMode {
  const hasLead = Boolean(model.lead);
  const hasSecondary = model.secondary.length > 0;
  if (hasLead && hasSecondary) return 'rich';
  if (hasLead) return 'sparse';
  return 'headline-only';
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface CategorySwatch {
  bg: string;
  text: string;
  border: string;
}

/**
 * Editorial-appropriate category swatches. Blue-led hierarchy with restrained
 * warm accents so the newsroom register stays distinct from the warm
 * celebratory People & Culture register.
 */
const CATEGORY_SWATCHES: Record<string, CategorySwatch> = {
  update: {
    bg: 'rgba(34, 83, 145, 0.08)',
    text: '#225391',
    border: 'rgba(34, 83, 145, 0.20)',
  },
  safety: {
    bg: 'rgba(245, 158, 11, 0.08)',
    text: '#b45309',
    border: 'rgba(245, 158, 11, 0.20)',
  },
  recognition: {
    bg: 'rgba(16, 185, 129, 0.08)',
    text: '#047857',
    border: 'rgba(16, 185, 129, 0.20)',
  },
  milestone: {
    bg: 'rgba(229, 126, 70, 0.08)',
    text: '#c2410c',
    border: 'rgba(229, 126, 70, 0.20)',
  },
};

const FALLBACK_SWATCH: CategorySwatch = {
  bg: 'rgba(34, 83, 145, 0.08)',
  text: '#225391',
  border: 'rgba(34, 83, 145, 0.15)',
};

function resolveCategorySwatch(category: string): CategorySwatch {
  return CATEGORY_SWATCHES[category] ?? FALLBACK_SWATCH;
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

function getFeaturedMotion(reducedMotion: boolean) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  } as const;
}

function getRailMotion(reducedMotion: boolean) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, delay: 0.15, ease: EASE_OUT_EXPO },
  } as const;
}

function getSparseFooterMotion(reducedMotion: boolean) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: 0.2, ease: EASE_OUT_EXPO },
  } as const;
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface CategoryChipProps {
  category: string;
  size?: 'sm' | 'md';
}

function CategoryChip({ category, size = 'sm' }: CategoryChipProps): React.JSX.Element {
  const swatch = resolveCategorySwatch(category);
  return (
    <span
      className={size === 'sm' ? styles.chipSm : styles.chipMd}
      style={{
        background: swatch.bg,
        color: swatch.text,
        border: `1px solid ${swatch.border}`,
      }}
    >
      {category}
    </span>
  );
}

interface FeaturedImageProps {
  src: string;
  alt: string;
}

function FeaturedImage({ src, alt }: FeaturedImageProps): React.JSX.Element {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <ImagePlaceholder />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={styles.imageZoneImg}
      onError={() => setFailed(true)}
    />
  );
}

function ImagePlaceholder(): React.JSX.Element {
  return (
    <div className={styles.imagePlaceholder} aria-hidden="true">
      <FileText size={48} strokeWidth={1.2} style={{ opacity: 0.25 }} />
    </div>
  );
}

interface FeaturedStoryProps {
  item: HbcNewsroomFeaturedItem;
  reducedMotion: boolean;
}

function FeaturedStory({ item, reducedMotion }: FeaturedStoryProps): React.JSX.Element {
  return (
    <motion.article
      aria-label={`Featured: ${item.title}`}
      className={styles.featured}
      {...getFeaturedMotion(reducedMotion)}
    >
      <div className={styles.imageZone}>
        {item.media ? (
          <>
            <FeaturedImage src={item.media.src} alt={item.media.alt} />
            <div className={styles.imageScrim} aria-hidden="true" />
          </>
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <div className={styles.contentZone}>
        {item.category ? (
          <div className={styles.featuredCategory}>
            <CategoryChip category={item.category} size="sm" />
          </div>
        ) : null}

        <h3 className={styles.featuredHeadline}>{item.title}</h3>

        <p className={styles.featuredExcerpt}>{item.summary}</p>

        {item.byline || item.publishDate ? (
          <div className={styles.featuredMeta}>
            {item.byline ? (
              <span className={styles.featuredByline}>{item.byline}</span>
            ) : null}
            {item.publishDate ? (
              <span className={styles.featuredDate}>
                <Clock size={11} aria-hidden="true" className={styles.featuredDateIcon} />
                {item.publishDate}
              </span>
            ) : null}
          </div>
        ) : null}

        {item.cta ? (
          <div className={styles.featuredCta}>
            <HbcPremiumCta
              label={item.cta.label}
              href={item.cta.href}
              variant="secondary"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

interface HeadlineItemProps {
  item: HbcNewsroomHeadlineItem;
}

function HeadlineItem({ item }: HeadlineItemProps): React.JSX.Element {
  const isClickable = Boolean(item.cta?.href);
  const commonContent = (
    <>
      <span className={styles.headlineIcon} aria-hidden="true">
        <FileText size={14} strokeWidth={2} />
      </span>
      <div className={styles.headlineContent}>
        <span className={styles.headlineTitle}>{item.title}</span>
        <div className={styles.headlineMeta}>
          {item.category ? <CategoryChip category={item.category} size="sm" /> : null}
          {item.byline ? <span>{item.byline}</span> : null}
          {item.publishDate ? (
            <span className={styles.featuredDate}>
              <Clock size={10} aria-hidden="true" className={styles.headlineDateIcon} />
              {item.publishDate}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <a
        href={item.cta!.href}
        target={item.cta!.openInNewTab ? '_blank' : undefined}
        rel={item.cta!.openInNewTab ? 'noopener noreferrer' : undefined}
        className={styles.headlineItem}
      >
        {commonContent}
      </a>
    );
  }
  return <div className={styles.headlineItemStatic}>{commonContent}</div>;
}

interface HeadlineStackProps {
  items: HbcNewsroomHeadlineItem[];
  header: string;
  reducedMotion: boolean;
}

function HeadlineStack({
  items,
  header,
  reducedMotion,
}: HeadlineStackProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <motion.div className={styles.rail} {...getRailMotion(reducedMotion)}>
      <h4 className={styles.railHeader}>{header}</h4>
      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 ? <hr className={styles.railDivider} /> : null}
          <HeadlineItem item={item} />
        </React.Fragment>
      ))}
    </motion.div>
  );
}

interface TertiaryZoneProps {
  items: HbcNewsroomTertiaryItem[];
  archiveHref?: string;
  archiveLabel: string;
}

function TertiaryZone({
  items,
  archiveHref,
  archiveLabel,
}: TertiaryZoneProps): React.JSX.Element | null {
  const categorized = items.filter((item) => Boolean(item.category));
  if (categorized.length === 0 && !archiveHref) return null;
  return (
    <div className={styles.tertiaryZone}>
      {categorized.map((item) => (
        <CategoryChip key={item.id} category={item.category!} size="sm" />
      ))}
      {archiveHref ? (
        <div className={styles.tertiaryArchive}>
          <HbcPremiumCta label={archiveLabel} href={archiveHref} variant="ghost" size="sm" arrow />
        </div>
      ) : null}
    </div>
  );
}

interface SparseFooterProps {
  archiveHref?: string;
  archiveLabel: string;
  reducedMotion: boolean;
}

function SparseFooter({
  archiveHref,
  archiveLabel,
  reducedMotion,
}: SparseFooterProps): React.JSX.Element | null {
  if (!archiveHref) return null;
  return (
    <motion.div className={styles.sparseFooter} {...getSparseFooterMotion(reducedMotion)}>
      <HbcPremiumCta label={archiveLabel} href={archiveHref} variant="ghost" size="sm" arrow />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function HbcNewsroomSurface({
  model,
  className,
  'aria-label': ariaLabel,
}: HbcNewsroomSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const layout = resolveNewsroomLayout(model);

  const headerSeeAllLabel = model.headerSeeAllLabel ?? 'See all';
  const archiveLabel = model.archiveLabel ?? 'View all news';
  const secondaryHeader =
    model.secondaryHeader ??
    (layout === 'headline-only' ? 'Latest headlines' : 'More headlines');
  const tertiaryItems = model.tertiary ?? [];

  return (
    <section
      aria-label={ariaLabel ?? model.heading}
      className={clsx(styles.root, className)}
      data-hbc-presentation="newsroom-surface"
      data-hbc-homepage="company-pulse"
      data-hbc-newsroom-layout={layout}
    >
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          <span className={styles.headerIcon} aria-hidden="true">
            <FileText size={16} strokeWidth={2} />
          </span>
          {model.heading}
        </h2>
        {model.archiveHref ? (
          <div className={styles.headerAction}>
            <HbcPremiumCta
              label={headerSeeAllLabel}
              href={model.archiveHref}
              variant="ghost"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </div>

      <hr className={styles.separator} />

      {layout === 'rich' ? (
        <>
          <div className={styles.composition}>
            <div className={styles.featuredWrapper}>
              <FeaturedStory item={model.lead!} reducedMotion={reducedMotion} />
            </div>
            <div className={styles.railWrapper}>
              <HeadlineStack
                items={model.secondary}
                header={secondaryHeader}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
          <TertiaryZone
            items={tertiaryItems}
            archiveHref={model.archiveHref}
            archiveLabel={archiveLabel}
          />
        </>
      ) : layout === 'sparse' ? (
        <>
          <FeaturedStory item={model.lead!} reducedMotion={reducedMotion} />
          <SparseFooter
            archiveHref={model.archiveHref}
            archiveLabel={archiveLabel}
            reducedMotion={reducedMotion}
          />
        </>
      ) : (
        <>
          <div className={styles.composition}>
            <div className={styles.railWrapper}>
              <HeadlineStack
                items={model.secondary}
                header={secondaryHeader}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
          <TertiaryZone
            items={tertiaryItems}
            archiveHref={model.archiveHref}
            archiveLabel={archiveLabel}
          />
        </>
      )}
    </section>
  );
}
