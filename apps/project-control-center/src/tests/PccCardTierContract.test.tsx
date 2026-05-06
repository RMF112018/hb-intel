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

import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';

const IN_SCOPE_SURFACES: readonly PccMvpSurfaceId[] = [
  'project-home',
  'team-and-access',
  'documents',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
];

function renderPccAppOnSurface(surfaceId: PccMvpSurfaceId): HTMLElement {
  const { container } = render(<PccApp forceMode="desktop" />);
  const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
  expect(tab, `tab for '${surfaceId}' must exist in shell`).not.toBeNull();
  fireEvent.click(tab!);
  return container;
}

function activePanelCards(container: HTMLElement, surfaceId: PccMvpSurfaceId): readonly Element[] {
  // Scope to the surface panel container so we don't pick up other surfaces' cards
  // (the shell may keep prior surface DOM mounted in some test harnesses).
  const surfacePanel = container.querySelector(`[data-pcc-active-surface-panel="${surfaceId}"]`);
  expect(surfacePanel, `surface '${surfaceId}' must mount its active-panel carrier`).not.toBeNull();
  // Every card in the rendered tree of this surface — including the active-panel
  // carrier itself — must be reachable from the same render. The active-panel
  // carrier is the route command card. Sibling cards may live at the bento-grid
  // level alongside it, so we walk up to the bento grid and select all cards.
  const bento = surfacePanel!.parentElement;
  expect(bento, `bento parent for '${surfaceId}' must exist`).not.toBeNull();
  return Array.from(bento!.querySelectorAll('[data-pcc-card]'));
}

function expectAllCardsExplicit(cards: readonly Element[], surfaceId: PccMvpSurfaceId): void {
  expect(cards.length, `surface '${surfaceId}' must render at least one card`).toBeGreaterThan(0);
  for (const card of cards) {
    const title = card.querySelector('h2, h3, h4')?.textContent ?? '(untitled)';
    expect(
      card.getAttribute('data-pcc-card-tier-source'),
      `surface '${surfaceId}' card '${title}' tier-source must be explicit`,
    ).toBe('explicit');
    expect(
      card.getAttribute('data-pcc-card-region-source'),
      `surface '${surfaceId}' card '${title}' region-source must be explicit`,
    ).toBe('explicit');
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

describe('PCC card-tier contract — every in-scope surface card has explicit sources', () => {
  for (const surfaceId of IN_SCOPE_SURFACES) {
    it(`'${surfaceId}' surface — every card has explicit tier/region source`, () => {
      const container = renderPccAppOnSurface(surfaceId);
      const cards = activePanelCards(container, surfaceId);
      expectAllCardsExplicit(cards, surfaceId);
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
});
