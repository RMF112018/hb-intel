import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

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
