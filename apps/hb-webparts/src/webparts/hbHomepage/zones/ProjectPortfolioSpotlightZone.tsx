import * as React from 'react';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import { FoleonHomepageLaneHost } from './FoleonHomepageLaneHost.js';

export function ProjectPortfolioSpotlightZone(props: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="project-portfolio-spotlight">
      <section aria-label="Project Spotlight">
        <FoleonHomepageLaneHost
          {...props}
          lane="projectSpotlight"
          occupantId="project-portfolio-spotlight"
        />
      </section>
    </ZoneErrorBoundary>
  );
}
