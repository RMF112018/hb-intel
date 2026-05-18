import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
  ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY,
  ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL,
  ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED,
  ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_EMPTY,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
  MY_WORK_HOME_SOURCE_UNAVAILABLE,
} from '@hbc/models/myWork/fixtures';
import type {
  AdobeSignActionLinkResolveResult,
  MyWorkAdobeSignActionQueueItem,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { MyWorkReadModelClientProvider } from '../../runtime/MyWorkReadModelClientProvider.js';

import { AdobeSignActionQueueCard } from './AdobeSignActionQueueCard.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCard(
  options: {
    readinessVariant?: 'loading' | 'ready' | 'non-ready' | 'error';
    homeEnvelope?: MyWorkReadModelEnvelope<MyWorkHomeReadModel>;
    sourceStatus?:
      | 'authorization-required'
      | 'configuration-required'
      | 'principal-unresolved'
      | 'source-unavailable'
      | 'backend-unavailable';
    onConnect?: () => Promise<void>;
    onReconnect?: () => Promise<void>;
    onDisconnect?: () => Promise<void>;
    onAfterDisconnect?: () => void;
    recentCompletionsEnvelope?: unknown;
    getAdobeSignRecentCompletions?: () => Promise<unknown>;
    resolveAdobeSignActionLink?: () => Promise<AdobeSignActionLinkResolveResult>;
    mode?: Parameters<typeof MyWorkBentoGrid>[0]['mode'];
  } = {},
) {
  const {
    readinessVariant = 'non-ready',
    homeEnvelope,
    sourceStatus,
    onConnect,
    onReconnect,
    onDisconnect,
    onAfterDisconnect,
    recentCompletionsEnvelope,
    getAdobeSignRecentCompletions,
    resolveAdobeSignActionLink,
    mode = 'standardLaptop',
  } = options;
  const getRecentCompletions =
    getAdobeSignRecentCompletions ??
    vi.fn(async () => recentCompletionsEnvelope ?? ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
  const client: any = {
    getMyWorkHome: vi.fn(async () => MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn(async () => MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue),
    getAdobeSignRecentCompletions: getRecentCompletions,
    getMyProjectLinks: vi.fn(async () => {
      throw new Error('unused');
    }),
    resolveAdobeSignActionLink:
      resolveAdobeSignActionLink ?? vi.fn(async () => ({ status: 'source-unavailable' as const })),
    startAdobeSignOAuth: vi.fn(async () => {
      throw new Error('unused');
    }),
  };
  return render(
    <MyWorkReadModelClientProvider client={client}>
      <MyWorkBentoGrid mode={mode}>
        <AdobeSignActionQueueCard
          readinessVariant={readinessVariant}
          homeEnvelope={homeEnvelope}
          sourceStatus={sourceStatus}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onDisconnect={onDisconnect}
          onAfterDisconnect={onAfterDisconnect}
        />
      </MyWorkBentoGrid>
    </MyWorkReadModelClientProvider>,
  );
}

const RETIRED_TELEMETRY_PHRASES: readonly string[] = [
  'Pending source connection',
  'Queue visibility only',
  'Source health',
  'Action system',
];

describe('AdobeSignActionQueueCard — card identity', () => {
  it('renders the locked eyebrow + title in every state', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]');
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain('Adobe Sign');
    expect(card?.textContent).toContain('Agreement Activity');
    expect(card?.getAttribute('data-my-work-module')).toBe('adobe-sign-action-queue');
  });

  it('keeps a stable noninteractive heading and does not embed the view switch in it', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const heading = container.querySelector('h3');
    expect(heading?.textContent).toBe('Agreement Activity');
    expect(heading?.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-view-switch]')).not.toBeNull();
  });

  it('stamps the responsive layout mode marker for representative modes', () => {
    const phone = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      mode: 'phone',
    });
    expect(
      phone.container
        .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
        ?.getAttribute('data-adobe-sign-layout-mode'),
    ).toBe('phone');
    phone.unmount();

    const standardLaptop = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      mode: 'standardLaptop',
    });
    expect(
      standardLaptop.container
        .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
        ?.getAttribute('data-adobe-sign-layout-mode'),
    ).toBe('standardLaptop');
    standardLaptop.unmount();

    const desktop = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      mode: 'desktop',
    });
    expect(
      desktop.container
        .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
        ?.getAttribute('data-adobe-sign-layout-mode'),
    ).toBe('desktop');
    desktop.unmount();
  });
});

describe('AdobeSignActionQueueCard — header toggle', () => {
  it('renders semantic tablist/tab wiring and panel relationships', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList).not.toBeNull();
    const queueTab = container.querySelector(
      '[data-adobe-sign-card-view="action-queue"]',
    ) as HTMLButtonElement;
    const completedTab = container.querySelector(
      '[data-adobe-sign-card-view="completed"]',
    ) as HTMLButtonElement;
    expect(queueTab.getAttribute('role')).toBe('tab');
    expect(completedTab.getAttribute('role')).toBe('tab');
    expect(queueTab.getAttribute('aria-controls')).toBe('adobe-sign-panel-action-queue');
    expect(completedTab.getAttribute('aria-controls')).toBe('adobe-sign-panel-completed');
    expect(container.querySelector('#adobe-sign-panel-action-queue')?.getAttribute('role')).toBe(
      'tabpanel',
    );
    expect(container.querySelector('#adobe-sign-panel-completed')?.getAttribute('role')).toBe(
      'tabpanel',
    );
    expect(
      container.querySelector('#adobe-sign-panel-action-queue')?.getAttribute('aria-labelledby'),
    ).toBe(queueTab.id);
    expect(
      container.querySelector('#adobe-sign-panel-completed')?.getAttribute('aria-labelledby'),
    ).toBe(completedTab.id);
  });

  it('defaults to Action Queue selected and swaps selected markers on click', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const toggle = container.querySelector('[data-adobe-sign-card-view-toggle]');
    expect(toggle).not.toBeNull();
    expect(
      container
        .querySelector('[data-adobe-sign-card-view="action-queue"]')
        ?.getAttribute('data-adobe-sign-card-view-selected'),
    ).toBe('true');
    expect(
      container
        .querySelector('[data-adobe-sign-card-view="completed"]')
        ?.getAttribute('data-adobe-sign-card-view-selected'),
    ).toBe('false');
    expect(
      container
        .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
        ?.getAttribute('data-adobe-sign-active-view'),
    ).toBe('action-queue');

    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.getAttribute('data-adobe-sign-active-view'),
      ).toBe('completed');
    });
    expect(
      container
        .querySelector('[data-adobe-sign-card-view="action-queue"]')
        ?.getAttribute('data-adobe-sign-card-view-selected'),
    ).toBe('false');
    expect(
      container
        .querySelector('[data-adobe-sign-card-view="completed"]')
        ?.getAttribute('data-adobe-sign-card-view-selected'),
    ).toBe('true');
  });

  it('uses manual activation: arrows/home/end move focus but do not activate', async () => {
    const getAdobeSignRecentCompletions = vi
      .fn()
      .mockResolvedValue(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      getAdobeSignRecentCompletions,
    });
    const queueTab = container.querySelector(
      '[data-adobe-sign-card-view="action-queue"]',
    ) as HTMLButtonElement;
    const completedTab = container.querySelector(
      '[data-adobe-sign-card-view="completed"]',
    ) as HTMLButtonElement;
    queueTab.focus();

    fireEvent.keyDown(queueTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(completedTab);
    fireEvent.keyDown(completedTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(queueTab);
    fireEvent.keyDown(queueTab, { key: 'End' });
    expect(document.activeElement).toBe(completedTab);
    fireEvent.keyDown(completedTab, { key: 'Home' });
    expect(document.activeElement).toBe(queueTab);
    expect(
      container
        .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
        ?.getAttribute('data-adobe-sign-active-view'),
    ).toBe('action-queue');
    expect(getAdobeSignRecentCompletions).toHaveBeenCalledTimes(0);
  });

  it('activates completed with Enter and keeps active panel labelled by the active tab', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const completedTab = container.querySelector(
      '[data-adobe-sign-card-view="completed"]',
    ) as HTMLButtonElement;
    completedTab.focus();
    fireEvent.keyDown(completedTab, { key: 'Enter' });
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.getAttribute('data-adobe-sign-active-view'),
      ).toBe('completed');
    });
    expect(completedTab.getAttribute('aria-selected')).toBe('true');
    const completedPanel = container.querySelector('#adobe-sign-panel-completed');
    expect(completedPanel?.getAttribute('aria-labelledby')).toBe(completedTab.id);
  });

  it('activates tabs with Space without click scaffolding', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const completedButton = container.querySelector(
      '[data-adobe-sign-card-view="completed"]',
    ) as HTMLButtonElement;
    completedButton.focus();
    fireEvent.keyDown(completedButton, { key: ' ' });
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.getAttribute('data-adobe-sign-active-view'),
      ).toBe('completed');
    });
    const queueButton = container.querySelector(
      '[data-adobe-sign-card-view="action-queue"]',
    ) as HTMLButtonElement;
    queueButton.focus();
    fireEvent.keyDown(queueButton, { key: ' ' });
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.getAttribute('data-adobe-sign-active-view'),
      ).toBe('action-queue');
    });
  });

  it('hides toggle in non-capable states', () => {
    const cases: Array<[string, MyWorkReadModelEnvelope<MyWorkHomeReadModel> | undefined, any]> = [
      ['loading', undefined, 'loading'],
      ['authorization-required', MY_WORK_HOME_AUTHORIZATION_REQUIRED, 'non-ready'],
      ['configuration-required', MY_WORK_HOME_CONFIGURATION_REQUIRED, 'non-ready'],
      ['principal-unresolved', MY_WORK_HOME_PRINCIPAL_UNRESOLVED, 'non-ready'],
      ['source-unavailable', MY_WORK_HOME_SOURCE_UNAVAILABLE, 'non-ready'],
      ['backend-unavailable', MY_WORK_HOME_BACKEND_UNAVAILABLE, 'non-ready'],
    ];
    for (const [, envelope, readiness] of cases) {
      const { container, unmount } = renderCard({
        readinessVariant: readiness,
        homeEnvelope: envelope,
      });
      expect(container.querySelector('[data-adobe-sign-card-view-toggle]')).toBeNull();
      unmount();
    }
  });
});

describe('AdobeSignActionQueueCard — loading state', () => {
  it('renders the locked loading badge + authored panel copy, no KPI strip, no items, no CTA', () => {
    const { container } = renderCard({ readinessVariant: 'loading' });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('loading');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Loading');
    expect(container.querySelector('[data-adobe-sign-status-chip]')).toBeNull();
    expect(card.textContent).toContain('Loading your Adobe Sign action queue…');
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-activity-list]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});

describe('AdobeSignActionQueueCard — authorization-required + onConnect (backend posture)', () => {
  it('renders the Connect CTA, idle by default', () => {
    const onConnect = vi.fn().mockResolvedValue(undefined);
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      onConnect,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('authorization-required');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Connect required');
    expect(card.textContent).toContain('Connect Adobe Sign to load your action queue.');
    expect(card.textContent).toContain(
      'Agreements needing your review, signature, approval, or other action will appear here after authorization.',
    );
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
    expect(button.textContent).toBe('Connect Adobe Sign');
  });

  it('invokes onConnect once, transitions through connecting → idle, and disables the button during the call', async () => {
    let resolve!: () => void;
    const onConnect = vi.fn().mockImplementation(
      () =>
        new Promise<void>((res) => {
          resolve = res;
        }),
    );
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      onConnect,
    });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    fireEvent.click(button);
    expect(onConnect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('connecting');
    });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.textContent).toBe('Connecting…');
    resolve();
    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
    });
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('transitions to error state when onConnect rejects, and renders an alert paragraph', async () => {
    const onConnect = vi.fn().mockRejectedValue(new Error('boom'));
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      onConnect,
    });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    fireEvent.click(button);
    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('error');
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to start the Adobe Sign connection',
    );
    expect(button.hasAttribute('disabled')).toBe(false);
  });
});

describe('AdobeSignActionQueueCard — authorization-required + no onConnect (fixture posture)', () => {
  it('renders the body copy and badge, but no Connect CTA', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('authorization-required');
    expect(card.textContent).toContain('Connect Adobe Sign to load your action queue.');
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});

describe('AdobeSignActionQueueCard — configuration-required', () => {
  it('renders the locked badge + body, suppresses Connect CTA even when onConnect is provided', () => {
    const onConnect = vi.fn().mockResolvedValue(undefined);
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_CONFIGURATION_REQUIRED,
      onConnect,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('configuration-required');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Configuration required');
    expect(card.textContent).toContain('Adobe Sign setup is required.');
    expect(card.textContent).toContain(
      'This dashboard cannot load agreement activity until Adobe Sign configuration is completed.',
    );
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});

describe('AdobeSignActionQueueCard — principal-unresolved', () => {
  it('renders the locked badge + body + secondary administrator line', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('principal-unresolved');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Account needs attention');
    expect(card.textContent).toContain('Adobe Sign account matching needs attention.');
    expect(card.textContent).toContain(
      'Your HB account could not be matched to an Adobe Sign user for this activity panel.',
    );
    expect(card.textContent).toContain('Contact an administrator if this persists.');
  });
});

describe('AdobeSignActionQueueCard — source-unavailable', () => {
  it('renders the locked badge + body', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_SOURCE_UNAVAILABLE,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('source-unavailable');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Temporarily unavailable');
    expect(card.textContent).toContain('Adobe Sign is temporarily unavailable.');
    expect(card.textContent).toContain(
      'Your action queue will resume once the source is reachable.',
    );
  });
});

describe('AdobeSignActionQueueCard — backend-unavailable (via readinessVariant="error")', () => {
  it('renders the locked badge + body when the readiness variant is error', () => {
    const { container } = renderCard({ readinessVariant: 'error' });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('backend-unavailable');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Temporarily unavailable');
    expect(card.textContent).toContain('The My Dashboard service is temporarily unavailable.');
    expect(card.textContent).toContain('Try again shortly.');
  });
});

describe('AdobeSignActionQueueCard — backend-unavailable (via sourceStatus)', () => {
  it('renders the same locked badge + body when sourceStatus is backend-unavailable', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_BACKEND_UNAVAILABLE,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('backend-unavailable');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Temporarily unavailable');
    expect(card.textContent).toContain('The My Dashboard service is temporarily unavailable.');
    expect(card.textContent).toContain('Try again shortly.');
  });
});

describe('AdobeSignActionQueueCard — partial', () => {
  it('renders the partial badge + caution body + metrics + items', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_PARTIAL,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('partial');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Partial data');
    expect(container.querySelector('[data-adobe-sign-status-chip]')).toBeNull();
    // Per ADOBE_SIGN_QUEUE_PARTIAL: 3 items total — 1 signature + 1 approval + 1 acceptance.
    expect(container.querySelector('[data-adobe-queue-summary-pending]')?.textContent).toBe('3');
    expect(container.querySelector('[data-adobe-queue-summary-signature]')?.textContent).toBe('1');
    expect(container.querySelector('[data-adobe-queue-summary-review]')?.textContent).toBe('2');
    expect(container.querySelectorAll('[data-adobe-sign-activity-row]').length).toBe(3);
  });
});

describe('AdobeSignActionQueueCard — available + zero items', () => {
  it('renders the Ready badge + zero-state body + KPI strip + no items', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_EMPTY,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('available-empty');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Ready');
    expect(card.textContent).toContain('No Adobe Sign agreements need your action.');
    expect(card.textContent).toContain(
      'Your queue is clear based on the latest available Adobe Sign read.',
    );
    expect(container.querySelector('[data-adobe-sign-activity-list]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')).not.toBeNull();
  });
});

describe('AdobeSignActionQueueCard — available + items', () => {
  it('renders the Ready badge + KPI strip + up to 5 items', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('available-items');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Ready');
    expect(container.querySelector('[data-adobe-sign-status-chip]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-freshness]')?.textContent).toContain(
      'Last refreshed',
    );
    expect(container.querySelector('[data-adobe-queue-summary-pending]')?.textContent).toBe('6');
    // The available fixture has 6 total items — preview limit is 5.
    expect(container.querySelectorAll('[data-adobe-sign-activity-row]').length).toBeLessThanOrEqual(
      5,
    );
    expect(container.querySelector('[data-adobe-sign-preview-context]')?.textContent).toContain(
      'Showing 5 of 6 agreements requiring action.',
    );
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')?.textContent).toContain(
      'Pending Agreements',
    );
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')?.textContent).toContain(
      'Signature Actions',
    );
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')?.textContent).toContain(
      'Review Contracts',
    );
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')?.textContent).toContain(
      'Complete < 30 Days',
    );
  });
});

describe('AdobeSignActionQueueCard — completed panel', () => {
  it('shows no status chip while completed fetch is in progress', async () => {
    let resolve!: (value: unknown) => void;
    const fetchCompleted = vi.fn(
      () =>
        new Promise((res) => {
          resolve = res;
        }),
    );
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      getAdobeSignRecentCompletions: fetchCompleted,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(container.querySelector('[data-adobe-sign-status-chip]')).toBeNull();
    });
    const panel = container.querySelector('#adobe-sign-panel-completed [role="status"]');
    expect(panel?.getAttribute('aria-live')).toBe('polite');
    resolve(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
  });

  it('does not fetch completed before selecting Completed; first select fetches once; second select reuses cache', async () => {
    const fetchCompleted = vi.fn(async () => ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      getAdobeSignRecentCompletions: fetchCompleted,
    });
    expect(fetchCompleted).toHaveBeenCalledTimes(0);

    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(fetchCompleted).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('available-items');
    });
    expect(container.querySelector('[data-adobe-sign-status-chip]')).toBeNull();

    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="action-queue"]')!);
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')).not.toBeNull();
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    expect(container.querySelector('[data-adobe-sign-kpi-strip]')).not.toBeNull();
    await waitFor(() => {
      expect(fetchCompleted).toHaveBeenCalledTimes(1);
    });
  });

  it('suppresses freshness when active view has no valid generated timestamp', () => {
    const noGeneratedEnvelope: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = {
      ...MY_WORK_HOME_AVAILABLE,
      generatedAtUtc: '',
    };
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: noGeneratedEnvelope,
    });
    expect(container.querySelector('[data-adobe-sign-freshness]')).toBeNull();
  });

  it('renders exact empty copy for available-empty state', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('available-empty');
    });
    expect(container.textContent).toContain(
      'No completed agreements were found in the last 30 days.',
    );
    expect(container.textContent).toContain(
      'Recent completion history will appear here when Adobe Sign reports completed agreements.',
    );
    expect(container.querySelector('[data-adobe-sign-preview-context]')).toBeNull();
  });

  it('renders populated completed rows and metric semantics', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('available-items');
    });
    expect(container.querySelector('[data-adobe-sign-completed-metrics]')?.textContent).toContain(
      'completed in the last 30 days',
    );
    expect(container.querySelectorAll('[data-adobe-sign-activity-row]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-adobe-sign-activity-row]').length).toBeLessThanOrEqual(
      5,
    );
  });

  it('renders completed metadata with sender/date fallback and never shows legacy placeholder', async () => {
    const customCompleted = {
      ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
      data: {
        ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data,
        items: [
          {
            ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items[0],
            completedAtUtc: undefined,
            modifiedAtUtc: undefined,
            sender: { displayName: 'Sender Only' },
          },
          {
            ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items[1],
            completedAtUtc: undefined,
            modifiedAtUtc: undefined,
            sender: undefined,
          },
        ],
      },
    };
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: customCompleted,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('available-items');
    });
    expect(container.textContent).toContain('From Sender Only');
    expect(container.textContent).toContain('Completion metadata not reported.');
    expect(container.textContent).not.toContain('Updated date unavailable');
  });

  it('renders partial completed copy and scoped degraded copy for degraded states', async () => {
    const partial = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL,
    });
    fireEvent.click(partial.container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        partial.container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('partial');
    });
    expect(partial.container.textContent).toContain(
      'Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.',
    );
    expect(partial.container.querySelector('[data-adobe-sign-completed-retry]')).not.toBeNull();
    partial.unmount();

    const degradedEnvelopes = [
      ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE,
      ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE,
    ];
    for (const envelope of degradedEnvelopes) {
      const degraded = renderCard({
        readinessVariant: 'ready',
        homeEnvelope: MY_WORK_HOME_AVAILABLE,
        recentCompletionsEnvelope: envelope,
      });
      fireEvent.click(degraded.container.querySelector('[data-adobe-sign-card-view="completed"]')!);
      await waitFor(() => {
        expect(degraded.container.textContent).toContain(
          'Recent Adobe Sign completions are temporarily unavailable.',
        );
      });
      expect(degraded.container.querySelector('[data-adobe-sign-completed-retry]')).not.toBeNull();
      expect(
        degraded.container
          .querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.getAttribute('data-adobe-sign-action-queue-state'),
      ).toBe('available-items');
      degraded.unmount();
    }

    const authoredPanels = [
      ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED,
      ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED,
      ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED,
    ];
    for (const envelope of authoredPanels) {
      const panel = renderCard({
        readinessVariant: 'ready',
        homeEnvelope: MY_WORK_HOME_AVAILABLE,
        recentCompletionsEnvelope: envelope,
      });
      fireEvent.click(panel.container.querySelector('[data-adobe-sign-card-view="completed"]')!);
      await waitFor(() => {
        expect(panel.container.querySelector('[data-adobe-sign-completed-retry]')).toBeNull();
      });
      panel.unmount();
    }
  });

  it('renders completed preview context only when total exceeds visible count', async () => {
    const previewCompleted = {
      ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
      data: {
        ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data,
        summary: {
          ...ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.summary,
          completedAgreementCount: 8,
        },
        items: ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE.data.items.slice(0, 2),
      },
    };
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: previewCompleted,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(
        container
          .querySelector('[data-adobe-sign-completed-panel-state]')
          ?.getAttribute('data-adobe-sign-completed-panel-state'),
      ).toBe('available-items');
    });
    expect(container.querySelector('[data-adobe-sign-preview-context]')?.textContent).toContain(
      'Showing latest',
    );
  });

  it('clicking completed retry reissues the recent completions request', async () => {
    const getAdobeSignRecentCompletions = vi
      .fn()
      .mockResolvedValueOnce(ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE)
      .mockResolvedValueOnce(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      getAdobeSignRecentCompletions,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      expect(container.querySelector('[data-adobe-sign-completed-retry]')).not.toBeNull();
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-completed-retry]')!);
    await waitFor(() => {
      expect(getAdobeSignRecentCompletions).toHaveBeenCalledTimes(2);
    });
  });
});

describe('AdobeSignActionQueueCard — item handoff actions', () => {
  it('renders a View anchor when item.sourceOpenUrl is present', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const anchors = container.querySelectorAll('[data-adobe-sign-row-open-action="start"]');
    // Positive existence: at least one preview item in MY_WORK_HOME_AVAILABLE carries a
    // policy-approved sourceOpenUrl, so the consolidated card must render at least one
    // handoff anchor. Asserting nonzero guards against a regression that strips all
    // anchors (which the prior forEach-only check silently allowed).
    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((anchor) => {
      expect(anchor.tagName).toBe('A');
      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      expect(anchor.getAttribute('href')).toBeTruthy();
      expect(anchor.textContent).toContain('View');
    });
  });

  it('keeps row open actions structurally visible in compact mode', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      mode: 'phone',
    });
    const rows = container.querySelectorAll('[data-adobe-sign-activity-row]');
    expect(rows.length).toBeGreaterThan(0);
    const action = container.querySelector('[data-adobe-sign-row-open-action="start"]');
    expect(action).not.toBeNull();
  });

  it('renders no handoff anchor when populated items omit sourceOpenUrl (no synthesized URLs)', () => {
    // Clone the available envelope and strip sourceOpenUrl from every preview item so
    // the card still receives a populated list but no truthful row-level URLs. This
    // proves Guardrail #5 (no synthesized URLs) by forcing the populated-items path
    // through a zero-URL fixture — far stronger than the previous test, which relied
    // on a fixture that may or may not have carried sourceOpenUrl.
    const sanitizedPreviewItems = MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.previewItems.map(
      ({ sourceOpenUrl: _sourceOpenUrl, ...item }) => item as MyWorkAdobeSignActionQueueItem,
    );
    const noOpenUrlEnvelope: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = {
      ...MY_WORK_HOME_AVAILABLE,
      data: {
        ...MY_WORK_HOME_AVAILABLE.data,
        adobeSignActionQueue: {
          ...MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue,
          previewItems: sanitizedPreviewItems,
        },
      },
    };
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: noOpenUrlEnvelope,
    });
    // The item list still renders (populated, ready).
    expect(container.querySelectorAll('[data-adobe-sign-activity-row]').length).toBeGreaterThan(0);
    // But no handoff anchor renders because no item carries a truthful URL.
    expect(container.querySelector('[data-adobe-sign-row-open-action="start"]')).toBeNull();
  });

  it('renders Act now only for resolver-capable queue rows', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const primaryActions = container.querySelectorAll(
      '[data-adobe-sign-row-primary-action="start"]',
    );
    expect(primaryActions.length).toBeGreaterThan(0);
    const labels = Array.from(primaryActions).map((el) => el.textContent?.trim());
    expect(labels.every((label) => label === 'Act now')).toBe(true);
  });

  it('renders two-row queue metadata with sender/date fallbacks and required action labels', () => {
    const first = MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.previewItems[0]!;
    const customEnvelope: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = {
      ...MY_WORK_HOME_AVAILABLE,
      data: {
        ...MY_WORK_HOME_AVAILABLE.data,
        adobeSignActionQueue: {
          ...MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue,
          previewItems: [
            {
              ...first,
              sender: undefined,
              createdAtUtc: undefined,
              modifiedAtUtc: first.modifiedAtUtc,
            },
          ],
        },
      },
    };
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: customEnvelope,
    });

    expect(container.querySelector('[data-adobe-sign-queue-row-one]')).not.toBeNull();
    expect(container.querySelector('[data-adobe-sign-queue-row-two]')).not.toBeNull();
    expect(container.textContent).toContain('received from Adobe Sign');
    expect(container.querySelector('[data-adobe-sign-queue-date]')?.textContent).toContain(
      'Updated',
    );
    expect(
      container.querySelector('[data-adobe-sign-queue-required-action]')?.textContent,
    ).toContain('required');
  });

  it('shows Opening… while resolving and surfaces row-local failure copy on non-success', async () => {
    let resolveRequest: (() => void) | undefined;
    const resolveAdobeSignActionLink = vi.fn(
      () =>
        new Promise<AdobeSignActionLinkResolveResult>((resolve) => {
          resolveRequest = () => resolve({ status: 'source-unavailable' });
        }),
    );
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      resolveAdobeSignActionLink,
    });

    const actNowButton = container.querySelector(
      '[data-adobe-sign-row-primary-action="start"]',
    ) as HTMLButtonElement | null;
    expect(actNowButton).not.toBeNull();
    fireEvent.click(actNowButton!);

    await waitFor(() => {
      expect(actNowButton?.textContent).toBe('Opening…');
      expect(actNowButton?.disabled).toBe(true);
    });

    resolveRequest?.();
    await waitFor(() => {
      expect(container.querySelector('[data-adobe-sign-row-error]')?.textContent).toContain(
        'Unable to open right now.',
      );
    });
  });

  it('surfaces reconnect guidance for scope-insufficient resolver failures', async () => {
    const resolveAdobeSignActionLink = vi.fn(async () => ({
      status: 'scope-insufficient' as const,
    }));
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      resolveAdobeSignActionLink,
    });

    const actNowButton = container.querySelector(
      '[data-adobe-sign-row-primary-action="start"]',
    ) as HTMLButtonElement | null;
    expect(actNowButton).not.toBeNull();
    fireEvent.click(actNowButton!);

    await waitFor(() => {
      expect(container.querySelector('[data-adobe-sign-row-error]')?.textContent).toContain(
        'Reconnect Adobe Sign to refresh permissions and try again.',
      );
    });
  });

  it('opens redirect url on resolver success and clears failure state', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const resolveAdobeSignActionLink = vi.fn(async () => ({
      status: 'redirect-ready' as const,
      redirectUrl: 'https://secure.adobesign.com/public/apiesign?x=1',
    }));
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      resolveAdobeSignActionLink,
    });

    const actNowButton = container.querySelector(
      '[data-adobe-sign-row-primary-action="start"]',
    ) as HTMLButtonElement | null;
    expect(actNowButton).not.toBeNull();
    fireEvent.click(actNowButton!);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        'https://secure.adobesign.com/public/apiesign?x=1',
        '_blank',
        'noopener,noreferrer',
      );
    });
    expect(container.querySelector('[data-adobe-sign-row-error]')).toBeNull();
  });

  it('keeps completed rows view-oriented', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      recentCompletionsEnvelope: ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE,
    });
    fireEvent.click(container.querySelector('[data-adobe-sign-card-view="completed"]')!);
    await waitFor(() => {
      const completedPanel = container.querySelector('#adobe-sign-panel-completed');
      expect(completedPanel?.hasAttribute('hidden')).toBe(false);
    });
    expect(container.querySelector('[data-adobe-sign-row-primary-action="start"]')).toBeNull();
    const completedOpen = container.querySelector('[data-adobe-sign-row-open-action="start"]');
    if (completedOpen) {
      expect(completedOpen.textContent).toContain('View');
    }
  });
});

describe('AdobeSignActionQueueCard — no retired markers', () => {
  it('emits none of the retired Adobe card roles', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-connection-guidance"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-agreement-action-list"]'),
    ).toBeNull();
  });
});

describe('AdobeSignActionQueueCard — no retired copy', () => {
  it.each(RETIRED_TELEMETRY_PHRASES)(
    'does not render the retired phrase "%s" inside the card text',
    (phrase) => {
      const { container } = renderCard({
        readinessVariant: 'ready',
        homeEnvelope: MY_WORK_HOME_AVAILABLE,
      });
      const cardText =
        container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')
          ?.textContent ?? '';
      expect(cardText).not.toContain(phrase);
    },
  );
});

describe('AdobeSignActionQueueCard — accessibility', () => {
  it('emits MyWorkCard article semantics with aria-labelledby pointing at the visible Agreement Activity heading', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const card = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(card.tagName).toBe('ARTICLE');
    const labelledBy = card.getAttribute('aria-labelledby');
    expect(labelledBy).not.toBeNull();
    const heading = labelledBy ? document.getElementById(labelledBy) : null;
    expect(heading?.textContent).toContain('Agreement Activity');
    // No default aria-label injected (MyWorkCard's ariaLabel prop is optional).
    expect(card.hasAttribute('aria-label')).toBe(false);
  });

  it('respects an explicit ariaLabel prop override', () => {
    const client: any = {
      getMyWorkHome: vi.fn(async () => MY_WORK_HOME_AVAILABLE),
      getAdobeSignActionQueue: vi.fn(async () => {
        throw new Error('unused');
      }),
      getAdobeSignRecentCompletions: vi.fn(async () => ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE),
      getMyProjectLinks: vi.fn(async () => {
        throw new Error('unused');
      }),
      resolveAdobeSignActionLink: vi.fn(async () => ({ status: 'source-unavailable' as const })),
      startAdobeSignOAuth: vi.fn(async () => {
        throw new Error('unused');
      }),
    };
    const { container } = render(
      <MyWorkReadModelClientProvider client={client}>
        <MyWorkBentoGrid mode="standardLaptop">
          <AdobeSignActionQueueCard
            readinessVariant="ready"
            homeEnvelope={MY_WORK_HOME_AVAILABLE}
            ariaLabel="Custom card label"
          />
        </MyWorkBentoGrid>
      </MyWorkReadModelClientProvider>,
    );
    const card = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(card.getAttribute('aria-label')).toBe('Custom card label');
  });
});

describe('AdobeSignActionQueueCard — locked-out content', () => {
  it('does not render PCC-style markers or developer-facing copy', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const html = container.innerHTML;
    expect(html.includes('data-pcc-')).toBe(false);
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
  });
});

describe('AdobeSignActionQueueCard — sourceStatus fallback', () => {
  it('uses the explicit sourceStatus prop when no envelope is provided', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      sourceStatus: 'authorization-required',
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('authorization-required');
  });

  it('envelope-derived status wins over the explicit sourceStatus prop', () => {
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_CONFIGURATION_REQUIRED,
      sourceStatus: 'source-unavailable',
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('configuration-required');
  });
});

// ---------------------------------------------------------------------------
// Adobe Sign options menu — ellipses-driven Connect / Reconnect / Disconnect.
// ---------------------------------------------------------------------------

const openOptionsMenu = (container: HTMLElement): HTMLButtonElement => {
  const button = container.querySelector<HTMLButtonElement>(
    '[data-adobe-sign-options-button="true"]',
  );
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  return button!;
};

const menuActionButton = (
  action: 'connect' | 'reconnect' | 'disconnect',
): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(`[data-adobe-sign-options-action="${action}"]`);

describe('AdobeSignActionQueueCard — options menu', () => {
  it('does not render an options button when no account-management callbacks are wired', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    expect(container.querySelector('[data-adobe-sign-options-button="true"]')).toBeNull();
  });

  it('authorization-required state offers both Connect and Reconnect items (both reach onConnect)', async () => {
    const onConnect = vi.fn(async () => {});
    const { container } = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      sourceStatus: 'authorization-required',
      onConnect,
    });
    const button = openOptionsMenu(container);
    expect(button.getAttribute('aria-label')).toBe('Adobe Sign options');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('true');

    const connect = menuActionButton('connect');
    const reconnect = menuActionButton('reconnect');
    const disconnect = menuActionButton('disconnect');
    expect(connect).not.toBeNull();
    expect(reconnect).not.toBeNull();
    expect(disconnect).toBeNull();
    expect(connect!.textContent).toContain('Connect Adobe Sign');
    expect(reconnect!.textContent).toContain('Reconnect Adobe Sign');

    fireEvent.click(reconnect!);
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1));
  });

  it('available state offers Reconnect and Disconnect (no Connect)', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    openOptionsMenu(container);
    expect(menuActionButton('connect')).toBeNull();
    expect(menuActionButton('reconnect')).not.toBeNull();
    expect(menuActionButton('disconnect')).not.toBeNull();
  });

  it('partial and source-unavailable states keep the Reconnect + Disconnect surface', () => {
    const partial = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_PARTIAL,
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    openOptionsMenu(partial.container);
    expect(menuActionButton('reconnect')).not.toBeNull();
    expect(menuActionButton('disconnect')).not.toBeNull();
    cleanup();

    const sourceUnavailable = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_SOURCE_UNAVAILABLE,
      sourceStatus: 'source-unavailable',
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    openOptionsMenu(sourceUnavailable.container);
    expect(menuActionButton('reconnect')).not.toBeNull();
    expect(menuActionButton('disconnect')).not.toBeNull();
  });

  it('uses onReconnect when supplied; falls back to onConnect when not', async () => {
    const onConnect = vi.fn(async () => {});
    const onReconnect = vi.fn(async () => {});
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect,
      onReconnect,
    });
    openOptionsMenu(container);
    fireEvent.click(menuActionButton('reconnect')!);
    await waitFor(() => expect(onReconnect).toHaveBeenCalledTimes(1));
    expect(onConnect).not.toHaveBeenCalled();
  });

  it('successful disconnect triggers onAfterDisconnect and clears stale row-level error', async () => {
    const onDisconnect = vi.fn(async () => {});
    const onAfterDisconnect = vi.fn();
    const resolveAdobeSignActionLink = vi.fn(async () => ({
      status: 'scope-insufficient' as const,
    }));
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect: vi.fn(async () => {}),
      onDisconnect,
      onAfterDisconnect,
      resolveAdobeSignActionLink,
    });

    // First produce a row-level error by clicking the existing Act now button.
    const actNow = container.querySelector<HTMLButtonElement>('[data-my-work-action-row-primary]');
    if (actNow) {
      fireEvent.click(actNow);
      await waitFor(() => expect(container.textContent ?? '').toContain('Reconnect Adobe Sign'));
    }

    openOptionsMenu(container);
    fireEvent.click(menuActionButton('disconnect')!);

    await waitFor(() => expect(onDisconnect).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onAfterDisconnect).toHaveBeenCalledTimes(1));

    // Row-level scope-insufficient copy must not survive a successful disconnect.
    expect(container.textContent ?? '').not.toContain(
      'Reconnect Adobe Sign to refresh permissions',
    );
  });

  it('failed disconnect surfaces safe error copy and does not call onAfterDisconnect', async () => {
    const onDisconnect = vi.fn(async () => {
      throw new Error('boom');
    });
    const onAfterDisconnect = vi.fn();
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect: vi.fn(async () => {}),
      onDisconnect,
      onAfterDisconnect,
    });

    openOptionsMenu(container);
    fireEvent.click(menuActionButton('disconnect')!);

    await waitFor(() => expect(onDisconnect).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        container.querySelector('[data-adobe-sign-disconnect-error="true"]')?.textContent,
      ).toContain('Unable to disconnect Adobe Sign right now. Please try again.'),
    );
    expect(onAfterDisconnect).not.toHaveBeenCalled();
  });

  it('options button is keyboard-focusable and opens the menu on click', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    const button = container.querySelector<HTMLButtonElement>(
      '[data-adobe-sign-options-button="true"]',
    )!;
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('Escape closes the open options menu', async () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    const button = openOptionsMenu(container);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(button.getAttribute('aria-expanded')).toBe('false'));
    expect(menuActionButton('reconnect')).toBeNull();
  });

  it('renders disabled menu items in loading / configuration-required / principal-unresolved states', () => {
    const loading = renderCard({
      readinessVariant: 'loading',
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    openOptionsMenu(loading.container);
    expect(menuActionButton('reconnect')?.disabled).toBe(true);
    expect(menuActionButton('disconnect')?.disabled).toBe(true);
    cleanup();

    const configRequired = renderCard({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_CONFIGURATION_REQUIRED,
      sourceStatus: 'configuration-required',
      onConnect: vi.fn(async () => {}),
      onDisconnect: vi.fn(async () => {}),
    });
    openOptionsMenu(configRequired.container);
    expect(menuActionButton('reconnect')?.disabled).toBe(true);
    expect(menuActionButton('disconnect')?.disabled).toBe(true);
  });
});
