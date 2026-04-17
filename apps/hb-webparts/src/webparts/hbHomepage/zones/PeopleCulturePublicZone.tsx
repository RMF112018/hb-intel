import * as React from 'react';
import { PeopleCulturePublic } from '../../peopleCulturePublic/PeopleCulturePublic.js';
import { createSharePointUserPhotoResolver } from '../../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function PeopleCulturePublicZone({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  profilePhotoResolver,
}: HbHomepageZoneProps): React.JSX.Element {
  const zoneConfig = config?.peopleCulturePublic as Record<string, unknown> | undefined;

  const resolver = React.useMemo(
    () => profilePhotoResolver ?? (siteUrl ? createSharePointUserPhotoResolver({ siteUrl }) : undefined),
    [profilePhotoResolver, siteUrl],
  );

  return (
    <ZoneErrorBoundary zoneName="people-culture-public">
      <section aria-label="People and Culture">
        <PeopleCulturePublic
          config={zoneConfig}
          identity={identity}
          assetBaseUrl={assetBaseUrl}
          profilePhotoResolver={resolver}
        />
      </section>
    </ZoneErrorBoundary>
  );
}
