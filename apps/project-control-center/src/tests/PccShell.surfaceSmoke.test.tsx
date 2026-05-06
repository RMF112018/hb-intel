import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

describe('PccShell all-surface smoke (shell-level)', () => {
  it('activates each tab and keeps exactly one active panel with matching selected id', () => {
    const { container } = render(<PccApp forceMode="desktop" />);

    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(
        `[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`,
      ) as HTMLButtonElement | null;
      expect(tab, `tab '${id}' should render`).not.toBeNull();

      fireEvent.click(tab!);

      const selectedTabs = container.querySelectorAll(
        '[data-pcc-horizontal-tabs] [data-pcc-tab-id][aria-selected="true"]',
      );
      expect(selectedTabs).toHaveLength(1);
      expect(selectedTabs[0]?.getAttribute('data-pcc-tab-id')).toBe(id);

      const activePanels = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(activePanels).toHaveLength(1);
      expect(activePanels[0]?.getAttribute('data-pcc-active-surface-panel')).toBe(id);
    }
  });
});
