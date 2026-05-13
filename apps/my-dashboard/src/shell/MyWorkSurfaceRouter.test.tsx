import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MyWorkBentoGrid } from '../layout/MyWorkBentoGrid.js';
import { MyWorkSurfaceRouter } from './MyWorkSurfaceRouter.js';

function renderRouter(props: React.ComponentProps<typeof MyWorkSurfaceRouter>) {
  return render(
    <MyWorkBentoGrid mode="standardLaptop">
      <MyWorkSurfaceRouter {...props} />
    </MyWorkBentoGrid>,
  );
}

afterEach(() => {
  cleanup();
});

describe('MyWorkSurfaceRouter', () => {
  it('renders the home surface when activeModuleId is undefined', () => {
    const { container } = renderRouter({ activePrimarySurfaceId: 'my-work-home' });
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull();
    expect(container.querySelector('[data-my-work-module="adobe-sign-action-queue"]')).not.toBeNull();
    // Home defaults to non-ready, so the queue-state card (Adobe-module-tagged) is present,
    // but the focused-only queue-summary card must NOT be.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]'),
    ).toBeNull();
  });

  it('renders the Adobe Sign focused-module surface when its id is active', () => {
    const { container } = renderRouter({
      activePrimarySurfaceId: 'my-work-home',
      activeModuleId: 'adobe-sign-action-queue',
    });
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelectorAll('[data-my-work-module="adobe-sign-action-queue"]').length)
      .toBeGreaterThan(0);
  });

  it('falls back to the home surface when activeModuleId is an invalid string', () => {
    const { container } = renderRouter({
      activePrimarySurfaceId: 'my-work-home',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeModuleId: 'not-a-module' as any,
    });
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull();
  });

  it('does not introduce a router-owned wrapper element or data attribute', () => {
    const { container } = renderRouter({ activePrimarySurfaceId: 'my-work-home' });
    expect(container.querySelector('[data-my-work-surface-router]')).toBeNull();
  });
});
