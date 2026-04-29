import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_ACTION_IDS,
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  PCC_MVP_SURFACES,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';

const microsoftSourceIds = DOCUMENT_CONTROL_SOURCE_IDS.filter(
  (id) => DOCUMENT_CONTROL_SOURCES[id].lane === 'microsoft-files',
);
const externalSourceIds = DOCUMENT_CONTROL_SOURCE_IDS.filter(
  (id) => DOCUMENT_CONTROL_SOURCES[id].lane === 'external-document-systems',
);

function renderSurface() {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccDocumentsSurface />
    </PccBentoGrid>,
  );
}

describe('PccDocumentsSurface (Wave 2 / Prompt 06)', () => {
  it('renders the header card + one card per Document Control source as direct grid children', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(1 + DOCUMENT_CONTROL_SOURCE_IDS.length);
    for (const card of cards) {
      expect(card.parentElement === grid, 'card must be a direct child of the bento grid').toBe(true);
      const span = Number(card.getAttribute('data-pcc-column-span'));
      expect(span).toBeGreaterThan(0);
    }
  });

  it('exactly one [data-pcc-active-surface-panel="documents"] exists, on the header card', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('documents');
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['documents'].displayName);
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['documents'].description);
  });

  it('renders both lanes from canonical DOCUMENT_CONTROL_LANES', () => {
    const { container } = renderSurface();
    const microsoftLaneTiles = container.querySelectorAll('[data-pcc-doc-lane="microsoft-files"][data-pcc-document-source-id]');
    const externalLaneTiles = container.querySelectorAll('[data-pcc-doc-lane="external-document-systems"][data-pcc-document-source-id]');
    expect(microsoftLaneTiles).toHaveLength(microsoftSourceIds.length);
    expect(externalLaneTiles).toHaveLength(externalSourceIds.length);
  });

  it('every Microsoft-lane source card renders all canonical action chips as disabled buttons', () => {
    const { container } = renderSurface();
    for (const sourceId of microsoftSourceIds) {
      const tile = container.querySelector(`[data-pcc-document-source-id="${sourceId}"][data-pcc-doc-lane="microsoft-files"]`);
      expect(tile, `Microsoft tile for ${sourceId} should render`).not.toBeNull();
      const actions = tile!.querySelectorAll('[data-pcc-doc-action]');
      expect(actions).toHaveLength(DOCUMENT_CONTROL_ACTION_IDS.length);
      for (const el of actions) {
        expect(el.tagName).toBe('BUTTON');
        const button = el as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-disabled')).toBe('true');
        expect(button.getAttribute('onclick')).toBeNull();
        expect(button.getAttribute('data-pcc-doc-action-execution-state')).toBe('preview-disabled');
        // visible label comes from canonical DOCUMENT_CONTROL_ACTIONS
        const actionId = button.getAttribute('data-pcc-doc-action') as keyof typeof DOCUMENT_CONTROL_ACTIONS;
        expect(button.textContent).toContain(DOCUMENT_CONTROL_ACTIONS[actionId].label);
      }
    }
  });

  it('External-lane source cards render launch/visibility cues only and contain no action buttons', () => {
    const { container } = renderSurface();
    for (const sourceId of externalSourceIds) {
      const tile = container.querySelector(`[data-pcc-document-source-id="${sourceId}"][data-pcc-doc-lane="external-document-systems"]`);
      expect(tile, `External tile for ${sourceId} should render`).not.toBeNull();
      const launchCues = tile!.querySelectorAll('[data-pcc-doc-launch-cue]');
      expect(launchCues.length).toBeGreaterThan(0);
      const actionButtons = tile!.querySelectorAll('[data-pcc-doc-action]');
      expect(actionButtons.length).toBe(0);
    }
  });

  it('renders no <a href="http(s)://"> elements anywhere on the surface', () => {
    const { container } = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });
});
