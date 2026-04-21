import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKudosSurface } from './PublicKudosSurface.js';
import type { KudosEntry } from '../../homepage/webparts/kudosContracts.js';

function makeEntry(overrides: Partial<KudosEntry> = {}): KudosEntry {
  return {
    id: overrides.id ?? 'k-1',
    headline: overrides.headline ?? 'Outstanding teamwork',
    excerpt: overrides.excerpt ?? 'Great collaboration this week.',
    details: overrides.details ?? 'Great collaboration this week.',
    submittedBy: overrides.submittedBy ?? { id: 'u-submitter', displayName: 'Sam Submitter' },
    submittedDate: overrides.submittedDate ?? '2026-04-20T14:00:00.000Z',
    status: overrides.status ?? 'approved',
    recipients: overrides.recipients ?? [{ id: 'u-recipient', name: 'Ren Recipient' }],
    celebrateCount: overrides.celebrateCount ?? 3,
    ...overrides,
  } as KudosEntry;
}

function renderSurface(input: {
  featured?: KudosEntry;
  recent?: KudosEntry[];
  archiveCount?: number;
}) {
  return render(
    <PublicKudosSurface
      heading="HB Kudos"
      featured={input.featured}
      recent={input.recent ?? []}
      archiveCount={input.archiveCount ?? 0}
      onGiveKudos={vi.fn()}
      onOpenArticle={vi.fn()}
      onCelebrate={vi.fn()}
    />,
  );
}

describe('PublicKudosSurface light-data storytelling', () => {
  it('renders featured-exists and recent-absent narrative', () => {
    const featured = makeEntry({ id: 'featured-only' });
    const { container } = renderSurface({ featured, recent: [], archiveCount: 5 });

    expect(screen.getByRole('heading', { name: 'No new recognition this week' })).toBeTruthy();
    expect(
      screen.getByText('Add one new kudos today to keep this week’s recognition story moving.'),
    ).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders featured-absent and archive-exists narrative', () => {
    const { container } = renderSurface({ featured: undefined, recent: [], archiveCount: 4 });

    expect(
      screen.getByRole('heading', { name: 'This week is ready for its first spotlight' }),
    ).toBeTruthy();
    expect(screen.getByText('4 past recognitions are available in the archive while new kudos builds.')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders featured-absent and archive-absent narrative', () => {
    const { container } = renderSurface({ featured: undefined, recent: [], archiveCount: 0 });

    expect(screen.getByRole('heading', { name: 'Start this week at HB' })).toBeTruthy();
    expect(screen.getByText('Share one meaningful kudos to set the tone for the team.')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});
