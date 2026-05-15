import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
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
  MyWorkAdobeSignActionQueueItem,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';

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
  } = {},
) {
  const { readinessVariant = 'non-ready', homeEnvelope, sourceStatus, onConnect } = options;
  return render(
    <MyWorkBentoGrid mode="standardLaptop">
      <AdobeSignActionQueueCard
        readinessVariant={readinessVariant}
        homeEnvelope={homeEnvelope}
        sourceStatus={sourceStatus}
        onConnect={onConnect}
      />
    </MyWorkBentoGrid>,
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
    expect(card?.textContent).toContain('Action Queue');
    expect(card?.getAttribute('data-my-work-module')).toBe('adobe-sign-action-queue');
  });
});

describe('AdobeSignActionQueueCard — loading state', () => {
  it('renders the locked loading badge + body, skeleton rows, no metrics, no items, no CTA', () => {
    const { container } = renderCard({ readinessVariant: 'loading' });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('loading');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Loading');
    expect(card.textContent).toContain('Loading your Adobe Sign queue…');
    expect(container.querySelector('[data-adobe-sign-action-queue-skeleton]')).not.toBeNull();
    expect(container.querySelector('[data-adobe-sign-action-queue-metrics]')).toBeNull();
    expect(container.querySelector('[data-my-work-agreement-list]')).toBeNull();
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
    expect(card.textContent).toContain(
      'Connect Adobe Sign to load agreements that need your review, signature, approval, or other action.',
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
    expect(card.textContent).toContain('Connect Adobe Sign to load agreements');
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
    expect(card.textContent).toContain(
      'Adobe Sign must be configured before your action queue can load.',
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
    expect(card.textContent).toContain(
      'Your HB account could not be matched to an Adobe Sign user for this queue.',
    );
    expect(container.querySelector('[data-adobe-sign-action-queue-secondary]')?.textContent).toBe(
      'Contact an administrator if this persists.',
    );
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
    expect(card.textContent).toContain(
      'Adobe Sign is temporarily unavailable. Your queue will resume once the source is reachable.',
    );
  });
});

describe('AdobeSignActionQueueCard — backend-unavailable (via readinessVariant="error")', () => {
  it('renders the locked badge + body when the readiness variant is error', () => {
    const { container } = renderCard({ readinessVariant: 'error' });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('backend-unavailable');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Temporarily unavailable');
    expect(card.textContent).toContain(
      'The My Dashboard service is not responding right now. Try again shortly.',
    );
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
    expect(card.textContent).toContain(
      'The My Dashboard service is not responding right now. Try again shortly.',
    );
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
    expect(card.textContent).toContain(
      'Some queue details may be incomplete. Showing the latest available Adobe Sign results.',
    );
    // Per ADOBE_SIGN_QUEUE_PARTIAL: 3 items total — 1 signature + 1 approval + 1 acceptance.
    expect(container.querySelector('[data-adobe-queue-summary-pending]')?.textContent).toBe('3');
    expect(container.querySelector('[data-adobe-queue-summary-signature]')?.textContent).toBe('1');
    expect(container.querySelector('[data-adobe-queue-summary-review]')?.textContent).toBe('2');
    expect(container.querySelectorAll('[data-my-work-agreement-item]').length).toBe(3);
  });
});

describe('AdobeSignActionQueueCard — available + zero items', () => {
  it('renders the Ready badge + zero-state body + no metrics + no items', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_EMPTY,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('available-empty');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Ready');
    expect(card.textContent).toContain('No Adobe Sign agreements currently need your action.');
    expect(container.querySelector('[data-my-work-empty-queue]')).not.toBeNull();
    expect(container.querySelector('[data-my-work-agreement-list]')).toBeNull();
    // State matrix 1.8: metrics are omitted in the ready + zero-items state.
    expect(container.querySelector('[data-adobe-sign-action-queue-metrics]')).toBeNull();
  });
});

describe('AdobeSignActionQueueCard — available + items', () => {
  it('renders the Ready badge + metrics + up to 5 items', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const card = container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]')!;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('available-items');
    expect(card.getAttribute('data-adobe-sign-action-queue-badge')).toBe('Ready');
    expect(container.querySelector('[data-adobe-queue-summary-pending]')?.textContent).toBe('6');
    // The available fixture has 6 total items — preview limit is 5.
    expect(container.querySelectorAll('[data-my-work-agreement-item]').length).toBeLessThanOrEqual(
      5,
    );
  });
});

describe('AdobeSignActionQueueCard — item handoff anchor', () => {
  it('renders an Open in Adobe Sign anchor when item.sourceOpenUrl is present', () => {
    const { container } = renderCard({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const anchors = container.querySelectorAll('[data-adobe-sign-item-open-action="start"]');
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
      expect(anchor.textContent).toContain('Open in Adobe Sign');
    });
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
    expect(container.querySelectorAll('[data-my-work-agreement-item]').length).toBeGreaterThan(0);
    // But no handoff anchor renders because no item carries a truthful URL.
    expect(container.querySelector('[data-adobe-sign-item-open-action="start"]')).toBeNull();
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
  it('emits MyWorkCard article semantics with aria-labelledby pointing at the visible Action Queue heading', () => {
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
    expect(heading?.textContent).toBe('Action Queue');
    // No default aria-label injected (MyWorkCard's ariaLabel prop is optional).
    expect(card.hasAttribute('aria-label')).toBe(false);
  });

  it('respects an explicit ariaLabel prop override', () => {
    const { container } = render(
      <MyWorkBentoGrid mode="standardLaptop">
        <AdobeSignActionQueueCard
          readinessVariant="ready"
          homeEnvelope={MY_WORK_HOME_AVAILABLE}
          ariaLabel="Custom card label"
        />
      </MyWorkBentoGrid>,
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
