import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

const PROMPT_07_SURFACES = [
  'team-and-access',
  'control-center-settings',
  'approvals',
  'project-readiness',
] as const;

// Surface-owned panel copy. After wave-b2 Prompt 03 removed the duplicated
// PccSurfaceContextHeader from happy-path, the panel no longer carries the
// surface description from PCC_MVP_SURFACES; assert against copy that is
// genuinely panel-owned (PreviewState titles / dashboard card titles).
const SURFACE_PREVIEW_COPY: Record<(typeof PROMPT_07_SURFACES)[number], string> = {
  'team-and-access': 'Team and access overview',
  'control-center-settings': 'Settings overview',
  approvals: 'Approvals home',
  'project-readiness': 'Project readiness',
};

describe('Prompt 07 routed surface invariants', () => {
  for (const surfaceId of PROMPT_07_SURFACES) {
    it(`renders '${surfaceId}' with the shell-owned active-surface panel and surface preview copy`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const button = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> is the
      // semantic active-panel owner; the surface command card retains a
      // compatibility marker. Lock shell ownership and verify panel copy
      // through the shell panel (which contains the surface card).
      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
      );
      expect(shellPanels).toHaveLength(1);
      expect(shellPanels[0].getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
      expect(shellPanels[0].textContent).toContain(SURFACE_PREVIEW_COPY[surfaceId]);
    });
  }
});
