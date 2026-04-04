import * as React from 'react';
import { normalizeHomepageConfig } from './helpers/config.js';
import { normalizeCuratedListItems } from './helpers/normalization.js';
import {
  HomepageEditorialCard,
  HomepageLoadingState,
  HomepagePersonRecognitionCard,
  HomepageRailShell,
  HomepageSectionShell,
  HomepageSpotlightCard,
  HomepageTopBandPair,
  HomepageUtilityTile,
} from './shared/index.js';
import { PersonalizedWelcomeHeader } from '../webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from '../webparts/hbHeroBanner/HbHeroBanner.js';

const rawEditorialItems = [
  {
    id: 'pulse-1',
    title: ' Company Pulse: Week in Review ',
    summary: 'Major highlights from current projects and leadership updates.',
    cta: { label: 'Read update', href: '/company-pulse' },
  },
  {
    id: 'pulse-2',
    title: 'Safety Milestone',
    summary: 'Field teams reached a new audit completion milestone.',
    cta: { label: 'View details', href: '/safety' },
  },
];

export function ReferenceHomepageComposition(): React.JSX.Element {
  const config = normalizeHomepageConfig({ maxItems: 2 });
  const editorialItems = normalizeCuratedListItems(rawEditorialItems, config.maxItems);

  return (
    <>
      <HomepageTopBandPair
        hero={
          <HbHeroBanner
            config={{
              headline: 'HB Central: Week of April Operations',
              message: 'Track active milestones, field recognition, and leadership guidance from one homepage band.',
              metadata: 'Updated Friday at 8:00 AM',
              cta: { label: 'Read update', href: '/company-pulse' },
            }}
          />
        }
        welcome={
          <PersonalizedWelcomeHeader
            identity={{ preferredName: 'Jordan Miller' }}
            config={{
              supportLine: 'Let’s keep projects moving with clarity today.',
              contextLine: 'Saturday, April 4',
              alertSeverity: 'warning',
              alertTitle: 'Weather advisory',
              alertMessage: 'Review field safety updates before site mobilization.',
            }}
          />
        }
      />

      <HomepageSectionShell title="Company Pulse">
        <HomepageRailShell label="editorial-zone">
          {editorialItems.map((item) => (
            <HomepageEditorialCard item={item} key={item.id} />
          ))}
        </HomepageRailShell>
      </HomepageSectionShell>

      <HomepageSectionShell title="Quick Actions">
        <HomepageRailShell label="utility-zone">
          <HomepageUtilityTile
            title="Tool Launcher"
            description="Open frequently used workflows without leaving homepage context."
            cta={{ label: 'Launch', href: '/tools' }}
          />
        </HomepageRailShell>
      </HomepageSectionShell>

      <HomepageSectionShell title="Operational Spotlight">
        <HomepageSpotlightCard
          item={{
            id: 'spotlight-1',
            title: 'Project Spotlight',
            summary: 'Two strategic milestones were completed this week.',
            statusLabel: 'On Track',
            cta: { label: 'Open portfolio', href: '/portfolio' },
          }}
        />
      </HomepageSectionShell>

      <HomepageSectionShell title="People and Culture">
        <HomepagePersonRecognitionCard
          item={{ id: 'person-1', personName: 'Avery Jordan', recognitionText: 'Recognized for cross-team safety mentorship.' }}
        />
      </HomepageSectionShell>

      <HomepageLoadingState label="Loading homepage content" />
    </>
  );
}
