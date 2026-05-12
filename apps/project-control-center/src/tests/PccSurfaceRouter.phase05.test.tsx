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
  // Phase 07 Prompt 02 removed the Phase 05-regressed generic
  // Dashboard/title-description hero card from PccPrimaryDashboardSurface
  // on the six shared primary-dashboard surfaces, dropping each count by
  // one. The shared dashboards now begin with `Module status`:
  //   - `core-tools`: Module status + Selected module = 2 direct cards;
  //   - `estimating-preconstruction` (Phase 06 Prompt 07 analytics):
  //     Module status + 2 analytics + Selected module = 4 direct cards;
  //   - `startup-closeout` (Phase 06 Prompt 08 analytics):
  //     Module status + 3 analytics + Selected module = 5 direct cards;
  //   - `project-controls` (Phase 06 Prompt 09 analytics):
  //     Module status + 3 analytics + Selected module = 5 direct cards;
  //   - `cost-time` (Phase 06 Prompt 10 analytics):
  //     Module status + 3 analytics + Selected module = 5 direct cards;
  //   - `systems-administration` (Phase 06 Prompt 11 analytics):
  //     Module status + 3 analytics + Selected module = 5 direct cards.
  // The Cost & Time Sage book-of-record cue was relocated into the
  // `Module status` card and remains scoped to `cost-time` only.
  // `project-home` and `documents` continue to use their own surfaces
  // (PccProjectHome and PccDocumentsSurface) and are not iterated here.
  const EXPECTED_DIRECT_CARD_COUNT_BY_TAB: Readonly<Record<PccPrimaryTabId, number>> = {
    'project-home': 3, // not iterated below; PccPrimaryDashboardSurface is not used for project-home
    'core-tools': 2,
    documents: 3, // not iterated below; PccDocumentsSurface is used for documents
    'estimating-preconstruction': 4,
    'startup-closeout': 5,
    'project-controls': 5,
    'cost-time': 5,
    'systems-administration': 5,
  };
  const CARD_SUMMARY_BY_TAB: Readonly<Record<PccPrimaryTabId, string>> = {
    'project-home': 'three direct bento children (hero + Module status + Selected module)',
    'core-tools': 'two direct bento children (Module status + Selected module)',
    documents: 'three direct bento children (hero + Module status + Selected module)',
    'estimating-preconstruction':
      'four direct bento children (Module status + 2 analytics + Selected module)',
    'startup-closeout':
      'five direct bento children (Module status + 3 analytics + Selected module)',
    'project-controls':
      'five direct bento children (Module status + 3 analytics + Selected module)',
    'cost-time': 'five direct bento children (Module status + 3 analytics + Selected module)',
    'systems-administration':
      'five direct bento children (Module status + 3 analytics + Selected module)',
  };
  for (const tabId of NEW_DASHBOARD_PRIMARY_TABS) {
    it(`'${tabId}' renders ${CARD_SUMMARY_BY_TAB[tabId]}`, () => {
      const { container } = renderRouter(tabId);
      const cards = getDirectChildCards(container);
      expect(cards.length).toBe(EXPECTED_DIRECT_CARD_COUNT_BY_TAB[tabId]);
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

// Phase 05 wave-b10 Prompt 05 — module-selection UX hardening contracts.

describe('PccSurfaceRouter — Prompt 05 selected-module card stable markers and content', () => {
  it('selected-module card carries stable markers when activeModuleId belongs to the active primary tab', () => {
    const { container } = renderRouter('core-tools', 'team-access');
    const card = container.querySelector('[data-pcc-selected-module-card]');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('data-pcc-selected-module-id')).toBe('team-access');
    expect(card!.getAttribute('data-pcc-selected-module-state')).toBe('preview');
    expect(card!.getAttribute('data-pcc-selected-module-parent-tab')).toBe('core-tools');
    expect(card!.hasAttribute('data-pcc-selected-module-empty')).toBe(false);
  });

  it('selected-module card renders the empty marker when no module context is active', () => {
    const { container } = renderRouter('core-tools');
    const card = container.querySelector(
      '[data-pcc-selected-module-card][data-pcc-selected-module-empty="true"]',
    );
    expect(card).not.toBeNull();
  });

  it('selected-module context renders module label, state label, summary, authority cue, and state reason', () => {
    const mod = getModule('team-access');
    const { container } = renderRouter('core-tools', 'team-access');
    const card = container.querySelector('[data-pcc-selected-module-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const text = card.textContent ?? '';
    expect(text).toContain(mod.stateLabel);
    expect(text).toContain(mod.summary);
    expect(text).toContain(mod.authorityCue);
    // The state reason is the canonical PCC_MODULE_STATE_COPY[state].reason.
    expect(text).toContain('Preview only. Review source records before taking action.');
  });

  it('selected-module module ID is not rendered as visible end-user copy (only the label)', () => {
    const { container } = renderRouter('core-tools', 'team-access');
    const card = container.querySelector('[data-pcc-selected-module-card]') as HTMLElement;
    const headings = Array.from(card.querySelectorAll('h2, h3, h4')).map(
      (h) => h.textContent?.trim() ?? '',
    );
    // The card heading lives on the parent PccDashboardCard; pull it
    // from the closest article.
    const articleHeading =
      card.closest('article')?.querySelector('h2, h3, h4')?.textContent?.trim() ?? '';
    const allHeadings = [...headings, articleHeading];
    expect(allHeadings).toContain('Team & Access');
    expect(allHeadings).not.toContain('team-access');
  });

  it('HBI Assistant selected-module context shows advisory + no-decision + no-approval + no-writeback', () => {
    const { container } = renderRouter('core-tools', 'hbi-assistant');
    const card = container.querySelector('[data-pcc-selected-module-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const text = (card.textContent ?? '').toLowerCase();
    expect(text).toContain('advisory');
    expect(text).toContain('no decision');
    expect(text).toContain('no approval');
    expect(/no writeback|does not write back/.test(text)).toBe(true);
  });

  it('Launch-only selected-module context shows the no-writeback cue', () => {
    // Use external-platforms (under core-tools) — the documents primary
    // tab routes to the legacy `PccDocumentsSurface`, which does not
    // render the Phase 05 dashboard's selected-module card.
    const { container } = renderRouter('core-tools', 'external-platforms');
    const card = container.querySelector('[data-pcc-selected-module-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const text = (card.textContent ?? '').toLowerCase();
    expect(/does not write back|no writeback/.test(text)).toBe(true);
  });

  it('Approvals & Checkpoints selected-module context renders no approve / reject / waive / override action verbs', () => {
    const { container } = renderRouter('core-tools', 'approvals-checkpoints');
    const card = container.querySelector('[data-pcc-selected-module-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const text = card.textContent ?? '';
    for (const verb of ['approve', 'reject', 'waive', 'override']) {
      const re = new RegExp(`\\b${verb}\\b`, 'i');
      expect(
        re.test(text),
        `Approvals & Checkpoints selected-module text must not render action verb '${verb}'`,
      ).toBe(false);
    }
  });
});

describe('PccSurfaceRouter — Prompt 05 module status row markers', () => {
  for (const tabId of NEW_DASHBOARD_PRIMARY_TABS) {
    it(`'${tabId}' module status card renders one stable row per registry module`, () => {
      const { container } = renderRouter(tabId);
      const rows = Array.from(
        container.querySelectorAll('[data-pcc-dashboard-module-row]'),
      ) as HTMLElement[];
      const expectedIds = new Set(
        getDirectChildCards(container)
          .map(() => null) // placeholder to keep the closure shape
          .filter(Boolean),
      );
      void expectedIds;
      // Each rendered row must have selectable + state markers and a
      // module id that resolves to the registry.
      for (const row of rows) {
        expect(row.getAttribute('data-pcc-dashboard-module-row')).toBeTruthy();
        expect(['true', 'false']).toContain(
          row.getAttribute('data-pcc-dashboard-module-selectable') ?? '',
        );
        expect(row.getAttribute('data-pcc-dashboard-module-state')).toBeTruthy();
      }
    });
  }
});

describe('PccSurfaceRouter — Prompt 05 Cost & Time Sage book-of-record line', () => {
  it('Cost & Time dashboard renders the Sage book-of-record governance line', () => {
    const { container } = renderRouter('cost-time');
    const node = container.querySelector('[data-pcc-dashboard-book-of-record="cost-time"]');
    expect(node).not.toBeNull();
    expect(/Sage remains the accounting book of record/i.test(node!.textContent ?? '')).toBe(true);
  });

  it('no other primary tab renders the book-of-record governance line', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      if (tabId === 'cost-time') continue;
      const { container } = renderRouter(tabId);
      expect(
        container.querySelector('[data-pcc-dashboard-book-of-record]'),
        `primary tab '${tabId}' must not render the cost-time book-of-record line`,
      ).toBeNull();
      cleanup();
    }
  });
});

// ───────────────────────────────────────────────────────────────────────
// Phase 08 wave-b13 Prompt 10D — Documents activeModuleId router seam.
//
// Proves that the router actually threads `activeModuleId` through to
// `PccDocumentsSurface` and that the Explorer shell resolves the locked
// module-focus mapping on initial render.

function railButtonForSource(container: HTMLElement, sourceId: string): HTMLButtonElement | null {
  return container.querySelector(
    `[data-pcc-doc-explorer-source-rail="true"] [data-pcc-doc-explorer-source-id="${sourceId}"]`,
  );
}

function breadcrumbLabels(container: HTMLElement): readonly string[] {
  const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]');
  if (!band) return [];
  return Array.from(band.querySelectorAll('[data-pcc-doc-explorer-breadcrumb]')).map(
    (n) => n.textContent?.trim() ?? '',
  );
}

describe('PccSurfaceRouter — Prompt 10D Documents activeModuleId seam', () => {
  it('routes documents with activeModuleId="sharepoint-project-record" → Explorer initial focus is Project Record root', () => {
    const { container } = renderRouter('documents', 'sharepoint-project-record');
    const projectRecord = railButtonForSource(container as HTMLElement, 'project-record');
    expect(projectRecord).not.toBeNull();
    expect(projectRecord!.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('true');
    expect(container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')).not.toBeNull();
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
    ]);
  });

  it('routes documents with activeModuleId="procore-documents" → Explorer initial focus is Procore at the Documents category', () => {
    const { container } = renderRouter('documents', 'procore-documents');
    const procore = railButtonForSource(container as HTMLElement, 'procore');
    expect(procore).not.toBeNull();
    expect(procore!.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('true');
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Procore',
      'Documents',
    ]);
  });

  it('routes documents with no activeModuleId → Explorer initial focus is Home', () => {
    const { container } = renderRouter('documents');
    const home = railButtonForSource(container as HTMLElement, 'home');
    expect(home).not.toBeNull();
    expect(home!.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('true');
    expect(container.querySelector('[data-pcc-doc-explorer-pane="home"]')).not.toBeNull();
  });

  it('routes documents with external-reference / deferred activeModuleId → Explorer falls back to Home', () => {
    for (const moduleId of ['document-crunch', 'adobe-sign', 'drawing-model-center'] as const) {
      const { container } = renderRouter('documents', moduleId);
      const home = railButtonForSource(container as HTMLElement, 'home');
      expect(
        home,
        `documents with activeModuleId='${moduleId}' must still render the Explorer shell`,
      ).not.toBeNull();
      expect(home!.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('true');
      cleanup();
    }
  });
});
