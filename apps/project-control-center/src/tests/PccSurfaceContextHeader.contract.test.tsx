import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

describe('PccSurfaceContextHeader contract', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`renders standardized context fields for '${surfaceId}'`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const button = container.querySelector(`[data-pcc-surface-id="${surfaceId}"]`);
      expect(button).not.toBeNull();
      fireEvent.click(button!);

      const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(panels).toHaveLength(1);
      expect(panels[0]?.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);

      const context = container.querySelector(`[data-pcc-surface-context-id="${surfaceId}"]`);
      expect(context, 'surface context header should render').not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-project]')).not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-surface]')).not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-posture]')).not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-source-status]')).not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-source-confidence]')).not.toBeNull();
      expect(context?.querySelector('[data-pcc-context-last-updated]')).not.toBeNull();
    });
  }
});
