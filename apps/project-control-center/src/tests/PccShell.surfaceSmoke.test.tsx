import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

// Wave 15A wave-b9 Prompt 04 + Prompts 4B-01 / 4B-05 / 4B-08 / 4B-09 —
// bifurcated surface sets. Project Home moved out after
// `PccProjectIntelligenceCard` was removed; Approvals moved out after
// `HomeCard` was removed (metric pills absorbed into `QueueCard`); Site
// Health moved out after `PccSiteHealthOverviewCard` was removed
// (overview metrics absorbed into `PccSiteHealthChecksCard`); Documents
// moved out after `PccDocumentsHeaderCard` was deleted and replaced by
// state-aware seam `PccDocumentControlStateCard`. Only project-readiness
// remains in `SURFACES_WITH_COMPATIBILITY_CARD` after Prompt 4B-09.
const SURFACES_WITH_COMPATIBILITY_CARD: readonly PccMvpSurfaceId[] = ['project-readiness'];

function expectsCompatibilityCard(surfaceId: PccMvpSurfaceId): boolean {
  return SURFACES_WITH_COMPATIBILITY_CARD.includes(surfaceId);
}

describe('PccShell all-surface smoke (shell-level)', () => {
  // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> is the
  // semantic active-panel owner. Surface command/header cards still emit
  // a card-level `data-pcc-active-surface-panel` compatibility marker, so
  // a broad `[data-pcc-active-surface-panel]` count in a shell-rendered
  // tree is legitimately >= 1. This smoke locks the shell-owner contract
  // and the direct-bento-child compatibility-card invariant per surface.
  it('activates each tab with shell-owned active panel and one direct bento-child compatibility card', () => {
    const { container } = render(<PccApp forceMode="desktop" />);

    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = getSurfaceSelectionControl(container, id);
      expect(tab, `tab '${id}' should render`).not.toBeNull();

      fireEvent.click(tab!);

      const selectedTabs = container.querySelectorAll(
        '[data-pcc-horizontal-tabs] [data-pcc-tab-id][aria-selected="true"]',
      );
      expect(selectedTabs).toHaveLength(1);
      expect(selectedTabs[0]?.getAttribute('data-pcc-tab-id')).toBe(id);

      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
      );
      expect(shellPanels, `shell panel must own active surface '${id}'`).toHaveLength(1);
      const shellPanel = shellPanels[0]!;
      expect(shellPanel.getAttribute('id')).toBe('pcc-active-surface-panel');
      expect(shellPanel.getAttribute('aria-labelledby')).toBe(`pcc-tab-${id}`);

      const bento = shellPanel.querySelector('[data-pcc-bento-grid]') as HTMLElement | null;
      expect(bento, `shell panel for '${id}' must contain [data-pcc-bento-grid]`).not.toBeNull();
      const compatibilityCards = Array.from(bento!.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${id}"]`),
      );
      const expectedCount = expectsCompatibilityCard(id) ? 1 : 0;
      expect(
        compatibilityCards,
        expectedCount === 1
          ? `surface '${id}' must render exactly one direct bento-child compatibility card`
          : `surface '${id}' must NOT render a direct bento-child compatibility card after Phase 04`,
      ).toHaveLength(expectedCount);
      const directCards = Array.from(bento!.children).filter((child) =>
        child.matches('[data-pcc-card]'),
      );
      expect(
        directCards.length,
        `surface '${id}' must still render at least one direct-child card`,
      ).toBeGreaterThan(0);
    }
  });
});
