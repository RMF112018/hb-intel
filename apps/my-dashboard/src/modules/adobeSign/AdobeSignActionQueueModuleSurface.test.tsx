import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { AdobeSignActionQueueModuleSurface } from './AdobeSignActionQueueModuleSurface.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';

afterEach(() => {
  cleanup();
});

function renderFocused(
  props: React.ComponentProps<typeof AdobeSignActionQueueModuleSurface> = {},
  mode: MyWorkResponsiveMode = 'desktop',
) {
  return render(
    <MyWorkBentoGrid mode={mode}>
      <AdobeSignActionQueueModuleSurface {...props} />
    </MyWorkBentoGrid>,
  );
}

function getCardRoles(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-my-work-bento-grid] [data-my-work-card-role]'),
  ).map((el) => el.getAttribute('data-my-work-card-role') ?? '');
}

function spanOf(container: HTMLElement, role: string): string | null {
  return (
    container
      .querySelector(`[data-my-work-card-role="${role}"]`)
      ?.getAttribute('data-my-work-column-span') ?? null
  );
}

describe('AdobeSignActionQueueModuleSurface — default (non-ready) variant', () => {
  it('emits the two non-ready cards in order', () => {
    const { container } = renderFocused();
    expect(getCardRoles(container)).toEqual([
      'adobe-sign-queue-state',
      'adobe-sign-connection-guidance',
    ]);
  });

  it('resolves 12-column spans on desktop (8 / 4)', () => {
    const { container } = renderFocused();
    expect(spanOf(container, 'adobe-sign-queue-state')).toBe('8');
    expect(spanOf(container, 'adobe-sign-connection-guidance')).toBe('4');
  });

  it('resolves 10-column spans on standardLaptop (6 / 4)', () => {
    const { container } = renderFocused({}, 'standardLaptop');
    expect(spanOf(container, 'adobe-sign-queue-state')).toBe('6');
    expect(spanOf(container, 'adobe-sign-connection-guidance')).toBe('4');
  });
});

describe('AdobeSignActionQueueModuleSurface — ready variant', () => {
  it('emits the two ready cards in order', () => {
    const { container } = renderFocused({ readinessVariant: 'ready' });
    expect(getCardRoles(container)).toEqual([
      'adobe-sign-queue-summary',
      'adobe-sign-agreement-action-list',
    ]);
  });

  it('resolves 12-column spans on desktop (4 / 8)', () => {
    const { container } = renderFocused({ readinessVariant: 'ready' });
    expect(spanOf(container, 'adobe-sign-queue-summary')).toBe('4');
    expect(spanOf(container, 'adobe-sign-agreement-action-list')).toBe('8');
  });

  it('resolves 10-column spans on standardLaptop (3 / 7)', () => {
    const { container } = renderFocused({ readinessVariant: 'ready' }, 'standardLaptop');
    expect(spanOf(container, 'adobe-sign-queue-summary')).toBe('3');
    expect(spanOf(container, 'adobe-sign-agreement-action-list')).toBe('7');
  });
});

describe('AdobeSignActionQueueModuleSurface — module markers', () => {
  it('every card carries data-my-work-module="adobe-sign-action-queue"', () => {
    for (const variant of ['ready', 'non-ready'] as const) {
      const { container, unmount } = renderFocused({ readinessVariant: variant });
      const cards = Array.from(
        container.querySelectorAll('[data-my-work-bento-grid] [data-my-work-card]'),
      );
      expect(cards.length).toBeGreaterThan(0);
      for (const c of cards) {
        expect(c.getAttribute('data-my-work-module')).toBe('adobe-sign-action-queue');
      }
      unmount();
      cleanup();
    }
  });

  it('only the agreement action list card carries data-my-work-adobe-sign-queue', () => {
    const { container } = renderFocused({ readinessVariant: 'ready' });
    const marked = container.querySelectorAll('[data-my-work-adobe-sign-queue]');
    expect(marked).toHaveLength(1);
    expect(marked[0].getAttribute('data-my-work-card-role')).toBe(
      'adobe-sign-agreement-action-list',
    );
  });
});

describe('AdobeSignActionQueueModuleSurface — no navigation takeovers', () => {
  it('renders no working anchor href and no modal dialog', () => {
    for (const variant of ['ready', 'non-ready'] as const) {
      const { container, unmount } = renderFocused({ readinessVariant: variant });
      const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
      expect(grid.querySelectorAll('a[href]')).toHaveLength(0);
      expect(grid.querySelector('[role="dialog"]')).toBeNull();
      unmount();
      cleanup();
    }
  });
});

describe('AdobeSignActionQueueModuleSurface — copy posture', () => {
  it('never renders developer-facing strings (TODO / mock / placeholder / fake)', () => {
    for (const variant of ['ready', 'non-ready'] as const) {
      const { container, unmount } = renderFocused({ readinessVariant: variant });
      const text = container.textContent ?? '';
      expect(/\bTODO\b/.test(text)).toBe(false);
      expect(/\bmock\b/i.test(text)).toBe(false);
      expect(/\bplaceholder\b/i.test(text)).toBe(false);
      expect(/\bfake\b/i.test(text)).toBe(false);
      unmount();
      cleanup();
    }
  });
});

describe('AdobeSignActionQueueModuleSurface — data-driven content via queueEnvelope', () => {
  it('renders 6 agreement rows and pending=6 when queueEnvelope is "available"', async () => {
    const { ADOBE_SIGN_QUEUE_AVAILABLE } = await import('@hbc/models/myWork/fixtures');
    const { container } = renderFocused({
      readinessVariant: 'ready',
      queueEnvelope: ADOBE_SIGN_QUEUE_AVAILABLE,
    });
    const summary = container.querySelector(
      '[data-my-work-card-role="adobe-sign-queue-summary"]',
    ) as HTMLElement;
    expect(summary.querySelector('[data-adobe-queue-summary-pending="6"]')).not.toBeNull();
    expect(summary.querySelector('[data-adobe-queue-summary-signature="1"]')).not.toBeNull();
    expect(summary.querySelector('[data-adobe-queue-summary-review="3"]')).not.toBeNull();
    const list = container.querySelector(
      '[data-my-work-card-role="adobe-sign-agreement-action-list"]',
    ) as HTMLElement;
    expect(list.querySelectorAll('[data-my-work-agreement-item]')).toHaveLength(6);
    expect(list.querySelector('[data-my-work-empty-queue]')).toBeNull();
  });

  it('renders the empty-state marker (not unavailable) for an empty queue envelope', async () => {
    const { ADOBE_SIGN_QUEUE_EMPTY } = await import('@hbc/models/myWork/fixtures');
    const { container } = renderFocused({
      readinessVariant: 'ready',
      queueEnvelope: ADOBE_SIGN_QUEUE_EMPTY,
    });
    const list = container.querySelector(
      '[data-my-work-card-role="adobe-sign-agreement-action-list"]',
    ) as HTMLElement;
    expect(list.querySelector('[data-my-work-empty-queue]')).not.toBeNull();
    expect(list.querySelectorAll('[data-my-work-agreement-item]')).toHaveLength(0);
  });

  it('renders distinct guidance for configuration-required vs authorization-required (non-ready)', async () => {
    const config = renderFocused({
      readinessVariant: 'non-ready',
      sourceStatus: 'configuration-required',
    });
    const configGuidance = config.container.querySelector(
      '[data-my-work-card-role="adobe-sign-connection-guidance"]',
    ) as HTMLElement;
    expect(configGuidance.getAttribute('data-adobe-sign-guidance-status')).toBe(
      'configuration-required',
    );
    expect(configGuidance.textContent).toContain('Configuration required');
    // configuration-required is NOT the user-actionable case — no Connect CTA.
    expect(configGuidance.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
    config.unmount();
    cleanup();

    const onConnect = () => new Promise<void>(() => undefined);
    const auth = renderFocused({
      readinessVariant: 'non-ready',
      sourceStatus: 'authorization-required',
      onConnect,
    });
    const authGuidance = auth.container.querySelector(
      '[data-my-work-card-role="adobe-sign-connection-guidance"]',
    ) as HTMLElement;
    expect(authGuidance.getAttribute('data-adobe-sign-guidance-status')).toBe(
      'authorization-required',
    );
    expect(authGuidance.textContent).toContain('Authorization required');
    expect(authGuidance.querySelector('[data-adobe-sign-connect-action="start"]')).not.toBeNull();
  });
});

describe('AdobeSignActionQueueModuleSurface — envelope-state variants', () => {
  it('loading variant renders only the loading marker (no ready/non-ready cards)', () => {
    const { container } = renderFocused({ readinessVariant: 'loading' });
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual([]);
  });

  it('error variant renders only the error marker', () => {
    const { container } = renderFocused({ readinessVariant: 'error' });
    expect(container.querySelector('[data-my-work-readiness-state="error"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual([]);
  });

  it('ready + sourceStatus="partial" emits the ready tree plus a hidden source-status marker', () => {
    const { container } = renderFocused({
      readinessVariant: 'ready',
      sourceStatus: 'partial',
    });
    expect(getCardRoles(container)).toEqual([
      'adobe-sign-queue-summary',
      'adobe-sign-agreement-action-list',
    ]);
    expect(container.querySelector('[data-my-work-source-status="partial"]')).not.toBeNull();
  });
});

describe('AdobeSignActionQueueModuleSurface — authorization-required CTA exclusivity (Prompt 03)', () => {
  it('authorization-required + onConnect → guidance card mounts, status marker is "authorization-required", Connect button visible and idle', () => {
    const onConnect = () => new Promise<void>(() => undefined);
    const { container } = renderFocused({
      readinessVariant: 'non-ready',
      sourceStatus: 'authorization-required',
      onConnect,
    });
    const guidance = container.querySelector(
      '[data-my-work-card-role="adobe-sign-connection-guidance"]',
    ) as HTMLElement;
    expect(guidance.getAttribute('data-adobe-sign-guidance-status')).toBe('authorization-required');
    expect(guidance.textContent).toContain('Authorization required');
    const button = guidance.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button?.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
    expect(button?.textContent).toBe('Connect Adobe Sign');
  });

  it.each([
    ['principal-unresolved', 'Account not resolved'],
    ['source-unavailable', 'Adobe Sign unavailable'],
    ['backend-unavailable', 'Service unavailable'],
  ] as const)(
    'non-authorization-required status "%s" + onConnect → guidance card mounts with status marker but no Connect CTA',
    (sourceStatus, expectedHeadline) => {
      const onConnect = () => new Promise<void>(() => undefined);
      const { container } = renderFocused({
        readinessVariant: 'non-ready',
        sourceStatus,
        onConnect,
      });
      const guidance = container.querySelector(
        '[data-my-work-card-role="adobe-sign-connection-guidance"]',
      ) as HTMLElement;
      expect(guidance.getAttribute('data-adobe-sign-guidance-status')).toBe(sourceStatus);
      expect(guidance.textContent).toContain(expectedHeadline);
      // The CTA is exclusive to 'authorization-required'; every other non-ready
      // status must suppress the Connect button even when onConnect is supplied.
      expect(guidance.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
    },
  );

  it('ready variant ("available") + onConnect → connection-guidance card is not mounted at all', () => {
    const onConnect = () => new Promise<void>(() => undefined);
    const { container } = renderFocused({
      readinessVariant: 'ready',
      sourceStatus: 'available',
      onConnect,
    });
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-connection-guidance"]'),
    ).toBeNull();
    expect(container.querySelector('[data-adobe-sign-guidance-status]')).toBeNull();
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});

describe('AdobeSignActionQueueModuleSurface — onConnect forwarding', () => {
  it('forwards onConnect to the connection guidance card on the non-ready variant', () => {
    const onConnect = () => new Promise<void>(() => undefined);
    const { container } = renderFocused({ onConnect });
    const button = container.querySelector(
      '[data-adobe-sign-connect-action="start"]',
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Connect Adobe Sign');
    expect(button?.getAttribute('data-adobe-sign-connect-state')).toBe('idle');
  });

  it('omits the Connect button on the non-ready variant when no onConnect is supplied', () => {
    const { container } = renderFocused();
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });

  it('does not render the Connect button on the ready variant even when onConnect is supplied', () => {
    const onConnect = () => new Promise<void>(() => undefined);
    const { container } = renderFocused({ readinessVariant: 'ready', onConnect });
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});
