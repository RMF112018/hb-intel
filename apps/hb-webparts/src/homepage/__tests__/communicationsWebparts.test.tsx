import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanyPulse } from '../../webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from '../../webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCultureMerged } from '../../webparts/peopleCulture/PeopleCultureMerged.js';

describe('Prompt-06 awareness webparts', () => {
  it('renders lead story hierarchy and secondary items for company pulse', () => {
    render(
      <CompanyPulse
        config={{
          items: [
            { id: 'feat', title: 'Featured Update', summary: 'Main summary', featured: true, order: 1, byline: 'Corporate Comms', publishDate: '2026-04-07' },
            { id: 'secondary', title: 'Secondary Update', summary: 'Secondary summary', order: 2 },
          ],
        }}
      />,
    );

    expect(screen.getByText('Featured Update')).not.toBeNull();
    expect(screen.getByText('Secondary Update')).not.toBeNull();
    expect(screen.getByLabelText('Company Pulse')).not.toBeNull();
  });

  it('renders premium newsroom surface with data-hbc-premium attribute', () => {
    const { container } = render(
      <CompanyPulse
        config={{
          items: [
            { id: 'lead', title: 'Lead Story', summary: 'Body', featured: true, order: 1 },
          ],
        }}
      />,
    );

    const surface = container.querySelector('[data-hbc-premium="newsroom-surface"]');
    expect(surface).not.toBeNull();
  });

  it('renders byline and publish date on lead story', () => {
    render(
      <CompanyPulse
        config={{
          items: [
            { id: 'lead', title: 'Lead', summary: 'Body', featured: true, order: 1, byline: 'Safety Team', publishDate: '2026-04-07' },
          ],
        }}
      />,
    );

    expect(screen.getByText('Safety Team')).not.toBeNull();
    expect(screen.getAllByText('2026-04-07').length).toBeGreaterThan(0);
  });

  it('renders sparse layout when only lead story exists', () => {
    render(
      <CompanyPulse
        config={{
          archiveHref: '/sites/hb-central/pulse',
          items: [
            { id: 'only', title: 'Solo Story', summary: 'Just one story', featured: true, order: 1 },
          ],
        }}
      />,
    );

    expect(screen.getByText('Solo Story')).not.toBeNull();
    expect(screen.getByText('View all news')).not.toBeNull();
  });

  it('renders rich layout with lead and secondary when multiple items provided', () => {
    render(
      <CompanyPulse
        config={{
          items: [
            { id: 'a', title: 'First Story', summary: 'Body A', order: 1 },
            { id: 'b', title: 'Second Story', summary: 'Body B', order: 2 },
          ],
        }}
      />,
    );

    expect(screen.getByText('First Story')).not.toBeNull();
    expect(screen.getByText('Second Story')).not.toBeNull();
    expect(screen.getAllByText('More headlines').length).toBeGreaterThan(0);
  });

  // ── Wave 05: Sparse-state and governance hardening tests ──────

  it('renders lead story without metadata fields and no empty meta container', () => {
    const { container } = render(
      <CompanyPulse
        config={{
          items: [
            { id: 'bare', title: 'Bare Story', summary: 'Minimal content', featured: true, order: 1 },
          ],
        }}
      />,
    );

    expect(screen.getByText('Bare Story')).not.toBeNull();
    expect(screen.getByText('Minimal content')).not.toBeNull();
    // Meta row with border-top should not render when no byline or date
    const metaRows = container.querySelectorAll('[class*="featuredMeta"]');
    expect(metaRows.length).toBe(0);
  });

  it('renders headline items without CTA as non-interactive elements', () => {
    const { container } = render(
      <CompanyPulse
        config={{
          items: [
            { id: 'lead', title: 'Lead', summary: 'Body', featured: true, order: 1 },
            { id: 'no-cta', title: 'No CTA Headline', summary: 'Body', order: 2 },
          ],
        }}
      />,
    );

    // The non-CTA headline should render as a div, not an anchor
    const links = container.querySelectorAll('a');
    const noCtaLink = Array.from(links).find((a) => a.textContent?.includes('No CTA Headline'));
    expect(noCtaLink).toBeUndefined();
  });

  it('renders invalid state for items with empty required fields', () => {
    render(
      <CompanyPulse
        config={{
          items: [
            { id: 'bad', title: '', summary: '', order: 1 },
          ],
        }}
      />,
    );

    expect(screen.getByText('Newsroom configuration needs attention')).not.toBeNull();
  });

  it('renders tertiary zone only for items with authored categories', () => {
    const { container } = render(
      <CompanyPulse
        config={{
          archiveHref: '/pulse',
          maxSecondaryItems: 1,
          maxTertiaryItems: 3,
          items: [
            { id: 'lead', title: 'Lead', summary: 'Body', featured: true, order: 1 },
            { id: 'sec', title: 'Secondary', summary: 'Body', order: 2, category: 'safety' },
            { id: 'tert-cat', title: 'Tertiary With Category', summary: 'Body', order: 3, category: 'milestone' },
            { id: 'tert-nocat', title: 'Tertiary No Category', summary: 'Body', order: 4 },
          ],
        }}
      />,
    );

    // Milestone chip should render, but no fabricated 'update' chip for the no-category item
    const chips = container.querySelectorAll('[class*="chip"]');
    const chipTexts = Array.from(chips).map((el) => el.textContent);
    expect(chipTexts).toContain('milestone');
    expect(chipTexts).not.toContain('update');
  });

  // ── Other webpart tests ───────────────────────────────────────

  it('renders empty state for malformed leadership config', () => {
    render(<LeadershipMessage config={{ entries: [{ id: 'bad', title: '', message: '', leaderName: '' }] }} />);
    expect(screen.getByText('Leadership message configuration is invalid')).not.toBeNull();
  });

  it('renders people and culture merged with announcement data', () => {
    render(
      <PeopleCultureMerged
        config={{
          announcements: [
            {
              id: 'ann1',
              personName: 'Jordan Lee',
              announcementType: 'promotion',
              headline: 'Promoted to Senior PM',
              summary: 'Congratulations.',
              publishDate: new Date().toISOString().slice(0, 10),
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Promoted to Senior PM')).not.toBeNull();
    expect(screen.getByText('Jordan Lee')).not.toBeNull();
  });

  it('renders module-level empty state when no data configured', () => {
    render(<PeopleCultureMerged config={{}} />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('renders loading state for communications webparts', () => {
    render(<CompanyPulse isLoading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('renders newsroom empty state with updated messaging', () => {
    render(<CompanyPulse config={{}} />);
    expect(screen.getByText('No newsroom content configured')).not.toBeNull();
  });
});
