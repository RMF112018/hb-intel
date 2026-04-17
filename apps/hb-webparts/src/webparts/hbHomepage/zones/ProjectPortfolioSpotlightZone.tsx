import * as React from 'react';
import { ProjectPortfolioSpotlight } from '../../projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function ProjectPortfolioSpotlightZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="project-portfolio-spotlight">
      <section aria-label="Project Portfolio Spotlight">
        <ProjectPortfolioSpotlight
          config={moduleConfig.projectPortfolioSpotlight}
          activeAudience={moduleConfig.activeAudience}
        />
      </section>
    </ZoneErrorBoundary>
  );
}
