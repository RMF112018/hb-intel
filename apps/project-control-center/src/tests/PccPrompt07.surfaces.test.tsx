import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

const PROMPT_07_SURFACES = [
  'team-and-access',
  'control-center-settings',
  'approvals',
  'project-readiness',
] as const;

// Surface-owned panel content markers. Wave 15A wave-b9 Prompt 04 —
// after the duplicate header cards were removed for `team-and-access`
// and `control-center-settings`, those surfaces no longer carry the
// previous "Team and access overview" / "Settings overview" preview-copy
// strings. Each surface is now identified by a structural data-* marker
// that survives removal and stays panel-resident regardless of branch.
const SURFACE_PREVIEW_MARKER: Record<(typeof PROMPT_07_SURFACES)[number], string> = {
  // Default render is `access-manager` branch which renders the access-
  // manager lane card; in the shell-rendered ready path the lane is
  // present even before any preview-persona prop is applied.
  'team-and-access': '[data-pcc-team-access-lane="access-manager"]',
  // Surviving Scope Lanes card on Control Center Settings.
  'control-center-settings': '[data-pcc-settings-scope-grid]',
  // Approvals retains its operational HomeCard with the lane-marker grid.
  approvals: '[data-pcc-approvals-lane="policy"]',
  // Project Readiness retains its hero/state slot.
  'project-readiness': '[data-pcc-readiness-region]',
};

describe('Prompt 07 routed surface invariants', () => {
  for (const surfaceId of PROMPT_07_SURFACES) {
    it(`renders '${surfaceId}' with the shell-owned active-surface panel and surface preview copy`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const button = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> is the
      // semantic active-panel owner. Lock shell ownership and verify a
      // structural surface-specific marker is rendered inside the panel.
      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
      );
      expect(shellPanels).toHaveLength(1);
      expect(shellPanels[0].getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
      const marker = shellPanels[0].querySelector(SURFACE_PREVIEW_MARKER[surfaceId]);
      expect(
        marker,
        `surface '${surfaceId}' panel must contain marker '${SURFACE_PREVIEW_MARKER[surfaceId]}'`,
      ).not.toBeNull();
    });
  }
});
