/**
 * Phase 08 wave-b13 Prompt 10C/10D — Document Control Explorer shell
 * behavior coverage: source rail, breadcrumb (display + click-back),
 * root-level source selection, per-pane rendering, drill-down
 * navigation, mounted per-source path retention, `activeModuleId`
 * module-focus mapping, and bento direct-child invariant.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { PccModuleId } from '@hbc/models/pcc';
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

async function renderShell(activeModuleId?: PccModuleId) {
  const utils = render(
    <PccBentoGrid forceMode="desktop">
      <PccDocumentsSurface readModelClient={fixtureClient()} activeModuleId={activeModuleId} />
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

  it('non-current breadcrumb segments are interactive buttons; the current segment stays a span (Prompt 10D click-back)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]')!;
    // No external anchors anywhere in the breadcrumb band.
    expect(band.querySelectorAll('a[href]')).toHaveLength(0);
    // Non-current segments are buttons (the home segment when procore is active).
    const nonCurrent = band.querySelector(
      '[data-pcc-doc-explorer-breadcrumb="home"][data-pcc-doc-explorer-breadcrumb-current="false"]',
    );
    expect(nonCurrent).not.toBeNull();
    expect(nonCurrent!.tagName).toBe('BUTTON');
    // The current segment (procore) is not a button.
    const current = band.querySelector(
      '[data-pcc-doc-explorer-breadcrumb="procore"][data-pcc-doc-explorer-breadcrumb-current="true"]',
    );
    expect(current).not.toBeNull();
    expect(current!.tagName).toBe('SPAN');
  });
});

describe('PccDocumentControlExplorerShell — Home pane', () => {
  it('renders three destination tiles for Project Record / My Project Files / Procore (Document Crunch / Adobe Sign live in External References, not as tiles — Prompt 10E)', async () => {
    const { container } = await renderShell();
    const tiles = container.querySelectorAll('[data-pcc-doc-explorer-destination]');
    const tileIds = Array.from(tiles).map((t) =>
      t.getAttribute('data-pcc-doc-explorer-destination'),
    );
    expect(tileIds).toEqual(['project-record', 'my-project-files', 'procore']);
    expect(tileIds).not.toContain('document-crunch');
    expect(tileIds).not.toContain('adobe-sign');
    // Tile text content does not mention DC/AS — those systems render in the
    // External References section below the tile grid (verified separately).
    const tileText = Array.from(tiles)
      .map((t) => t.textContent ?? '')
      .join(' ');
    expect(tileText).not.toContain('Document Crunch');
    expect(tileText).not.toContain('Adobe Sign');
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

  it('Prompt 10F — destination tile summaries surface read-only Project Record + project-scoped MPF + launch-only Procore guardrails', async () => {
    const { container } = await renderShell();
    const projectRecordTile = container.querySelector(
      '[data-pcc-doc-explorer-destination="project-record"]',
    );
    const mpfTile = container.querySelector(
      '[data-pcc-doc-explorer-destination="my-project-files"]',
    );
    const procoreTile = container.querySelector('[data-pcc-doc-explorer-destination="procore"]');
    expect(projectRecordTile!.textContent ?? '').toMatch(/SharePoint/);
    expect(projectRecordTile!.textContent ?? '').toMatch(/[Rr]ead-only/);
    expect(mpfTile!.textContent ?? '').toMatch(/[Pp]roject-scoped/);
    expect(mpfTile!.textContent ?? '').toMatch(/formal project record/);
    expect(procoreTile!.textContent ?? '').toMatch(/[Ll]aunch-only|deep-link/);
    expect(procoreTile!.textContent ?? '').toMatch(/does not write back to Procore/);
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

  it('folder rows are interactive <button type="button"> drill-down controls with no external anchors (Prompt 10D)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')!;
    const rowButtons = pane.querySelectorAll('button[data-pcc-doc-explorer-row]');
    expect(rowButtons.length).toBeGreaterThan(0);
    for (const btn of rowButtons) {
      expect((btn as HTMLButtonElement).getAttribute('type')).toBe('button');
    }
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

  it('category rows are interactive <button type="button"> drill-down controls with no external anchors (Prompt 10D)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    const rowButtons = pane.querySelectorAll('button[data-pcc-doc-explorer-row]');
    expect(rowButtons.length).toBeGreaterThan(0);
    for (const btn of rowButtons) {
      expect((btn as HTMLButtonElement).getAttribute('type')).toBe('button');
    }
    expect(pane.querySelectorAll('a[href]')).toHaveLength(0);
  });

  it('Procore pane never carries Document Crunch / Adobe Sign rows (those live in Home External References only — Prompt 10E)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    const text =
      container.querySelector('[data-pcc-doc-explorer-pane="procore"]')?.textContent ?? '';
    expect(text).not.toContain('Document Crunch');
    expect(text).not.toContain('Adobe Sign');
  });
});

// ───────────────────────────────────────────────────────────────────────
// Prompt 10D — navigation state, drill-down, breadcrumb back, source
// switching from depth, mounted per-source path retention, Home reset,
// and `activeModuleId` mapping.

function folderRow(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[data-pcc-doc-explorer-row]'),
  );
  const match = buttons.find((b) => b.querySelector('span')?.textContent === label);
  expect(match, `folder row '${label}' must render`).toBeDefined();
  return match!;
}

function categoryRow(container: HTMLElement, label: string): HTMLButtonElement {
  return folderRow(container, label);
}

function breadcrumbLabels(container: HTMLElement): readonly string[] {
  const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]')!;
  return Array.from(band.querySelectorAll('[data-pcc-doc-explorer-breadcrumb]')).map(
    (n) => n.textContent?.trim() ?? '',
  );
}

describe('PccDocumentControlExplorerShell — Prompt 10D Project Record drill-down', () => {
  it('clicking a folder row updates the current path and renders its children', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '07-RFI'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')!;
    const rows = pane.querySelectorAll('button[data-pcc-doc-explorer-row]');
    expect(rows.length).toBeGreaterThan(0);
    const labels = Array.from(rows).map((r) => r.querySelector('span')?.textContent ?? '');
    expect(labels).toContain('001.Description.R');
  });

  it('breadcrumb gains a third segment matching the drilled folder label', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '07-RFI'));
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
      '07-RFI',
    ]);
    const band = container.querySelector('[data-pcc-doc-explorer-breadcrumbs="true"]')!;
    const current = band.querySelector('[data-pcc-doc-explorer-breadcrumb-current="true"]');
    expect(current!.getAttribute('data-pcc-doc-explorer-breadcrumb')).toBe('project-record/07-RFI');
  });

  it('clicking a parent breadcrumb segment navigates upward', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '07-RFI'));
    fireEvent.click(folderRow(container as HTMLElement, '001.Description.R'));
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
      '07-RFI',
      '001.Description.R',
    ]);
    // Click the middle 07-RFI segment to navigate up one level.
    const upButton = container.querySelector(
      'button[data-pcc-doc-explorer-breadcrumb="project-record/07-RFI"]',
    );
    expect(upButton).not.toBeNull();
    fireEvent.click(upButton!);
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
      '07-RFI',
    ]);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10D Procore category drill-down (Prompt 10E linked-record content)', () => {
  it('clicking a Procore category drills in, updates the breadcrumb, and renders linked-record rows (no empty-state marker after 10E)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    fireEvent.click(categoryRow(container as HTMLElement, 'Documents'));
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Procore',
      'Documents',
    ]);
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    expect(pane.querySelector('[data-pcc-doc-explorer-empty="true"]')).toBeNull();
    const linkedRows = pane.querySelectorAll('[data-pcc-doc-explorer-row-kind="linked-record"]');
    expect(linkedRows.length).toBeGreaterThan(0);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10D one-click source switching from depth', () => {
  it('from a deep Project Record path, clicking Procore in the rail switches in one action', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '12-Accounting'));
    fireEvent.click(folderRow(container as HTMLElement, 'PayApp'));
    fireEvent.click(folderRow(container as HTMLElement, 'Sub'));
    // From depth, click Procore in the source rail in one action.
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    expect(
      railButton(container as HTMLElement, 'procore').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Procore',
    ]);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10D mounted per-source path retention', () => {
  it('switching away from a drilled Project Record path and back restores the same path', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '12-Accounting'));
    fireEvent.click(folderRow(container as HTMLElement, 'PayApp'));
    fireEvent.click(folderRow(container as HTMLElement, 'Sub'));
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
      '12-Accounting',
      'PayApp',
      'Sub',
    ]);
    // Switch to Procore, then back to Project Record.
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    // Path restored.
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
      '12-Accounting',
      'PayApp',
      'Sub',
    ]);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10D Home reset', () => {
  it('clicking Home in the rail returns to the home pane and a single-segment breadcrumb', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'project-record'));
    fireEvent.click(folderRow(container as HTMLElement, '07-RFI'));
    fireEvent.click(railButton(container as HTMLElement, 'home'));
    expect(container.querySelector('[data-pcc-doc-explorer-pane="home"]')).not.toBeNull();
    expect(breadcrumbLabels(container as HTMLElement)).toEqual(['Document Control Home']);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10D activeModuleId mapping (locked table)', () => {
  it('sharepoint-project-record → initial focus is Project Record root', async () => {
    const { container } = await renderShell('sharepoint-project-record');
    expect(
      railButton(container as HTMLElement, 'project-record').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(container.querySelector('[data-pcc-doc-explorer-pane="project-record"]')).not.toBeNull();
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Project Record',
    ]);
  });

  it('procore-documents → initial focus is Procore at the Documents category', async () => {
    const { container } = await renderShell('procore-documents');
    expect(
      railButton(container as HTMLElement, 'procore').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Procore',
      'Documents',
    ]);
  });

  it('my-project-files → initial focus is the My Project Files pane', async () => {
    const { container } = await renderShell('my-project-files');
    expect(
      railButton(container as HTMLElement, 'my-project-files').getAttribute(
        'data-pcc-doc-explorer-source-selected',
      ),
    ).toBe('true');
    expect(
      container.querySelector('[data-pcc-doc-explorer-pane="my-project-files"]'),
    ).not.toBeNull();
  });

  it('primary-documents and document-control-center map to Home', async () => {
    for (const id of ['primary-documents', 'document-control-center'] as const) {
      cleanup();
      const { container } = await renderShell(id);
      expect(
        railButton(container as HTMLElement, 'home').getAttribute(
          'data-pcc-doc-explorer-source-selected',
        ),
      ).toBe('true');
      expect(container.querySelector('[data-pcc-doc-explorer-pane="home"]')).not.toBeNull();
    }
  });

  it('external-reference and deferred module ids fall back to Home on initial render', async () => {
    for (const id of ['document-crunch', 'adobe-sign', 'drawing-model-center'] as const) {
      cleanup();
      const { container } = await renderShell(id);
      expect(
        railButton(container as HTMLElement, 'home').getAttribute(
          'data-pcc-doc-explorer-source-selected',
        ),
      ).toBe('true');
      expect(container.querySelector('[data-pcc-doc-explorer-pane="home"]')).not.toBeNull();
    }
  });
});

// ───────────────────────────────────────────────────────────────────────
// Prompt 10E — Procore linked-record directory + External References

describe('PccDocumentControlExplorerShell — Prompt 10E Procore linked-record drill-down', () => {
  it('renders linked-record rows inside a drilled Procore category pane with disabled launch affordances', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    fireEvent.click(categoryRow(container as HTMLElement, 'Documents'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    const linkedRows = pane.querySelectorAll('[data-pcc-doc-explorer-row-kind="linked-record"]');
    expect(linkedRows.length).toBeGreaterThan(0);
    // Each linked-record row exposes a label and an inert disabled affordance
    // with the locked launch-reason copy.
    for (const row of linkedRows) {
      const label = row.querySelector('span')?.textContent ?? '';
      expect(label.length).toBeGreaterThan(0);
      const reason = row.querySelector('[data-pcc-disabled-affordance-reason]')?.textContent ?? '';
      expect(reason).toMatch(/Direct launch is not available/);
    }
    // No live external anchors anywhere in the pane.
    expect(pane.querySelectorAll('a[href]')).toHaveLength(0);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10E Procore category-pane posture cue', () => {
  it('renders the posture cue when drilled into a Procore category', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    fireEvent.click(categoryRow(container as HTMLElement, 'Documents'));
    const cue = container.querySelector('[data-pcc-doc-explorer-procore-posture="true"]');
    expect(cue).not.toBeNull();
    expect(cue!.textContent ?? '').toMatch(/Procore is the source system/);
    expect(cue!.textContent ?? '').toMatch(/does not mirror, sync, or write back/);
  });

  it('does NOT render the posture cue at Procore root (no drill-in)', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    expect(container.querySelector('[data-pcc-doc-explorer-procore-posture="true"]')).toBeNull();
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10E linked-record rows are structurally inert', () => {
  it('inside a drilled Procore category pane, linked-record rows are <li> (not <button>), carry no drill-down <button> wrapping, no <a href> anchor, and the breadcrumb depth stays at the category', async () => {
    const { container } = await renderShell();
    fireEvent.click(railButton(container as HTMLElement, 'procore'));
    fireEvent.click(categoryRow(container as HTMLElement, 'Documents'));
    const pane = container.querySelector('[data-pcc-doc-explorer-pane="procore"]')!;
    const linkedRows = pane.querySelectorAll('[data-pcc-doc-explorer-row-kind="linked-record"]');
    expect(linkedRows.length).toBeGreaterThan(0);
    for (const row of linkedRows) {
      // The row itself is an <li>, not a <button>.
      expect(row.tagName).toBe('LI');
      // No descendant drill-down button (a button that carries the row marker).
      expect(row.querySelectorAll('button[data-pcc-doc-explorer-row]')).toHaveLength(0);
      // No external anchor inside the row.
      expect(row.querySelectorAll('a[href]')).toHaveLength(0);
    }
    // Breadcrumb depth remains at the category segment count (Home / Procore /
    // Documents = 3). Linked-record rows do not introduce a further drill.
    expect(breadcrumbLabels(container as HTMLElement)).toEqual([
      'Document Control Home',
      'Procore',
      'Documents',
    ]);
  });
});

describe('PccDocumentControlExplorerShell — Prompt 10E External References on Home', () => {
  it('no-client fallback omits the External References section (empty references prop)', () => {
    const utils = render(
      <PccBentoGrid forceMode="desktop">
        <PccDocumentsSurface />
      </PccBentoGrid>,
    );
    expect(
      utils.container.querySelector('[data-pcc-doc-explorer-external-references="true"]'),
    ).toBeNull();
    cleanup();
  });

  it('with fixture read-model, renders Document Crunch + Adobe Sign rows in the External References section (not as destination tiles)', async () => {
    const { container } = await renderShell();
    const section = container.querySelector('[data-pcc-doc-explorer-external-references="true"]');
    expect(section).not.toBeNull();
    const dc = section!.querySelector(
      '[data-pcc-doc-explorer-external-reference="document-crunch"]',
    );
    const adobe = section!.querySelector('[data-pcc-doc-explorer-external-reference="adobe-sign"]');
    expect(dc, 'Document Crunch external-reference row must render').not.toBeNull();
    expect(adobe, 'Adobe Sign external-reference row must render').not.toBeNull();
    expect(dc!.textContent ?? '').toContain('Document Crunch');
    expect(adobe!.textContent ?? '').toContain('Adobe Sign');
    // Each row exposes a disabled-affordance with a product-safe reason.
    expect(dc!.querySelector('[data-pcc-disabled-affordance-reason]')).not.toBeNull();
    expect(adobe!.querySelector('[data-pcc-disabled-affordance-reason]')).not.toBeNull();
    // No live external anchors.
    expect(section!.querySelectorAll('a[href]')).toHaveLength(0);
    // Document Crunch / Adobe Sign are NOT destination tiles.
    const tileIds = Array.from(
      container.querySelectorAll('[data-pcc-doc-explorer-destination]'),
    ).map((t) => t.getAttribute('data-pcc-doc-explorer-destination'));
    expect(tileIds).not.toContain('document-crunch');
    expect(tileIds).not.toContain('adobe-sign');
  });
});
