/**
 * Project Readiness — blocker hierarchy and ownership escalation
 * disabled-affordance contracts. Per-component scoped
 * (feedback_per_component_marker_scoping). No shared layout primitive
 * edits. Order assertions use region markers, not sibling indexes
 * (feedback_per_lane_marker_assertions).
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

afterEach(() => {
  cleanup();
});

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-tab-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function selectProjectReadinessSection(container: HTMLElement, sectionId: string): void {
  const control = container.querySelector(
    `[data-pcc-readiness-drilldown-control="${sectionId}"]`,
  ) as HTMLButtonElement | null;
  expect(control, `expected drilldown control for "${sectionId}"`).not.toBeNull();
  fireEvent.click(control!);
}

function regionCard(container: HTMLElement, regionId: string): HTMLElement {
  const region = container.querySelector(`[data-pcc-readiness-region="${regionId}"]`);
  expect(region, `region '${regionId}' should render`).not.toBeNull();
  const card = region!.closest('[data-pcc-card]');
  expect(card, `region '${regionId}' should be wrapped in a PccDashboardCard`).not.toBeNull();
  return card as HTMLElement;
}

function lifecycleSectionRegion(container: HTMLElement, regionId: string): HTMLElement {
  const region = container.querySelector(`[data-pcc-readiness-region="${regionId}"]`);
  expect(region, `lifecycle region '${regionId}' should render`).not.toBeNull();
  return region as HTMLElement;
}

describe('Project Readiness — Wave 8 blocker posture', () => {
  it('BlockersCard adopts tier=tier2/region=operational and footprint="full" (Wave 15A wave-b3 Prompt 04 removed the legacy hierarchy="primary" marker; the route command is the readiness Hero, not Blockers)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    const card = regionCard(container, 'blockers');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
    expect(card.getAttribute('data-pcc-footprint')).toBe('full');
  });

  it('Wave 8 BlockersCard appears before DomainGridCard in DOM order', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    const blockersCard = regionCard(container, 'blockers');
    const domainsCard = regionCard(container, 'domains');
    const compare = blockersCard.compareDocumentPosition(domainsCard);
    expect(
      compare & Node.DOCUMENT_POSITION_FOLLOWING,
      'blockers card must precede domain grid card in DOM order',
    ).toBeTruthy();
  });

  it('EvidenceSourceHealthCard footprint is "full" so the row stays visually clean', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const card = regionCard(container, 'evidence-source-health');
    expect(card.getAttribute('data-pcc-footprint')).toBe('full');
  });
});

// Wave 15A B5 / Prompt 02 — the lifecycle module renders only when the
// 'lifecycle-readiness' detail section is selected. Each test selects
// it via the module-index drilldown control before asserting on
// lifecycle region markers.
describe('Project Readiness — Wave 9 lifecycle blocker posture', () => {
  it('LifecycleBlockersCard adopts tier=tier2/region=operational and footprint="full" (Wave 15A wave-b3 Prompt 04 removed the legacy hierarchy="primary" marker; the route command is the readiness Hero, not the lifecycle Blockers card)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    selectProjectReadinessSection(container, 'lifecycle-readiness');

    // The lifecycle blocker region is keyed by data-pcc-readiness-region
    // string declared in PccProjectReadinessSurface.tsx.
    const region = container.querySelector(
      '[data-pcc-readiness-region="lifecycle-blockers-exceptions"]',
    );
    expect(region, 'lifecycle blockers region should render').not.toBeNull();
    const card = region!.closest('[data-pcc-card]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card?.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card?.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
    expect(card?.getAttribute('data-pcc-footprint')).toBe('full');
  });

  it('LifecycleBlockersCard appears before LifecycleFamilyDomainsCard in DOM order', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    selectProjectReadinessSection(container, 'lifecycle-readiness');

    const blockersRegion = lifecycleSectionRegion(container, 'lifecycle-blockers-exceptions');
    const familyRegion = lifecycleSectionRegion(container, 'lifecycle-family-domains');
    const compare = blockersRegion.compareDocumentPosition(familyRegion);
    expect(
      compare & Node.DOCUMENT_POSITION_FOLLOWING,
      'lifecycle blockers must precede lifecycle family domains in DOM order',
    ).toBeTruthy();
  });
});

describe('Project Readiness — active-panel ownership preserved (Wave 15A wave-b9 Prompt 4B-10)', () => {
  it('zero in-grid card-level [data-pcc-active-surface-panel="project-readiness"] markers exist; project-readiness joined SURFACES_WITH_SHELL_ONLY_PANEL after `HeroCard` was deleted (MVP metrics absorbed into LifecycleGateMapCard), and the shell `<main role="tabpanel">` is the sole semantic owner of the marker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const compatibilityCards = container.querySelectorAll(
      '[data-pcc-card][data-pcc-active-surface-panel="project-readiness"]',
    );
    expect(compatibilityCards).toHaveLength(0);
    // Shell `<main>` continues to carry the marker as the sole semantic
    // owner.
    const shellPanel = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-readiness"]',
    );
    expect(
      shellPanel,
      'shell <main role="tabpanel"> must carry the active-panel marker',
    ).not.toBeNull();
  });
});

describe('Project Readiness — Ownership escalation disabled-affordance contract', () => {
  it('every escalation chip is routed through PccDisabledAffordance with a paired reason', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    const ownershipRegion = container.querySelector(
      '[data-pcc-readiness-region="ownership-accountability"]',
    );
    expect(ownershipRegion, 'ownership-accountability region should render').not.toBeNull();

    const escalationWrappers = ownershipRegion!.querySelectorAll(
      '[data-pcc-readiness-ownership-escalation]',
    );
    expect(
      escalationWrappers.length,
      'expected at least one escalation chip in the ownership region',
    ).toBeGreaterThan(0);

    for (const wrapper of Array.from(escalationWrappers)) {
      const button = wrapper.querySelector('[data-pcc-disabled-affordance-variant]');
      expect(
        button,
        'each escalation chip must be wrapped in PccDisabledAffordance',
      ).not.toBeNull();
      expect(button?.getAttribute('aria-disabled')).toBe('true');
      const describedBy = button?.getAttribute('aria-describedby') ?? '';
      const firstId = describedBy.split(' ')[0];
      const reasonNode = wrapper.querySelector(`#${CSS.escape(firstId)}`);
      expect(reasonNode, 'aria-describedby must resolve to a reason node').not.toBeNull();
      expect((reasonNode!.textContent ?? '').length).toBeGreaterThan(0);
    }
  });
});
