import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Phase 05 wave-b10 Prompt 04 — every Phase 05 primary tab is shell-only.
// The shell `<main role="tabpanel">` is the sole carrier of
// `data-pcc-active-surface-panel`; no bento-child card emits the marker.

describe('PccShell all-primary-tab smoke (shell-level)', () => {
  it('activates each primary tab with shell-owned active panel and zero direct bento-child cards carrying [data-pcc-active-surface-panel]', () => {
    const { container } = render(<PccApp forceMode="desktop" />);

    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, id);
      expect(tab, `primary tab '${id}' should render`).not.toBeNull();

      fireEvent.click(tab!);

      const selectedTabs = container.querySelectorAll(
        '[data-pcc-horizontal-tabs] [role="tab"][aria-selected="true"]',
      );
      expect(selectedTabs).toHaveLength(1);
      expect(selectedTabs[0]?.getAttribute('data-pcc-tab-id')).toBe(id);

      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
      );
      expect(shellPanels, `shell panel must own active primary tab '${id}'`).toHaveLength(1);
      const shellPanel = shellPanels[0]!;
      expect(shellPanel.getAttribute('id')).toBe('pcc-active-surface-panel');
      expect(shellPanel.getAttribute('aria-labelledby')).toBe(`pcc-tab-${id}`);

      const bento = shellPanel.querySelector('[data-pcc-bento-grid]') as HTMLElement | null;
      expect(bento, `shell panel for '${id}' must contain [data-pcc-bento-grid]`).not.toBeNull();
      const compatibilityCards = Array.from(bento!.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${id}"]`),
      );
      expect(
        compatibilityCards,
        `primary tab '${id}' must NOT render a direct bento-child card carrying [data-pcc-active-surface-panel] (Phase 05 is shell-owned)`,
      ).toHaveLength(0);
      const directCards = Array.from(bento!.children).filter((child) =>
        child.matches('[data-pcc-card]'),
      );
      expect(
        directCards.length,
        `primary tab '${id}' must still render at least one direct-child card`,
      ).toBeGreaterThan(0);
    }
  });
});
