import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
});

const TAIL_TITLES = [
  'Lifecycle Timeline',
  'Procore snapshot',
  'Ask HBI — Grounded Project Answers',
  'Project Memory',
  'Related Records',
  'Project Lens',
] as const;

const TWELVE_COL_TAIL_SPANS: Readonly<Record<(typeof TAIL_TITLES)[number], number>> = {
  'Lifecycle Timeline': 8,
  'Procore snapshot': 4,
  'Ask HBI — Grounded Project Answers': 8,
  'Project Memory': 4,
  'Related Records': 8,
  'Project Lens': 4,
};

const STANDARD_LAPTOP_TAIL_SPANS: Readonly<Record<(typeof TAIL_TITLES)[number], number>> = {
  'Lifecycle Timeline': 7,
  'Procore snapshot': 3,
  'Ask HBI — Grounded Project Answers': 7,
  'Project Memory': 3,
  'Related Records': 7,
  'Project Lens': 3,
};

function getDirectCardTitles(grid: HTMLElement): string[] {
  return Array.from(grid.children)
    .filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    )
    .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '(untitled)');
}

function getDirectCardByTitle(grid: HTMLElement, title: string): HTMLElement {
  const card = Array.from(grid.children).find((child): child is HTMLElement => {
    if (!(child instanceof HTMLElement) || !child.hasAttribute('data-pcc-card')) return false;
    return (child.querySelector('h2,h3,h4')?.textContent?.trim() ?? '') === title;
  });
  if (!card) {
    throw new Error(`Card titled "${title}" not found`);
  }
  return card;
}

async function renderGridAtMode(mode: PccResponsiveMode): Promise<HTMLElement> {
  const { container } = render(
    <PccApp forceMode={mode} readModelClient={createPccFixtureReadModelClient()} />,
  );
  await waitFor(() => {
    expect(container.querySelector('[data-pcc-bento-grid]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-ask-hbi-panel]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-procore-source-boundary]')).not.toBeNull();
  });
  return container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
}

describe('Project Home tail choreography (Prompt 09D)', () => {
  it('renders the read-model tail in the final direct-child order', async () => {
    const grid = await renderGridAtMode('desktop');
    const titles = getDirectCardTitles(grid);
    expect(titles.slice(-6)).toEqual([...TAIL_TITLES]);
  });

  it('applies the 12-column tail span matrix at desktop/largeLaptop/ultrawide', async () => {
    for (const mode of ['desktop', 'largeLaptop', 'ultrawide'] as const) {
      const grid = await renderGridAtMode(mode);
      for (const title of TAIL_TITLES) {
        const card = getDirectCardByTitle(grid, title);
        expect(card.getAttribute('data-pcc-column-span')).toBe(
          String(TWELVE_COL_TAIL_SPANS[title]),
        );
        expect(card.getAttribute('data-pcc-span-source')).toBe('override');
        expect(card.getAttribute('data-pcc-span-override-mode')).toBe(mode);
      }
    }
  });

  it('applies the 10-column tail span matrix at standardLaptop', async () => {
    const grid = await renderGridAtMode('standardLaptop');
    for (const title of TAIL_TITLES) {
      const card = getDirectCardByTitle(grid, title);
      expect(card.getAttribute('data-pcc-column-span')).toBe(
        String(STANDARD_LAPTOP_TAIL_SPANS[title]),
      );
      expect(card.getAttribute('data-pcc-span-source')).toBe('override');
      expect(card.getAttribute('data-pcc-span-override-mode')).toBe('standardLaptop');
    }
  });

  it('tail rows sum to 12 in 12-column modes and 10 at standardLaptop', async () => {
    for (const mode of ['desktop', 'largeLaptop', 'ultrawide'] as const) {
      const grid = await renderGridAtMode(mode);
      const spans = TAIL_TITLES.map((title) =>
        Number(getDirectCardByTitle(grid, title).getAttribute('data-pcc-column-span')),
      );
      expect(spans[0]! + spans[1]!).toBe(12);
      expect(spans[2]! + spans[3]!).toBe(12);
      expect(spans[4]! + spans[5]!).toBe(12);
    }

    const laptopGrid = await renderGridAtMode('standardLaptop');
    const laptopSpans = TAIL_TITLES.map((title) =>
      Number(getDirectCardByTitle(laptopGrid, title).getAttribute('data-pcc-column-span')),
    );
    expect(laptopSpans[0]! + laptopSpans[1]!).toBe(10);
    expect(laptopSpans[2]! + laptopSpans[3]!).toBe(10);
    expect(laptopSpans[4]! + laptopSpans[5]!).toBe(10);
  });

  it('falls back to footprint spans at tabletLandscape (no tail override mode marker)', async () => {
    const grid = await renderGridAtMode('tabletLandscape');
    for (const title of TAIL_TITLES) {
      const card = getDirectCardByTitle(grid, title);
      expect(card.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(card.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });

  it('keeps tail cards as direct bento children and preserves Ask HBI idle + Procore boundary guards', async () => {
    const grid = await renderGridAtMode('desktop');
    for (const title of TAIL_TITLES) {
      const card = getDirectCardByTitle(grid, title);
      expect(card.parentElement).toBe(grid);
    }
    const askHbiPanel = grid.querySelector('[data-pcc-ask-hbi-panel]');
    expect(askHbiPanel).not.toBeNull();
    expect(askHbiPanel!.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    expect(grid.querySelector('[data-pcc-procore-source-boundary]')).not.toBeNull();
  });
});
