/**
 * GalleryPanel — visual media management surface for the Article
 * Publisher. Workstream-e step-02.
 *
 * Replaces the inline six-input row editor with a thumbnail grid of
 * image tiles plus a right-side composer flyout. The panel only
 * handles `gallery` and `supporting` roles; `hero` and `secondary`
 * are authored on their dedicated tabs. Legacy rows with other
 * roles are preserved verbatim (passed through on edit) and shown
 * in the grid with a role badge so the author can retire them.
 */

import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';
import {
  ChevronBack,
  ChevronForward,
  Star,
  StarFilled,
} from '@hbc/ui-kit/icons';
import { ImagePlus } from 'lucide-react';
import type { PublisherMediaRow } from '../../../data/publisherAdapter/index.js';
import { mediaRoleLabel } from '../authorLabels.js';
import { MediaComposer } from './MediaComposer.js';
import {
  applyFeaturedGalleryInvariant,
  moveMediaRow,
  restampMediaSortOrder,
} from './mediaInvariants.js';
import { assessAltText } from './altTextGuidance.js';
import {
  EditorialChip,
  PublisherButton,
  type AssetLibrarySearchFn,
} from '../sharedChrome/index.js';
import styles from './galleryPanel.module.css';

export interface GalleryPanelProps {
  readonly articleId: string;
  readonly rows: PublisherMediaRow[];
  readonly onChange: (next: PublisherMediaRow[]) => void;
  readonly searchAssets?: AssetLibrarySearchFn;
}

type ReadinessLevel = 'good' | 'warn' | 'problem';

interface ReadinessSummary {
  readonly level: ReadinessLevel;
  readonly message: string;
}

function summariseGalleryReadiness(
  rows: readonly PublisherMediaRow[],
): ReadinessSummary {
  const gallery = rows.filter((r) => r.MediaRole === 'gallery');
  const featured = gallery.filter((r) => r.FeaturedInGallery === true).length;
  const problemAlt = gallery.filter(
    (r) => assessAltText(r.AltText).level === 'problem',
  ).length;
  const warnAlt = gallery.filter(
    (r) => assessAltText(r.AltText).level === 'warn',
  ).length;
  const count = gallery.length;
  const countLabel = `${count} gallery image${count === 1 ? '' : 's'}`;
  const featuredLabel = featured === 1 ? ' · 1 featured' : '';
  if (problemAlt > 0) {
    return {
      level: 'problem',
      message: `${countLabel}${featuredLabel}. ${problemAlt} need${problemAlt === 1 ? 's' : ''} alt text before publish.`,
    };
  }
  if (warnAlt > 0) {
    return {
      level: 'warn',
      message: `${countLabel}${featuredLabel}. ${warnAlt} alt-text suggestion${warnAlt === 1 ? '' : 's'} to review.`,
    };
  }
  return {
    level: 'good',
    message: `${countLabel}${featuredLabel}. Gallery is ready.`,
  };
}

export function GalleryPanel({
  articleId,
  rows,
  onChange,
  searchAssets,
}: GalleryPanelProps): React.JSX.Element {
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | undefined>();

  const editingRow = React.useMemo(
    () => rows.find((r) => r.MediaId === editingId),
    [rows, editingId],
  );

  const openAdd = () => {
    setEditingId(undefined);
    setComposerOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setComposerOpen(true);
  };
  const close = () => {
    setComposerOpen(false);
    setEditingId(undefined);
  };

  const handleSave = (saved: PublisherMediaRow) => {
    const exists = rows.some((r) => r.MediaId === saved.MediaId);
    const merged = exists
      ? rows.map((r) => (r.MediaId === saved.MediaId ? saved : r))
      : [...rows, saved];
    const featured =
      saved.FeaturedInGallery === true ? saved.MediaId : undefined;
    const withFeatured = featured
      ? applyFeaturedGalleryInvariant(merged, featured)
      : merged;
    onChange(restampMediaSortOrder(withFeatured));
    close();
  };

  const removeAt = (idx: number) => {
    const filtered = rows.filter((_, i) => i !== idx);
    onChange(restampMediaSortOrder(filtered));
  };

  const move = (idx: number, delta: number) => {
    const next = moveMediaRow(rows, idx, delta);
    if (next.length === rows.length) onChange(next);
  };

  const toggleFeatured = (id: string) => {
    const current = rows.find((r) => r.FeaturedInGallery === true);
    const next =
      current?.MediaId === id
        ? applyFeaturedGalleryInvariant(rows, undefined)
        : applyFeaturedGalleryInvariant(rows, id);
    onChange(next);
  };

  const tileKeyHandler = (idx: number) => (e: React.KeyboardEvent) => {
    if (!e.altKey) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(idx, -1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(idx, 1);
    }
  };

  const readiness = summariseGalleryReadiness(rows);

  return (
    <div className={styles.panel}>
      {rows.length > 0 && (
        <div
          className={`${styles.readiness} ${
            readiness.level === 'problem'
              ? styles.readinessProblem
              : readiness.level === 'warn'
                ? styles.readinessWarn
                : styles.readinessGood
          }`}
          role={readiness.level === 'problem' ? 'alert' : undefined}
          aria-live="polite"
        >
          {readiness.message}
        </div>
      )}
      {rows.length === 0 ? (
        <HbcEmptyState
          title="No images yet"
          description="Add visuals that ride with the article. Feature one to use as the homepage card thumbnail. Every image needs alt text before publish — captions are optional but help readers."
        />
      ) : (
        (() => {
          const featuredIndex = rows.findIndex((r) => r.FeaturedInGallery === true);
          const featuredRow = featuredIndex >= 0 ? rows[featuredIndex] : undefined;
          const featuredLabel = featuredRow
            ? featuredRow.Title ||
              featuredRow.AltText ||
              'the current card thumbnail'
            : undefined;
          const galleryEntries = rows
            .map((row, index) => ({ row, index }))
            .filter(({ index }) => index !== featuredIndex);

          const renderTile = (
            r: PublisherMediaRow,
            i: number,
            isFeatured: boolean,
          ) => {
            const label = r.Title || r.AltText || `Image ${i + 1}`;
            const showRoleBadge = r.MediaRole !== 'gallery';
            return (
              <li
                key={r.MediaId}
                className={`${styles.tile} ${isFeatured ? styles.tileFeatured : ''}`}
              >
                <button
                  type="button"
                  className={styles.tileBody}
                  onClick={() => openEdit(r.MediaId)}
                  onKeyDown={tileKeyHandler(i)}
                  aria-label={`Edit ${label}${isFeatured ? ' — featured' : ''}`}
                >
                  <span className={styles.thumbFrame}>
                    <img
                      src={r.ImageAsset}
                      alt={r.AltText || ''}
                      className={styles.thumb}
                      onError={(e) => {
                        e.currentTarget.classList.add(styles.thumbBroken ?? '');
                      }}
                    />
                  </span>
                  <span className={styles.tileCaption}>
                    {r.Caption?.trim() ? r.Caption : <em>No caption</em>}
                  </span>
                  <span className={styles.tileMetaRow}>
                    {showRoleBadge && (
                      <EditorialChip variant="info" size="sm">
                        {mediaRoleLabel(r.MediaRole)}
                      </EditorialChip>
                    )}
                    {isFeatured && (
                      <EditorialChip variant="featured" size="sm">
                        Card thumbnail
                      </EditorialChip>
                    )}
                  </span>
                </button>
                <div className={styles.tileActions}>
                  <PublisherButton
                    iconOnly
                    size="sm"
                    pressed={isFeatured}
                    aria-label={
                      isFeatured
                        ? `Unfeature ${label} — no image will lead the homepage card`
                        : featuredLabel
                          ? `Use ${label} as the card thumbnail — replaces ${featuredLabel}`
                          : `Use ${label} as the card thumbnail`
                    }
                    title={
                      isFeatured
                        ? 'Unfeature (no card thumbnail)'
                        : featuredLabel
                          ? `Use as card thumbnail (replaces ${featuredLabel})`
                          : 'Use as card thumbnail'
                    }
                    onClick={() => toggleFeatured(r.MediaId)}
                  >
                    {isFeatured ? <StarFilled size="sm" /> : <Star size="sm" />}
                  </PublisherButton>
                  <PublisherButton
                    iconOnly
                    size="sm"
                    aria-label={`Move ${label} earlier`}
                    title="Move earlier (Alt+Left)"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    <ChevronBack size="sm" />
                  </PublisherButton>
                  <PublisherButton
                    iconOnly
                    size="sm"
                    aria-label={`Move ${label} later`}
                    title="Move later (Alt+Right)"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                  >
                    <ChevronForward size="sm" />
                  </PublisherButton>
                  <PublisherButton
                    size="sm"
                    variant="danger"
                    aria-label={`Remove ${label}`}
                    onClick={() => removeAt(i)}
                  >
                    Remove
                  </PublisherButton>
                </div>
              </li>
            );
          };

          return (
            <>
              {featuredRow && (
                <div
                  className={styles.galleryCluster}
                  aria-label="Card thumbnail"
                >
                  <div className={styles.galleryHeadingRow}>
                    <p className={styles.galleryHeading}>Card thumbnail</p>
                    <span className={styles.galleryHeadingHint}>
                      Leads the homepage card. Use the star on any image to move it.
                    </span>
                  </div>
                  <ol className={styles.leadGrid}>
                    {renderTile(featuredRow, featuredIndex, true)}
                  </ol>
                </div>
              )}
              {galleryEntries.length > 0 && (
                <div
                  className={styles.galleryCluster}
                  aria-label="Article images — use Alt+ArrowLeft or Alt+ArrowRight to reorder"
                >
                  <div className={styles.galleryHeadingRow}>
                    <p className={styles.galleryHeading}>
                      {featuredRow ? 'Gallery' : 'Images'} ({galleryEntries.length})
                    </p>
                    <span className={styles.galleryHeadingHint}>
                      Tip: Alt+← / Alt+→ to reorder while focused on an image.
                    </span>
                  </div>
                  <ol className={styles.grid}>
                    {galleryEntries.map(({ row, index }) =>
                      renderTile(row, index, false),
                    )}
                  </ol>
                </div>
              )}
            </>
          );
        })()
      )}
      <PublisherButton variant="primary" leadingIcon={ImagePlus} onClick={openAdd}>
        Add image
      </PublisherButton>

      <MediaComposer
        open={composerOpen}
        articleId={articleId}
        editingRow={editingRow}
        nextSortOrder={rows.length + 1}
        onSave={handleSave}
        onRequestClose={close}
        searchAssets={searchAssets}
      />
    </div>
  );
}
