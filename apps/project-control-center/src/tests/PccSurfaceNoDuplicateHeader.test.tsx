/**
 * PCC no-duplicate-header regression — Phase 05 wave-b10 Prompt 04,
 * tightened by Phase 07 Prompt 02.
 *
 * Locks the post-Phase-07 end state: every routed primary-tab dashboard
 * starts its bento with operational content (not a page-title /
 * description-only restatement of the shell hero), and no card carries
 * a card-level `data-pcc-active-surface-panel` marker (the shell
 * `<main role="tabpanel">` is the sole owner of that marker).
 *
 * The "first operational heading" map identifies the canonical first
 * direct-child card heading per primary tab in the PccApp default
 * render path. Phase 07 Prompt 02 removed the Phase 05-regressed generic
 * Dashboard hero card from the six shared primary-dashboard surfaces, so
 * `core-tools`, `estimating-preconstruction`, `startup-closeout`,
 * `project-controls`, `cost-time`, and `systems-administration` now
 * lead with `Module status`. Project Home and Document Control retain
 * their specialized first cards.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS, type PccPrimaryTabId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { HB_DOCUMENT_CONTROL_CENTER_TITLE } from '../surfaces/documents/documentControlViewModel';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

const FIRST_OPERATIONAL_HEADING: Readonly<Record<PccPrimaryTabId, string>> = {
  'project-home': 'Priority Actions',
  'core-tools': 'Module status',
  documents: 'Document sources unavailable',
  'estimating-preconstruction': 'Module status',
  'startup-closeout': 'Module status',
  'project-controls': 'Module status',
  'cost-time': 'Module status',
  'systems-administration': 'Module status',
};

const REMOVED_HEADER_HEADINGS: readonly string[] = [HB_DOCUMENT_CONTROL_CENTER_TITLE];

afterEach(() => {
  cleanup();
});

describe('PCC primary-tab no-duplicate-header regression (Phase 05 wave-b10 Prompt 04)', () => {
  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`'${tabId}' first direct-child bento card is operational, not a header restatement, and carries no [data-pcc-active-surface-panel]`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const control = getPrimaryTabSelectionControl(container, tabId);
      expect(control, `primary tab '${tabId}' selection control must exist`).not.toBeNull();
      fireEvent.click(control!);

      const panel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${tabId}"]`,
      );
      expect(panel, `primary tab '${tabId}' shell active panel must mount`).not.toBeNull();

      const bento = panel!.querySelector('[data-pcc-bento-grid]');
      expect(bento, `primary tab '${tabId}' bento grid must render`).not.toBeNull();

      const firstCard = bento!.firstElementChild;
      expect(firstCard, `primary tab '${tabId}' bento must have a first child`).not.toBeNull();
      expect(
        firstCard!.hasAttribute('data-pcc-card'),
        `primary tab '${tabId}' first bento child must be a [data-pcc-card]`,
      ).toBe(true);
      expect(
        firstCard!.getAttribute('data-pcc-active-surface-panel'),
        `primary tab '${tabId}' first card must NOT carry [data-pcc-active-surface-panel] (shell-owned only)`,
      ).toBeNull();

      const firstHeading = firstCard!.querySelector('h2, h3, h4');
      expect(
        firstHeading?.textContent?.trim(),
        `primary tab '${tabId}' first card heading must match operational title`,
      ).toBe(FIRST_OPERATIONAL_HEADING[tabId]);

      const bentoHeadings = Array.from(
        bento!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2, h3, h4)'),
      ).map((h) => h.textContent?.trim() ?? '');
      for (const removed of REMOVED_HEADER_HEADINGS) {
        expect(
          bentoHeadings,
          `primary tab '${tabId}' bento must not render '${removed}' as a card heading`,
        ).not.toContain(removed);
      }
    });
  }
});
