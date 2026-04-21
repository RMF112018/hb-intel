import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as React from 'react';
import { PublicKudosSurface } from '../../webparts/hbKudos/PublicKudosSurface.js';
import { ArchiveList } from '../../webparts/hbKudos/ArchiveList.js';
import type { KudosEntry } from '../webparts/kudosContracts.js';

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

function makeEntry(id: string): KudosEntry {
  return {
    id,
    headline: 'Outstanding teamwork',
    excerpt: 'Great collaboration this week.',
    details: 'Great collaboration this week with reliable delivery.',
    submittedBy: { id: 'u-submitter', displayName: 'Sam Submitter' },
    submittedDate: '2026-04-20T14:00:00.000Z',
    status: 'approved',
    recipients: [{ id: 'u-recipient', name: 'Ren Recipient' }],
    celebrateCount: 3,
  } as KudosEntry;
}

describe('HB Kudos accessibility guardrails', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('compact-mode handheld keeps explicit non-hover action labels', () => {
    installMatchMedia(440);
    render(
      <PublicKudosSurface
        heading="HB Kudos"
        featured={makeEntry('featured')}
        recent={[makeEntry('recent')]}
        archiveCount={2}
        onGiveKudos={vi.fn()}
        onCelebrate={vi.fn()}
        onOpenArticle={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Give Kudos' })).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: /Open recognition for Ren Recipient/i }).length,
    ).toBeGreaterThan(0);
  });

  it('archive surface exposes explicit controls and destination text without hover', () => {
    render(
      <ArchiveList
        entries={[makeEntry('a-1'), makeEntry('a-2')]}
        searchText=""
        onSearchChange={vi.fn()}
        onOpenEntry={vi.fn()}
        onViewAll={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Open archive/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Browse the full Kudos feed/i })).toBeTruthy();
    expect(screen.getByText('Browse all recognition')).toBeTruthy();
  });

  it('kudosSurface CSS enforces 44px targets for compact-mode primary controls', () => {
    const cssPath = resolve(
      __dirname,
      '../../webparts/hbKudos/kudosSurface.module.css',
    );
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toMatch(/\.recentRow[\s\S]*?min-height:\s*44px;/);
    expect(css).toMatch(/\.archiveToggle[\s\S]*?min-height:\s*44px;/);
    expect(css).toMatch(/\.archiveSearch[\s\S]*?min-height:\s*44px;/);
    expect(css).toMatch(/\.archiveRow[\s\S]*?min-height:\s*44px;/);
    expect(css).toMatch(/\.feedCta[\s\S]*?min-height:\s*44px;/);
  });

  it('reduced-motion rule covers archive/feed/readmore transitions', () => {
    const cssPath = resolve(
      __dirname,
      '../../webparts/hbKudos/kudosSurface.module.css',
    );
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toContain('.archiveToggle');
    expect(css).toContain('.feedCta');
    expect(css).toContain('.feedCtaArrow');
    expect(css).toContain('.readmoreBtn');
  });
});
