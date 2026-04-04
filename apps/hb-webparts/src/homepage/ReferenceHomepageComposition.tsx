import * as React from 'react';
import { normalizeHomepageConfig } from './helpers/config.js';
import { HomepageLoadingState, HomepageSectionShell, HomepageTopBandPair } from './shared/index.js';
import { PersonalizedWelcomeHeader } from '../webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from '../webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from '../webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from '../webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from '../webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from '../webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCulture } from '../webparts/peopleCulture/PeopleCulture.js';

export function ReferenceHomepageComposition(): React.JSX.Element {
  const config = normalizeHomepageConfig({ maxItems: 2 });

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

      <HomepageSectionShell title="Quick-use / Work Zone">
        <PriorityActionsRail
          activeAudience="field"
          config={{
            heading: 'Priority Actions',
            maxItems: config.maxItems + 2,
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

      <HomepageSectionShell title="Awareness Zone">
        <CompanyPulse
          activeAudience="field"
          config={{
            items: [
              {
                id: 'pulse-feature',
                title: 'Project Teams Hit Safety Milestone',
                summary: 'Crews reached a record week of audit completion and mentoring coverage.',
                category: 'safety',
                featured: true,
                order: 1,
                cta: { label: 'View pulse', href: '/pulse' },
              },
              {
                id: 'pulse-secondary',
                title: 'Recognition Moment',
                summary: 'Field office teams recognized for schedule recovery collaboration.',
                category: 'recognition',
                order: 2,
              },
            ],
          }}
        />
        <LeadershipMessage
          config={{
            entries: [
              {
                id: 'leadership-feature',
                title: 'Leadership Focus This Week',
                message: 'We are prioritizing closeout quality and disciplined cross-team communication.',
                leaderName: 'Alex Carter',
                leaderRole: 'Chief Operating Officer',
                featured: true,
                order: 1,
                cta: { label: 'Read message', href: '/leadership' },
              },
              {
                id: 'leadership-archive',
                title: 'Last Week Highlights',
                message: 'Keep momentum by closing open safety actions early.',
                leaderName: 'Alex Carter',
                order: 2,
              },
            ],
          }}
        />
        <PeopleCulture
          activeAudience="field"
          config={{
            entries: [
              {
                id: 'culture-feature',
                personName: 'Avery Jordan',
                eventType: 'recognition',
                highlight: 'Recognized for cross-team safety mentorship.',
                featured: true,
                order: 1,
                cta: { label: 'Celebrate', href: '/people' },
              },
              {
                id: 'culture-secondary',
                personName: 'Riley Brooks',
                eventType: 'anniversary',
                highlight: 'Celebrating 10 years with HB.',
                order: 2,
              },
            ],
          }}
        />
      </HomepageSectionShell>

      <HomepageLoadingState label="Loading homepage content" />
    </>
  );
}
