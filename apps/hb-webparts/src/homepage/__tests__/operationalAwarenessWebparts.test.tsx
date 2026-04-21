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

    expect(screen.getAllByText('Featured Project').length).toBeGreaterThan(0);
    expect(screen.getByText('Show past spotlights (1)')).not.toBeNull();
  });

  it('renders stale badge semantics for safety items', () => {
    render(
      <SafetyFieldExcellence
        config={{
          staleAfterHours: 1,
          primarySpotlight: {
            id: 'safety',
            title: 'Safety Highlight',
            summary: 'Summary',
            urgency: 'attention',
            freshness: { source: 'live', updatedAt: '2026-03-31T01:00:00.000Z' },
          },
        }}
      />,
    );

    expect(screen.getByText('Stale')).not.toBeNull();
  });

  it('falls back to a valid project surface for malformed project config', () => {
    render(<ProjectPortfolioSpotlight config={{ items: [{ id: 'bad', title: '', summary: '' }] }} />);
    expect(screen.getByText('Project and Portfolio Spotlight')).not.toBeNull();
  });

  it('keeps CTA links keyboard-accessible for safety entries', () => {
    render(
      <SafetyFieldExcellence
        config={{
          primarySpotlight: {
            id: 'safety-cta',
            title: 'Reminder',
            summary: 'Review safety packet',
            urgency: 'attention',
            cta: { label: 'Open packet', href: '/safety' },
          },
        }}
      />,
    );

    expect(screen.getByRole('link', { name: /Open packet/ }).getAttribute('href')).toBe('/safety');
  });

  it('maps shell summary-collapsed render mode to minimal safety mode', () => {
    const { container } = render(
      <SafetyFieldExcellence
        shellRenderMode="summary-collapsed"
        config={{
          primarySpotlight: {
            id: 'safety-compact',
            title: 'Compact safety spotlight',
            summary: 'Summary',
            urgency: 'attention',
          },
        }}
      />,
    );
    const root = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(root?.getAttribute('data-hbc-safety-mode')).toBe('minimal');
  });

  it('renders legacy safety items config without falling into no-data empty state', () => {
    render(
      <SafetyFieldExcellence
        config={{
          statusLabel: 'Safety posture: Attention',
          summary: 'Legacy-authored safety items remain active.',
          items: [
            {
              id: 'legacy-primary',
              title: 'Legacy primary signal',
              summary: 'Primary summary',
              featured: true,
              indicator: { label: 'Action today', variant: 'critical' },
            },
            {
              id: 'legacy-secondary',
              title: 'Legacy secondary signal',
              summary: 'Secondary summary',
              indicatorLabel: 'Monitor this week',
              indicatorVariant: 'warning',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Legacy primary signal')).toBeTruthy();
    expect(screen.queryByText('No safety and field excellence items configured')).toBeNull();
  });
});
