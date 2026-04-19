import * as React from 'react';
import { HP_SPACE, hpZoneSection } from './tokens.js';
import { HbSignatureHero } from '../webparts/hbSignatureHero/HbSignatureHero.js';
import { HBCENTRAL_SITE_URL } from '../webparts/hbSignatureHero/heroModeResolver.js';
import { PriorityActionsRail } from '../webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from '../webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from '../webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from '../webparts/leadershipMessage/LeadershipMessage.js';
import { ProjectPortfolioSpotlight } from '../webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from '../webparts/safetyFieldExcellence/SafetyFieldExcellence.js';
import { SmartSearchWayfinding } from '../webparts/smartSearchWayfinding/SmartSearchWayfinding.js';

/**
 * Governed Homepage Composition Reference
 *
 * This composition is a REFERENCE ONLY. On the flagship HBCentral
 * homepage, production dispatches one flagship runtime webpart through
 * `mount.tsx`: `HbHomepage`. That wrapper owns the hero and launcher
 * entry regions before `HbHomepageShell`. This file intentionally
 * remains a non-production, flattened visual reference path so
 * designers/reviewers can inspect sequence and tone without hosted
 * SPFx authoring.
 *
 * Phase 16-03 — Unified signature hero with design breakout.
 * Phase 18 (01–04) — Signature hero canonicalized, rebuilt as minimal
 *   premium identity surface, gradient replaced with charcoal background
 *   system, accessibility and doctrine hardened.
 *
 * This is a non-production composition reference for the HB Central
 * homepage experience. It demonstrates the premium 5-zone focal sequence:
 *
 *   1. Signature Hero — minimal premium identity surface (logo, tagline, greeting)
 *   2. Utility — command surfaces (priority actions + tool launcher)
 *   3. Discovery — search and wayfinding product
 *   4. Communications — editorial modules (pulse, leadership, people)
 *   5. Operational — intelligence modules (projects, safety)
 *
 * P16-03: Top band merged from two-panel welcome+hero into a single
 * unified HbSignatureHero with motion reveal choreography.
 *
 * P18: HbSignatureHero formally canonicalized as the only homepage
 * flagship hero. Content reduced to three locked identity elements.
 * Split-path pattern retired. Gradient wash replaced with premium
 * charcoal background system. Accessibility and authoring hardened.
 *
 * This is NOT the production rendering path. In production, the
 * flagship page dispatches `HbHomepage` and the wrapper owns hero +
 * launcher/actions entry regions before shell lanes.
 *
 * @see docs/architecture/plans/MASTER/spfx/homepage/phase-16/
 * @see docs/architecture/plans/MASTER/spfx/homepage/phase-18/
 */

/** Page-level composition gap — generous separation between zones */
const compositionStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE['4xl'],
  maxWidth: 1200,
};

/** Zone wrapper — tinted background with deliberate padding and rhythm */
const zoneStyle = (zone: Parameters<typeof hpZoneSection>[0]): React.CSSProperties => ({
  ...hpZoneSection(zone),
  display: 'grid',
  gap: HP_SPACE.xl,
});

export function ReferenceHomepageComposition(): React.JSX.Element {
  return (
    <div data-hbc-homepage="composition-reference" style={compositionStyle}>

      {/* ── Zone 1: Signature Hero — Premium Identity Surface ──── */}
      <HbSignatureHero
        identity={{ preferredName: 'Jordan Miller' }}
        siteUrl={HBCENTRAL_SITE_URL}
      />

      {/* ── Zone 2: Utility — Command Surfaces ──────────────────── */}
      <section aria-label="Quick-use and work zone" style={zoneStyle('utility')}>
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
        {/* Phase 03: Live-data path renders 4-region composition shell
            (command band, flagship stage, utility rail, workflow shelves)
            when SPFx context is available. Config below is the local-dev
            fallback only — renders flat HbcLauncherSurface bridge. */}
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
      </section>

      {/* ── Zone 3: Discovery — Search and Wayfinding ───────────── */}
      <section aria-label="Discovery and wayfinding" style={zoneStyle('discovery')}>
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
      </section>

      {/* ── Zone 4: Communications — Editorial Modules ──────────── */}
      <section aria-label="Communications" style={zoneStyle('communications')}>
        <CompanyPulse
          activeAudience="field"
          config={{
            archiveHref: '/sites/hb-central/pulse',
            items: [
              {
                id: 'pulse-lead',
                title: 'Project Teams Hit Safety Milestone',
                summary: 'Crews reached a record week of audit completion and mentoring coverage across all active project sites.',
                category: 'safety',
                byline: 'Safety & Field Excellence',
                publishDate: '2026-04-07',
                media: { src: '/sites/hb-central/assets/safety-milestone.jpg', alt: 'Field team at safety milestone event' },
                featured: true,
                order: 1,
                cta: { label: 'Read highlights', href: '/sites/hb-central/pulse/safety-milestone' },
              },
              {
                id: 'pulse-secondary',
                title: 'Recognition Moment: Schedule Recovery',
                summary: 'Field office teams recognized for schedule recovery collaboration.',
                category: 'recognition',
                byline: 'Project Controls',
                publishDate: '2026-04-06',
                order: 2,
              },
              {
                id: 'pulse-tertiary',
                title: 'New Subcontractor Onboarding Process',
                summary: 'Preconstruction has rolled out a streamlined onboarding workflow.',
                category: 'update',
                publishDate: '2026-04-05',
                order: 3,
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
        {/* Legacy merged People & Culture preview block retired in the
            Phase-23 closure. The split PeopleCulturePublic /
            PeopleCultureCompanion / HbKudos surfaces each own their
            own preview harness under the dev-harness tabs; this
            reference composition intentionally stops at the editorial
            pulse + leadership zone here. */}
      </section>

      {/* ── Zone 5: Operational — Intelligence Modules ──────────── */}
      <section aria-label="Operational awareness" style={zoneStyle('operational')}>
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
                freshness: { source: 'live', updatedAt: '2026-04-05T12:00:00.000Z' },
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
                freshness: { source: 'live', updatedAt: '2026-04-05T13:00:00.000Z' },
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
      </section>
    </div>
  );
}
