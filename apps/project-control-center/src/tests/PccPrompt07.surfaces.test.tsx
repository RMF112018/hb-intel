import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

const PROMPT_07_SURFACES = [
  'team-and-access',
  'control-center-settings',
  'approvals',
  'project-readiness',
] as const;

const SURFACE_PREVIEW_COPY: Record<(typeof PROMPT_07_SURFACES)[number], string> = {
  'team-and-access': 'Preview-only lifecycle',
  'control-center-settings': 'Preview-only settings visibility',
  approvals: 'Preview-only approval tracking',
  'project-readiness': 'Preview-only readiness rollup',
};

describe('Prompt 07 routed surface invariants', () => {
  for (const surfaceId of PROMPT_07_SURFACES) {
    it(`renders '${surfaceId}' with exactly one active-surface marker`, () => {
      const { container } = render(<PccApp forceMode="wideDesktop" />);
      const button = container.querySelector(`[data-pcc-surface-id="${surfaceId}"]`);
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const markers = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(markers).toHaveLength(1);
      expect(markers[0].getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
      expect(markers[0].textContent).toContain(SURFACE_PREVIEW_COPY[surfaceId]);
    });
  }
});
