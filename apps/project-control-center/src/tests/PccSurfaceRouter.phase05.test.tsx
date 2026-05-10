import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import {
  PCC_PRIMARY_TAB_IDS,
  getModule,
  type PccModuleId,
  type PccPrimaryTabId,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccSurfaceRouter } from '../shell/PccSurfaceRouter';

afterEach(() => {
  cleanup();
});

const FORBIDDEN_DEVELOPER_TERMS: readonly string[] = [
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
];
const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FORBIDDEN_TERM_PATTERNS = FORBIDDEN_DEVELOPER_TERMS.map((term) => ({
  term,
  pattern: new RegExp(`\\b${escapeRegex(term)}\\b`, 'i'),
}));

const NEW_DASHBOARD_PRIMARY_TABS: readonly PccPrimaryTabId[] = [
  'core-tools',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
];

function renderRouter(activePrimaryTabId: PccPrimaryTabId, activeModuleId?: PccModuleId) {
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccSurfaceRouter activePrimaryTabId={activePrimaryTabId} activeModuleId={activeModuleId} />
    </PccBentoGrid>,
  );
}

function getDirectChildCards(container: HTMLElement): HTMLElement[] {
  const grid = container.querySelector('[data-pcc-bento-grid]');
  if (!grid) return [];
  return Array.from(grid.children).filter((child) =>
    child.matches('[data-pcc-card]'),
  ) as HTMLElement[];
}

describe('PccSurfaceRouter — Phase 05 primary-tab routing', () => {
  it('renders at least one direct-child card for each primary tab', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const { container } = renderRouter(tabId);
      const cards = getDirectChildCards(container);
      expect(
        cards.length,
        `primary tab '${tabId}' must render at least one direct bento child`,
      ).toBeGreaterThan(0);
      cleanup();
    }
  });

  it('routes project-home to the existing PccProjectHome bento dashboard', () => {
    const { container } = renderRouter('project-home');
    const cards = getDirectChildCards(container);
    expect(cards.length).toBeGreaterThan(1);
    expect(container.textContent).toContain('Priority Actions');
  });

  it('routes documents to the existing PccDocumentsSurface bento dashboard', () => {
    const { container } = renderRouter('documents');
    const cards = getDirectChildCards(container);
    expect(cards.length).toBeGreaterThan(1);
  });
});

describe('PccSurfaceRouter — Phase 05 reusable PccPrimaryDashboardSurface', () => {
  for (const tabId of NEW_DASHBOARD_PRIMARY_TABS) {
    it(`'${tabId}' renders the three Phase 05 dashboard cards as direct bento children`, () => {
      const { container } = renderRouter(tabId);
      const cards = getDirectChildCards(container);
      expect(cards.length).toBe(3);
      // No nested cards — every card is at the top level.
      expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    });
  }

  it('selected-module card title reads "Select a module" when activeModuleId is undefined', () => {
    const { container } = renderRouter('core-tools');
    expect(container.textContent).toContain('Select a module');
  });

  it('selected-module card title equals the module label when activeModuleId belongs to the active primary tab', () => {
    const { container } = renderRouter('core-tools', 'team-access');
    const expected = getModule('team-access').label;
    expect(container.textContent).toContain(expected);
    // Active-module body shows the module's authority cue.
    expect(container.textContent).toContain(getModule('team-access').authorityCue);
  });

  it('selected-module card title falls back to "Select a module" when activeModuleId belongs to a different primary tab', () => {
    // 'document-control-center' belongs to 'documents', not 'core-tools'.
    const { container } = renderRouter('core-tools', 'document-control-center');
    const headings = Array.from(container.querySelectorAll('h2, h3, h4')).map(
      (h) => h.textContent?.trim() ?? '',
    );
    expect(headings).toContain('Select a module');
    // The unrelated module's label must NOT appear as a card heading.
    expect(headings).not.toContain(getModule('document-control-center').label);
  });

  it('renders no forbidden developer copy across any new dashboard', () => {
    for (const tabId of NEW_DASHBOARD_PRIMARY_TABS) {
      const { container } = renderRouter(tabId);
      const text = container.textContent ?? '';
      for (const { term, pattern } of FORBIDDEN_TERM_PATTERNS) {
        expect(
          pattern.test(text),
          `dashboard '${tabId}' must not render forbidden term '${term}'`,
        ).toBe(false);
      }
      cleanup();
    }
  });
});
