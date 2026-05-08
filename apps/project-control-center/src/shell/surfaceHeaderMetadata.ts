import type { PccMvpSurfaceId } from '@hbc/models/pcc';

/**
 * PCC shell surface header metadata seam — Wave 15A wave-b7 Prompt 02.
 *
 * Deterministic, typed, read-only metadata that lets the shell hero begin
 * absorbing duplicate surface-header content without altering bento header
 * cards. Inert at render time: every value is a presentational string and
 * no entry implies live counts, writeback authority, or autonomous HBI
 * decisions. Keyed exhaustively over `PccMvpSurfaceId` so a new surface
 * cannot land without supplying compact preview metadata.
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

export interface IPccShellSurfaceHeaderMetadata {
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
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
    ],
    readOnlyCue: 'Read-only preview — readiness actions remain governed by source modules.',
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
    ],
    readOnlyCue: 'Read-only preview — external platform actions remain outside this header.',
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
    readOnlyCue: 'Read-only preview — configuration changes require governed settings workflows.',
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
  },
};
