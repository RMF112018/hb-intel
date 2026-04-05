import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveWelcomeMessage } from '../helpers/welcomeMessage.js';
import { normalizeHeroBannerConfig, normalizeWelcomeHeaderConfig } from '../helpers/topBandConfig.js';
import { PersonalizedWelcomeHeader } from '../../webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from '../../webparts/hbHeroBanner/HbHeroBanner.js';

describe('Prompt-04 top-band contracts', () => {
  it('resolves greeting headline and fallback identity name', () => {
    const message = resolveWelcomeMessage({ email: 'taylor.hale@hb.com' }, new Date('2026-04-04T13:00:00'));
    expect(message.headline).toBe('Good afternoon, taylor.');
  });

  it('normalizes welcome config and keeps alert severity guardrails', () => {
    expect(normalizeWelcomeHeaderConfig({ alertSeverity: 'critical', supportLine: '  Team briefing at 7 AM ' })).toEqual({
      supportLine: 'Team briefing at 7 AM',
      contextLine: undefined,
      alertSeverity: 'critical',
      alertTitle: undefined,
      alertMessage: undefined,
    });
  });

  it('normalizes hero authoring config and trims CTA fields', () => {
    expect(
      normalizeHeroBannerConfig({
        headline: '  Hero headline ',
        cta: { label: ' Open ', href: ' /hero ', openInNewTab: true },
      }),
    ).toMatchObject({
      headline: 'Hero headline',
      cta: { label: 'Open', href: '/hero', openInNewTab: true },
    });
  });

  it('renders welcome header semantic heading and alert state', () => {
    render(
      <PersonalizedWelcomeHeader
        identity={{ preferredName: 'Avery Jordan' }}
        now={new Date('2026-04-04T10:00:00')}
        config={{
          supportLine: 'Daily operational review is ready.',
          alertSeverity: 'warning',
          alertTitle: 'Schedule update',
          alertMessage: 'Concrete pour moved to 2:00 PM.',
        }}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Good morning, Avery.' })).not.toBeNull();
    expect(screen.getByRole('status')).not.toBeNull();
  });

  it('renders hero empty state when no authored config is present', () => {
    render(<HbHeroBanner />);

    expect(screen.getByText('Hero content not configured')).not.toBeNull();
  });

  it('renders authored hero banner content and CTA', () => {
    render(
      <HbHeroBanner
        config={{
          headline: 'Leadership Message',
          message: 'This week we prioritize closeout quality checks.',
          cta: { label: 'Read message', href: '/leadership' },
        }}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Leadership Message' })).not.toBeNull();
    expect(screen.getByRole('link', { name: /Read message/ }).getAttribute('href')).toBe('/leadership');
  });
});
