/**
 * NewsroomFeaturedStory — premium lead article surface.
 * Wave 02 — CompanyPulse newsroom primitives.
 *
 * Image-led editorial composition with scrim overlay for headline
 * readability. Supports byline, publishDate, category chip, CTA,
 * and graceful fallback when image is missing or broken.
 *
 * Desktop: side-by-side image + content (image ~55%, content ~45%).
 * Tablet: same layout with slightly smaller image zone.
 * Mobile: stacked image over content.
 *
 * Modeled on ProjectPortfolioSpotlight's featured zone pattern but
 * tuned for editorial/newsroom posture (cooler palette, headline-
 * driven hierarchy, byline attribution, publish date).
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
import { NR_PALETTE, getNrFeaturedMotion } from './NewsroomPalette.js';
import type { CompanyPulseItem } from '../../webparts/communicationsContracts.js';

export interface NewsroomFeaturedStoryProps {
  item: CompanyPulseItem;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}

/* ── Image components ─────────────────────────────────────────── */

function FeaturedImage({ src, alt, tier }: { src: string; alt: string; tier: ResponsiveTier }): React.JSX.Element {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <ImagePlaceholder tier={tier} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
      }}
    />
  );
}

function ImagePlaceholder({ tier }: { tier: ResponsiveTier }): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: NR_PALETTE.featuredPlaceholderBg,
      }}
    >
      <FileText
        size={tier === 'mobile' ? 36 : 48}
        strokeWidth={1.2}
        style={{ opacity: 0.25, color: NR_PALETTE.text3 }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ── Style helpers ────────────────────────────────────────────── */

function getLayoutStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return { display: 'flex', flexDirection: 'column', gap: 0 };
  }
  return { display: 'flex', gap: 0 };
}

function getImageZoneStyle(tier: ResponsiveTier): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: NR_PALETTE.featuredPlaceholderBg,
    contain: 'layout style',
  };
  if (tier === 'mobile') {
    return { ...base, minHeight: 200, maxHeight: 280 };
  }
  if (tier === 'tablet') {
    return { ...base, flex: '0 0 48%', minHeight: 280 };
  }
  return { ...base, flex: '0 0 55%', minHeight: 320 };
}

function getContentZoneStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: tier === 'mobile' ? '16px 16px 20px' : '20px 24px 24px',
    background: NR_PALETTE.featuredBg,
    minWidth: 0,
  };
}

/* ── Component ────────────────────────────────────────────────── */

export function NewsroomFeaturedStory({ item, tier, reducedMotion }: NewsroomFeaturedStoryProps): React.JSX.Element {
  const motionProps = getNrFeaturedMotion(reducedMotion);

  return (
    <motion.article
      aria-label={`Featured: ${item.title}`}
      style={getLayoutStyle(tier)}
      {...motionProps}
    >
      {/* Image zone */}
      <div style={getImageZoneStyle(tier)}>
        {item.media ? (
          <>
            <FeaturedImage src={item.media.src} alt={item.media.alt} tier={tier} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: NR_PALETTE.featuredScrim,
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            />
          </>
        ) : (
          <ImagePlaceholder tier={tier} />
        )}
      </div>

      {/* Content zone */}
      <div style={getContentZoneStyle(tier)}>
        {/* Eyebrow + category */}
        {item.category ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NewsroomCategoryChip category={item.category} size="sm" />
          </div>
        ) : null}

        {/* Headline */}
        <h3
          style={{
            margin: 0,
            fontSize: tier === 'mobile' ? '1.0625rem' : '1.1875rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            color: NR_PALETTE.text1,
          }}
        >
          {item.title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: NR_PALETTE.text2,
          }}
        >
          {item.summary}
        </p>

        {/* Metadata row: byline + date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.75rem',
            color: NR_PALETTE.text3,
            flexWrap: 'wrap',
          }}
        >
          {item.byline ? (
            <span style={{ fontWeight: 600, color: NR_PALETTE.text2 }}>
              {item.byline}
            </span>
          ) : null}
          {item.publishDate ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} aria-hidden="true" style={{ opacity: 0.6 }} />
              {item.publishDate}
            </span>
          ) : null}
        </div>

        {/* CTA */}
        {item.cta ? (
          <div style={{ marginTop: 4 }}>
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
