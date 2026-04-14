/**
 * MediaComposer — right-side flyout for adding or editing a
 * gallery / supporting image. Workstream-e step-02.
 *
 * Reuses HbcKudosComposerFlyout chrome. All persistence stays with
 * the Publisher's existing `media.replaceAllForArticle` seam — this
 * component only emits a PublisherMediaRow through `onSave`.
 */

import * as React from 'react';
import { HbcKudosComposerFlyout } from '@hbc/ui-kit/homepage';
import type { PublisherMediaRow } from '../../../homepage/data/publisherAdapter/index.js';
import {
  createMediaRowFromDraft,
  draftFromRow,
  isAllowedImageUrl,
  mergeMediaRowWithDraft,
  type MediaComposerDraft,
  type MediaComposerRole,
} from './buildMediaRow.js';
import {
  assessAltText,
  assessCaption,
  roleGuidance,
  type AltTextQuality,
} from './altTextGuidance.js';
import styles from './mediaComposer.module.css';

export interface MediaComposerProps {
  readonly open: boolean;
  readonly articleId: string;
  readonly editingRow?: PublisherMediaRow;
  readonly nextSortOrder: number;
  readonly onSave: (row: PublisherMediaRow) => void;
  readonly onRequestClose: () => void;
}

const ALT_SOFT = 125;
const ALT_MAX = 250;
const CAPTION_SOFT = 140;
const CAPTION_MAX = 240;

type ThumbState = 'idle' | 'loading' | 'ready' | 'error';

function guidanceClass(level: AltTextQuality): string {
  switch (level) {
    case 'problem':
      return styles.guidanceProblem;
    case 'warn':
      return styles.guidanceWarn;
    case 'good':
      return styles.guidanceGood;
    case 'ok':
    default:
      return styles.guidanceMuted;
  }
}

export function MediaComposer({
  open,
  articleId,
  editingRow,
  nextSortOrder,
  onSave,
  onRequestClose,
}: MediaComposerProps): React.JSX.Element {
  const isEdit = !!editingRow;
  const seed = React.useMemo<MediaComposerDraft>(
    () =>
      editingRow
        ? draftFromRow(editingRow)
        : { imageUrl: '', altText: '', caption: '', role: 'gallery' },
    [editingRow],
  );

  const [draft, setDraft] = React.useState<MediaComposerDraft>(seed);
  const [thumbState, setThumbState] = React.useState<ThumbState>(
    seed.imageUrl ? 'loading' : 'idle',
  );

  React.useEffect(() => {
    if (!open) return;
    setDraft(seed);
    setThumbState(seed.imageUrl ? 'loading' : 'idle');
  }, [open, seed]);

  const urlValid = isAllowedImageUrl(draft.imageUrl);
  const altAssessment = assessAltText(draft.altText);
  const captionAssessment = assessCaption({
    caption: draft.caption ?? '',
    altText: draft.altText,
  });
  const altBlocking = altAssessment.level === 'problem';
  const altValid = draft.altText.trim().length > 0 && !altBlocking;
  const canSave = urlValid && altValid && thumbState !== 'error';

  const handleSave = React.useCallback(() => {
    if (!canSave) return;
    const next = isEdit && editingRow
      ? mergeMediaRowWithDraft({ existing: editingRow, draft })
      : createMediaRowFromDraft({
          articleId,
          mediaId: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          draft,
          sortOrder: nextSortOrder,
        });
    onSave(next);
  }, [articleId, canSave, draft, editingRow, isEdit, nextSortOrder, onSave]);

  const trimmedUrl = draft.imageUrl.trim();
  const previewUrl = urlValid ? trimmedUrl : undefined;

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onRequestClose}
      title={isEdit ? 'Edit image' : 'Add image'}
      subtitle="Add supporting visuals that render on the published page — alt text is required so every reader gets the same story."
      primaryAction={{
        label: isEdit ? 'Save image' : 'Add image',
        onClick: handleSave,
        disabled: !canSave,
      }}
      secondaryAction={{ label: 'Cancel', onClick: onRequestClose }}
    >
      <div className={styles.body} aria-label="Image composer">
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Image URL</span>
          <span className={styles.fieldHelper}>
            https:// only. Paste a link from the tenant image library or an
            approved CDN.
          </span>
          <input
            className={styles.input}
            value={draft.imageUrl}
            placeholder="https://…"
            inputMode="url"
            autoFocus
            onChange={(e) => {
              const nextUrl = e.target.value;
              setDraft((d) => ({ ...d, imageUrl: nextUrl }));
              setThumbState(nextUrl.trim().length === 0 ? 'idle' : 'loading');
            }}
          />
          {trimmedUrl.length > 0 && !urlValid && (
            <span className={styles.fieldError} role="alert">
              Use an https:// URL. Other schemes are not allowed.
            </span>
          )}
        </label>

        <div className={styles.preview} aria-label="Image preview">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={draft.altText || 'Image preview'}
                className={styles.previewImage}
                onLoad={() => setThumbState('ready')}
                onError={() => setThumbState('error')}
              />
              {thumbState === 'loading' && (
                <span className={styles.previewStatus}>Loading preview…</span>
              )}
              {thumbState === 'error' && (
                <span className={styles.previewError} role="alert">
                  We couldn't load that image. Check the URL is reachable.
                </span>
              )}
            </>
          ) : (
            <span className={styles.previewPlaceholder}>Preview appears here</span>
          )}
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldLabel}>Used as</legend>
          <span className={styles.fieldHelper}>
            Gallery images appear in the article gallery. Supporting images
            render inline with the body when the template exposes them.
          </span>
          <div className={styles.roleChooser} role="radiogroup" aria-label="Image role">
            {(['gallery', 'supporting'] as MediaComposerRole[]).map((role) => (
              <label key={role} className={styles.roleOption}>
                <input
                  type="radio"
                  name="media-role"
                  value={role}
                  checked={draft.role === role}
                  onChange={() => setDraft((d) => ({ ...d, role }))}
                />
                <span>{role === 'gallery' ? 'Gallery image' : 'Supporting image'}</span>
              </label>
            ))}
          </div>
          <span className={styles.fieldHelper} aria-live="polite">
            {roleGuidance(draft.role)}
          </span>
        </fieldset>

        <label className={styles.field}>
          <span className={styles.fieldLabelRow}>
            <span className={styles.fieldLabel}>
              Alt text <span className={styles.required}>required</span>
            </span>
            <span
              className={`${styles.fieldCount} ${
                draft.altText.length > ALT_SOFT ? styles.fieldCountWarn : ''
              }`}
              aria-live="polite"
            >
              {draft.altText.length} / {ALT_SOFT}
            </span>
          </span>
          <span className={styles.fieldHelper}>
            Describe what is visible and why it matters. Skip the phrase
            "image of…". Screen-reader users depend on this.
          </span>
          <textarea
            className={styles.textarea}
            value={draft.altText}
            placeholder="e.g. Crew raising the final steel beam at the West Palm Beach jobsite."
            maxLength={ALT_MAX}
            aria-describedby="media-composer-alt-guidance"
            aria-invalid={altAssessment.level === 'problem' || undefined}
            onChange={(e) => setDraft((d) => ({ ...d, altText: e.target.value }))}
          />
          <span
            id="media-composer-alt-guidance"
            className={guidanceClass(altAssessment.level)}
            role={altAssessment.level === 'problem' ? 'alert' : undefined}
            aria-live="polite"
          >
            {altAssessment.message}
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabelRow}>
            <span className={styles.fieldLabel}>Caption</span>
            <span
              className={`${styles.fieldCount} ${
                (draft.caption ?? '').length > CAPTION_SOFT ? styles.fieldCountWarn : ''
              }`}
              aria-live="polite"
            >
              {(draft.caption ?? '').length} / {CAPTION_SOFT}
            </span>
          </span>
          <span className={styles.fieldHelper}>
            Optional. A short editorial line rendered under the image.
          </span>
          <input
            className={styles.input}
            value={draft.caption ?? ''}
            placeholder="e.g. Final beam — April 2026."
            maxLength={CAPTION_MAX}
            aria-describedby="media-composer-caption-guidance"
            onChange={(e) =>
              setDraft((d) => ({ ...d, caption: e.target.value || undefined }))
            }
          />
          {(draft.caption ?? '').trim().length > 0 && (
            <span
              id="media-composer-caption-guidance"
              className={guidanceClass(captionAssessment.level)}
              aria-live="polite"
            >
              {captionAssessment.message}
            </span>
          )}
        </label>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={draft.featured === true}
            onChange={(e) =>
              setDraft((d) => ({ ...d, featured: e.target.checked }))
            }
          />
          <span>Feature this image in the gallery</span>
        </label>
      </div>
    </HbcKudosComposerFlyout>
  );
}
