/**
 * Phase 07 Prompt 01 — anti-regression test for the Phase 05 redundant
 * top-level Dashboard/title-description bento card on the six shared
 * primary-dashboard surfaces.
 *
 * Today, `PccPrimaryDashboardSurface` emits a first direct bento child
 * card with `eyebrow="Dashboard"`, `title={tab.dashboardTitle}`, and a body
 * containing `tab.dashboardDescription` for every primary tab routed
 * through it. Phase 07 Prompt 02 will remove that card and surface the
 * Module status card first.
 *
 * This focused suite is intentionally test-first: it FAILS against the
 * current source on the first-card-heading and duplicate-header-card
 * patterns. Prompt 02's removal of the redundant card flips it green.
 *
 * Scope is strictly the six shared primary-dashboard tabs. `project-home`
 * (owned by Project Home composition / read-model / gateway tests) and
 * `documents` (owned by `PccDocumentsSurface`) are intentionally excluded.
 *
 * Stable DOM markers only — no CSS module class selectors.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { getPrimaryNavigationTab, type PccPrimaryTabId } from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';

type PccDashboardPrimaryTabId = Exclude<PccPrimaryTabId, 'project-home' | 'documents'>;

const SURFACES_UNDER_TEST: readonly PccDashboardPrimaryTabId[] = [
  'core-tools',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
];

const FORBIDDEN_FIRST_CARD_HEADINGS: readonly string[] = [
  'Dashboard',
  'Core Tools',
  'Estimating & Preconstruction',
  'Project Startup & Closeout',
  'Project Controls',
  'Cost & Time',
  'Systems Administration',
];

// Bounded developer/internal-copy vocabulary aligned with the Phase 07
// Prompt 01 specification. End-user-legitimate PCC cues such as `sample`,
// `preview`, and `source` are deliberately NOT included.
const FORBIDDEN_DEV_COPY_TERMS: readonly string[] = [
  'todo',
  'tbd',
  'placeholder',
  'stub',
  'mock',
  'fixture',
  'debug',
  'dev-only',
  'not implemented',
  'lorem',
  'developer',
  'code agent',
  'prompt',
  'repo',
  'test selector',
  'internal only',
  'coming soon',
];

function getGrid(container: HTMLElement): HTMLElement {
  const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]');
  if (!grid) {
    throw new Error('No [data-pcc-bento-grid] found in render output');
  }
  return grid;
}

function getDirectChildCards(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
  );
}

function getDirectChildHtmlElements(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

function getCardHeading(card: HTMLElement): string {
  return card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '';
}

function matchesDuplicateHeaderPattern(
  card: HTMLElement,
  dashboardTitle: string,
  dashboardDescription: string,
): boolean {
  return (
    getCardHeading(card) === dashboardTitle &&
    (card.textContent ?? '').includes(dashboardDescription) &&
    card.getAttribute('data-pcc-footprint') === 'hero' &&
    card.getAttribute('data-pcc-card-hierarchy') === 'primary' &&
    card.getAttribute('data-pcc-card-tier') === 'tier1' &&
    card.getAttribute('data-pcc-card-region') === 'command'
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

afterEach(() => {
  cleanup();
});

describe('PCC Phase 07 — no redundant shared-dashboard header cards', () => {
  it.each(SURFACES_UNDER_TEST)(
    "'%s' shared primary dashboard does not render a redundant Dashboard/title-description hero card",
    (tabId) => {
      const { container } = render(
        <PccBentoGrid forceMode="desktop">
          <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
        </PccBentoGrid>,
      );
      const grid = getGrid(container);

      // (1) Direct-child structure — scoped to this active test grid only.
      const directChildren = getDirectChildHtmlElements(grid);
      for (const child of directChildren) {
        expect(
          child.hasAttribute('data-pcc-card'),
          `tab '${tabId}': every direct child of [data-pcc-bento-grid] must be a [data-pcc-card]`,
        ).toBe(true);
      }

      const cards = getDirectChildCards(grid);
      expect(
        cards.length,
        `tab '${tabId}': bento grid must have at least one direct [data-pcc-card] child`,
      ).toBeGreaterThanOrEqual(1);

      expect(
        grid.querySelectorAll('[data-pcc-card] [data-pcc-card]').length,
        `tab '${tabId}': bento grid must have zero nested cards`,
      ).toBe(0);

      expect(
        grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]').length,
        `tab '${tabId}': bento grid must have zero card-level [data-pcc-active-surface-panel] markers (shell owns the active panel)`,
      ).toBe(0);

      // (2) First-card target posture — primary assertion. Fails today
      // because the generic Dashboard hero card is still emitted first.
      const firstCard = cards[0];
      if (!firstCard) {
        throw new Error(`tab '${tabId}': no first card present`);
      }
      const firstHeading = getCardHeading(firstCard);
      expect(
        firstHeading,
        `tab '${tabId}': first direct card heading must be "Module status" (post-Prompt-02 target)`,
      ).toBe('Module status');
      expect(
        FORBIDDEN_FIRST_CARD_HEADINGS,
        `tab '${tabId}': first direct card heading must not be a surface-identity title (actual: "${firstHeading}")`,
      ).not.toContain(firstHeading);

      // (3) Duplicate header-card pattern absent — primary anti-regression
      // assertion. Fails today on the redundant Dashboard hero card.
      const tab = getPrimaryNavigationTab(tabId);
      const duplicateHeaderCard = cards.find((card) =>
        matchesDuplicateHeaderPattern(card, tab.dashboardTitle, tab.dashboardDescription),
      );
      expect(
        duplicateHeaderCard,
        `tab '${tabId}': a direct child card still matches the duplicate Dashboard/title-description hero pattern (heading "${tab.dashboardTitle}", footprint=hero, hierarchy=primary, tier=tier1, region=command)`,
      ).toBeUndefined();

      // (4) No developer/internal UI copy — scoped to this grid's text.
      const renderedText = (grid.textContent ?? '').toLowerCase();
      for (const term of FORBIDDEN_DEV_COPY_TERMS) {
        const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`);
        expect(
          pattern.test(renderedText),
          `tab '${tabId}': forbidden developer/internal copy term "${term}" appears in rendered grid text`,
        ).toBe(false);
      }
    },
  );
});
