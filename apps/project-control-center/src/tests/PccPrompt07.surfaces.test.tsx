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
    it(`renders '${surfaceId}' with exactly one active-surface marker`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const button = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const markers = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(markers).toHaveLength(1);
      expect(markers[0].getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
      expect(markers[0].textContent).toContain(SURFACE_PREVIEW_COPY[surfaceId]);
    });
  }
});
