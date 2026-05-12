/**
 * PCC Document Control Project Home summary feed fixtures.
 *
 * Phase 08 / Prompt 09A.
 *
 * Scope guardrails:
 * - Summary-feed contract for Project Home only.
 * - Does not replace the dedicated Documents surface source registry model.
 * - Row-level deep links are intentionally deferred to a later phase after
 *   canonical SharePoint/OneDrive/Procore path resolution and auth gate
 *   approval.
 * - `permissionPosture` is display/read-model metadata only, not a runtime
 *   authorization decision.
 */

import type { IPccDocumentControlHomeFeed } from '../DocumentControl.js';

/**
 * Approved Project Home summary-feed item universe (MVP):
 * Documents/files, Drawings, Specifications, RFIs, Submittals, Change Orders,
 * Commitments, Change Events, Inspections, Observations, Punch List.
 *
 * Top-five arrays below are intentionally concise previews and do not need to
 * include every kind in a single list.
 */
export const SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED: IPccDocumentControlHomeFeed = {
  myRecentFiles: [
    {
      id: 'dc-home-recent-005',
      title: 'Permit Matrix - Level 2.pdf',
      source: 'sharepoint',
      kind: 'file',
      contextLabel: 'Project Record / Permitting',
      accessedAtUtc: '2026-04-30T16:45:00Z',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-recent-004',
      title: 'Facade Shop Drawings Rev C',
      source: 'procore',
      kind: 'drawing',
      contextLabel: 'Procore Drawings / Building Envelope',
      accessedAtUtc: '2026-04-30T15:10:00Z',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-recent-003',
      title: 'MEP Coordination Notes.docx',
      source: 'onedrive',
      kind: 'file',
      contextLabel: 'My Project Files / Coordination',
      accessedAtUtc: '2026-04-30T13:20:00Z',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-recent-002',
      title: 'RFI-214 Curtainwall Anchor Clarification',
      source: 'procore',
      kind: 'rfi',
      contextLabel: 'Procore RFIs / Exterior',
      accessedAtUtc: '2026-04-30T11:05:00Z',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-recent-001',
      title: 'Closeout Deliverables Checklist.xlsx',
      source: 'sharepoint',
      kind: 'file',
      contextLabel: 'Project Record / Closeout',
      accessedAtUtc: '2026-04-30T09:00:00Z',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
  ],
  latestChanges: [
    {
      id: 'dc-home-change-005',
      title: 'Submittal 06 41 00-019 Resubmission',
      source: 'procore',
      kind: 'submittal',
      contextLabel: 'Procore Submittals / Architectural Woodwork',
      changedAtUtc: '2026-04-30T17:15:00Z',
      changeKind: 'updated',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-change-004',
      title: 'Specification 26 05 19 - Low-Voltage Conductors',
      source: 'procore',
      kind: 'specification',
      contextLabel: 'Procore Specifications / Electrical',
      changedAtUtc: '2026-04-30T14:40:00Z',
      changeKind: 'updated',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-change-003',
      title: 'Budget Commitment CO-043',
      source: 'procore',
      kind: 'commitment',
      contextLabel: 'Procore Commitments / Interiors',
      changedAtUtc: '2026-04-30T12:25:00Z',
      changeKind: 'added',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-change-002',
      title: 'Owner Change Order Bulletin 07',
      source: 'procore',
      kind: 'change-order',
      contextLabel: 'Procore Change Orders / Owner',
      changedAtUtc: '2026-04-30T10:50:00Z',
      changeKind: 'updated',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
    {
      id: 'dc-home-change-001',
      title: 'Site Safety Observation 118',
      source: 'procore',
      kind: 'observation',
      contextLabel: 'Procore Observations / Safety',
      changedAtUtc: '2026-04-30T08:35:00Z',
      changeKind: 'added',
      deepLinkPosture: 'preview-only',
      permissionPosture: 'viewer-authorized-preview',
    },
  ],
};

export const EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED: IPccDocumentControlHomeFeed = {
  myRecentFiles: [],
  latestChanges: [],
};
