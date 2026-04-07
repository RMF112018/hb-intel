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
