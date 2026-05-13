import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { MyWorkHomeSurface } from './MyWorkHomeSurface.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';

afterEach(() => {
  cleanup();
});

function renderHome(
  props: React.ComponentProps<typeof MyWorkHomeSurface> = {},
  mode: MyWorkResponsiveMode = 'desktop',
) {
  return render(
    <MyWorkBentoGrid mode={mode}>
      <MyWorkHomeSurface {...props} />
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

describe('MyWorkHomeSurface — default (non-ready) variant', () => {
  it('emits the three non-ready cards in order', () => {
    const { container } = renderHome();
    expect(getCardRoles(container)).toEqual([
      'work-summary',
      'adobe-sign-queue-state',
      'source-readiness',
    ]);
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
  });

  it('resolves 12-column spans on desktop (3 / 6 / 3)', () => {
    const { container } = renderHome();
    expect(spanOf(container, 'work-summary')).toBe('3');
    expect(spanOf(container, 'adobe-sign-queue-state')).toBe('6');
    expect(spanOf(container, 'source-readiness')).toBe('3');
  });

  it('resolves 10-column spans on standardLaptop (3 / 4 / 3)', () => {
    const { container } = renderHome({}, 'standardLaptop');
    expect(spanOf(container, 'work-summary')).toBe('3');
    expect(spanOf(container, 'adobe-sign-queue-state')).toBe('4');
    expect(spanOf(container, 'source-readiness')).toBe('3');
  });

  it('clamps every card to 1 column on phone', () => {
    const { container } = renderHome({}, 'phone');
    expect(spanOf(container, 'work-summary')).toBe('1');
    expect(spanOf(container, 'adobe-sign-queue-state')).toBe('1');
    expect(spanOf(container, 'source-readiness')).toBe('1');
  });
});

describe('MyWorkHomeSurface — ready variant', () => {
  it('emits the two ready cards in order', () => {
    const { container } = renderHome({ readinessVariant: 'ready' });
    expect(getCardRoles(container)).toEqual(['work-summary', 'adobe-sign-action-queue-home']);
    expect(container.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('resolves 12-column spans on desktop (4 / 8)', () => {
    const { container } = renderHome({ readinessVariant: 'ready' });
    expect(spanOf(container, 'work-summary')).toBe('4');
    expect(spanOf(container, 'adobe-sign-action-queue-home')).toBe('8');
  });

  it('resolves 10-column spans on standardLaptop (3 / 7)', () => {
    const { container } = renderHome({ readinessVariant: 'ready' }, 'standardLaptop');
    expect(spanOf(container, 'work-summary')).toBe('3');
    expect(spanOf(container, 'adobe-sign-action-queue-home')).toBe('7');
  });

  it('"View queue" CTA fires onSelectModule exactly once', () => {
    const onSelectModule = vi.fn();
    const { getByText } = renderHome({ readinessVariant: 'ready', onSelectModule });
    fireEvent.click(getByText('View queue'));
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('adobe-sign-action-queue');
  });

  it('CTA renders aria-disabled when onSelectModule is not provided', () => {
    const { getByText } = renderHome({ readinessVariant: 'ready' });
    const cta = getByText('View queue');
    expect(cta.getAttribute('aria-disabled')).toBe('true');
    expect((cta as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('MyWorkHomeSurface — copy posture', () => {
  it('never renders developer-facing strings (TODO / mock / placeholder / fake)', () => {
    const { container } = renderHome();
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
    expect(/\bfake\b/i.test(text)).toBe(false);
  });
});

describe('MyWorkHomeSurface — envelope-state variants', () => {
  it('loading variant renders only the loading marker (never any non-ready cards)', () => {
    const { container } = renderHome({ readinessVariant: 'loading' });
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual([]);
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('error variant renders only the error marker', () => {
    const { container } = renderHome({ readinessVariant: 'error' });
    expect(container.querySelector('[data-my-work-readiness-state="error"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual([]);
  });

  it('ready + sourceStatus="partial" emits the ready tree plus a hidden source-status marker', () => {
    const { container } = renderHome({
      readinessVariant: 'ready',
      sourceStatus: 'partial',
    });
    expect(getCardRoles(container)).toEqual(['work-summary', 'adobe-sign-action-queue-home']);
    expect(container.querySelector('[data-my-work-source-status="partial"]')).not.toBeNull();
  });
});
