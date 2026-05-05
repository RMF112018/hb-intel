import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import {
  PCC_PREVIEW_STATES,
  PCC_PREVIEW_STATE_SPECS,
  PccPreviewState,
  type PccPreviewStateKind,
} from '../ui/PccPreviewState';

afterEach(() => {
  cleanup();
});

const EXPECTED_PRODUCT_COPY: Record<
  PccPreviewStateKind,
  { badge: string; title: string; description: string }
> = {
  preview: {
    badge: 'Reference',
    title: 'Reference view',
    description: 'This area shows reference content for the selected project.',
  },
  empty: {
    badge: 'Empty',
    title: 'Nothing to show yet',
    description: 'No items match the current view.',
  },
  loading: {
    badge: 'Loading',
    title: 'Loading…',
    description: 'Loading the latest information.',
  },
  error: {
    badge: 'Error',
    title: 'We could not load this section',
    description: 'Try again, or contact your administrator if the issue continues.',
  },
  'missing-config': {
    badge: 'Setup needed',
    title: 'Configuration needed',
    description:
      'This area needs configuration before it can show data. Ask your administrator to complete setup.',
  },
  'unavailable-fixture': {
    badge: 'Unavailable',
    title: 'Not available for this project',
    description:
      'This area is part of the Project Control Center, but no content is available for the selected project.',
  },
  'unauthorized-persona': {
    badge: 'Restricted',
    title: 'Not visible to your role',
    description:
      'You do not have access to this area. Contact your administrator if you need access.',
  },
  'not-yet-implemented-operation': {
    badge: 'Unavailable',
    title: 'Action not available',
    description: 'This action is not available in the current view.',
  },
};

describe('PccPreviewState — state catalog', () => {
  it('exposes exactly eight distinct states', () => {
    expect(PCC_PREVIEW_STATES).toHaveLength(8);
    expect(new Set(PCC_PREVIEW_STATES).size).toBe(8);
  });

  for (const state of PCC_PREVIEW_STATES) {
    it(`renders the '${state}' variant with product-grade copy and structural markers`, () => {
      const spec = PCC_PREVIEW_STATE_SPECS[state];
      const expected = EXPECTED_PRODUCT_COPY[state];

      expect(spec.badge).toBe(expected.badge);
      expect(spec.title).toBe(expected.title);
      expect(spec.description).toBe(expected.description);

      const { container } = render(<PccPreviewState state={state} />);
      const root = container.querySelector(`[data-pcc-state="${state}"]`);
      expect(root, `state '${state}' root should render`).not.toBeNull();
      expect(root?.getAttribute('data-pcc-state-tone')).toBe(spec.tone);
      expect(root?.textContent).toContain(spec.badge);
      expect(root?.textContent).toContain(spec.title);
      expect(root?.textContent).toContain(spec.description);
    });
  }

  it('renders the loading state with aria-busy', () => {
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

describe('PccPreviewState — reason and nextStep slots', () => {
  it('renders a reason node with the supplied text', () => {
    const { container } = render(
      <PccPreviewState state="missing-config" reason="Project site has not been configured." />,
    );
    const reason = container.querySelector('[data-pcc-preview-state-reason]');
    expect(reason).not.toBeNull();
    expect(reason?.textContent).toBe('Project site has not been configured.');
  });

  it('renders a next-step node with the supplied text', () => {
    const { container } = render(
      <PccPreviewState
        state="error"
        reason="The connection timed out."
        nextStep="Try again, or contact your administrator."
      />,
    );
    const nextStep = container.querySelector('[data-pcc-preview-state-next-step]');
    expect(nextStep).not.toBeNull();
    expect(nextStep?.textContent).toBe('Try again, or contact your administrator.');
  });

  it('omits the reason node when reason is not provided', () => {
    const { container } = render(<PccPreviewState state="preview" />);
    expect(container.querySelector('[data-pcc-preview-state-reason]')).toBeNull();
    expect(container.querySelector('[data-pcc-preview-state-next-step]')).toBeNull();
  });
});
