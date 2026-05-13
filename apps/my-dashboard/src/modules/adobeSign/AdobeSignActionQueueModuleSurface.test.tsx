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
  return container
    .querySelector(`[data-my-work-card-role="${role}"]`)
    ?.getAttribute('data-my-work-column-span') ?? null;
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
