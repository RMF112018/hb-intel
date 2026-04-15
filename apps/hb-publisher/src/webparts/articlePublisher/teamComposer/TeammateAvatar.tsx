/**
 * Photo-aware avatar for teammate rows in the authoring TeamPanel.
 *
 * Degrades cleanly in three layers:
 *   1. Directory photo when a `fetchPersonPhoto` adapter is threaded
 *      in and the cache has resolved a URL for this principal.
 *   2. A premium initials circle otherwise.
 *   3. Pure decoration (`aria-hidden`) because the surrounding chip
 *      button already announces the teammate's name.
 *
 * Uses the governed `usePersonPhotoCache` hook from `@hbc/ui-kit` so
 * the authoring surface shares the same fetch/cache semantics as the
 * teammate composer, the homepage Team Viewer, and any future
 * person-bearing surface.
 */

import * as React from 'react';
import { usePersonPhotoCache } from '@hbc/ui-kit';
import type { PersonPhotoFn } from '@hbc/ui-kit';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';
import { teamMemberInitials } from './teamInvariants.js';
import styles from './teamPanel.module.css';

export interface TeammateAvatarProps {
  readonly row: PublisherTeamMemberRow;
  readonly fetchPersonPhoto?: PersonPhotoFn;
}

export function TeammateAvatar({
  row,
  fetchPersonPhoto,
}: TeammateAvatarProps): React.JSX.Element {
  const { getPhoto } = usePersonPhotoCache(fetchPersonPhoto);
  const key = row.PersonPrincipal;
  const cached = key ? getPhoto(key) : undefined;
  const photoUrl = cached?.url;

  if (photoUrl) {
    return (
      <span className={styles.avatarPhoto} aria-hidden="true">
        <img
          src={photoUrl}
          alt=""
          className={styles.avatarPhotoImg}
          onError={(e) => {
            // If the cached URL fails to load, hide the img so the
            // flex layout collapses and we re-render initials next
            // cycle. Intentionally leave the cache entry alone.
            e.currentTarget.style.display = 'none';
          }}
        />
      </span>
    );
  }

  return (
    <span className={styles.avatar} aria-hidden="true">
      {teamMemberInitials(row)}
    </span>
  );
}
