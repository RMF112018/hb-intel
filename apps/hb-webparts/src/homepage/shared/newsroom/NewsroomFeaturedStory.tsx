/**
 * NewsroomFeaturedStory — premium lead article surface.
 * Wave 04 — CSS-module premium surface architecture.
 *
 * Image-led editorial composition with scrim overlay for headline
 * readability. Supports byline, publishDate, category chip, CTA,
 * and graceful fallback when image is missing or broken.
 *
 * Desktop: side-by-side image (~55%) + content (~45%).
 * Tablet: same layout with slightly smaller image zone.
 * Mobile: stacked image over content.
 */
import * as React from 'react';
import {
  HbcPremiumCta,
  motion,
  Clock,
  FileText,
} from '@hbc/ui-kit/homepage';
import type { ResponsiveTier } from '../useResponsiveTier.js';
import { NewsroomCategoryChip } from './NewsroomCategoryChip.js';
import { getNrFeaturedMotion } from './NewsroomPalette.js';
import type { CompanyPulseItem } from '../../webparts/communicationsContracts.js';
import s from './newsroom-surface.module.css';

export interface NewsroomFeaturedStoryProps {
  item: CompanyPulseItem;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}

/* ── Image components ─────────────────────────────────────────── */

function FeaturedImage({ src, alt }: { src: string; alt: string }): React.JSX.Element {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <ImagePlaceholder />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      className={s.imageZoneImg}
    />
  );
}

function ImagePlaceholder(): React.JSX.Element {
  return (
    <div className={s.imagePlaceholder}>
      <FileText size={48} strokeWidth={1.2} style={{ opacity: 0.25 }} aria-hidden="true" />
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export function NewsroomFeaturedStory({ item, tier, reducedMotion }: NewsroomFeaturedStoryProps): React.JSX.Element {
  const motionProps = getNrFeaturedMotion(reducedMotion);
  const isMobile = tier === 'mobile';

  const imageClass = isMobile
    ? s.imageZoneMobile
    : tier === 'tablet'
      ? s.imageZoneTablet
      : s.imageZone;

  return (
    <motion.article
      aria-label={`Featured: ${item.title}`}
      className={isMobile ? s.featuredStacked : s.featured}
      {...motionProps}
    >
      {/* Image zone */}
      <div className={imageClass}>
        {item.media ? (
          <>
            <FeaturedImage src={item.media.src} alt={item.media.alt} />
            <div className={s.imageScrim} aria-hidden="true" />
          </>
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Content zone */}
      <div className={isMobile ? s.contentZoneMobile : s.contentZone}>
        {item.category ? (
          <div className={s.featuredCategory}>
            <NewsroomCategoryChip category={item.category} size="sm" />
          </div>
        ) : null}

        <h3 className={isMobile ? s.featuredHeadlineMobile : s.featuredHeadline}>
          {item.title}
        </h3>

        <p className={s.featuredExcerpt}>
          {item.summary}
        </p>

        {(item.byline || item.publishDate) ? (
          <div className={s.featuredMeta}>
            {item.byline ? (
              <span className={s.featuredByline}>{item.byline}</span>
            ) : null}
            {item.publishDate ? (
              <span className={s.featuredDate}>
                <Clock size={11} aria-hidden="true" className={s.featuredDateIcon} />
                {item.publishDate}
              </span>
            ) : null}
          </div>
        ) : null}

        {item.cta ? (
          <div className={s.featuredCta}>
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
