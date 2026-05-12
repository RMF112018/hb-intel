import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PCC_RESPONSIVE_COLUMNS, type PccResponsiveMode } from '../layout/footprints';
import {
  PROJECT_HOME_OPERATIONAL_CARD_TITLES,
  type PccProjectHomeOperationalCardKey,
} from '../surfaces/projectHome/projectHomeChoreography';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

afterEach(() => {
  cleanup();
});

/**
 * Project Home choreography contract — established in Phase 06 Prompt 02,
 * extended in Phase 06 Prompt 04 (preview analytics interleave), and
 * re-centered in Phase 08 Prompt 09 (Project Readiness + Document Control
 * become the headline support cards; Site Health Summary moves into the
 * second row).
 *
 * Locks:
 *   - the canonical nine-card operational spine on the fixture path;
 *   - the same spine + lifecycle/HBI/Procore/detail tail on the read-model
 *     path (18 direct children total);
 *   - per-card `data-pcc-column-span` + `data-pcc-span-source` at the
 *     four 12-/10-column modes;
 *   - footprint-fallback behavior at smaller modes.
 */

// Operational-only filtered spine — the nine operational cards in their
// rendered order (analytics filtered out).
const SPINE_TITLES_IN_ORDER: readonly string[] = [
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.priorityActions,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.projectReadiness,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.documentControl,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.siteHealthSummary,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.approvalsCheckpoints,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.missingConfigurations,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.externalPlatforms,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.teamSnapshot,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.recentActivity,
];

// Phase 08 Prompt 09 canonical 12-card Project Home fixture order — the
// nine-card operational spine with three preview analytics cards
// interleaved into the second-row analytics pair and the rollup slot.
const PROJECT_HOME_FIXTURE_ORDER: readonly string[] = [
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.priorityActions,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.projectReadiness,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.documentControl,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.siteHealthSummary,
  'Action Exposure Mix',
  'Project Health Trend',
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.approvalsCheckpoints,
  'Readiness / Approval Rollup',
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.missingConfigurations,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.externalPlatforms,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.teamSnapshot,
  PROJECT_HOME_OPERATIONAL_CARD_TITLES.recentActivity,
];

const READ_MODEL_FULL_ORDER: readonly string[] = [
  ...PROJECT_HOME_FIXTURE_ORDER,
  'Lifecycle Timeline',
  'Ask HBI — Grounded Project Answers',
  'Procore snapshot',
  'Project Memory',
  'Project Lens',
  'Related Records',
];

function getCardTitles(grid: HTMLElement): readonly string[] {
  return Array.from(grid.querySelectorAll<HTMLElement>('[data-pcc-card]')).map((card) => {
    // Cards expose their title via the labelled heading. Walk to the
    // first heading element inside the card; falls back to text content
    // for cards without a heading element.
    const heading = card.querySelector('h2, h3, h4');
    return heading?.textContent?.trim() ?? '';
  });
}

function getDirectChildCards(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
  );
}

function getCardByTitle(grid: HTMLElement, title: string): HTMLElement {
  const card = Array.from(grid.querySelectorAll<HTMLElement>('[data-pcc-card]')).find((node) => {
    const heading = node.querySelector('h2, h3, h4');
    return (heading?.textContent?.trim() ?? '') === title;
  });
  if (!card) {
    throw new Error(`Card titled "${title}" not found in the grid`);
  }
  return card;
}

describe('Project Home Phase 06 composition — fixture path', () => {
  it('renders the Phase 08 Prompt 09 canonical Project Home twelve-card order (operational spine + three analytics cards)', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    expect(getCardTitles(grid!)).toEqual(PROJECT_HOME_FIXTURE_ORDER);
  });

  it('renders exactly twelve direct bento children, all data-pcc-card articles', () => {
    // Cardinality (12) is governed by Phase 06 Prompt 04 and unchanged by
    // Phase 08 Prompt 09; only the order shifted.
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = getDirectChildCards(grid);
    expect(directCards).toHaveLength(12);
    expect(
      Array.from(grid.children).every(
        (child) => child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      ),
    ).toBe(true);
  });

  it('the operational-only filtered sequence equals the Phase 08 Prompt 09 nine-card spine', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = getCardTitles(grid);
    const operationalOnly = titles.filter((t) => SPINE_TITLES_IN_ORDER.includes(t));
    expect(operationalOnly).toEqual(SPINE_TITLES_IN_ORDER);
  });

  it('does not contain "Project Intelligence" anywhere in the grid', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });
});

describe('Project Home Phase 06 composition — read-model path', () => {
  it('renders the Phase 08 Prompt 09 canonical Project Home twelve-card spine+analytics first, then lifecycle / Ask HBI / Procore / Memory / Lens / Related Records', async () => {
    const client = createPccFixtureReadModelClient();
    const { container, findByText } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome readModelClient={client} />
      </PccBentoGrid>,
    );
    // Wait for the lifecycle title to render; then assert the full
    // 15-card sequence in a waitFor so the unified-lifecycle async
    // microtask can settle.
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    await waitFor(() => {
      expect(getCardTitles(grid)).toEqual(READ_MODEL_FULL_ORDER);
    });
  });

  it('first twelve direct cards exactly match the Phase 08 Prompt 09 Project Home fixture order on the read-model path', async () => {
    const client = createPccFixtureReadModelClient();
    const { container, findByText } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome readModelClient={client} />
      </PccBentoGrid>,
    );
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = getCardTitles(grid);
    expect(titles.slice(0, 12)).toEqual(PROJECT_HOME_FIXTURE_ORDER);
  });

  it('every direct bento child is a [data-pcc-card] article on the read-model path', async () => {
    const client = createPccFixtureReadModelClient();
    const { container, findByText } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome readModelClient={client} />
      </PccBentoGrid>,
    );
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(
      Array.from(grid.children).every(
        (child) => child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      ),
    ).toBe(true);
  });

  it('does not contain "Project Intelligence" anywhere on the read-model path', async () => {
    const client = createPccFixtureReadModelClient();
    const { container, findByText } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome readModelClient={client} />
      </PccBentoGrid>,
    );
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });
});

describe('Project Home Phase 06 composition — span overrides', () => {
  const TWELVE_COL_SPAN_BY_TITLE: Readonly<Record<string, number>> = {
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.priorityActions]: 5,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.siteHealthSummary]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.documentControl]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.projectReadiness]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.approvalsCheckpoints]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.missingConfigurations]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.externalPlatforms]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.teamSnapshot]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.recentActivity]: 5,
  };

  const STANDARD_LAPTOP_SPAN_BY_TITLE: Readonly<Record<string, number>> = {
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.priorityActions]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.siteHealthSummary]: 4,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.documentControl]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.projectReadiness]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.approvalsCheckpoints]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.missingConfigurations]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.externalPlatforms]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.teamSnapshot]: 3,
    [PROJECT_HOME_OPERATIONAL_CARD_TITLES.recentActivity]: 4,
  };

  function assertSpansForMode(
    expectedByTitle: Readonly<Record<string, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = render(
      <PccBentoGrid forceMode={mode}>
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    for (const [title, expectedSpan] of Object.entries(expectedByTitle)) {
      const card = getCardByTitle(grid, title);
      expect(card.getAttribute('data-pcc-column-span')).toBe(String(expectedSpan));
      expect(card.getAttribute('data-pcc-span-source')).toBe('override');
      expect(card.getAttribute('data-pcc-span-override-mode')).toBe(mode);
    }
  }

  it('applies the 12-column override matrix at desktop', () => {
    assertSpansForMode(TWELVE_COL_SPAN_BY_TITLE, 'desktop');
  });

  it('applies the 12-column override matrix at largeLaptop', () => {
    assertSpansForMode(TWELVE_COL_SPAN_BY_TITLE, 'largeLaptop');
  });

  it('applies the 12-column override matrix at ultrawide', () => {
    assertSpansForMode(TWELVE_COL_SPAN_BY_TITLE, 'ultrawide');
  });

  it('applies the 10-column override matrix at standardLaptop', () => {
    assertSpansForMode(STANDARD_LAPTOP_SPAN_BY_TITLE, 'standardLaptop');
  });

  it('retains footprint behavior at tabletLandscape (no overrides keyed for that mode)', () => {
    const { container } = render(
      <PccBentoGrid forceMode="tabletLandscape">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    // Sample three cards across the spine — the override matrix only
    // declares keys for largeLaptop/desktop/ultrawide/standardLaptop, so
    // tabletLandscape must fall back to footprint behavior.
    const sampledTitles: readonly PccProjectHomeOperationalCardKey[] = [
      'priorityActions',
      'siteHealthSummary',
      'recentActivity',
    ];
    for (const key of sampledTitles) {
      const card = getCardByTitle(grid, PROJECT_HOME_OPERATIONAL_CARD_TITLES[key]);
      expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });

  it('column count clamp guards the override at the responsive column count', () => {
    // Sanity check: at standardLaptop the column count is 10. None of the
    // operational card overrides exceed 10; this test simply asserts the
    // PCC_RESPONSIVE_COLUMNS table the choreography matrix is built
    // against has not silently shifted under us.
    expect(PCC_RESPONSIVE_COLUMNS.standardLaptop).toBe(10);
    expect(PCC_RESPONSIVE_COLUMNS.desktop).toBe(12);
    expect(PCC_RESPONSIVE_COLUMNS.largeLaptop).toBe(12);
    expect(PCC_RESPONSIVE_COLUMNS.ultrawide).toBe(12);
  });
});

describe('Project Home Phase 06 composition — shell-owned active panel preserved', () => {
  it('zero direct bento cards carry [data-pcc-active-surface-panel="project-home"] (PccApp render)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const cardLevel = grid.querySelectorAll(
      '[data-pcc-card][data-pcc-active-surface-panel="project-home"]',
    );
    expect(cardLevel).toHaveLength(0);
    const shellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
    );
    expect(shellPanels).toHaveLength(1);
  });
});
