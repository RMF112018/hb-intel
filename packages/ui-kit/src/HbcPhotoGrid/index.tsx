/**
 * HbcPhotoGrid — Responsive photo gallery grid
 * PH4.13 §13.4 | Blueprint §1d
 *
 * CSS Grid with aspect-ratio: 1 thumbnails, hover overlay with caption,
 * optional "+" add-photo tile, and "+N more" truncation tile.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_SURFACE_LIGHT, HBC_HEADER_TEXT } from '../theme/tokens.js';
import { HBC_RADIUS_XL } from '../theme/radii.js';
import type { HbcPhotoGridProps } from './types.js';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gap: '8px',
  },
  tile: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: HBC_RADIUS_XL,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '10px',
    paddingRight: '10px',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
    ':hover': {
      opacity: 1,
    },
  },
  captionText: {
    color: HBC_HEADER_TEXT,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  addTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: '2px',
    borderRightWidth: '2px',
    borderBottomWidth: '2px',
    borderLeftWidth: '2px',
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderTopColor: HBC_SURFACE_LIGHT['border-default'],
    borderRightColor: HBC_SURFACE_LIGHT['border-default'],
    borderBottomColor: HBC_SURFACE_LIGHT['border-default'],
    borderLeftColor: HBC_SURFACE_LIGHT['border-default'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color',
    transitionDuration: '200ms',
  },
  addTileHover: {
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  addIcon: {
    fontSize: '2rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontWeight: 300,
  },
  moreTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    cursor: 'pointer',
  },
  moreText: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '32px',
    paddingBottom: '32px',
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontSize: '0.875rem',
  },
});

export function HbcPhotoGrid({
  photos,
  columns = 3,
  onPhotoClick,
  onAddPhoto,
  maxDisplay,
  className,
}: HbcPhotoGridProps): React.JSX.Element {
  const styles = useStyles();

  const displayPhotos =
    maxDisplay && photos.length > maxDisplay
      ? photos.slice(0, maxDisplay - 1)
      : photos;
  const remainingCount =
    maxDisplay && photos.length > maxDisplay
      ? photos.length - (maxDisplay - 1)
      : 0;

  if (photos.length === 0 && !onAddPhoto) {
    return (
      <div data-hbc-ui="photo-grid" className={mergeClasses(styles.empty, className)}>
        No photos available
      </div>
    );
  }

  return (
    <div
      data-hbc-ui="photo-grid"
      className={mergeClasses(styles.grid, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      role="grid"
      aria-label="Photo gallery"
    >
      {displayPhotos.map((photo) => (
        <div
          key={photo.id}
          className={styles.tile}
          role="gridcell"
          onClick={() => onPhotoClick?.(photo)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPhotoClick?.(photo);
            }
          }}
        >
          <img
            className={styles.image}
            src={photo.thumbnailSrc ?? photo.src}
            alt={photo.alt}
            loading="lazy"
          />
          {photo.caption && (
            <div className={styles.overlay}>
              <span className={styles.captionText}>{photo.caption}</span>
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={mergeClasses(styles.tile, styles.moreTile)}
          role="gridcell"
          onClick={() => onPhotoClick?.(photos[maxDisplay! - 1])}
          tabIndex={0}
        >
          <span className={styles.moreText}>+{remainingCount}</span>
        </div>
      )}

      {onAddPhoto && (
        <div
          className={mergeClasses(styles.tile, styles.addTile, styles.addTileHover)}
          role="gridcell"
          onClick={onAddPhoto}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAddPhoto();
            }
          }}
          aria-label="Add photo"
        >
          <span className={styles.addIcon}>+</span>
        </div>
      )}
    </div>
  );
}

export type { PhotoItem, HbcPhotoGridProps } from './types.js';
