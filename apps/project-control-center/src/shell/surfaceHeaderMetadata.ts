import type { PccPrimaryTabId } from '@hbc/models/pcc';

/**
 * PCC shell surface header metadata seam.
 *
 * Phase 05 wave-b10 Prompt 06 — re-keyed to `PccPrimaryTabId`. Two
 * legacy keys carry forward (`project-home`, `documents`); six new
 * primary-tab entries (`core-tools`, `estimating-preconstruction`,
 * `startup-closeout`, `project-controls`, `cost-time`,
 * `systems-administration`) replace the legacy six (`team-and-access`,
 * `project-readiness`, `approvals`, `external-systems`,
 * `control-center-settings`, `site-health`). The legacy surface
 * components remain on disk and are reachable through the Phase 05
 * module dropdowns; their hero metadata moves into the parent primary
 * tab's posture.
 *
 * Every value is a deterministic, presentational string. No entry
 * implies live counts, writeback authority, or autonomous HBI
 * decisions. The hero band renders `heroHighlights` and
 * `governanceMicrocopy` as primary visible content; the legacy
 * `surfaceSummaryItems` / `surfaceCues` / `readOnlyCue` fields stay
 * populated to anchor source / authority / no-writeback governance
 * assertions in tests.
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
  Record<PccPrimaryTabId, IPccShellSurfaceHeaderMetadata>
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
  'core-tools': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Core Tools preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Cross-cutting project tools posture' },
      { id: 'authority', label: 'Authority', value: 'Advisory only — no decisions, no writeback' },
    ],
    surfaceCues: [
      {
        id: 'core-tools-posture',
        label: 'Focus',
        value: 'Assistance, access, directory, platforms, and checkpoints',
      },
      { id: 'hbi-boundary', label: 'HBI', value: 'Advisory only, no decisions or approvals' },
    ],
    readOnlyCue:
      'Read-only preview — HBI is advisory; PCC does not make decisions, provide approval authority, or write back to source systems from this header.',
    heroHighlights: [
      {
        id: 'hbi-assistant',
        label: 'HBI Assistant',
        value: 'Advisory context for the active project',
        kind: 'summary',
      },
      {
        id: 'team-access',
        label: 'Team & Access',
        value: 'Project team and access posture',
        kind: 'status',
      },
      {
        id: 'approvals-checkpoints',
        label: 'Approvals & Checkpoints',
        value: 'Checkpoint context only',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'hbi-no-authority',
        text: 'HBI Assistant is advisory only; it does not make decisions, provide approval authority, or write back to source systems.',
      },
    ],
  },
  documents: {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Document Control preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'Project Record · OneDrive · external references',
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
    readOnlyCue:
      'Read-only preview — no uploads, moves, deletes, or external launches from this header.',
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
  'estimating-preconstruction': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Preconstruction continuity preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Estimating handoff and continuity posture' },
      { id: 'authority', label: 'Authority', value: 'Reference only' },
    ],
    surfaceCues: [
      {
        id: 'continuity-posture',
        label: 'Focus',
        value: 'Handoff context, assumptions, alternates, and exclusions',
      },
      { id: 'reference-only', label: 'Boundary', value: 'No estimating actions from this header' },
    ],
    readOnlyCue: 'Read-only preview — preconstruction continuity is reference-only in this phase.',
    heroHighlights: [
      {
        id: 'preconstruction-handoff',
        label: 'Preconstruction Handoff',
        value: 'Continuity context for the active project',
        kind: 'summary',
      },
      {
        id: 'estimate-assumptions',
        label: 'Assumptions / Alternates / Exclusions',
        value: 'Estimate-stage references',
        kind: 'reminder',
      },
      {
        id: 'future-estimating',
        label: 'Future Estimating Modules',
        value: 'Planned for a future release',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'reference-only-reminder',
        text: 'Estimating continuity is reference-only; no estimating actions occur in this header.',
      },
    ],
  },
  'startup-closeout': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Startup & Closeout preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Readiness, responsibility, and closeout posture' },
      { id: 'authority', label: 'Authority', value: 'Context only' },
    ],
    surfaceCues: [
      {
        id: 'startup-closeout-posture',
        label: 'Focus',
        value: 'Startup readiness, responsibilities, turnover, and warranty',
      },
      { id: 'no-action', label: 'Boundary', value: 'No execution from this header' },
    ],
    readOnlyCue:
      'Read-only preview — readiness and closeout signals are context only; source modules own actions.',
    heroHighlights: [
      {
        id: 'startup-center',
        label: 'Startup Center',
        value: 'Readiness onboarding context',
        kind: 'summary',
      },
      {
        id: 'responsibility-matrix',
        label: 'Responsibility Matrix',
        value: 'Assignment and responsibility posture',
        kind: 'status',
      },
      {
        id: 'closeout-warranty',
        label: 'Closeout / Warranty',
        value: 'Closeout, turnover, and warranty signals',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'source-modules-own-actions',
        text: 'Closeout and warranty actions remain in their source modules.',
      },
    ],
  },
  'project-controls': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Project Controls preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'Permits, inspections, constraints, and field posture',
      },
      { id: 'authority', label: 'Authority', value: 'Read-only context' },
    ],
    surfaceCues: [
      {
        id: 'controls-posture',
        label: 'Focus',
        value: 'Permits, inspections, constraints, compliance, and communication',
      },
      {
        id: 'source-workflows',
        label: 'Boundary',
        value: 'Source workflows own permit and inspection actions',
      },
    ],
    readOnlyCue:
      'Read-only preview — controls context is read-only; source workflows own permit, inspection, and compliance actions.',
    heroHighlights: [
      {
        id: 'permits-inspections',
        label: 'Permits & Inspections',
        value: 'Permit and inspection control context',
        kind: 'summary',
      },
      {
        id: 'constraints-log',
        label: 'Constraints Log',
        value: 'Active constraints and exposure',
        kind: 'status',
      },
      {
        id: 'risk-field-comms',
        label: 'Risk · Field · Communications',
        value: 'Cross-controls coordination context',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'source-workflows-own',
        text: 'Permit, inspection, and compliance actions remain in their source workflows.',
      },
    ],
  },
  'cost-time': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Cost & Time preview', tone: 'info' },
      {
        id: 'source',
        label: 'Source',
        value: 'Financial, schedule, procurement, and exposure posture',
      },
      { id: 'authority', label: 'Authority', value: 'Review only — no writeback to Sage' },
    ],
    surfaceCues: [
      {
        id: 'cost-time-posture',
        label: 'Focus',
        value: 'Financial review, schedule, procurement, buyout, and exposure context',
      },
      {
        id: 'sage-book-of-record',
        label: 'Boundary',
        value: 'Sage remains the accounting book of record',
      },
    ],
    readOnlyCue:
      'Read-only preview — Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.',
    heroHighlights: [
      {
        id: 'financial-review',
        label: 'Financial Review',
        value: 'Project financial posture for review only',
        kind: 'summary',
      },
      {
        id: 'schedule-monitor',
        label: 'Schedule Monitor',
        value: 'Schedule posture and risk context',
        kind: 'status',
      },
      {
        id: 'procurement-buyout',
        label: 'Procurement & Buyout',
        value: 'Procurement and buyout review context',
        kind: 'next-step',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'sage-no-writeback',
        text: 'Sage remains the accounting book of record; PCC does not write back to Sage.',
      },
    ],
  },
  'systems-administration': {
    surfaceSummaryItems: [
      { id: 'mode', label: 'Mode', value: 'Systems Administration preview', tone: 'info' },
      { id: 'source', label: 'Source', value: 'Site health, settings, and integration posture' },
      { id: 'authority', label: 'Authority', value: 'Administrative context only' },
    ],
    surfaceCues: [
      {
        id: 'admin-posture',
        label: 'Focus',
        value: 'Site health, settings, integration, and module configuration',
      },
      {
        id: 'governed-settings',
        label: 'Boundary',
        value: 'Settings changes remain in governed administrator workflows',
      },
    ],
    readOnlyCue:
      'Read-only preview — administrative context only; settings, integration, and tenant changes remain in governed administrator workflows.',
    heroHighlights: [
      {
        id: 'site-health',
        label: 'Site Health',
        value: 'Drift and repair posture',
        kind: 'summary',
      },
      {
        id: 'control-center-settings',
        label: 'Control Center Settings',
        value: 'Site, project, persona, and integration scope',
        kind: 'status',
      },
      {
        id: 'integration-procore-mapping',
        label: 'Integration · Procore Mapping',
        value: 'Source-system mapping and sync-health context',
        kind: 'reminder',
      },
    ],
    governanceMicrocopy: [
      { id: 'read-only', text: 'Read-only preview' },
      {
        id: 'governed-administrator',
        text: 'Settings, integration, and tenant changes are managed through governed administrator workflows.',
      },
    ],
  },
};
