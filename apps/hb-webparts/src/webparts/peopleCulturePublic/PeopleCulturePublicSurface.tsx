/**
 * People & Culture public surface composition.
 *
 * Phase-14 pc/ Prompt-02.
 *
 * Stateless presentation component that renders the normalized
 * split-aware output from
 * `normalizePeopleCulturePublicConfig`. Owns only composition — no data
 * fetching, no audience scoping, no lifecycle classification.
 *
 * This surface is deliberately **self-contained inside the webpart
 * folder** and does NOT import from `@hbc/ui-kit/homepage`'s
 * `HbcPeopleCultureSurface`. That legacy surface is merged-shape (it
 * carries a Kudos module) and using it here would re-couple the public
 * PC runtime to HB Kudos. The split boundary stays hard.
 *
 * Rendering hierarchy:
 *   - `PeopleCulturePublicFeaturedCard` — large hero-style cards, one
 *     per featured item
 *   - `PeopleCulturePublicSupportingRow` — compact rows for supporting
 *     items
 *   - Empty state when both tiers are empty
 */

import * as React from 'react';
import type {
  PeopleCultureItem,
  PeopleCulturePublicOutput,
  PeopleCultureResolvedMedia,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  resolveMediaSource,
  type ProfilePhotoResolver,
} from '../../homepage/helpers/peopleCultureSplitModel.js';

export interface PeopleCulturePublicSurfaceProps {
  output: PeopleCulturePublicOutput;
  profilePhotoResolver?: ProfilePhotoResolver;
}

const SECTION_STYLE: React.CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  color: '#0a1b33',
  background: '#ffffff',
  borderRadius: 14,
  padding: '24px 28px',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const HEADER_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
};

const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#225391',
};

const HEADING_STYLE: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  color: '#0a1b33',
  margin: 0,
};

const FEATURED_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 16,
};

const FEATURED_CARD_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '20px 22px',
  borderRadius: 12,
  border: '1px solid rgba(34, 83, 145, 0.18)',
  background:
    'linear-gradient(180deg, rgba(34, 83, 145, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
};

const FEATURED_MEDIA_STYLE: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: 10,
  objectFit: 'cover',
  background: 'rgba(34, 83, 145, 0.08)',
};

const FEATURED_TITLE_STYLE: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 1.25,
  color: '#0a1b33',
  margin: 0,
};

const FEATURED_BODY_STYLE: React.CSSProperties = {
  fontSize: '0.9375rem',
  lineHeight: 1.55,
  color: 'rgba(26, 26, 26, 0.78)',
  margin: 0,
};

const FEATURED_FOOTER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 2,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#225391',
};

const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'rgba(34, 83, 145, 0.1)',
  color: '#225391',
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const PINNED_BADGE_STYLE: React.CSSProperties = {
  ...BADGE_STYLE,
  background: 'rgba(226, 113, 37, 0.12)',
  color: '#c2410c',
};

const SUPPORTING_LIST_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const SUPPORTING_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(10, 27, 51, 0.08)',
  background: '#ffffff',
};

const SUPPORTING_MEDIA_STYLE: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 10,
  objectFit: 'cover',
  background: 'rgba(34, 83, 145, 0.08)',
  flexShrink: 0,
};

const SUPPORTING_MEDIA_PLACEHOLDER_STYLE: React.CSSProperties = {
  ...SUPPORTING_MEDIA_STYLE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#225391',
  fontWeight: 800,
  fontSize: '1rem',
};

const SUPPORTING_TEXT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
};

const SUPPORTING_TITLE_STYLE: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: '#0a1b33',
  margin: 0,
  lineHeight: 1.25,
};

const SUPPORTING_BODY_STYLE: React.CSSProperties = {
  fontSize: '0.8125rem',
  lineHeight: 1.45,
  color: 'rgba(26, 26, 26, 0.72)',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const EMPTY_STATE_STYLE: React.CSSProperties = {
  padding: '28px 24px',
  borderRadius: 12,
  border: '1px dashed rgba(10, 27, 51, 0.2)',
  background: 'rgba(10, 27, 51, 0.02)',
  color: 'rgba(10, 27, 51, 0.7)',
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  textAlign: 'center',
};

const FAMILY_LABEL: Record<PeopleCultureItem['family'], string> = {
  announcement: 'Announcement',
  celebrationMilestone: 'Celebration',
  cultureProgramEvent: 'Culture Program',
};

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function FeaturedCard({
  item,
  media,
}: {
  item: PeopleCultureItem;
  media: PeopleCultureResolvedMedia | undefined;
}): React.JSX.Element {
  return (
    <article
      style={FEATURED_CARD_STYLE}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-tier="featured"
      data-hbc-pc-family={item.family}
      data-hbc-pc-media-source={media?.sourceKind ?? item.mediaSource.kind}
    >
      {media ? (
        <img
          src={media.slot.src}
          alt={media.slot.alt}
          style={FEATURED_MEDIA_STYLE}
          loading="lazy"
        />
      ) : null}
      <h3 style={FEATURED_TITLE_STYLE}>{item.title}</h3>
      <p style={FEATURED_BODY_STYLE}>{item.body}</p>
      <footer style={FEATURED_FOOTER_STYLE}>
        <span style={BADGE_STYLE}>{FAMILY_LABEL[item.family]}</span>
        {item.homepage.isPinned ? <span style={PINNED_BADGE_STYLE}>Pinned</span> : null}
        {item.cta ? (
          <a
            href={item.cta.href}
            target={item.cta.openInNewTab ? '_blank' : undefined}
            rel={item.cta.openInNewTab ? 'noreferrer' : undefined}
            style={{ color: '#225391', textDecoration: 'none', fontWeight: 700 }}
          >
            {item.cta.label}
          </a>
        ) : null}
      </footer>
    </article>
  );
}

function SupportingRow({
  item,
  media,
}: {
  item: PeopleCultureItem;
  media: PeopleCultureResolvedMedia | undefined;
}): React.JSX.Element {
  const initials = item.personRef ? initialsFrom(item.personRef.displayName) : '';
  return (
    <li
      style={SUPPORTING_ROW_STYLE}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-tier="supporting"
      data-hbc-pc-family={item.family}
      data-hbc-pc-media-source={media?.sourceKind ?? item.mediaSource.kind}
    >
      {media ? (
        <img
          src={media.slot.src}
          alt={media.slot.alt}
          style={SUPPORTING_MEDIA_STYLE}
          loading="lazy"
        />
      ) : (
        <div style={SUPPORTING_MEDIA_PLACEHOLDER_STYLE} aria-hidden="true">
          {initials || FAMILY_LABEL[item.family][0]}
        </div>
      )}
      <div style={SUPPORTING_TEXT_STYLE}>
        <p style={SUPPORTING_TITLE_STYLE}>{item.title}</p>
        <p style={SUPPORTING_BODY_STYLE}>{item.body}</p>
      </div>
    </li>
  );
}

export function PeopleCulturePublicSurface({
  output,
  profilePhotoResolver,
}: PeopleCulturePublicSurfaceProps): React.JSX.Element {
  const featuredMedia = React.useMemo(
    () => output.featured.map((item) => resolveMediaSource(item.mediaSource, profilePhotoResolver)),
    [output.featured, profilePhotoResolver],
  );
  const supportingMedia = React.useMemo(
    () => output.supporting.map((item) => resolveMediaSource(item.mediaSource, profilePhotoResolver)),
    [output.supporting, profilePhotoResolver],
  );

  return (
    <section
      aria-label={output.heading}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-empty={output.isEmpty ? 'true' : 'false'}
      style={SECTION_STYLE}
    >
      <header style={HEADER_ROW_STYLE}>
        <div>
          <div style={EYEBROW_STYLE}>People and Culture</div>
          <h2 style={HEADING_STYLE}>{output.heading}</h2>
        </div>
      </header>

      {output.isEmpty ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No People and Culture stories are featured right now. Check back soon.
        </div>
      ) : (
        <>
          {output.featured.length > 0 ? (
            <div style={FEATURED_GRID_STYLE} data-hbc-pc-section="featured">
              {output.featured.map((item, index) => (
                <FeaturedCard key={item.id} item={item} media={featuredMedia[index]} />
              ))}
            </div>
          ) : null}

          {output.supporting.length > 0 ? (
            <ul style={SUPPORTING_LIST_STYLE} data-hbc-pc-section="supporting">
              {output.supporting.map((item, index) => (
                <SupportingRow key={item.id} item={item} media={supportingMedia[index]} />
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
