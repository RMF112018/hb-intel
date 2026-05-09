import type { PccMvpSurfaceId } from '@hbc/models/pcc';

/**
 * PCC shell surface header metadata seam.
 *
 * Wave 15A wave-b7 Prompt 02 introduced `surfaceSummaryItems`, `surfaceCues`,
 * and `readOnlyCue` so the shell hero could absorb duplicate surface-header
 * content without altering bento header cards. Wave 15A wave-b9 Prompt 4B-02
 * adds the production-visible band: `heroHighlights` (end-user posture
 * highlights — labels and short values) and `governanceMicrocopy` (subordinate
 * read-only / governed-workflow reminders). The hero band renders the new
 * fields as primary content; the legacy `surfaceSummaryItems` /
 * `surfaceCues` / `readOnlyCue` fields remain populated to anchor source /
 * authority / no-writeback governance assertions in tests but are no longer
 * rendered as the primary visible band.
 *
 * Every value is a deterministic, presentational string. No entry implies
 * live counts, writeback authority, or autonomous HBI decisions. Keyed
 * exhaustively over `PccMvpSurfaceId` so a new surface cannot land without
 * supplying compact preview metadata.
 *
 * TODO(PCC future phase): Replace static hero highlight values with
 * backend-generated project/surface summary records. The intended target is a
 * site-specific SharePoint list that stores precomputed PCC hero summaries by
 * project and surface. The shell hero should eventually read those summaries
 * from the PCC read model instead of carrying static preview values here.
 *
 * TODO(PCC future phase): Introduce backend summary functions that compute
 * Project Home, Team & Access, Documents, Readiness, Approvals, External
 * Platforms, Settings, and Site Health hero summaries. Persist the computed
 * results to a project/site-scoped SharePoint list, then expose them through
 * the PCC read model for shell hero rendering.
 */

export type PccShellSurfaceSummaryTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface IPccShellSurfaceSummaryItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone?: PccShellSurfaceSummaryTone;
}

export interface IPccShellSurfaceCue {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export type PccShellHeroHighlightTone = 'neutral' | 'attention' | 'success' | 'warning' | 'risk';

export type PccShellHeroHighlightKind = 'summary' | 'status' | 'reminder' | 'next-step';

export interface IPccShellHeroHighlight {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone?: PccShellHeroHighlightTone;
  readonly kind?: PccShellHeroHighlightKind;
}

export interface IPccShellHeroMicrocopy {
  readonly id: string;
  readonly text: string;
}

export interface IPccShellSurfaceHeaderMetadata {
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
  readonly heroHighlights: readonly IPccShellHeroHighlight[];
  readonly governanceMicrocopy: readonly IPccShellHeroMicrocopy[];
}

export const PCC_SHELL_SURFACE_HEADER_METADATA: Readonly<
  Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>
> = {
  'project-home': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Command preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Fixture / read-model preview' },
      { id: 'authority', label: 'Authority', value: 'Advisory only' },
    ],
    surfaceCues: [
      {
        id: 'priority-actions',
        label: 'Focus',
        value: 'Priority actions and project signals',
      },
      { id: 'hbi-boundary', label: 'HBI', value: 'Grounded preview, no writeback' },
    ],
    readOnlyCue: 'Read-only preview — no decisions, approvals, or writeback authority.',
    heroHighlights: [
      {
        id: 'priority-actions',
        label: 'Priority Actions',
        value: 'Highest-severity items first',
        kind: 'summary',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        value: 'Pending decisions in queue',
        kind: 'status',
      },
      {
        id: 'setup-gaps',
        label: 'Setup Gaps',
        value: 'Source configurations outstanding',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'coordination-reminder',
        text: 'Review blocking signals before the next coordination meeting.',
      },
    ],
  },
  'team-and-access': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Team access preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Project team and access posture' },
      { id: 'authority', label: 'Authority', value: 'Request context only' },
    ],
    surfaceCues: [
      {
        id: 'team-visibility',
        label: 'Focus',
        value: 'Team visibility and permission posture',
      },
      {
        id: 'access-boundary',
        label: 'Boundary',
        value: 'No access changes from this header',
      },
    ],
    readOnlyCue: 'Read-only preview — access changes require governed workflows.',
    heroHighlights: [
      {
        id: 'team-summary',
        label: 'Team Summary',
        value: 'Internal · external · guest posture',
        kind: 'summary',
      },
      {
        id: 'access-requests',
        label: 'Access Requests',
        value: 'Request context only',
        kind: 'status',
      },
      {
        id: 'permission-reminder',
        label: 'Permission Reminder',
        value: 'Changes follow governed workflows',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'access-manager-reminder',
        text: 'Only access managers can change project team permissions.',
      },
    ],
  },
  documents: {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Document control preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'SharePoint / OneDrive / external references',
      },
      { id: 'authority', label: 'Authority', value: 'Navigation context only' },
    ],
    surfaceCues: [
      {
        id: 'document-posture',
        label: 'Focus',
        value: 'Document access and source posture',
      },
      { id: 'external-files', label: 'Boundary', value: 'No file moves or writeback' },
    ],
    readOnlyCue: 'Read-only preview — no uploads, moves, deletes, or external launches.',
    heroHighlights: [
      {
        id: 'document-sources',
        label: 'Document Sources',
        value: 'Project Record · My Project Files · External References',
        kind: 'summary',
      },
      {
        id: 'record-source',
        label: 'Record Source',
        value: 'Project Record remains the formal file source',
        kind: 'status',
      },
      {
        id: 'open-items',
        label: 'Open Items',
        value: 'Source confirmation required where flagged',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'project-record-reminder',
        text: 'Project Record remains the formal source for project files.',
      },
    ],
  },
  'project-readiness': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Readiness preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'Readiness framework and module signals',
      },
      { id: 'authority', label: 'Authority', value: 'Evidence context only' },
    ],
    surfaceCues: [
      {
        id: 'readiness-posture',
        label: 'Focus',
        value: 'Blockers, evidence, and startup-to-closeout controls',
      },
      {
        id: 'module-boundary',
        label: 'Boundary',
        value: 'No checklist completion from this header',
      },
      {
        id: 'no-execution',
        label: 'Posture',
        value: 'No checklist completion or evidence execution from this header',
      },
    ],
    readOnlyCue: 'Read-only preview — readiness actions remain governed by source modules.',
    heroHighlights: [
      {
        id: 'readiness-status',
        label: 'Readiness Status',
        value: 'Stage gates in progress',
        kind: 'status',
      },
      {
        id: 'blockers',
        label: 'Blockers',
        value: 'Open items in queue',
        kind: 'summary',
      },
      {
        id: 'evidence',
        label: 'Evidence',
        value: 'Confidence pending source confirmation',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'blockers-reminder',
        text: 'Resolve blockers before advancing readiness posture.',
      },
      {
        id: 'no-checklist-completion',
        text: 'Checklist completion happens in the source module, not here.',
      },
    ],
  },
  approvals: {
    surfaceSummaryItems: [
      {
        id: 'mode',
        label: 'Mode',
        value: 'Approval checkpoint preview',
        tone: 'info',
      },
      { id: 'source', label: 'Source', value: 'Routing and checkpoint context' },
      { id: 'authority', label: 'Authority', value: 'No approval authority' },
    ],
    surfaceCues: [
      {
        id: 'routing-posture',
        label: 'Focus',
        value: 'Pending decisions and checkpoint posture',
      },
      {
        id: 'approval-boundary',
        label: 'Boundary',
        value: 'No approve / reject action from this header',
      },
    ],
    readOnlyCue:
      'Read-only preview — approvals require explicit governed action outside the shell header.',
    heroHighlights: [
      {
        id: 'approval-status',
        label: 'Approval Status',
        value: 'Pending decisions require review',
        kind: 'status',
      },
      {
        id: 'routing',
        label: 'Routing',
        value: 'Checkpoint context only',
        kind: 'summary',
      },
      {
        id: 'escalations',
        label: 'Escalations',
        value: 'Overdue items in queue',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'governed-workflow-reminder',
        text: 'Approval actions remain in governed approval workflows.',
      },
    ],
  },
  'external-systems': {
    surfaceSummaryItems: [
      {
        id: 'mode',
        label: 'Mode',
        value: 'External platform preview',
        tone: 'info',
      },
      {
        id: 'source',
        label: 'Source',
        value: 'Platform registry and mapping posture',
      },
      { id: 'authority', label: 'Authority', value: 'Launch context only' },
    ],
    surfaceCues: [
      {
        id: 'registry-posture',
        label: 'Focus',
        value: 'External platform mapping and source health',
      },
      {
        id: 'integration-boundary',
        label: 'Boundary',
        value: 'No sync or external writeback',
      },
      {
        id: 'launch-context',
        label: 'Boundary',
        value: 'Launch links open the source system in a new tab',
      },
    ],
    readOnlyCue: 'Read-only preview — external platform actions remain outside this header.',
    heroHighlights: [
      {
        id: 'launch-links',
        label: 'Launch Links',
        value: 'External integrations tracked',
        kind: 'summary',
      },
      {
        id: 'mapping-warnings',
        label: 'Mapping Warnings',
        value: 'Configuration warnings in queue',
        kind: 'status',
      },
      {
        id: 'reviews',
        label: 'Reviews',
        value: 'Pending mapping reviews',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'launch-context-reminder',
        text: 'Launch links open the source system in a new tab.',
      },
    ],
  },
  'control-center-settings': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Settings preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'Project, site, persona, and integration context',
      },
      { id: 'authority', label: 'Authority', value: 'Configuration context only' },
    ],
    surfaceCues: [
      {
        id: 'settings-posture',
        label: 'Focus',
        value: 'Setup posture and inherited configuration context',
      },
      {
        id: 'settings-boundary',
        label: 'Boundary',
        value: 'No setting changes from this header',
      },
    ],
    readOnlyCue:
      'Read-only preview — saving, updating, and tenant changes require governed settings workflows managed by your PCC administrator.',
    heroHighlights: [
      {
        id: 'settings-scope',
        label: 'Settings Scope',
        value: 'Project · site · persona · integrations',
        kind: 'summary',
      },
      {
        id: 'setup-items',
        label: 'Setup Items',
        value: 'Configuration items outstanding',
        kind: 'next-step',
      },
      {
        id: 'governance',
        label: 'Governance',
        value: 'Managed by PCC administrator',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'governed-workflows-reminder',
        text: 'Tenant and project settings are managed through governed workflows.',
      },
    ],
  },
  'site-health': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Site health preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Configuration drift and repair posture' },
      { id: 'authority', label: 'Authority', value: 'Repair context only' },
    ],
    surfaceCues: [
      {
        id: 'health-posture',
        label: 'Focus',
        value: 'Drift, repair posture, and operating health signals',
      },
      {
        id: 'repair-boundary',
        label: 'Boundary',
        value: 'No repair acknowledgement from this header',
      },
    ],
    readOnlyCue: 'Read-only preview — repair acknowledgements require governed source workflows.',
    heroHighlights: [
      {
        id: 'site-health',
        label: 'Site Health',
        value: 'Drift and repair signals',
        kind: 'summary',
      },
      {
        id: 'last-scan',
        label: 'Last Scan',
        value: 'Recent automated check',
        kind: 'status',
      },
      {
        id: 'repair-posture',
        label: 'Repair Posture',
        value: 'Managed through SharePoint admin tooling',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'failing-checks-reminder',
        text: 'Review failing checks before relying on site automation.',
      },
    ],
  },
};
