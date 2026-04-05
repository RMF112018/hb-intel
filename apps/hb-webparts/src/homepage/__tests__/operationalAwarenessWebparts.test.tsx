import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectPortfolioSpotlight } from '../../webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from '../../webparts/safetyFieldExcellence/SafetyFieldExcellence.js';

describe('Prompt-07 operational-awareness webparts', () => {
  it('renders featured hierarchy and secondary items for project spotlight', () => {
    render(
      <ProjectPortfolioSpotlight
        config={{
          items: [
            {
              id: 'featured',
              title: 'Featured Project',
              summary: 'Summary',
              featured: true,
              status: { label: 'On Track', variant: 'success' },
            },
            {
              id: 'secondary',
              title: 'Secondary Project',
              summary: 'Summary',
            },
          ],
        }}
      />, 
    );

    expect(screen.getByLabelText('featured-item')).not.toBeNull();
    expect(screen.getByText('Featured Project')).not.toBeNull();
    expect(screen.getByText('Secondary Project')).not.toBeNull();
  });

  it('renders stale badge semantics for safety items', () => {
    render(
      <SafetyFieldExcellence
        config={{
          staleAfterHours: 1,
          items: [
            {
              id: 'safety',
              title: 'Safety Highlight',
              summary: 'Summary',
              eventType: 'highlight',
              freshness: { source: 'live', updatedAt: '2026-03-31T01:00:00.000Z' },
              featured: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Stale')).not.toBeNull();
  });

  it('renders empty state for malformed project config', () => {
    render(<ProjectPortfolioSpotlight config={{ items: [{ id: 'bad', title: '', summary: '' }] }} />);
    expect(screen.getByText('Project spotlight configuration is invalid')).not.toBeNull();
  });

  it('keeps CTA links keyboard-accessible for safety entries', () => {
    render(
      <SafetyFieldExcellence
        config={{
          items: [
            {
              id: 'safety-cta',
              title: 'Reminder',
              summary: 'Review safety packet',
              eventType: 'reminder',
              featured: true,
              cta: { label: 'Open packet', href: '/safety' },
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('link', { name: /Open packet/ }).getAttribute('href')).toBe('/safety');
  });
});
