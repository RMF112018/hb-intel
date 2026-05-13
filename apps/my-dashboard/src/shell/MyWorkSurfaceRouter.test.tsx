import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_PARTIAL,
} from '@hbc/models/myWork/fixtures';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
import { MyWorkBentoGrid } from '../layout/MyWorkBentoGrid.js';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';

import { MyWorkSurfaceRouter } from './MyWorkSurfaceRouter.js';

const PROJECT_LINKS_AVAILABLE: MyWorkReadModelEnvelope<MyProjectLinksReadModel> = {
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-05-13T00:00:00Z',
  data: { items: [], paging: { hasMore: false } } as unknown as MyProjectLinksReadModel,
};

function makeStubClient(overrides: Partial<IMyWorkReadModelClient> = {}): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AVAILABLE),
    getMyProjectLinks: vi.fn().mockResolvedValue(PROJECT_LINKS_AVAILABLE),
    startAdobeSignOAuth: vi.fn(),
    ...overrides,
  };
}

function renderRouter(
  client: IMyWorkReadModelClient,
  routerProps: Partial<React.ComponentProps<typeof MyWorkSurfaceRouter>> = {},
) {
  return render(
    <MyWorkReadModelClientProvider client={client}>
      <MyWorkBentoGrid mode="standardLaptop">
        <MyWorkSurfaceRouter activePrimarySurfaceId="my-work-home" {...routerProps} />
      </MyWorkBentoGrid>
    </MyWorkReadModelClientProvider>,
  );
}

function getCardRoles(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-my-work-bento-grid] [data-my-work-card-role]'),
  ).map((el) => el.getAttribute('data-my-work-card-role') ?? '');
}

beforeEach(() => {
  // No-op; vi.restoreAllMocks below clears spies.
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MyWorkSurfaceRouter — route dispatch', () => {
  it('renders the home surface when activeModuleId is undefined', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull(),
    );
    // The focused-only queue-summary card must NOT appear on the home route.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]'),
    ).toBeNull();
  });

  it('renders the Adobe Sign focused-module surface when its id is active', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(
        container.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]'),
      ).not.toBeNull(),
    );
    // Home-only work-summary card must NOT appear on the focused route.
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
  });

  it('falls back to the home surface when activeModuleId is an invalid string', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeModuleId: 'not-a-module' as any,
    });
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull(),
    );
  });

  it('does not introduce a router-owned wrapper element or data attribute', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-my-work-surface-router]')).toBeNull();
  });
});

describe('MyWorkSurfaceRouter — home route readiness wiring', () => {
  it('renders the home ready tree when getMyWorkHome resolves "available"', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(getCardRoles(container)).toEqual(['work-summary', 'adobe-sign-action-queue-home']),
    );
    expect(container.querySelector('[data-my-work-source-status="available"]')).not.toBeNull();
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).toBeNull();
  });

  it('renders the home ready tree with sourceStatus="partial" marker for partial envelope', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_PARTIAL),
    });
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-source-status="partial"]')).not.toBeNull(),
    );
    expect(getCardRoles(container)).toEqual(['work-summary', 'adobe-sign-action-queue-home']);
  });

  it('renders the home non-ready tree for "authorization-required" envelope', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AUTHORIZATION_REQUIRED),
    });
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(
        container.querySelector('[data-my-work-source-status="authorization-required"]'),
      ).not.toBeNull(),
    );
    expect(getCardRoles(container)).toEqual([
      'work-summary',
      'adobe-sign-queue-state',
      'source-readiness',
    ]);
  });

  it('renders only the loading marker while getMyWorkHome has not resolved (no false ready flash)', () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { container } = renderRouter(stub);
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });
});

describe('MyWorkSurfaceRouter — Adobe Sign route readiness wiring', () => {
  it('renders the Adobe ready tree when getAdobeSignActionQueue resolves "available"', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(getCardRoles(container)).toEqual([
        'adobe-sign-queue-summary',
        'adobe-sign-agreement-action-list',
      ]),
    );
    expect(container.querySelector('[data-my-work-source-status="available"]')).not.toBeNull();
  });

  it('renders the Adobe non-ready tree for "configuration-required"', async () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED),
    });
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(
        container.querySelector('[data-my-work-source-status="configuration-required"]'),
      ).not.toBeNull(),
    );
    expect(getCardRoles(container)).toEqual([
      'adobe-sign-queue-state',
      'adobe-sign-connection-guidance',
    ]);
  });

  it('renders the Adobe non-ready tree for "backend-unavailable"', async () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE),
    });
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(
        container.querySelector('[data-my-work-source-status="backend-unavailable"]'),
      ).not.toBeNull(),
    );
  });

  it('renders the Adobe non-ready tree for "principal-unresolved"', async () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED),
    });
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(
        container.querySelector('[data-my-work-source-status="principal-unresolved"]'),
      ).not.toBeNull(),
    );
  });

  it('renders the error marker when getAdobeSignActionQueue rejects', async () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockRejectedValue(new Error('boom')),
    });
    const { container } = renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-readiness-state="error"]')).not.toBeNull(),
    );
    expect(getCardRoles(container)).toEqual([]);
  });
});

describe('MyWorkSurfaceRouter — route-scoped fetching', () => {
  it('does NOT call the Adobe queue method when only the home route is active', async () => {
    const stub = makeStubClient();
    renderRouter(stub);
    await waitFor(() => expect(stub.getMyWorkHome).toHaveBeenCalledTimes(1));
    expect(stub.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('does NOT call the home method when only the Adobe queue route is active', async () => {
    const stub = makeStubClient();
    renderRouter(stub, { activeModuleId: 'adobe-sign-action-queue' });
    await waitFor(() => expect(stub.getAdobeSignActionQueue).toHaveBeenCalledTimes(1));
    expect(stub.getMyWorkHome).not.toHaveBeenCalled();
  });
});
