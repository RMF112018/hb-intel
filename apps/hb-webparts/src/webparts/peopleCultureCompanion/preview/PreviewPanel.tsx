/**
 * Multi-context preview panel for the People & Culture HR operating
 * companion.
 *
 * Phase-14 pc/ Prompt-04 (Media, Preview, Homepage, Milestone
 * Operations).
 *
 * Renders the selected item through every
 * `PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS` variant so HR can see how a
 * change will land across:
 *
 *   - `publicWebpart` `featured` desktop
 *   - `publicWebpart` `supporting` desktop
 *   - `publicWebpart` `featured` mobile
 *   - `companionItem` card
 *
 * Each frame reuses `resolveMediaSource` so the preview honors the
 * profile-photo-first + HR override rules exactly as the live surface
 * will at render time. A small badge calls out which media channel
 * is active.
 */

import * as React from 'react';
import type {
  PeopleCultureItem,
  PeopleCulturePreviewKey,
  PeopleCultureResolvedMedia,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS } from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  resolveMediaSource,
  type ProfilePhotoResolver,
} from '../../../homepage/helpers/peopleCultureSplitModel.js';
import {
  BADGE_STYLE,
  COMPANION_COLORS,
  EMPTY_STATE_STYLE,
  PANEL_STYLE,
  PINNED_BADGE_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface PreviewPanelProps {
  item: PeopleCultureItem | undefined;
  previewKeys?: ReadonlyArray<PeopleCulturePreviewKey>;
  profilePhotoResolver?: ProfilePhotoResolver;
}

const FAMILY_LABEL: Record<PeopleCultureItem['family'], string> = {
  announcement: 'Announcement',
  celebrationMilestone: 'Celebration',
  cultureProgramEvent: 'Culture Program',
};

const MEDIA_SOURCE_LABEL: Record<string, string> = {
  profilePhoto: 'Profile photo',
  hrUpload: 'HR uploaded',
  campaignArtwork: 'Campaign artwork',
  eventPhotography: 'Event photo',
  none: 'No image',
};

const PREVIEW_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const FRAME_STYLE: React.CSSProperties = {
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  borderRadius: 12,
  background: COMPANION_COLORS.surface,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const FRAME_HEADER_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  background: COMPANION_COLORS.surfaceMuted,
  borderBottom: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: COMPANION_COLORS.inkSubtle,
};

const FRAME_BODY_STYLE: React.CSSProperties = {
  padding: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const FEATURED_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: 10,
  objectFit: 'cover',
  background: 'rgba(34, 83, 145, 0.08)',
};

const FEATURED_IMAGE_MOBILE_STYLE: React.CSSProperties = {
  ...FEATURED_IMAGE_STYLE,
  aspectRatio: '4 / 5',
};

const SUPPORTING_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
};

const SUPPORTING_THUMB_STYLE: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 8,
  objectFit: 'cover',
  background: 'rgba(34, 83, 145, 0.08)',
  flexShrink: 0,
};

const SUPPORTING_INITIALS_STYLE: React.CSSProperties = {
  ...SUPPORTING_THUMB_STYLE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: COMPANION_COLORS.brandBlue,
  fontWeight: 800,
  fontSize: '0.9375rem',
};

const COMPANION_ITEM_STYLE: React.CSSProperties = {
  border: `1px solid ${COMPANION_COLORS.surfaceLine}`,
  borderRadius: 10,
  padding: 12,
  background: COMPANION_COLORS.surfaceMuted,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

function previewKeyLabel(key: PeopleCulturePreviewKey): string {
  if (key.context === 'companionItem') {
    return 'Companion item card';
  }
  const variant = key.variant ?? 'featured';
  const viewport = key.viewport ?? 'desktop';
  return `Public ${variant} · ${viewport}`;
}

function initialsOf(item: PeopleCultureItem): string {
  const name = item.personRef?.displayName ?? item.title;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function renderFeatured(
  item: PeopleCultureItem,
  media: PeopleCultureResolvedMedia | undefined,
  viewport: 'desktop' | 'mobile',
): React.JSX.Element {
  return (
    <div style={FRAME_BODY_STYLE}>
      {media ? (
        <img
          src={media.slot.src}
          alt={media.slot.alt}
          style={viewport === 'mobile' ? FEATURED_IMAGE_MOBILE_STYLE : FEATURED_IMAGE_STYLE}
          loading="lazy"
        />
      ) : (
        <div
          style={viewport === 'mobile' ? FEATURED_IMAGE_MOBILE_STYLE : FEATURED_IMAGE_STYLE}
          aria-hidden="true"
        />
      )}
      <h4
        style={{
          margin: 0,
          fontSize: viewport === 'mobile' ? '1rem' : '1.125rem',
          fontWeight: 700,
          color: COMPANION_COLORS.inkPrimary,
          lineHeight: 1.2,
        }}
      >
        {item.title}
      </h4>
      <p
        style={{
          margin: 0,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          color: COMPANION_COLORS.inkMuted,
        }}
      >
        {item.body}
      </p>
      <div
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
      >
        <span style={BADGE_STYLE}>{FAMILY_LABEL[item.family]}</span>
        {item.homepage.isPinned ? (
          <span style={PINNED_BADGE_STYLE}>Pinned</span>
        ) : null}
      </div>
    </div>
  );
}

function renderSupporting(
  item: PeopleCultureItem,
  media: PeopleCultureResolvedMedia | undefined,
): React.JSX.Element {
  return (
    <div style={FRAME_BODY_STYLE}>
      <div style={SUPPORTING_ROW_STYLE}>
        {media ? (
          <img
            src={media.slot.src}
            alt={media.slot.alt}
            style={SUPPORTING_THUMB_STYLE}
            loading="lazy"
          />
        ) : (
          <div style={SUPPORTING_INITIALS_STYLE} aria-hidden="true">
            {initialsOf(item) || FAMILY_LABEL[item.family][0]}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 700,
              color: COMPANION_COLORS.inkPrimary,
              lineHeight: 1.2,
            }}
          >
            {item.title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: COMPANION_COLORS.inkMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function renderCompanionCard(
  item: PeopleCultureItem,
  media: PeopleCultureResolvedMedia | undefined,
): React.JSX.Element {
  return (
    <div style={FRAME_BODY_STYLE}>
      <div style={COMPANION_ITEM_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={BADGE_STYLE}>{FAMILY_LABEL[item.family]}</span>
          <span style={BADGE_STYLE}>{item.lifecycleState}</span>
          {item.homepage.isPinned ? (
            <span style={PINNED_BADGE_STYLE}>Pinned</span>
          ) : null}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: COMPANION_COLORS.inkPrimary,
          }}
        >
          {item.title}
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: COMPANION_COLORS.inkMuted }}>
          {item.body}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: COMPANION_COLORS.inkSubtle,
          }}
        >
          Media: {MEDIA_SOURCE_LABEL[media?.sourceKind ?? item.mediaSource.kind] ?? 'Unknown'}
        </p>
      </div>
    </div>
  );
}

export function PreviewPanel({
  item,
  previewKeys = PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS,
  profilePhotoResolver,
}: PreviewPanelProps): React.JSX.Element {
  if (!item) {
    return (
      <div
        role="tabpanel"
        aria-label="Preview"
        data-hbc-companion-section="preview"
        style={PANEL_STYLE}
      >
        <div>
          <h3 style={SECTION_TITLE_STYLE}>Preview</h3>
          <p style={SECTION_HINT_STYLE}>
            Select an item from Announcements, Celebrations / Milestones,
            or Culture Programs / Events to preview it across the public
            and companion surfaces.
          </p>
        </div>
        <div style={EMPTY_STATE_STYLE} role="status">
          No item selected.
        </div>
      </div>
    );
  }

  const resolvedMedia = resolveMediaSource(item.mediaSource, profilePhotoResolver);
  const activeSourceKind = resolvedMedia?.sourceKind ?? item.mediaSource.kind;

  return (
    <div
      role="tabpanel"
      aria-label="Preview"
      data-hbc-companion-section="preview"
      data-hbc-companion-preview-item={item.id}
      data-hbc-companion-preview-media-source={activeSourceKind}
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Preview — {item.title}</h3>
        <p style={SECTION_HINT_STYLE}>
          Multi-context preview across the public webpart hierarchy and
          the companion item card. Media channel actively in use:{' '}
          <strong>{MEDIA_SOURCE_LABEL[activeSourceKind] ?? activeSourceKind}</strong>.
        </p>
      </div>

      {item.homepage.conflictReason ? (
        <div data-hbc-companion-preview-conflict={item.homepage.conflictReason}>
          <span style={WARNING_BADGE_STYLE}>Conflict: {item.homepage.conflictReason}</span>
        </div>
      ) : null}

      <div style={PREVIEW_GRID_STYLE} data-hbc-companion-preview-grid>
        {previewKeys.map((key, index) => {
          const label = previewKeyLabel(key);
          const testKey = `${key.context}:${key.variant ?? 'card'}:${
            key.viewport ?? 'desktop'
          }`;
          const isSupporting = key.context === 'publicWebpart' && key.variant === 'supporting';
          const isMobile = key.viewport === 'mobile';
          return (
            <article
              key={`${testKey}-${index}`}
              style={FRAME_STYLE}
              data-hbc-companion-preview-frame={testKey}
            >
              <header style={FRAME_HEADER_STYLE}>
                <span>{label}</span>
                <span>{MEDIA_SOURCE_LABEL[activeSourceKind] ?? activeSourceKind}</span>
              </header>
              {key.context === 'companionItem'
                ? renderCompanionCard(item, resolvedMedia)
                : isSupporting
                  ? renderSupporting(item, resolvedMedia)
                  : renderFeatured(item, resolvedMedia, isMobile ? 'mobile' : 'desktop')}
            </article>
          );
        })}
      </div>
    </div>
  );
}
