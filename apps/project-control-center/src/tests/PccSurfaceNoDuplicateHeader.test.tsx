/**
 * PCC no-duplicate-header regression — Wave 15A wave-b8 Prompt 05.
 *
 * Locks the post-Phase-04B end state: every PCC MVP surface starts its
 * bento with operational content, never with a page-title / description-
 * only restatement of the shell hero. The first direct-child card is
 * matched per-surface by the canonical operational heading already
 * asserted in each surface's existing ready-path test (no invented copy)
 * and is required to carry zero `data-pcc-active-surface-panel` (shell
 * `<main role="tabpanel">` is the sole owner of that marker after Wave
 * 15A wave-b9 Prompts 4B-01 / 4B-05 / 4B-08 / 4B-09 / 4B-10).
 *
 * The test also asserts that the deleted Documents header title is not
 * rendered as a bento heading on any surface. Other deleted-header
 * regressions are protected by the per-surface ready-path tests; this
 * file consolidates the cross-surface contract.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { HB_DOCUMENT_CONTROL_CENTER_TITLE } from '../surfaces/documents/documentControlViewModel';
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

// First-direct-child card heading per surface in the PccApp default
// render. Each value is the `<PccDashboardCard title>` actually rendered
// when the shell mounts without an injected read-model client (the
// deterministic shell-rendered path covered by every shell-level
// contract test in this suite). Documents and External Systems use the
// PccApp default state-card title because PccApp does not wire those
// surfaces' read-model clients in test renders; both titles are
// canonical state-card titles, not duplicate-header restatements:
//   project-home              -> PccPriorityActionsCard.tsx:33
//   team-and-access           -> PccTeamViewerLaneCard.tsx:20
//   documents                 -> PccDocumentControlStateCard.tsx STATE_SPECS (sources-unavailable kind)
//   project-readiness         -> PccProjectReadinessSurface.tsx:574 (LifecycleGateMapCard)
//   approvals                 -> PccApprovalsSurface.tsx:365 (Approval queue)
//   external-systems          -> PccExternalSystemsLaunchPadSummaryCard.tsx:22
//   control-center-settings   -> PccControlCenterSettingsSurface.tsx:26
//   site-health               -> PccSiteHealthChecksCard.tsx:121
const FIRST_OPERATIONAL_HEADING: Readonly<Record<PccMvpSurfaceId, string>> = {
  'project-home': 'Priority Actions',
  'team-and-access': 'Project Team Map',
  documents: 'Document sources unavailable',
  'project-readiness': 'Project lifecycle map',
  approvals: 'Approval queue',
  'external-systems': 'Launch Pad summary',
  'control-center-settings': 'Project / Site / Persona / Integration Scope',
  'site-health': 'Site Health Checks',
};

// Headings that lived on deleted page-intro / header / overview cards
// and must not reappear as bento card headings on any surface. Only the
// canonical Documents constant is enumerated here; the other removed
// headings are covered by per-surface ready-path tests already in the
// suite.
const REMOVED_HEADER_HEADINGS: readonly string[] = [HB_DOCUMENT_CONTROL_CENTER_TITLE];

afterEach(() => {
  // Surface tests in this workspace run with `globals: false`; explicit
  // cleanup keeps PccApp portal/host renders from leaking across cases.
  cleanup();
});

describe('PCC surface no-duplicate-header regression (Wave 15A wave-b8 Prompt 05)', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}' first direct-child bento card is operational, not a header restatement, and carries no [data-pcc-active-surface-panel]`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const control = getSurfaceSelectionControl(container, surfaceId);
      expect(control, `surface '${surfaceId}' selection control must exist`).not.toBeNull();
      fireEvent.click(control!);

      const panel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
      );
      expect(panel, `surface '${surfaceId}' shell active panel must mount`).not.toBeNull();

      const bento = panel!.querySelector('[data-pcc-bento-grid]');
      expect(bento, `surface '${surfaceId}' bento grid must render`).not.toBeNull();

      const firstCard = bento!.firstElementChild;
      expect(firstCard, `surface '${surfaceId}' bento must have a first child`).not.toBeNull();
      expect(
        firstCard!.hasAttribute('data-pcc-card'),
        `surface '${surfaceId}' first bento child must be a [data-pcc-card]`,
      ).toBe(true);
      expect(
        firstCard!.getAttribute('data-pcc-active-surface-panel'),
        `surface '${surfaceId}' first card must NOT carry [data-pcc-active-surface-panel] (shell-owned only)`,
      ).toBeNull();

      const firstHeading = firstCard!.querySelector('h2, h3, h4');
      expect(
        firstHeading?.textContent?.trim(),
        `surface '${surfaceId}' first card heading must match operational title`,
      ).toBe(FIRST_OPERATIONAL_HEADING[surfaceId]);

      const bentoHeadings = Array.from(
        bento!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2, h3, h4)'),
      ).map((h) => h.textContent?.trim() ?? '');
      for (const removed of REMOVED_HEADER_HEADINGS) {
        expect(
          bentoHeadings,
          `surface '${surfaceId}' bento must not render '${removed}' as a card heading`,
        ).not.toContain(removed);
      }
    });
  }
});
