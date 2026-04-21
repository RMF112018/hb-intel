import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PublicKudosSurface } from '../../webparts/hbKudos/PublicKudosSurface.js';
import type { KudosEntry } from '../webparts/kudosContracts.js';

function makeEntry(overrides: Partial<KudosEntry> = {}): KudosEntry {
  return {
    id: overrides.id ?? 'k-1',
    headline: overrides.headline ?? 'Outstanding teamwork',
    excerpt: overrides.excerpt ?? 'Great collaboration this week.',
    details: overrides.details ?? 'Great collaboration this week with reliable delivery.',
    submittedBy: overrides.submittedBy ?? { id: 'u-submitter', displayName: 'Sam Submitter' },
    submittedDate: overrides.submittedDate ?? '2026-04-20T14:00:00.000Z',
    status: overrides.status ?? 'approved',
    recipients: overrides.recipients ?? [{ id: 'u-recipient', name: 'Ren Recipient' }],
    celebrateCount: overrides.celebrateCount ?? 3,
    ...overrides,
  } as KudosEntry;
}

function installMatchMedia(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
    writable: true,
  });

  const makeList = (matches: boolean): MediaQueryList =>
    ({
      matches,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  vi.stubGlobal('matchMedia', (query: string): MediaQueryList => {
    const max = query.match(/max-width:\s*(\d+)px/i);
    if (max) return makeList(width <= Number(max[1]));
    const min = query.match(/min-width:\s*(\d+)px/i);
    if (min) return makeList(width >= Number(min[1]));
    return makeList(false);
  });
}

function renderPublicSurface(): void {
  const featured = makeEntry({ id: 'featured' });
  const recent = [makeEntry({ id: 'recent-1' }), makeEntry({ id: 'recent-2' })];
  render(
    <PublicKudosSurface
      heading="HB Kudos"
      featured={featured}
      recent={recent}
      archiveCount={4}
      onGiveKudos={vi.fn()}
      onCelebrate={vi.fn()}
      onOpenArticle={vi.fn()}
    />,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HB Kudos public responsive regression guards', () => {
  it.each([
    { label: 'phone portrait', width: 440, expectedMode: 'handheld' as const },
    { label: 'tablet portrait', width: 834, expectedMode: 'compact' as const },
    { label: 'standard laptop', width: 1366, expectedMode: 'default' as const },
    { label: 'large desktop', width: 1920, expectedMode: 'default' as const },
  ])('$label resolves to $expectedMode layout mode', ({ width, expectedMode }) => {
    installMatchMedia(width);
    renderPublicSurface();

    const featured = document.querySelector('[data-hbc-testid="hb-kudos-featured-card"]');
    expect(featured?.getAttribute('data-layout-mode')).toBe(expectedMode);
  });

  it('handheld posture hides excerpt and shows explicit open-recognition action', () => {
    installMatchMedia(440);
    renderPublicSurface();
    expect(
      document.querySelector('[data-hbc-testid="hb-kudos-featured-excerpt"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-hbc-testid="hb-kudos-featured-open"]'),
    ).toBeTruthy();
    expect(screen.queryByText('Featured Recognition')).toBeNull();
  });

  it('compact posture keeps excerpt, removes handheld-only CTA, and uses compact badge label', () => {
    installMatchMedia(834);
    renderPublicSurface();
    expect(
      document.querySelector('[data-hbc-testid="hb-kudos-featured-excerpt"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-hbc-testid="hb-kudos-featured-open"]'),
    ).toBeNull();
    expect(screen.getByText('Featured')).toBeTruthy();
  });
});
