/**
 * FeaturedMedia — mode-aware hero media zone with optional poster
 * content block.
 *
 * Two posture branches:
 *   - image authored + loaded → editorial hero (image + scrim + overlay)
 *   - image authored + errored → subtle branded fallback band at the
 *     editorial height so the authored intent is preserved but a
 *     broken asset does not dominate the slot
 *
 * In `wide` / `medium` modes the parent surface may hand in
 * `posterTitle` + `posterHeadline` — when present, the hero becomes
 * editorial poster furniture: eyebrow chip, large overlay title
 * (semantic `<h3>`), optional overlay headline, and the status / chip
 * row sit together over the scrim so first view carries title + signal
 * without scrolling past the image to find them.
 *
 * When no image is authored, callers render a title-led layout and
 * never call this component — `image` is required.
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
  /**
   * When provided, the featured title is rendered inside the hero
   * as an editorial poster. The surface also suppresses the below-hero
   * `<h3>` so the title does not appear twice. Used for `wide` /
   * `medium` modes where the hero height is reduced enough to carry
   * the title in first view.
   */
  posterTitle?: string;
  /**
   * Optional authored headline rendered under the poster title when
   * `posterTitle` is set. Ignored when `posterTitle` is absent.
   */
  posterHeadline?: string;
}

export function FeaturedMedia({
  image,
  eyebrowText,
  status,
  strategicEmphasis,
  isStale,
  showOverlayChips,
  posterTitle,
  posterHeadline,
}: FeaturedMediaProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setErrored(false);
  }, [image.src]);

  const statusLabel = status?.label;
  const hasOverlayChips =
    showOverlayChips && Boolean(statusLabel || strategicEmphasis || isStale);
  const posterLed = Boolean(posterTitle);

  return (
    <div
      className={styles.mediaZone}
      data-has-image="true"
      data-poster-led={posterLed ? 'true' : 'false'}
    >
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
        {posterLed ? (
          <div className={styles.mediaPosterBlock}>
            <h3 className={styles.mediaPosterTitle}>{posterTitle}</h3>
            {posterHeadline ? (
              <p className={styles.mediaPosterHeadline}>{posterHeadline}</p>
            ) : null}
          </div>
        ) : null}
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
