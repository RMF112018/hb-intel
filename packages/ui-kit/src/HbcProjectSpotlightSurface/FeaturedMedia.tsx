/**
 * FeaturedMedia — mode-aware hero media zone.
 *
 * Renders the featured project's image with a two-stop editorial scrim,
 * a pinned eyebrow chip, and optional status / strategic / stale chips.
 * Hero height posture is driven by `data-layout-mode` on the surface
 * root, not by viewport media queries. Overlay chips are gated by the
 * mode's `showInlineMeta` visibility rule so compact / minimal states
 * keep the image reading strong without chrome drift.
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
  const statusLabel = status?.label;
  const hasOverlayChips =
    showOverlayChips && Boolean(statusLabel || strategicEmphasis || isStale);

  return (
    <div className={styles.mediaZone}>
      <div className={styles.mediaPlaceholder} aria-hidden="true">
        Project Image
      </div>
      {image && !errored ? (
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
      ) : null}
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
