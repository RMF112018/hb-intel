import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  PCC_PREVIEW_STATES,
  PCC_PREVIEW_STATE_SPECS,
  PccPreviewState,
} from '../ui/PccPreviewState';

describe('PccPreviewState — full W2-ODR-009 catalog', () => {
  it('exposes exactly eight distinct states', () => {
    expect(PCC_PREVIEW_STATES).toHaveLength(8);
    const set = new Set(PCC_PREVIEW_STATES);
    expect(set.size).toBe(8);
  });

  for (const state of PCC_PREVIEW_STATES) {
    it(`renders the '${state}' variant with distinct markers and non-empty spec copy`, () => {
      const spec = PCC_PREVIEW_STATE_SPECS[state];
      expect(spec).toBeDefined();
      expect(spec.badge.trim().length).toBeGreaterThan(0);
      expect(spec.title.trim().length).toBeGreaterThan(0);
      expect(spec.description.trim().length).toBeGreaterThan(0);

      const { container } = render(<PccPreviewState state={state} />);
      const root = container.querySelector(`[data-pcc-state="${state}"]`);
      expect(root, `state '${state}' root should render`).not.toBeNull();
      const tone = root?.getAttribute('data-pcc-state-tone');
      expect(tone).toBe(spec.tone);
      expect(root?.textContent).toContain(spec.badge);
      expect(root?.textContent).toContain(spec.title);
      expect(root?.textContent).toContain(spec.description);
    });
  }

  it('renders the loading state with aria-busy and pulse marker', () => {
    const { container } = render(<PccPreviewState state="loading" />);
    const root = container.querySelector('[data-pcc-state="loading"]');
    expect(root?.getAttribute('aria-busy')).toBe('true');
  });

  it('renders the error state with role=alert', () => {
    const { container } = render(<PccPreviewState state="error" />);
    const root = container.querySelector('[data-pcc-state="error"]');
    expect(root?.getAttribute('role')).toBe('alert');
  });
});
