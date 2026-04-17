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

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface SupportingRowProps {
  item: PeopleCultureItem;
  media: PeopleCultureResolvedMedia | undefined;
}

export function SupportingRow({ item, media }: SupportingRowProps): React.JSX.Element {
  const initials = item.personRef ? initialsFrom(item.personRef.displayName) : '';
  return (
    <li
      className={styles.supportingRow}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-tier="supporting"
      data-hbc-pc-family={item.family}
      data-hbc-pc-media-source={media?.sourceKind ?? item.mediaSource.kind}
    >
      {media ? (
        <img
          src={media.slot.src}
          alt={media.slot.alt}
          className={styles.supportingMedia}
          loading="lazy"
        />
      ) : (
        <div className={styles.mediaPlaceholder} aria-hidden="true">
          {initials || FAMILY_LABEL[item.family][0]}
        </div>
      )}
      <div className={styles.supportingTextGroup}>
        <p className={styles.supportingTitle}>{item.title}</p>
        <p className={styles.supportingBody}>{item.body}</p>
      </div>
    </li>
  );
}
