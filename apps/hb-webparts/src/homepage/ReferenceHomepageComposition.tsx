import * as React from 'react';
import { normalizeHomepageConfig } from './helpers/config.js';
import { normalizeCuratedListItems } from './helpers/normalization.js';
import {
  HomepageEditorialCard,
  HomepageLoadingState,
  HomepagePersonRecognitionCard,
  HomepageSectionShell,
  HomepageSpotlightCard,
  HomepageTopBandPair,
} from './shared/index.js';
import { PersonalizedWelcomeHeader } from '../webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from '../webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from '../webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from '../webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';

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
        <div aria-label="editorial-zone">
          {editorialItems.map((item) => (
            <HomepageEditorialCard item={item} key={item.id} />
          ))}
        </div>
      </HomepageSectionShell>

      <HomepageSectionShell title="Quick-use / Work Zone">
        <PriorityActionsRail
          activeAudience="field"
          config={{
            heading: 'Priority Actions',
            groups: [
              { id: 'today', title: 'Today', order: 1 },
              { id: 'approvals', title: 'Approvals', order: 2 },
            ],
            actions: [
              {
                id: 'complete-daily-log',
                title: 'Complete Daily Log',
                href: '/daily-log',
                group: 'today',
                order: 1,
                audiences: ['field'],
                badge: { label: 'Due by 4 PM', variant: 'warning' },
              },
              {
                id: 'review-submittals',
                title: 'Review Submittals',
                href: '/submittals',
                group: 'approvals',
                order: 2,
                audiences: ['field', 'leadership'],
                badge: { label: 'Needs attention', variant: 'critical' },
              },
            ],
          }}
        />
        <ToolLauncherWorkHub
          activeAudience="field"
          config={{
            groups: [
              {
                id: 'field-systems',
                title: 'Field Systems',
                order: 1,
                items: [
                  { id: 'safety-center', title: 'Safety Center', href: '/safety', iconKey: 'safety', order: 1 },
                  { id: 'daily-reports', title: 'Daily Reports', href: '/reports', iconKey: 'field', order: 2 },
                ],
              },
              {
                id: 'admin-systems',
                title: 'Admin Systems',
                order: 2,
                items: [{ id: 'finance-hub', title: 'Finance Hub', href: '/finance', iconKey: 'finance', order: 1 }],
              },
            ],
          }}
        />
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
