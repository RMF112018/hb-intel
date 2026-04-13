import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { HbSignatureHeroArticle } from '../../webparts/hbSignatureHero/HbSignatureHeroArticle.js';
import { HbSignatureHero } from '../../webparts/hbSignatureHero/HbSignatureHero.js';

describe('HbSignatureHeroArticle — Phase-02 article-mode adapter', () => {
  it('renders title, subheading, byline, labels, and link', () => {
    render(
      <HbSignatureHeroArticle
        article={{
          title: 'A Major Milestone on Project Horizon',
          subheading: 'Field teams close out structural phase ahead of schedule.',
          author: 'Avery Stone',
          publishedDate: '2026-04-13',
          publishedTime: '09:15 AM',
          labels: ['Project', 'Field'],
          primaryImage: 'https://example.invalid/hero.jpg',
          destinationUrl: 'https://example.invalid/articles/horizon',
        }}
      />,
    );

    expect(screen.getByText('A Major Milestone on Project Horizon')).not.toBeNull();
    expect(
      screen.getByText('Field teams close out structural phase ahead of schedule.'),
    ).not.toBeNull();
    expect(screen.getByText('Avery Stone · 2026-04-13 · 09:15 AM')).not.toBeNull();
    expect(screen.getByText('Project · Field')).not.toBeNull();
    const titleLink = screen.getByRole('link', {
      name: 'A Major Milestone on Project Horizon',
    });
    expect(titleLink.getAttribute('href')).toBe(
      'https://example.invalid/articles/horizon',
    );
  });

  it('degrades gracefully when optional fields are missing', () => {
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Minimal Article',
          author: 'Jordan Miller',
          publishedDate: '2026-04-13',
        }}
      />,
    );

    const scope = within(container);
    expect(scope.getByText('Minimal Article')).not.toBeNull();
    expect(scope.getByText('Jordan Miller · 2026-04-13')).not.toBeNull();
    // No subheading, label eyebrow, or title link emitted.
    expect(container.querySelector('[data-hbc-article-subheading]')).toBeNull();
    expect(container.querySelector('[data-hbc-article-title-link]')).toBeNull();
    expect(scope.queryByRole('link')).toBeNull();
  });
});

describe('HbSignatureHeroArticle — author identity and photo seam (Phase-03)', () => {
  it('uses an explicit authorPhotoUrl without calling the Graph adapter', () => {
    const fetchPersonPhoto = vi.fn();
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Explicit Photo',
          author: 'Avery Stone',
          publishedDate: '2026-04-13',
          authorUpn: 'avery.stone@example.invalid',
          authorPhotoUrl: 'https://cdn.example.invalid/avery.jpg',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    const img = container.querySelector('img[alt="Avery Stone"]') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.src).toBe('https://cdn.example.invalid/avery.jpg');
    expect(fetchPersonPhoto).not.toHaveBeenCalled();
  });

  it('resolves a Graph photo via authorUpn through the shared adapter', async () => {
    const fetchPersonPhoto = vi
      .fn<(upn: string) => Promise<string | undefined>>()
      .mockResolvedValue('blob:mock/graph-photo');
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Graph Photo',
          author: 'Pat Field',
          publishedDate: '2026-04-13',
          authorUpn: 'pat.field@example.invalid',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    await waitFor(() => {
      const img = container.querySelector('img[alt="Pat Field"]') as HTMLImageElement | null;
      expect(img).not.toBeNull();
      expect(img!.src).toBe('blob:mock/graph-photo');
    });
    expect(fetchPersonPhoto).toHaveBeenCalledWith('pat.field@example.invalid');
  });

  it('falls back to initials when the adapter returns no photo', async () => {
    const fetchPersonPhoto = vi
      .fn<(upn: string) => Promise<string | undefined>>()
      .mockResolvedValue(undefined);
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'No Photo',
          author: 'Jordan Miller',
          publishedDate: '2026-04-13',
          authorUpn: 'jordan.miller@example.invalid',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    await waitFor(() => expect(fetchPersonPhoto).toHaveBeenCalledTimes(1));
    // No image rendered — initials fallback span instead.
    expect(container.querySelector('img[alt="Jordan Miller"]')).toBeNull();
    expect(within(container).getByText('JM')).not.toBeNull();
  });

  it('falls back to initials when neither photo URL nor adapter is supplied', () => {
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Initials Only',
          author: 'Sam River',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(within(container).getByText('SR')).not.toBeNull();
  });
});

describe('HbSignatureHero — article-mode dispatch', () => {
  it('renders the article adapter on non-HBCentral site URLs when article content is supplied', () => {
    render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/Other"
        article={{
          title: 'Dispatch Article',
          author: 'Pat Field',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(screen.getByText('Dispatch Article')).not.toBeNull();
  });

  it('renders nothing on non-HBCentral sites when no article payload is wired', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/Other"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('ignores article content on HBCentral and renders the homepage adapter', () => {
    render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        article={{
          title: 'Should Not Appear',
          author: 'X',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(screen.queryByText('Should Not Appear')).toBeNull();
    expect(screen.getByText('Build with GRIT.')).not.toBeNull();
  });
});
