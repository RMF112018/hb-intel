import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

import type { ConnectionGuidanceVm } from '../../state/myWorkCardViewModel.js';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { AdobeSignConnectionGuidanceCard } from './AdobeSignConnectionGuidanceCard.js';

afterEach(() => {
  cleanup();
});

function renderCard(props: React.ComponentProps<typeof AdobeSignConnectionGuidanceCard> = {}) {
  return render(
    <MyWorkBentoGrid mode="desktop">
      <AdobeSignConnectionGuidanceCard {...props} />
    </MyWorkBentoGrid>,
  );
}

const guidanceTextFragment =
  'Adobe Sign credentials and source authorization will be configured by an administrator';

describe('AdobeSignConnectionGuidanceCard — without onConnect (fixture posture)', () => {
  it('renders the guidance paragraph but no Connect button', () => {
    const { container } = renderCard();
    expect(container.textContent ?? '').toContain(guidanceTextFragment);
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});

describe('AdobeSignConnectionGuidanceCard — with onConnect (backend posture)', () => {
  it('renders the Connect Adobe Sign button alongside the guidance paragraph', () => {
    const onConnect = vi.fn(() => new Promise<void>(() => undefined));
    const { container } = renderCard({ onConnect });
    expect(container.textContent ?? '').toContain(guidanceTextFragment);
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Connect Adobe Sign');
    expect(button?.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
  });

  it('invokes onConnect exactly once on click and disables the button while connecting', async () => {
    let resolveConnect: (() => void) | undefined;
    const onConnect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConnect = resolve;
        }),
    );
    const { container } = renderCard({ onConnect });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    button.click();
    expect(onConnect).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('connecting');
    });
    expect(button.textContent).toBe('Connecting…');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    resolveConnect?.();
    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
    });
    expect(button.disabled).toBe(false);
  });

  it('surfaces an alert and re-enables the button when onConnect rejects', async () => {
    const onConnect = vi.fn(() => Promise.reject(new Error('boom')));
    const { container } = renderCard({ onConnect });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    button.click();

    await waitFor(() => {
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.textContent ?? '').toMatch(/Unable to start the Adobe Sign connection/);
    });
    expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('error');
    expect(button.disabled).toBe(false);
  });

  it('does not echo developer-facing strings in any state', async () => {
    let resolveConnect: (() => void) | undefined;
    const onConnect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConnect = resolve;
        }),
    );
    const { container } = renderCard({ onConnect });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement;
    button.click();

    await waitFor(() => {
      expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('connecting');
    });
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
    expect(/\bfake\b/i.test(text)).toBe(false);

    resolveConnect?.();
  });
});

describe('AdobeSignConnectionGuidanceCard — vm-gated CTA (Prompt 03)', () => {
  const authVm: ConnectionGuidanceVm = {
    sourceStatus: 'authorization-required',
    headline: 'Authorization required',
    guidance:
      "You haven't authorized the Adobe Sign connection yet — connect to start loading your queue.",
    ctaVisible: true,
  };

  function makeVm(
    sourceStatus: ConnectionGuidanceVm['sourceStatus'],
    headline: string,
    guidance: string,
  ): ConnectionGuidanceVm {
    return { sourceStatus, headline, guidance, ctaVisible: false };
  }

  it('renders the Connect button when vm.ctaVisible is true AND onConnect is supplied', () => {
    const onConnect = vi.fn(() => new Promise<void>(() => undefined));
    const { container } = renderCard({ onConnect, vm: authVm });
    const guidance = container.querySelector('[data-adobe-sign-guidance-status]');
    expect(guidance?.getAttribute('data-adobe-sign-guidance-status')).toBe(
      'authorization-required',
    );
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).not.toBeNull();
  });

  it('suppresses the Connect button when vm.ctaVisible is true but onConnect is absent', () => {
    const { container } = renderCard({ vm: authVm });
    // Status marker is still published so operators can see why no CTA renders.
    expect(
      container
        .querySelector('[data-adobe-sign-guidance-status]')
        ?.getAttribute('data-adobe-sign-guidance-status'),
    ).toBe('authorization-required');
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });

  it.each([
    [
      'configuration-required',
      'Configuration required',
      'Adobe Sign credentials need to be configured by an administrator before your queue can load.',
    ],
    [
      'principal-unresolved',
      'Account not resolved',
      "Your HB account couldn't be matched to an Adobe Sign user. Contact an administrator.",
    ],
    [
      'source-unavailable',
      'Adobe Sign unavailable',
      "Adobe Sign isn't reachable right now. Your queue will resume once the source is back online.",
    ],
    [
      'backend-unavailable',
      'Service unavailable',
      "The HB read-model service isn't responding. Try again shortly.",
    ],
  ] as const)(
    'suppresses the Connect button when vm.ctaVisible is false (%s) even with onConnect supplied',
    (sourceStatus, headline, guidance) => {
      const onConnect = vi.fn(() => new Promise<void>(() => undefined));
      const { container } = renderCard({
        onConnect,
        vm: makeVm(sourceStatus, headline, guidance),
      });
      expect(
        container
          .querySelector('[data-adobe-sign-guidance-status]')
          ?.getAttribute('data-adobe-sign-guidance-status'),
      ).toBe(sourceStatus);
      expect(container.textContent ?? '').toContain(headline);
      expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
      expect(onConnect).not.toHaveBeenCalled();
    },
  );
});
