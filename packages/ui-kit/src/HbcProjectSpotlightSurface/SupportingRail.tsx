/**
 * SupportingRail — numbered editorial list of past spotlights.
 *
 * Rendered only inside the `HistoryDisclosure` shell. Owns the rail's
 * presentation: header rule, numbered 01/02/03 index, thumbnail
 * treatment, tile hover-lift, and the bordered footer "view all" CTA.
 */
import * as React from 'react';
import { motion } from 'motion/react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import type {
  ProjectSpotlightMedia,
  ProjectSpotlightRailItem,
} from './types.js';
import { EASE_OUT_EXPO, formatEditorialIndex } from './internals.js';
import styles from './project-spotlight-surface.module.css';

interface RailThumbnailProps {
  image?: ProjectSpotlightMedia;
}

function RailThumbnail({ image }: RailThumbnailProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);
  if (!image || errored) {
    return <div className={styles.railThumb} aria-hidden="true" />;
  }
  return (
    <div className={styles.railThumbWrap}>
      <img
        src={image.src}
        alt={image.alt}
        width={100}
        height={72}
        decoding="async"
        loading="lazy"
        className={styles.railThumbImg}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

interface RailTileProps {
  item: ProjectSpotlightRailItem;
  index: number;
}

function RailTile({ item, index }: RailTileProps): React.JSX.Element {
  const metaText =
    [item.location, item.sector].filter(Boolean).join(' \u00B7 ') ||
    item.freshnessLabel;
  const href = item.cta?.href;
  const label = formatEditorialIndex(index);
  const content = (
    <>
      <span className={styles.railIndex} aria-hidden="true">
        {label}
      </span>
      <RailThumbnail image={item.image} />
      <div className={styles.railContent}>
        <p className={styles.railTitle}>{item.title}</p>
        {metaText ? <span className={styles.railMeta}>{metaText}</span> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={item.cta?.openInNewTab ? '_blank' : undefined}
        rel={item.cta?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={styles.railTile}
        data-hbc-homepage="spotlight-tile"
      >
        {content}
      </a>
    );
  }
  return (
    <div
      className={styles.railTile}
      data-hbc-homepage="spotlight-tile"
      role="listitem"
    >
      {content}
    </div>
  );
}

export interface SupportingRailProps {
  items: ProjectSpotlightRailItem[];
  label: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
  reducedMotion: boolean;
}

export function SupportingRail({
  items,
  label,
  allProjectsLabel,
  allProjectsUrl,
  reducedMotion,
}: SupportingRailProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: 0.2, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.div
      className={styles.rail}
      role="list"
      aria-label="Additional projects"
      {...motionProps}
    >
      <div className={styles.railHeader}>
        <span>{label}</span>
        <span className={styles.railHeaderRule} aria-hidden="true" />
      </div>
      {items.map((item, i) => (
        <RailTile key={item.id} item={item} index={i + 1} />
      ))}
      {allProjectsUrl ? (
        <div className={styles.railFooter}>
          <HbcPremiumCta
            label={allProjectsLabel ?? 'View all projects'}
            href={allProjectsUrl}
            variant="ghost"
            size="sm"
            arrow
          />
        </div>
      ) : null}
    </motion.div>
  );
}
