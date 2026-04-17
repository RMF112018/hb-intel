import * as React from 'react';
import { ProjectPortfolioSpotlight } from '../../projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function ProjectPortfolioSpotlightZone({ config }: HbHomepageZoneProps): React.JSX.Element {
  const zoneConfig = config?.projectPortfolioSpotlight as Record<string, unknown> | undefined;
  const activeAudience = typeof config?.activeAudience === 'string' ? config.activeAudience : undefined;

  return (
    <ZoneErrorBoundary zoneName="project-portfolio-spotlight">
      <section aria-label="Project Portfolio Spotlight">
        <ProjectPortfolioSpotlight config={zoneConfig} activeAudience={activeAudience} />
      </section>
    </ZoneErrorBoundary>
  );
}
