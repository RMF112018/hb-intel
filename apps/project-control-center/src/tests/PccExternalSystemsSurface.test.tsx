import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  EXTERNAL_SYSTEM_CATALOG,
  EXTERNAL_SYSTEM_IDS,
  PCC_MVP_SURFACES,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  type ExternalSystemId,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';

function renderSurface() {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccExternalSystemsSurface />
    </PccBentoGrid>,
  );
}

function expectedState(id: ExternalSystemId): 'configured' | 'missing' | 'unavailable-fixture' {
  if (SAMPLE_EXTERNAL_SYSTEM_LINKS.some((l) => l.systemId === id)) return 'configured';
  if (SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.some((m) => m.systemId === id)) return 'missing';
  return 'unavailable-fixture';
}

describe('PccExternalSystemsSurface (Wave 2 / Prompt 06)', () => {
  it('renders the header + one tile per EXTERNAL_SYSTEM_CATALOG entry as direct grid children', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(1 + Object.keys(EXTERNAL_SYSTEM_CATALOG).length);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
  });

  it('exactly one [data-pcc-active-surface-panel="external-systems"] exists', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('external-systems');
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['external-systems'].displayName);
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['external-systems'].description);
  });

  it('every system has a tile carrying tri-state markers and the canonical displayName', () => {
    const { container } = renderSurface();
    for (const id of EXTERNAL_SYSTEM_IDS) {
      const tile = container.querySelector(`[data-pcc-external-system-id="${id}"]`);
      expect(tile, `tile for system '${id}' should render`).not.toBeNull();
      const state = tile!.getAttribute('data-pcc-external-system-state');
      expect(['configured', 'missing', 'unavailable-fixture']).toContain(state);
      expect(state).toBe(expectedState(id));
      const enclosingCard = tile!.closest('[data-pcc-card]');
      expect(enclosingCard?.textContent).toContain(EXTERNAL_SYSTEM_CATALOG[id].displayName);
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
