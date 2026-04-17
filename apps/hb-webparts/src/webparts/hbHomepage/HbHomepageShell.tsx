import * as React from 'react';
import { createSharePointUserPhotoResolver } from '../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import type { HbHomepageProps, HbHomepageZoneProps } from './hbHomepageContract.js';
import { CompanyPulseZone } from './zones/CompanyPulseZone.js';
import { LeadershipMessageZone } from './zones/LeadershipMessageZone.js';
import { ProjectPortfolioSpotlightZone } from './zones/ProjectPortfolioSpotlightZone.js';
import { PeopleCulturePublicZone } from './zones/PeopleCulturePublicZone.js';
import { HbKudosZone } from './zones/HbKudosZone.js';
import styles from './HbHomepageShell.module.css';

export function HbHomepageShell({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  getGraphToken,
}: HbHomepageProps): React.JSX.Element {
  const profilePhotoResolver = React.useMemo(
    () => (siteUrl ? createSharePointUserPhotoResolver({ siteUrl }) : undefined),
    [siteUrl],
  );

  const zoneProps: HbHomepageZoneProps = {
    config,
    identity,
    assetBaseUrl,
    siteUrl,
    getGraphToken,
    profilePhotoResolver,
  };

  return (
    <div className={styles.shell}>
      <CompanyPulseZone {...zoneProps} />
      <LeadershipMessageZone {...zoneProps} />
      <ProjectPortfolioSpotlightZone {...zoneProps} />
      <PeopleCulturePublicZone {...zoneProps} />
      <HbKudosZone {...zoneProps} />
    </div>
  );
}
