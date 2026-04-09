/**
 * Full editor modal for the People & Culture HR operating companion.
 * Phase-14 pc/ Prompt-03.
 *
 * Richer authoring surface for deeper edits that don't fit the
 * quick-edit drawer — media source selection (profile-photo first or
 * HR override channels), CTA authoring, scheduling, preview
 * foreshadowing hooks, and tag authoring. Remains operational and
 * intentionally does not carry full rich-text editing in v1; the
 * underlying schema can upgrade once the full `People Culture
 * Announcements` list adapter lands.
 */

import * as React from 'react';
import type {
  PeopleCultureItem,
  PeopleCultureMediaSource,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  COMPANION_COLORS,
  DRAWER_BODY_STYLE,
  DRAWER_FOOTER_STYLE,
  DRAWER_HEADER_STYLE,
  FIELD_GROUP_STYLE,
  FIELD_LABEL_STYLE,
  INPUT_STYLE,
  MODAL_OVERLAY_STYLE,
  MODAL_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  SELECT_STYLE,
  TEXTAREA_STYLE,
} from '../companionStyles.js';

export interface FullEditorProps {
  item: PeopleCultureItem;
  onClose: () => void;
  onSubmit: (patch: Partial<PeopleCultureItem>) => void;
}

export function FullEditor({ item, onClose, onSubmit }: FullEditorProps): React.JSX.Element {
  const [title, setTitle] = React.useState(item.title);
  const [body, setBody] = React.useState(item.body);
  const [ctaLabel, setCtaLabel] = React.useState(item.cta?.label ?? '');
  const [ctaHref, setCtaHref] = React.useState(item.cta?.href ?? '');
  const [mediaKind, setMediaKind] = React.useState<PeopleCultureMediaSource['kind']>(
    item.mediaSource.kind,
  );
  const [mediaSrc, setMediaSrc] = React.useState(
    'src' in item.mediaSource ? item.mediaSource.src : '',
  );
  const [mediaAlt, setMediaAlt] = React.useState(
    'alt' in item.mediaSource ? item.mediaSource.alt : '',
  );
  const [personId, setPersonId] = React.useState(
    item.mediaSource.kind === 'profilePhoto' ? item.mediaSource.personId : item.personRef?.id ?? '',
  );
  const [tags, setTags] = React.useState((item.tags ?? []).join(', '));
  const [scheduledStart, setScheduledStart] = React.useState(
    item.scheduledStart ? item.scheduledStart.slice(0, 10) : '',
  );
  const [scheduledEnd, setScheduledEnd] = React.useState(
    item.scheduledEnd ? item.scheduledEnd.slice(0, 10) : '',
  );
  const [expiresAt, setExpiresAt] = React.useState(
    item.expiresAt ? item.expiresAt.slice(0, 10) : '',
  );

  const handleSave = (): void => {
    let mediaSource: PeopleCultureMediaSource;
    switch (mediaKind) {
      case 'profilePhoto':
        mediaSource = { kind: 'profilePhoto', personId: personId || item.personRef?.id || 'unknown' };
        break;
      case 'hrUpload':
      case 'campaignArtwork':
      case 'eventPhotography':
        mediaSource = { kind: mediaKind, src: mediaSrc.trim(), alt: mediaAlt.trim() };
        break;
      case 'none':
      default:
        mediaSource = { kind: 'none' };
    }
    const patch: Partial<PeopleCultureItem> = {
      title: title.trim() || item.title,
      body: body.trim() || item.body,
      cta:
        ctaLabel.trim() && ctaHref.trim()
          ? { label: ctaLabel.trim(), href: ctaHref.trim() }
          : undefined,
      mediaSource,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : undefined,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };
    onSubmit(patch);
  };

  return (
    <div
      role="dialog"
      aria-label="Full editor"
      data-hbc-companion-editor="full-editor"
      data-hbc-companion-editor-item={item.id}
      style={MODAL_OVERLAY_STYLE}
      onClick={onClose}
    >
      <section
        style={MODAL_STYLE}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={DRAWER_HEADER_STYLE}>
          <strong>Full editor — {item.title}</strong>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              cursor: 'pointer',
              color: COMPANION_COLORS.inkMuted,
            }}
          >
            ×
          </button>
        </header>
        <div style={DRAWER_BODY_STYLE}>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="full-title" style={FIELD_LABEL_STYLE}>
              Title
            </label>
            <input
              id="full-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={INPUT_STYLE}
              data-hbc-companion-full-editor-field="title"
            />
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="full-body" style={FIELD_LABEL_STYLE}>
              Body
            </label>
            <textarea
              id="full-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              style={{ ...TEXTAREA_STYLE, minHeight: 120 }}
              data-hbc-companion-full-editor-field="body"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-cta-label" style={FIELD_LABEL_STYLE}>
                CTA label
              </label>
              <input
                id="full-cta-label"
                type="text"
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="ctaLabel"
              />
            </div>
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-cta-href" style={FIELD_LABEL_STYLE}>
                CTA href
              </label>
              <input
                id="full-cta-href"
                type="text"
                value={ctaHref}
                onChange={(event) => setCtaHref(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="ctaHref"
              />
            </div>
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="full-media-kind" style={FIELD_LABEL_STYLE}>
              Media source
            </label>
            <select
              id="full-media-kind"
              value={mediaKind}
              onChange={(event) =>
                setMediaKind(event.target.value as PeopleCultureMediaSource['kind'])
              }
              style={SELECT_STYLE}
              data-hbc-companion-full-editor-field="mediaKind"
            >
              <option value="profilePhoto">Profile photo (first default)</option>
              <option value="hrUpload">HR uploaded image</option>
              <option value="campaignArtwork">Campaign artwork</option>
              <option value="eventPhotography">Event photography</option>
              <option value="none">No image</option>
            </select>
          </div>
          {mediaKind === 'profilePhoto' ? (
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-person-id" style={FIELD_LABEL_STYLE}>
                Person identifier (email or GUID)
              </label>
              <input
                id="full-person-id"
                type="text"
                value={personId}
                onChange={(event) => setPersonId(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="personId"
              />
            </div>
          ) : mediaKind === 'hrUpload' ||
            mediaKind === 'campaignArtwork' ||
            mediaKind === 'eventPhotography' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={FIELD_GROUP_STYLE}>
                <label htmlFor="full-media-src" style={FIELD_LABEL_STYLE}>
                  Image URL
                </label>
                <input
                  id="full-media-src"
                  type="text"
                  value={mediaSrc}
                  onChange={(event) => setMediaSrc(event.target.value)}
                  style={INPUT_STYLE}
                  data-hbc-companion-full-editor-field="mediaSrc"
                />
              </div>
              <div style={FIELD_GROUP_STYLE}>
                <label htmlFor="full-media-alt" style={FIELD_LABEL_STYLE}>
                  Alt text
                </label>
                <input
                  id="full-media-alt"
                  type="text"
                  value={mediaAlt}
                  onChange={(event) => setMediaAlt(event.target.value)}
                  style={INPUT_STYLE}
                  data-hbc-companion-full-editor-field="mediaAlt"
                />
              </div>
            </div>
          ) : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-scheduled-start" style={FIELD_LABEL_STYLE}>
                Scheduled start
              </label>
              <input
                id="full-scheduled-start"
                type="date"
                value={scheduledStart}
                onChange={(event) => setScheduledStart(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="scheduledStart"
              />
            </div>
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-scheduled-end" style={FIELD_LABEL_STYLE}>
                Scheduled end
              </label>
              <input
                id="full-scheduled-end"
                type="date"
                value={scheduledEnd}
                onChange={(event) => setScheduledEnd(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="scheduledEnd"
              />
            </div>
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="full-expires-at" style={FIELD_LABEL_STYLE}>
                Expires at
              </label>
              <input
                id="full-expires-at"
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                style={INPUT_STYLE}
                data-hbc-companion-full-editor-field="expiresAt"
              />
            </div>
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="full-tags" style={FIELD_LABEL_STYLE}>
              Tags (comma-separated)
            </label>
            <input
              id="full-tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              style={INPUT_STYLE}
              data-hbc-companion-full-editor-field="tags"
            />
          </div>
        </div>
        <footer style={DRAWER_FOOTER_STYLE}>
          <button
            type="button"
            style={SECONDARY_BUTTON_STYLE}
            onClick={onClose}
            data-hbc-companion-action="full-editor-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            style={PRIMARY_BUTTON_STYLE}
            onClick={handleSave}
            data-hbc-companion-action="full-editor-save"
          >
            Save
          </button>
        </footer>
      </section>
    </div>
  );
}
