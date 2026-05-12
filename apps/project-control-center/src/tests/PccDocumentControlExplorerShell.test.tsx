/**
 * Phase 08 wave-b13 Prompt 10C — Document Control Explorer shell
 * behavior coverage: source rail, breadcrumb, root-level source
 * selection, per-pane rendering, non-affordance guarantees, and bento
 * direct-child invariant.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import { DOCUMENT_EXPLORER_SOURCE_ID_ORDER } from '../surfaces/documents/documentExplorerModel';
import { PROJECT_RECORD_TREE_ROOT } from '../surfaces/documents/documentExplorerProjectRecordTree';
import { PROCORE_CATEGORY_DIRECTORY_NODES } from '../surfaces/documents/documentExplorerProcoreCategories';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccDocumentsReadModelClient } from '../surfaces/documents/documentControlViewModel';

afterEach(() => {
  cleanup();
});

function fixtureClient(): IPccDocumentsReadModelClient {
  const base = createPccFixtureReadModelClient();
  return {
    getDocumentControl: (id, persona) => base.getDocumentControl(id, persona),
  };
}

async function renderShell() {
  const utils = render(
    <PccBentoGrid forceMode="desktop">
      <PccDocumentsSurface readModelClient={fixtureClient()} />
    </PccBentoGrid>,
  );
  await waitFor(() => {
    expect(utils.container.querySelector('[data-pcc-doc-explorer="true"]')).not.toBeNull();
  });
  return utils;
}

function railButton(container: HTMLElement, sourceId: string): HTMLButtonElement {
  const btn = container.querySelector(
    `[data-pcc-doc-explorer-source-rail="true"] [data-pcc-doc-explorer-source-id="${sourceId}"]`,
  );
  expect(btn, `rail button for ${sourceId} must render`).not.toBeNull();
  return btn as HTMLButtonElement;
}

describe('PccDocumentControlExplorerShell — bento direct-child invariant', () => {
  it('shell renders inside a single direct-child bento card', async () => {
    const { container } = await renderShell();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const explorers = container.querySelectorAll('[data-pcc-doc-explorer="true"]');
    expect(explorers).toHaveLength(1);
    const card = explorers[0]!.closest('[data-pcc-card]');
    expect(card).not.toBeNull();
    expect(card!.parentElement === grid).toBe(true);
  });

  it('Explorer card carries no data-pcc-active-surface-panel marker', async () => {
    const { container } = await renderShell();
    const explorer = container.querySelector('[data-pcc-doc-explorer="true"]')!;
    const card = explorer.closest('[data-pcc-card]')!;
    expect(card.hasAttribute('data-pcc-active-surface-panel')).toBe(false);
    // Defensive: also check the shell subtree.
    expect(explorer.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(0);
  });

  it('does not render the HB Document Control Center duplicate title inside the Explorer card', async () => {
    const { container } = await renderShell();
    const explorer = container.querySelector('[data-pcc-doc-explorer="true"]')!;
    expect(explorer.textContent ?? '').not.toContain('HB Document Control Center');
  });
});

describe('PccDocumentControlExplorerShell — source rail', () => {
  it('renders exactly four root buttons in DOCUMENT_EXPLORER_SOURCE_ID_ORDER', async () => {
    const { container } = await renderShell();
    const rail = container.querySelector('[data-pcc-doc-explorer-source-rail="true"]');
    expect(rail).not.toBeNull();
    const buttons = rail!.querySelectorAll('[data-pcc-doc-explorer-source-id]');
    expect(buttons).toHaveLength(DOCUMENT_EXPLORER_SOURCE_ID_ORDER.length);
    const order = Array.from(buttons).map((b) => b.getAttribute('data-pcc-doc-explorer-source-id'));
    expect(order).toEqual([...DOCUMENT_EXPLORER_SOURCE_ID_ORDER]);
  });

  it('initial selected source is `home` (Document Control Home)', async () => {
    const { container } = await renderShell();
    const home = railButton(container as HTMLElement, 'home');
    expect(home.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('true');
    expect(home.getAttribute('aria-current')).toBe('true');
    for (const otherId of ['project-record', 'my-project-files', 'procore']) {
      const btn = railButton(container as HTMLElement, otherId);
      expect(btn.getAttribute('data-pcc-doc-explorer-source-selected')).toBe('false');
      expect(btn.getAttribute('aria-current')).toBeNull();
    }
  });

  it('all rail controls are real keyboard-accessible <button type="button"> elements', async () => {
    const { container } = await renderShell();
    const buttons = container.querySelectorAll(
      '[data-pcc-doc-explorer-source-rail="true"] [data-pcc-doc-explorer-source-id]',
    );
    for (const btn of buttons) {
      expect(btn.tagName).toBe('BUTTON');
      expect((btn as HTMLButtonElement).getAttribute('type')).toBe('button');
    }
  });

  it('clicking Project Record switches selection to project-record and renders its pane', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    expect(
      railButton(container as HTMLElement, 'project-record').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')).not.toBeNull();
  });

  it('clicking My Project Files switches selection and renders the MPF safety pane', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'my-project-files'));
    expect(
      container.querySelector('[data-pcc-doc-explorer-pane="my-project-files"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-doc-explorer-mpf-safety="true"]')).not.toBeNull();
  });

  it('clicking Procore switches selection and renders the category pane', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    expect(container.querySelector('[data-pcc-doc-explorer-pane="procore"]')).not.toBeNull();
  });
});

describe('PccDocumentControlExplorerShell — breadcrumb band', () => {
  it('home active → single segment `Document Control Home` with current=true', async () => {
    const { container } = await renderShell();
    const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]');
    expect(band).not.toBeNull();
    const segments = band!.querySelectorAll('[data-pcc-doc-explorer-breadcrumb]');
    expect(segments).toHaveLength(1);
    expect(segments[0]!.getAttribute('data-pcc-doc-explorer-breadcrumb')).toBe('home');
    expect(segments[0]!.getAttribute('data-pcc-doc-explorer-breadcrumb-current')).toBe('true');
    expect(segments[0]!.textContent).toBe('Document Control Home');
  });

  it('project-record active → two-segment breadcrumb `Document Control Home` / `Project Record`', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]')!;
    const segments = band.querySelectorAll('[data-pcc-doc-explorer-breadcrumb]');
    expect(segments).toHaveLength(2);
    expect(segments[0]!.getAttribute('data-pcc-doc-explorer-breadcrumb')).toBe('home');
    expect(segments[0]!.getAttribute('data-pcc-doc-explorer-breadcrumb-current')).toBe('false');
    expect(segments[1]!.getAttribute('data-pcc-doc-explorer-breadcrumb')).toBe('project-record');
    expect(segments[1]!.getAttribute('data-pcc-doc-explorer-breadcrumb-current')).toBe('true');
    expect(segments[0]!.textContent).toBe('Document Control Home');
    expect(segments[1]!.textContent).toBe('Project Record');
  });

  it('breadcrumb segments are display-only (no <button> or <a href>)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]')!;
    expect(band.querySelectorAll('button')).toHaveLength(0);
    expect(band.querySelectorAll('a[href]')).toHaveLength(0);
  });
});

describe('PccDocumentControlExplorerShell — Home pane', () => {
  it('renders three destination tiles for Project Record / My Project Files / Procore (no Document Crunch / Adobe Sign)', async () => {
    const { container } = await renderShell();
    const tiles = container.querySelectorAll('[data-pcc-doc-explorer-destination]');
    const tileIds = Array.from(tiles).map((t) =>
      t.getAttribute('data-pcc-doc-explorer-destination'),
    );
    expect(tileIds).toEqual(['project-record', 'my-project-files', 'procore']);
    expect(tileIds).not.toContain('document-crunch');
    expect(tileIds).not.toContain('adobe-sign');
    const text = container.querySelector('[data-pcc-doc-explorer-pane="home"]')?.textContent ?? '';
    expect(text).not.toContain('Document Crunch');
    expect(text).not.toContain('Adobe Sign');
  });

  it('clicking a destination tile switches the active source', async () => {
    const { container } = await renderShell();
    const projectRecordTile = container.querySelector(
      '[data-pcc-doc-explorer-destination="project-record"]',
    );
    expect(projectRecordTile).not.toBeNull();
    fireEvent.click(projectRecordTile!);
    expect(
      railButton(container as HTMLElement, 'project-record').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')).not.toBeNull();
  });
});

describe('PccDocumentControlExplorerShell — Project Record pane', () => {
  it('renders the 13 top-level folder rows from PROJECT_RECORD_TREE_ROOT.children', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')!;
    const rows = pane.querySelectorAll('[data-pcc-doc-explorer-row]');
    const expectedLabels = (PROJECT_RECORD_TREE_ROOT.children ?? []).map((c) => c.displayLabel);
    expect(rows).toHaveLength(expectedLabels.length);
    const actualLabels = Array.from(rows).map(
      (row) => row.querySelector('span')?.textContent ?? '',
    );
    expect(actualLabels).toEqual(expectedLabels);
    for (const row of rows) {
      expect(row.getAttribute('data-pcc-doc-explorer-row-kind')).toBe('folder');
    }
  });

  it('folder rows are non-interactive (no <button>, no <a href> inside the pane)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')!;
    expect(pane.querySelectorAll('button')).toHaveLength(0);
    expect(pane.querySelectorAll('a[href]')).toHaveLength(0);
  });
});

describe('PccDocumentControlExplorerShell — My Project Files pane', () => {
  it('renders project-scoped guardrail copy and zero folder rows', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'my-project-files'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="my-project-files"]')!;
    const safety = pane.querySelector('[data-pcc-doc-explorer-mpf-safety="true"]');
    expect(safety).not.toBeNull();
    expect(safety!.textContent ?? '').toMatch(/project-scoped/i);
    expect(safety!.textContent ?? '').toMatch(/full OneDrive root/i);
    expect(pane.querySelectorAll('[data-pcc-doc-explorer-row]')).toHaveLength(0);
  });
});

describe('PccDocumentControlExplorerShell — Procore pane', () => {
  it('renders the 11 locked category rows from PROCORE_CATEGORY_DIRECTORY_NODES', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    const rows = pane.querySelectorAll('[data-pcc-doc-explorer-row]');
    expect(rows).toHaveLength(PROCORE_CATEGORY_DIRECTORY_NODES.length);
    const actualLabels = Array.from(rows).map(
      (row) => row.querySelector('span')?.textContent ?? '',
    );
    expect(actualLabels).toEqual(PROCORE_CATEGORY_DIRECTORY_NODES.map((n) => n.displayLabel));
    for (const row of rows) {
      expect(row.getAttribute('data-pcc-doc-explorer-row-kind')).toBe('category');
    }
  });

  it('category rows are non-interactive (no <button>, no <a href> inside the pane)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    expect(pane.querySelectorAll('button')).toHaveLength(0);
    expect(pane.querySelectorAll('a[href]')).toHaveLength(0);
  });

  it('does not introduce Document Crunch / Adobe Sign rows (Prompt 10E scope)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const text =
      container.querySelector('[data-pcc-doc-explorer-pane="procore"]')?.textContent ?? '';
    expect(text).not.toContain('Document Crunch');
    expect(text).not.toContain('Adobe Sign');
  });
});
