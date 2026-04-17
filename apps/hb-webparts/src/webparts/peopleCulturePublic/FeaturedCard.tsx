import * as React from 'react';
import type {
  PeopleCultureItem,
  PeopleCultureResolvedMedia,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import styles from './peopleCulturePublic.module.css';

const FAMILY_LABEL: Record<PeopleCultureItem['family'], string> = {
  announcement: 'Announcement',
  celebrationMilestone: 'Celebration',
  cultureProgramEvent: 'Culture Program',
};

interface FeaturedCardProps {
  item: PeopleCultureItem;
  media: PeopleCultureResolvedMedia | undefined;
}

export function FeaturedCard({ item, media }: FeaturedCardProps): React.JSX.Element {
  return (
    <article
      className={styles.featuredCard}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-tier="featured"
      data-hbc-pc-family={item.family}
      data-hbc-pc-media-source={media?.sourceKind ?? item.mediaSource.kind}
    >
      {media ? (
        <img
          src={media.slot.src}
          alt={media.slot.alt}
          className={styles.featuredMedia}
          loading="lazy"
        />
      ) : null}
      <h3 className={styles.featuredTitle}>{item.title}</h3>
      <p className={styles.featuredBody}>{item.body}</p>
      <footer className={styles.featuredFooter}>
        <span className={styles.badge}>{FAMILY_LABEL[item.family]}</span>
        {item.homepage.isPinned ? <span className={styles.badgePinned}>Pinned</span> : null}
        {item.cta ? (
          <a
            href={item.cta.href}
            target={item.cta.openInNewTab ? '_blank' : undefined}
            rel={item.cta.openInNewTab ? 'noreferrer' : undefined}
            className={styles.ctaLink}
          >
            {item.cta.label}
          </a>
        ) : null}
      </footer>
    </article>
  );
}
