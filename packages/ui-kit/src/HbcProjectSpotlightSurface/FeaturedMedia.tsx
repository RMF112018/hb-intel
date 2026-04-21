/**
 * FeaturedMedia — mode-aware hero media zone.
 *
 * Renders the image-led posture only. When no image is authored,
 * the component returns `null` and the parent `FeaturedSlot` takes
 * over with a title-led header. This preserves a single clear rule:
 * the media zone exists exclusively to carry a credible hero image.
 *
 * Two posture branches:
 *   - image authored + loaded → editorial hero (image + scrim + overlay)
 *   - image authored + errored → subtle branded fallback band at the
 *     editorial height so the authored intent is preserved but a
 *     broken asset does not dominate the slot
 *
 * When `image` is `undefined`, callers render a title-led layout
 * instead of calling this component with an empty prop.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import type {
  ProjectSpotlightMedia,
  ProjectSpotlightStatus,
} from './types.js';
import styles from './project-spotlight-surface.module.css';

export interface FeaturedMediaProps {
  image: ProjectSpotlightMedia;
  eyebrowText: string;
  status?: ProjectSpotlightStatus;
  strategicEmphasis?: boolean;
  isStale?: boolean;
  showOverlayChips: boolean;
}

export function FeaturedMedia({
  image,
  eyebrowText,
  status,
  strategicEmphasis,
  isStale,
  showOverlayChips,
}: FeaturedMediaProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);

  // Reset error state when the image source changes so a new authored
  // image gets a fresh load attempt instead of inheriting a stale error.
  React.useEffect(() => {
    setErrored(false);
  }, [image.src]);

  const statusLabel = status?.label;
  const hasOverlayChips =
    showOverlayChips && Boolean(statusLabel || strategicEmphasis || isStale);

  return (
    <div className={styles.mediaZone} data-has-image="true">
      {errored ? (
        <div
          className={clsx(styles.mediaFallback, styles.mediaFallbackErrored)}
          aria-hidden="true"
        />
      ) : (
        <>
          <img
            src={image.src}
            alt={image.alt}
            decoding="async"
            loading="lazy"
            className={styles.mediaImage}
            onError={() => setErrored(true)}
          />
          <div className={styles.mediaScrim} aria-hidden="true" />
        </>
      )}
      <div className={styles.mediaOverlay}>
        <span className={styles.mediaOverlayEyebrow}>
          <span className={styles.mediaOverlayEyebrowDot} aria-hidden="true" />
          {eyebrowText}
        </span>
        {hasOverlayChips ? (
          <div className={styles.mediaBadgeRow}>
            {statusLabel ? (
              <span className={styles.mediaOverlayChip}>{statusLabel}</span>
            ) : null}
            {strategicEmphasis ? (
              <span
                className={clsx(
                  styles.mediaOverlayChip,
                  styles.mediaOverlayChipStrategic,
                )}
              >
                Strategic
              </span>
            ) : null}
            {isStale ? (
              <span
                className={clsx(
                  styles.mediaOverlayChip,
                  styles.mediaOverlayChipStale,
                )}
              >
                Stale
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
