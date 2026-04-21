/**
 * FeaturedMedia — mode-aware hero media zone with a formalized
 * no-image posture.
 *
 * Three explicit render postures, picked from the authored data
 * and the runtime load outcome:
 *
 *   1. `image` authored + `<img>` loads         → editorial hero
 *      (full mode-governed height, scrim, overlay chips)
 *   2. `image` authored + `<img>` fails at load → subtle branded
 *      fallback band (no dominant filler text) at the editorial height
 *   3. no `image` authored                      → condensed eyebrow
 *      band (`data-has-image="false"`) — the hero slot does not
 *      pretend to be a full editorial image when there is nothing
 *      to show. CSS reduces the mode-governed min-height so the
 *      featured content leads the composition.
 *
 * The old always-on `mediaPlaceholder` with a giant "PROJECT IMAGE"
 * filler label is intentionally gone — a missing image must not
 * dominate the flagship slot.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import type {
  ProjectSpotlightMedia,
  ProjectSpotlightStatus,
} from './types.js';
import styles from './project-spotlight-surface.module.css';

export interface FeaturedMediaProps {
  image?: ProjectSpotlightMedia;
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
  }, [image?.src]);

  const statusLabel = status?.label;
  const hasOverlayChips =
    showOverlayChips && Boolean(statusLabel || strategicEmphasis || isStale);

  const hasAuthoredImage = Boolean(image?.src);
  const showImage = hasAuthoredImage && !errored;
  // `data-has-image` governs the zone's mode-specific min-height in CSS.
  // A failed image still occupies the editorial posture (the authored
  // intent was a full hero) but renders a neutral band instead of a
  // dominant filler label. A truly image-less item collapses to a
  // condensed eyebrow band.
  const hasImageAttr = hasAuthoredImage ? 'true' : 'false';

  return (
    <div className={styles.mediaZone} data-has-image={hasImageAttr}>
      {showImage ? (
        <>
          <img
            src={image!.src}
            alt={image!.alt}
            decoding="async"
            loading="lazy"
            className={styles.mediaImage}
            onError={() => setErrored(true)}
          />
          <div className={styles.mediaScrim} aria-hidden="true" />
        </>
      ) : (
        <div
          className={clsx(
            styles.mediaFallback,
            hasAuthoredImage
              ? styles.mediaFallbackErrored
              : styles.mediaFallbackEmpty,
          )}
          aria-hidden="true"
        />
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
