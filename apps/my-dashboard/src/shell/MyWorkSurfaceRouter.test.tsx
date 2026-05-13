import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MyWorkSurfaceRouter } from './MyWorkSurfaceRouter.js';

afterEach(() => {
  cleanup();
});

describe('MyWorkSurfaceRouter', () => {
  it('renders the home surface when activeModuleId is undefined', () => {
    const { container } = render(
      <MyWorkSurfaceRouter activePrimarySurfaceId="my-work-home" />,
    );
    expect(
      container.querySelector('[data-my-work-surface="my-work-home"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-my-work-surface="adobe-sign-action-queue"]'),
    ).toBeNull();
  });

  it('renders the Adobe Sign focused-module surface when its id is active', () => {
    const { container } = render(
      <MyWorkSurfaceRouter
        activePrimarySurfaceId="my-work-home"
        activeModuleId="adobe-sign-action-queue"
      />,
    );
    expect(
      container.querySelector('[data-my-work-surface="adobe-sign-action-queue"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-my-work-surface="my-work-home"]'),
    ).toBeNull();
  });

  it('falls back to the home surface when activeModuleId is an invalid string', () => {
    const { container } = render(
      <MyWorkSurfaceRouter
        activePrimarySurfaceId="my-work-home"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeModuleId={'not-a-module' as any}
      />,
    );
    expect(
      container.querySelector('[data-my-work-surface="my-work-home"]'),
    ).not.toBeNull();
  });

  it('does not introduce a router-owned wrapper element or data attribute', () => {
    const { container } = render(
      <MyWorkSurfaceRouter activePrimarySurfaceId="my-work-home" />,
    );
    expect(container.querySelector('[data-my-work-surface-router]')).toBeNull();
  });
});
