import * as React from 'react';
import { HomepageLoadingState, HomepageSectionShell, HomepageTopBandPair } from './shared/index.js';
import { HP_SPACE, hpZoneSection } from './tokens.js';
import { PersonalizedWelcomeHeader } from '../webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from '../webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from '../webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from '../webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from '../webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from '../webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCulture } from '../webparts/peopleCulture/PeopleCulture.js';
import { ProjectPortfolioSpotlight } from '../webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from '../webparts/safetyFieldExcellence/SafetyFieldExcellence.js';
import { SmartSearchWayfinding } from '../webparts/smartSearchWayfinding/SmartSearchWayfinding.js';

/**
 * Governed Homepage Composition Reference
 *
 * This component is the authoritative composition reference for the HB Central
 * homepage page-canvas product. It demonstrates the governed zone structure,
 * section rhythm, and webpart arrangement with realistic sample data.
 *
 * Roles:
 * 1. Development preview — renders when mount.tsx receives no webPartId
 * 2. Visual integration test — confirms all 10 webparts compose without errors
 * 3. Zone architecture reference — shows the 5-zone homepage structure
 *
 * This is NOT the production rendering path. In production, each webpart
 * renders independently through the mount/dispatch seam. This composition
 * exists to preview the intended homepage experience as a single surface.
 *
 * Zone order: Top Band → Utility → Communications → Operational → Discovery
 *
 * @see docs/architecture/plans/MASTER/spfx/homepage/phase-03/Homepage-Zone-Architecture.md
 */
export function ReferenceHomepageComposition(): React.JSX.Element {
  return (
    <div
      data-hbc-homepage="composition-reference"
      style={{ display: 'grid', gap: HP_SPACE['2xl'] }}
    >
      {/* ── Zone 1: Top Band ─────────────────────────────────────── */}
      <HomepageTopBandPair
        hero={
          <HbHeroBanner
            config={{
              eyebrow: 'This week at HB',
              headline: 'HB Central: Week of April Operations',
              message: 'Track active milestones, field recognition, and leadership guidance from one homepage band.',
              metadata: 'Updated Friday at 8:00 AM',
              cta: { label: 'Read update', href: '/company-pulse' },
              secondaryCta: { label: 'View all updates', href: '/updates' },
            }}
          />
        }
        welcome={
          <PersonalizedWelcomeHeader
            identity={{ preferredName: 'Jordan Miller' }}
            config={{
              supportLine: "Let's keep projects moving with clarity today.",
              contextLine: 'Saturday, April 4',
              alertSeverity: 'warning',
              alertTitle: 'Weather advisory',
              alertMessage: 'Review field safety updates before site mobilization.',
            }}
          />
        }
      />

      {/* ── Zone 2: Utility ──────────────────────────────────────── */}
      <div style={hpZoneSection('utility')}>
      <HomepageSectionShell title="Quick-use / Work Zone">
        <PriorityActionsRail
          activeAudience="field"
          config={{
            heading: 'Priority Actions',
            maxItems: 4,
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

      </div>

      {/* ── Zone 3: Communications ───────────────────────────────── */}
      <div style={hpZoneSection('communications')}>
      <HomepageSectionShell title="Communications">
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
      </div>

      {/* ── Zone 4: Operational Awareness ────────────────────────── */}
      <div style={hpZoneSection('operational')}>
      <HomepageSectionShell title="Operational Awareness">
        <ProjectPortfolioSpotlight
          activeAudience="field"
          config={{
            items: [
              {
                id: 'portfolio-feature',
                title: 'Downtown Mixed-Use Tower',
                summary: 'Curtain wall and interior sequence are synchronized for turnover readiness.',
                featured: true,
                strategicEmphasis: true,
                status: { label: 'On Track', variant: 'success' },
                freshness: { source: 'live', updatedAt: '2026-04-04T12:00:00.000Z' },
                milestones: [
                  { id: 'm1', title: 'MEP closeout', completed: true },
                  { id: 'm2', title: 'Punch list reduction', completed: false },
                ],
                cta: { label: 'View project spotlight', href: '/projects' },
              },
              {
                id: 'portfolio-secondary',
                title: 'Coastal School Renovation',
                summary: 'Phasing adjustments keep classroom handover dates intact.',
                status: { label: 'Watchlist', variant: 'warning' },
                order: 2,
              },
            ],
          }}
        />
        <SafetyFieldExcellence
          activeAudience="field"
          config={{
            items: [
              {
                id: 'safety-feature',
                title: 'Field Excellence Recognition',
                summary: 'North district crews completed all safety observations before Friday close.',
                eventType: 'recognition',
                featured: true,
                indicator: { label: 'Audit Complete', variant: 'success' },
                freshness: { source: 'live', updatedAt: '2026-04-04T13:00:00.000Z' },
                cta: { label: 'Open safety hub', href: '/safety' },
              },
              {
                id: 'safety-secondary',
                title: 'Hydration Protocol Reminder',
                summary: 'Shift planning now requires heat-index check before mobilization.',
                eventType: 'reminder',
                indicator: { label: 'Action Required', variant: 'warning' },
                order: 2,
              },
            ],
          }}
        />
      </HomepageSectionShell>
      </div>

      {/* ── Zone 5: Discovery ────────────────────────────────────── */}
      <div style={hpZoneSection('discovery')}>
      <HomepageSectionShell title="Discovery">
        <SmartSearchWayfinding
          activeAudience="field"
          config={{
            strategy: { mode: 'curatedFirst', futureSearchEnhancement: 'planned' },
            quickPaths: [
              {
                id: 'open-timesheet',
                title: 'Open Timesheet',
                href: '/timesheet',
                description: 'Most-used weekly action',
                order: 1,
              },
              {
                id: 'field-safety',
                title: 'Safety Center',
                href: '/safety',
                description: 'Field notices and protocols',
                order: 2,
              },
            ],
            categories: [
              { id: 'systems', title: 'Systems', order: 1 },
              { id: 'forms', title: 'Forms and Policies', order: 2 },
              { id: 'teams', title: 'Team Spaces', order: 3 },
            ],
            resources: [
              {
                id: 'resource-procore',
                title: 'Procore Project Hub',
                href: '/systems/procore',
                type: 'system',
                categoryId: 'systems',
                description: 'Project coordination and field updates',
                promoted: true,
                order: 1,
                keywords: ['project', 'field', 'coordination'],
              },
              {
                id: 'resource-change-order',
                title: 'Change Order Form',
                href: '/forms/change-order',
                type: 'form',
                categoryId: 'forms',
                description: 'Submit approved change requests',
                order: 2,
              },
              {
                id: 'resource-ops-team',
                title: 'Operations Team Space',
                href: '/teams/operations',
                type: 'teamSpace',
                categoryId: 'teams',
                description: 'Weekly priorities and handoff notes',
                order: 3,
              },
            ],
          }}
        />
      </HomepageSectionShell>

      </div>

      <HomepageLoadingState label="Loading homepage content" />
    </div>
  );
}
