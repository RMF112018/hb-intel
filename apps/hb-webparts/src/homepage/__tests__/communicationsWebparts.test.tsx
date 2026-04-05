import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanyPulse } from '../../webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from '../../webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCulture } from '../../webparts/peopleCulture/PeopleCulture.js';

describe('Prompt-06 awareness webparts', () => {
  it('renders featured hierarchy and secondary items for company pulse', () => {
    render(
      <CompanyPulse
        config={{
          items: [
            { id: 'feat', title: 'Featured Update', summary: 'Main summary', featured: true, order: 1 },
            { id: 'secondary', title: 'Secondary Update', summary: 'Secondary summary', order: 2 },
          ],
        }}
      />,
    );

    expect(screen.getByLabelText('featured-item')).not.toBeNull();
    expect(screen.getByText('Featured Update')).not.toBeNull();
    expect(screen.getByText('Secondary Update')).not.toBeNull();
  });

  it('renders empty state for malformed leadership config', () => {
    render(<LeadershipMessage config={{ entries: [{ id: 'bad', title: '', message: '', leaderName: '' }] }} />);
    expect(screen.getByText('Leadership message configuration is invalid')).not.toBeNull();
  });

  it('renders people and culture media optionally and keeps keyboard-access links', () => {
    render(
      <PeopleCulture
        config={{
          entries: [
            {
              id: 'feat',
              personName: 'Jordan Lee',
              eventType: 'newHire',
              highlight: 'Welcome to the team.',
              featured: true,
              cta: { label: 'Meet Jordan', href: '/people' },
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('link', { name: /Meet Jordan/ }).getAttribute('href')).toBe('/people');
    expect(screen.getByText('Welcome to the team.')).not.toBeNull();
  });

  it('renders loading state for communications webparts', () => {
    render(<CompanyPulse isLoading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});
