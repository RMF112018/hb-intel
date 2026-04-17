/**
 * People & Culture Public — governed surface composition.
 *
 * Stateless presentation component that renders the normalized
 * split-aware output. All styling flows through the CSS module and
 * --pc-* custom properties seeded by pcCSSVars().
 *
 * This surface is deliberately self-contained inside the webpart
 * folder and does NOT import from @hbc/ui-kit/homepage's
 * HbcPeopleCultureSurface. The split boundary with HB Kudos stays hard.
 */

import * as React from 'react';
import type { PeopleCulturePublicOutput } from '../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  resolveMediaSource,
  type ProfilePhotoResolver,
} from '../../homepage/helpers/peopleCultureSplitModel.js';
import { pcCSSVars } from './tokens.js';
import { FeaturedCard } from './FeaturedCard.js';
import { SupportingRow } from './SupportingRow.js';
import styles from './peopleCulturePublic.module.css';

export interface PeopleCulturePublicSurfaceProps {
  output: PeopleCulturePublicOutput;
  profilePhotoResolver?: ProfilePhotoResolver;
}

export function PeopleCulturePublicSurface({
  output,
  profilePhotoResolver,
}: PeopleCulturePublicSurfaceProps): React.JSX.Element {
  const featuredMedia = React.useMemo(
    () => output.featured.map((item) => resolveMediaSource(item.mediaSource, profilePhotoResolver)),
    [output.featured, profilePhotoResolver],
  );
  const supportingMedia = React.useMemo(
    () => output.supporting.map((item) => resolveMediaSource(item.mediaSource, profilePhotoResolver)),
    [output.supporting, profilePhotoResolver],
  );

  return (
    <section
      aria-label={output.heading}
      data-hbc-webpart="people-culture-public"
      data-hbc-pc-empty={output.isEmpty ? 'true' : 'false'}
      className={styles.section}
      style={pcCSSVars() as React.CSSProperties}
    >
      <header className={styles.headerRow}>
        <div>
          <div className={styles.eyebrow}>People and Culture</div>
          <h2 className={styles.heading}>{output.heading}</h2>
        </div>
      </header>

      {output.isEmpty ? (
        <div className={styles.emptyState} role="status">
          No People and Culture stories are featured right now. Check back soon.
        </div>
      ) : (
        <>
          {output.featured.length > 0 ? (
            <div className={styles.featuredGrid} data-hbc-pc-section="featured">
              {output.featured.map((item, index) => (
                <FeaturedCard key={item.id} item={item} media={featuredMedia[index]} />
              ))}
            </div>
          ) : null}

          {output.supporting.length > 0 ? (
            <ul className={styles.supportingList} data-hbc-pc-section="supporting">
              {output.supporting.map((item, index) => (
                <SupportingRow key={item.id} item={item} media={supportingMedia[index]} />
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
