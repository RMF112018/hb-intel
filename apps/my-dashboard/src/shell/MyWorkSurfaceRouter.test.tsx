import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_PARTIAL,
} from '@hbc/models/myWork/fixtures';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
import { MyWorkBentoGrid } from '../layout/MyWorkBentoGrid.js';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';

import { MyWorkActiveEnvelopeProvider } from './MyWorkActiveEnvelopeContext.js';
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

function renderRouter(client: IMyWorkReadModelClient) {
  return render(
    <MyWorkReadModelClientProvider client={client}>
      <MyWorkActiveEnvelopeProvider>
        <MyWorkBentoGrid mode="standardLaptop">
          <MyWorkSurfaceRouter activePrimarySurfaceId="my-work-home" />
        </MyWorkBentoGrid>
      </MyWorkActiveEnvelopeProvider>
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

describe('MyWorkSurfaceRouter — single primary-page command surface', () => {
  it('renders the home surface', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull(),
    );
    // The retired focused-Adobe queue-summary card must NOT appear.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]'),
    ).toBeNull();
    // Retired surface cards (Work Summary, Source Readiness) must NOT appear.
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('does not introduce a router-owned wrapper element or data attribute', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-my-work-surface-router]')).toBeNull();
  });
});

describe('MyWorkSurfaceRouter — home route readiness wiring', () => {
  it('renders the home ready tree when getMyWorkHome resolves "available"', async () => {
    const stub = makeStubClient();
    const { container } = renderRouter(stub);
    await waitFor(() =>
      expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']),
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
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
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
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    // Source Readiness card retired by Prompt 05.
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('renders both primary cards plus the loading marker while getMyWorkHome has not resolved (no false ready flash) and starts the project-links fetch in parallel', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { container } = renderRouter(stub);
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    // Both primary cards must mount during home loading so My Projects'
    // independent /project-links request can begin in parallel with /home.
    expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]'),
    ).not.toBeNull();
    // No false ready flash: the resolved branch's source-status marker must
    // not appear while the home envelope is still unresolved.
    expect(container.querySelector('[data-my-work-source-status]')).toBeNull();
    // Retired/legacy surface markers must still be absent.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
    // The provider-stub spy proves My Projects starts its /project-links
    // fetch while /home is still unresolved (parallel-fetch contract).
    await waitFor(() => expect(stub.getMyProjectLinks).toHaveBeenCalled());
  });
});

describe('MyWorkSurfaceRouter — route-scoped fetching', () => {
  it('does NOT call the Adobe queue method on the single primary page', async () => {
    const stub = makeStubClient();
    renderRouter(stub);
    await waitFor(() => expect(stub.getMyWorkHome).toHaveBeenCalledTimes(1));
    expect(stub.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });
});
