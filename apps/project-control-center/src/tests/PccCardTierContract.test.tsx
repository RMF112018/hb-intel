/**
 * PCC card-tier contract — Wave 15A wave-b3 Prompt 03.
 *
 * Locks every non-command card across the in-scope route surfaces to
 * explicit tier and region provenance. The generic per-surface loop
 * walks every `[data-pcc-card]` rendered for a given surface and asserts
 * `data-pcc-card-tier-source="explicit"` and
 * `data-pcc-card-region-source="explicit"` on every card.
 *
 * Targeted assertions verify specific state / deferred / reference
 * postures called out by Prompt 03:
 *   - Team Access restricted card (state / state).
 *   - Approvals Policy / Module Integration / HBI Boundary (tier3 / reference).
 *   - Approvals Decision History / Lineage seams (tier3 / deferred).
 *   - External Systems Audit / HBI Lineage / Source Health / Procore Config /
 *     Registry (tier3 / reference).
 *   - Documents external-systems lane (region=deferred).
 *   - Project Home Missing Configurations (state / state).
 *   - Control Center Settings "Items needing setup" (state / state).
 *
 * `project-readiness` is intentionally excluded from the generic loop —
 * its subregion cards are deferred to Prompt 04. Prompt 02's contract
 * test already locks the project-readiness route command and state cards.
 */

import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';

// Wave 15A wave-b3 Prompt 05 — explicit cleanup between cases keeps each
// surface render isolated. PCC SPFx workspace runs vitest with
// `globals: false`, so DOM does not auto-clear between `it()` blocks.
afterEach(() => {
  cleanup();
});

const IN_SCOPE_SURFACES: readonly PccMvpSurfaceId[] = [
  'project-home',
  'team-and-access',
  'documents',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
  // Wave 15A wave-b3 Prompt 04 — Project Readiness embedded subregions are
  // now classified explicitly; the surface joins the generic explicit-source
  // loop here. Targeted Project Readiness assertions live in their own block
  // below.
  'project-readiness',
];

function renderPccAppOnSurface(surfaceId: PccMvpSurfaceId): HTMLElement {
  const { container } = render(<PccApp forceMode="desktop" />);
  const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
  expect(tab, `tab for '${surfaceId}' must exist in shell`).not.toBeNull();
  fireEvent.click(tab!);
  return container;
}

function getActiveBento(container: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> is the
  // semantic active-panel owner. Resolve the bento grid through the shell
  // panel rather than via a card `parentElement` lookup, since surface
  // command cards still emit a card-level `data-pcc-active-surface-panel`
  // compatibility marker and broad selectors are now ambiguous.
  const shellPanel = container.querySelector(
    `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
  );
  expect(shellPanel, `surface '${surfaceId}' must mount its shell active panel`).not.toBeNull();
  expect(shellPanel!.getAttribute('id')).toBe('pcc-active-surface-panel');
  expect(shellPanel!.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);

  const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
  expect(
    bento,
    `surface '${surfaceId}' shell panel must contain [data-pcc-bento-grid]`,
  ).not.toBeNull();

  return bento as HTMLElement;
}

function getActiveCompatibilityCard(bento: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  // The compatibility command card is a direct child of the bento grid
  // and still emits the temporary `data-pcc-active-surface-panel`
  // marker. Scoping to direct children prevents false positives from
  // descendant cards that share a marker namespace.
  const matches = Array.from(bento.children).filter((child) =>
    child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
  );
  expect(
    matches,
    `surface '${surfaceId}' must render one direct bento-child compatibility card`,
  ).toHaveLength(1);
  return matches[0] as HTMLElement;
}

function activePanelCards(container: HTMLElement, surfaceId: PccMvpSurfaceId): readonly Element[] {
  const bento = getActiveBento(container, surfaceId);
  return Array.from(bento.querySelectorAll('[data-pcc-card]'));
}

function cardTitle(card: Element): string {
  return card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '(untitled)';
}

function expectAllCardsExplicit(cards: readonly Element[], surfaceId: PccMvpSurfaceId): void {
  expect(cards.length, `surface '${surfaceId}' must render at least one card`).toBeGreaterThan(0);
  for (const card of cards) {
    const title = cardTitle(card);
    expect(
      card.getAttribute('data-pcc-card-tier-source'),
      `surface '${surfaceId}' card '${title}' tier-source must be explicit`,
    ).toBe('explicit');
    expect(
      card.getAttribute('data-pcc-card-region-source'),
      `surface '${surfaceId}' card '${title}' region-source must be explicit`,
    ).toBe('explicit');
    // Negative form of the same constraint — locks the absence of fallback
    // resolution explicitly so a regression to default/resolved fails on a
    // different assertion line and is easier to attribute.
    expect(
      card.getAttribute('data-pcc-card-tier-source'),
      `surface '${surfaceId}' card '${title}' tier-source must not be 'default'`,
    ).not.toBe('default');
    expect(
      card.getAttribute('data-pcc-card-region-source'),
      `surface '${surfaceId}' card '${title}' region-source must not be 'resolved'`,
    ).not.toBe('resolved');
  }
}

function expectAllCardsHaveLayoutMarkers(
  cards: readonly Element[],
  surfaceId: PccMvpSurfaceId,
): void {
  for (const card of cards) {
    const title = cardTitle(card);
    const footprint = card.getAttribute('data-pcc-footprint');
    expect(
      footprint,
      `surface '${surfaceId}' card '${title}' missing data-pcc-footprint`,
    ).toBeTruthy();
    expect(
      (footprint ?? '').length,
      `surface '${surfaceId}' card '${title}' has empty data-pcc-footprint`,
    ).toBeGreaterThan(0);

    const columnSpanRaw = card.getAttribute('data-pcc-column-span');
    expect(
      columnSpanRaw,
      `surface '${surfaceId}' card '${title}' missing data-pcc-column-span`,
    ).toBeTruthy();
    const columnSpan = Number(columnSpanRaw);
    expect(
      Number.isFinite(columnSpan) && columnSpan > 0,
      `surface '${surfaceId}' card '${title}' data-pcc-column-span must be numeric > 0 (got '${columnSpanRaw}')`,
    ).toBe(true);

    const rowSpanRaw = card.getAttribute('data-pcc-row-span');
    expect(
      rowSpanRaw,
      `surface '${surfaceId}' card '${title}' missing data-pcc-row-span`,
    ).toBeTruthy();
    const rowSpan = Number(rowSpanRaw);
    expect(
      Number.isFinite(rowSpan) && rowSpan > 0,
      `surface '${surfaceId}' card '${title}' data-pcc-row-span must be numeric > 0 (got '${rowSpanRaw}')`,
    ).toBe(true);
  }
}

function expectTitledCardsHaveAriaLabelledBy(
  cards: readonly Element[],
  surfaceId: PccMvpSurfaceId,
): void {
  for (const card of cards) {
    const heading = card.querySelector('h2, h3, h4');
    if (!heading) continue;
    const headingText = heading.textContent?.trim();
    if (!headingText) continue;
    const headingId = heading.getAttribute('id');
    expect(
      headingId,
      `surface '${surfaceId}' card '${headingText}' heading must have an id for aria-labelledby`,
    ).toBeTruthy();
    const ariaLabelledBy = card.getAttribute('aria-labelledby');
    expect(
      ariaLabelledBy,
      `surface '${surfaceId}' card '${headingText}' must have aria-labelledby pointing at heading id`,
    ).toBe(headingId);
  }
}

function expectCardsAreDirectChildrenOfBento(
  bento: HTMLElement,
  cards: readonly Element[],
  surfaceId: PccMvpSurfaceId,
): void {
  for (const card of cards) {
    const title = cardTitle(card);
    expect(
      card.parentElement,
      `surface '${surfaceId}' card '${title}' must be a direct child of [data-pcc-bento-grid]`,
    ).toBe(bento);
  }
}

function findCardByDescendant(container: HTMLElement, selector: string): Element {
  const inner = container.querySelector(selector);
  expect(inner, `descendant selector '${selector}' must match`).not.toBeNull();
  const card = inner!.closest('[data-pcc-card]');
  expect(card, `descendant '${selector}' must be inside a [data-pcc-card]`).not.toBeNull();
  return card!;
}

function findCardByHeading(container: HTMLElement, headingText: string): Element {
  const headings = Array.from(container.querySelectorAll('h2, h3, h4'));
  const heading = headings.find((h) => h.textContent?.trim() === headingText);
  expect(heading, `heading '${headingText}' must render`).toBeTruthy();
  const card = heading!.closest('[data-pcc-card]');
  expect(card, `heading '${headingText}' must be inside a [data-pcc-card]`).not.toBeNull();
  return card!;
}

describe('PCC card-tier contract — every in-scope surface card has explicit sources, layout markers, aria-labelledby, and is a direct bento child', () => {
  for (const surfaceId of IN_SCOPE_SURFACES) {
    it(`'${surfaceId}' surface — explicit sources, layout markers, aria-labelledby, direct bento children`, () => {
      const container = renderPccAppOnSurface(surfaceId);
      const bento = getActiveBento(container, surfaceId);
      const cards = Array.from(bento.querySelectorAll('[data-pcc-card]'));
      expect(cards.length, `surface '${surfaceId}' must render at least one card`).toBeGreaterThan(
        0,
      );
      expectAllCardsExplicit(cards, surfaceId);
      expectAllCardsHaveLayoutMarkers(cards, surfaceId);
      expectTitledCardsHaveAriaLabelledBy(cards, surfaceId);
      expectCardsAreDirectChildrenOfBento(bento, cards, surfaceId);
    });
  }
});

describe('PCC card-tier contract — active command card heading-level is "2" on every surface', () => {
  for (const surfaceId of IN_SCOPE_SURFACES) {
    it(`'${surfaceId}' compatibility command card emits data-pcc-heading-level="2"`, () => {
      const container = renderPccAppOnSurface(surfaceId);
      const bento = getActiveBento(container, surfaceId);
      const compatibilityCard = getActiveCompatibilityCard(bento, surfaceId);
      expect(
        compatibilityCard.getAttribute('data-pcc-heading-level'),
        `surface '${surfaceId}' compatibility command card must declare heading level 2`,
      ).toBe('2');
    });
  }
});

describe('PCC card-tier contract — no live http(s) anchors inside the bento grid on any surface', () => {
  for (const surfaceId of IN_SCOPE_SURFACES) {
    it(`'${surfaceId}' surface bento grid contains zero <a href^="http(s)"> anchors`, () => {
      const container = renderPccAppOnSurface(surfaceId);
      const bento = getActiveBento(container, surfaceId);
      // Scope to the bento grid; shell-level links (help, feedback, etc.)
      // live outside the grid and are intentionally not in scope here.
      const anchors = bento.querySelectorAll('a[href^="http"]');
      expect(
        anchors.length,
        `surface '${surfaceId}' bento grid must not render live http(s) anchors`,
      ).toBe(0);
    });
  }
});

describe('PCC card-tier contract — disabled-affordance reason linkage is intact on every surface', () => {
  for (const surfaceId of IN_SCOPE_SURFACES) {
    it(`'${surfaceId}' disabled affordances resolve aria-describedby to a reason node`, () => {
      const container = renderPccAppOnSurface(surfaceId);
      const bento = getActiveBento(container, surfaceId);
      const affordances = bento.querySelectorAll('[data-pcc-disabled-affordance-variant]');
      // Surfaces without disabled affordances pass trivially. The point of
      // this loop is to lock the linkage WHEN affordances are present, not
      // to require their presence on every surface.
      for (const affordance of Array.from(affordances)) {
        const describedBy = affordance.getAttribute('aria-describedby');
        expect(
          describedBy,
          `surface '${surfaceId}' disabled affordance must declare aria-describedby`,
        ).toBeTruthy();
        const ids = (describedBy ?? '').split(/\s+/).filter((id) => id.length > 0);
        expect(
          ids.length,
          `surface '${surfaceId}' disabled affordance aria-describedby must list at least one id`,
        ).toBeGreaterThan(0);
        const linkedNodes = ids
          .map((id) => container.ownerDocument.getElementById(id))
          .filter((node): node is HTMLElement => node !== null);
        expect(
          linkedNodes.length,
          `surface '${surfaceId}' disabled affordance describedby ids must resolve to live nodes`,
        ).toBeGreaterThan(0);
        const hasReason = linkedNodes.some(
          (node) =>
            node.hasAttribute('data-pcc-disabled-affordance-reason') ||
            (node.textContent ?? '').trim().length > 0,
        );
        expect(
          hasReason,
          `surface '${surfaceId}' disabled affordance must link to a [data-pcc-disabled-affordance-reason] node or a non-empty reason`,
        ).toBe(true);
      }
    });
  }
});

describe('PCC card-tier contract — Team Access restricted card', () => {
  it('renders state / state when persona lacks access-manager privileges', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccTeamAccessSurface previewPersona="viewer" previewHasProjectSiteAccess={false} />
      </PccBentoGrid>,
    );
    const card = findCardByHeading(container, 'Access manager actions');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('state');
    expect(card.getAttribute('data-pcc-card-region')).toBe('state');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
    expect(card.getAttribute('data-pcc-card-region-source')).toBe('explicit');
  });
});

describe('PCC card-tier contract — Approvals reference and deferred cards', () => {
  function renderApprovals(): HTMLElement {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface />
      </PccBentoGrid>,
    );
    return container;
  }

  it('Policy card is tier3 / reference', () => {
    const card = findCardByDescendant(renderApprovals(), '[data-pcc-approvals-lane="policy"]');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });

  it('Module Integration card is tier3 / reference', () => {
    const card = findCardByDescendant(
      renderApprovals(),
      '[data-pcc-approvals-lane="module-integration"]',
    );
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });

  it('HBI Boundary card is tier3 / reference', () => {
    const card = findCardByDescendant(
      renderApprovals(),
      '[data-pcc-approvals-lane="hbi-boundary"]',
    );
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });

  it('Decision History seam card is tier3 / deferred', () => {
    const card = findCardByDescendant(
      renderApprovals(),
      '[data-pcc-approvals-lane="decision-history"]',
    );
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
  });

  it('Lineage seam card is tier3 / deferred', () => {
    const card = findCardByDescendant(renderApprovals(), '[data-pcc-approvals-lane="lineage"]');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
  });
});

describe('PCC card-tier contract — External Systems reference cards', () => {
  function renderExternalSystems(): HTMLElement {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccExternalSystemsSurface />
      </PccBentoGrid>,
    );
    return container;
  }

  const referenceLanes: readonly { readonly lane: string; readonly label: string }[] = [
    { lane: 'audit-history', label: 'Audit history' },
    { lane: 'hbi-lineage', label: 'HBI lineage' },
    { lane: 'source-health', label: 'Source health' },
    { lane: 'registry', label: 'Registry' },
  ];

  for (const { lane, label } of referenceLanes) {
    it(`${label} card is tier3 / reference`, () => {
      const card = findCardByDescendant(
        renderExternalSystems(),
        `[data-pcc-launch-pad-lane="${lane}"]`,
      );
      expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
      expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
    });
  }

  it('Procore configuration & status card is tier3 / reference', () => {
    const card = findCardByDescendant(
      renderExternalSystems(),
      '[data-pcc-card-id="procore-configuration-status"]',
    );
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
  });
});

describe('PCC card-tier contract — Documents external-systems lane is deferred', () => {
  it('Documents external-systems lane has region=deferred', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDocumentsSurface />
      </PccBentoGrid>,
    );
    const card = findCardByDescendant(container, '[data-pcc-doc-lane="external-systems"]');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });
});

describe('PCC card-tier contract — locked state cards', () => {
  it('Project Home Missing Configurations card is state / state', () => {
    const container = renderPccAppOnSurface('project-home');
    const card = findCardByHeading(container, 'Missing Configurations');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('state');
    expect(card.getAttribute('data-pcc-card-region')).toBe('state');
  });

  it('Control Center Settings "Items needing setup" card is state / state', () => {
    const container = renderPccAppOnSurface('control-center-settings');
    const card = findCardByHeading(container, 'Items needing setup');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('state');
    expect(card.getAttribute('data-pcc-card-region')).toBe('state');
  });

  it('Site Health "Repair Requests" card is tier3 / deferred', () => {
    const container = renderPccAppOnSurface('site-health');
    const card = findCardByHeading(container, 'Repair Requests');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
  });
});

// ---------------------------------------------------------------------------
// Wave 15A wave-b3 Prompt 04 — Project Readiness specific assertions.
// ---------------------------------------------------------------------------

describe('PCC card-tier contract — Project Readiness specific assertions', () => {
  function renderProjectReadiness(sectionId?: string): HTMLElement {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    if (sectionId) {
      // Wave 15A B5 / Prompt 02 — detail-section cards render only
      // when the matching module-index drilldown is selected.
      const drilldown = container.querySelector(
        `[data-pcc-readiness-drilldown-control="${sectionId}"]`,
      ) as HTMLButtonElement | null;
      expect(drilldown, `expected drilldown control for "${sectionId}"`).not.toBeNull();
      fireEvent.click(drilldown!);
    }
    return container;
  }

  it('Blockers card is not Tier 1 (Project Readiness route command is the readiness Hero)', () => {
    const card = findCardByHeading(renderProjectReadiness(), 'Blockers and exceptions');
    expect(card.getAttribute('data-pcc-card-tier')).not.toBe('tier1');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  });

  it('Lifecycle Blockers card is not Tier 1', () => {
    const card = findCardByHeading(
      renderProjectReadiness('lifecycle-readiness'),
      'Blocked, escalated, and at-risk items',
    );
    expect(card.getAttribute('data-pcc-card-tier')).not.toBe('tier1');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  });

  it('Lifecycle "Future closeout exposure" card is region=deferred', () => {
    const card = findCardByHeading(
      renderProjectReadiness('lifecycle-readiness'),
      'Early closeout-risk surface',
    );
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('AHJ launcher panel card is region=deferred', () => {
    const card = findCardByHeading(
      renderProjectReadiness('permits-inspections'),
      'AHJ launcher panel',
    );
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('Responsibility Matrix template-and-admin card is region=deferred', () => {
    const card = findCardByHeading(
      renderProjectReadiness('responsibility-matrix'),
      'Template and source-mapping admin',
    );
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('Downstream module readiness card is region=reference', () => {
    const card = findCardByHeading(renderProjectReadiness(), 'Downstream module readiness');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('Procore source confidence card is region=reference', () => {
    const card = findCardByHeading(
      renderProjectReadiness('procore-source-confidence'),
      'Procore source confidence',
    );
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('Responsibility Matrix integration signals card is region=reference', () => {
    const card = findCardByHeading(
      renderProjectReadiness('responsibility-matrix'),
      'Integration signals (read-only references)',
    );
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('Buyout Procore Reconciliation card is region=reference', () => {
    const card = findCardByHeading(renderProjectReadiness('buyout'), 'Procore Reconciliation View');
    expect(card.getAttribute('data-pcc-card-region')).toBe('reference');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
  });

  it('every Project Readiness card is a direct child of [data-pcc-bento-grid]', () => {
    // Strict invariant: card.parentElement must equal the bento grid node
    // itself — not "all cards share one parent" (which would pass if cards
    // were wrapped in any common container).
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    const bento = container.querySelector('[data-pcc-bento-grid]');
    expect(bento, '[data-pcc-bento-grid] must mount').not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length, 'Project Readiness must render at least one card').toBeGreaterThan(0);
    for (const card of cards) {
      const title = card.querySelector('h2, h3, h4')?.textContent ?? '(untitled)';
      expect(
        card.parentElement,
        `Project Readiness card '${title}' must be a direct child of [data-pcc-bento-grid]`,
      ).toBe(bento);
    }
  });
});
