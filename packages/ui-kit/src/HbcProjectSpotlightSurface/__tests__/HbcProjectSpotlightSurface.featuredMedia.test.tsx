/**
 * HbcProjectSpotlightSurface — featured media posture contract.
 *
 * Pins the three supported media states and the title-led rebuild
 * for the no-image posture so the flagship slot cannot regress to
 * the pre-fix behavior where a missing or broken image filled the
 * hero with a dominant "PROJECT IMAGE" placeholder label.
 *
 *   1. authored image present → <img> renders inside .mediaZone,
 *      root carries data-featured-has-image="true"
 *   2. authored image errored → <img> unmounts on `error`, zone
 *      preserves data-has-image="true" and renders a neutral
 *      fallback band (no filler text)
 *   3. no authored image      → the media zone does not render
 *      at all; the surface is title-led: a subordinate header
 *      strip + boosted title + primary CTA sit in first view
 *      without a disclosure click
 */
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightSurfaceModel,
} from '../index.js';

function modelWithImage(
  image: { src: string; alt: string } | undefined,
): ProjectSpotlightSurfaceModel {
  return {
    heading: 'Project Spotlight',
    featured: {
      id: 'featured',
      title: 'Palm Beach Medical Campus Expansion',
      summary: 'Structural turnover enters final phase.',
      status: { label: 'On Track', variant: 'success' },
      strategicEmphasis: true,
      milestones: [],
      teamMembers: [],
      image,
      cta: { label: 'View project brief', href: '#brief' },
      completeness: 'full',
    },
    secondary: [],
  };
}

function findRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>(
    '[data-hbc-presentation="project-spotlight-surface"]',
  );
  if (!root) throw new Error('Spotlight root not rendered');
  return root;
}

function findFeaturedLayout(container: HTMLElement): HTMLElement {
  const layout = container.querySelector<HTMLElement>(
    '[aria-label="Featured project spotlight"]',
  );
  if (!layout) throw new Error('Spotlight featuredLayout not rendered');
  return layout;
}

describe('HbcProjectSpotlightSurface — featured media posture', () => {
  it('renders <img>, marks the surface as image-bearing, and carries the image-led posture when authored', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/palm-beach.jpg',
          alt: 'Palm Beach aerial',
        })}
        forceMode="wide"
      />,
    );
    const root = findRoot(container);
    expect(root.getAttribute('data-featured-has-image')).toBe('true');
    const layout = findFeaturedLayout(container);
    expect(layout.getAttribute('data-has-image')).toBe('true');
    const img = layout.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(
      'https://cdn.example.invalid/projects/palm-beach.jpg',
    );
    expect(img?.getAttribute('alt')).toBe('Palm Beach aerial');
    expect(layout.textContent).not.toMatch(/project\s*image/i);
  });

  it('unmounts <img> on load failure and renders the neutral branded fallback (no filler text)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/broken.jpg',
          alt: 'Broken asset',
        })}
        forceMode="wide"
      />,
    );
    const layout = findFeaturedLayout(container);
    const img = layout.querySelector('img');
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(layout.querySelector('img')).toBeNull();
    // Authored intent was a hero, so the zone keeps its editorial posture.
    expect(layout.getAttribute('data-has-image')).toBe('true');
    expect(layout.textContent).not.toMatch(/project\s*image/i);
  });

  it('recovers from a prior image-load error when the image source changes', () => {
    const { container, rerender } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/broken.jpg',
          alt: 'Broken',
        })}
        forceMode="wide"
      />,
    );
    fireEvent.error(findFeaturedLayout(container).querySelector('img')!);
    expect(findFeaturedLayout(container).querySelector('img')).toBeNull();

    rerender(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/recovered.jpg',
          alt: 'Recovered',
        })}
        forceMode="wide"
      />,
    );
    const recovered = findFeaturedLayout(container).querySelector('img');
    expect(recovered).not.toBeNull();
    expect(recovered?.getAttribute('src')).toBe(
      'https://cdn.example.invalid/projects/recovered.jpg',
    );
  });
});

describe('HbcProjectSpotlightSurface — title-led no-image posture', () => {
  it('stamps data-featured-has-image="false" on the root and omits the media zone entirely', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage(undefined)}
        forceMode="wide"
      />,
    );
    const root = findRoot(container);
    expect(root.getAttribute('data-featured-has-image')).toBe('false');
    const layout = findFeaturedLayout(container);
    expect(layout.getAttribute('data-has-image')).toBe('false');
    // No media zone at all — the surface is title-led.
    expect(layout.querySelector('[data-has-image="true"]')).toBeNull();
    // No <img>, no "Project Image" filler anywhere.
    expect(layout.querySelector('img')).toBeNull();
    expect(layout.textContent).not.toMatch(/project\s*image/i);
  });

  it('places the title, at least one authored signal, and the primary CTA in first view without opening the disclosure', () => {
    const { container, getByRole } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage(undefined)}
        forceMode="wide"
      />,
    );
    const layout = findFeaturedLayout(container);

    // Title present.
    expect(layout.textContent).toContain(
      'Palm Beach Medical Campus Expansion',
    );
    // At least one authored signal — status or strategic — visible.
    expect(layout.textContent).toMatch(/On Track|Strategic/);
    // Primary CTA rendered as a link, without clicking the details
    // disclosure. The disclosure button text indicates closed state
    // when "Show spotlight details" is present; we don't click it.
    const cta = getByRole('link', { name: /View project brief/i });
    expect(cta).toBeInTheDocument();
  });

  it('keeps minimal mode tight but still lands the CTA in first view', () => {
    const { container, getByRole } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage(undefined)}
        forceMode="minimal"
      />,
    );
    const layout = findFeaturedLayout(container);
    expect(layout.getAttribute('data-has-image')).toBe('false');
    expect(layout.querySelector('img')).toBeNull();
    // Title still present.
    expect(layout.textContent).toContain(
      'Palm Beach Medical Campus Expansion',
    );
    // CTA in first view even though minimal keeps details collapsed.
    expect(
      getByRole('link', { name: /View project brief/i }),
    ).toBeInTheDocument();
  });
});

describe('HbcProjectSpotlightSurface — poster-led image-led posture', () => {
  function posterModel(
    headline: string | undefined,
  ): ProjectSpotlightSurfaceModel {
    return {
      heading: 'Project Spotlight',
      featured: {
        id: 'featured',
        title: 'Palm Beach Medical Campus Expansion',
        headline,
        summary: 'Structural turnover enters final phase.',
        status: { label: 'On Track', variant: 'success' },
        strategicEmphasis: true,
        image: {
          src: 'https://cdn.example.invalid/projects/palm-beach.jpg',
          alt: 'Palm Beach aerial',
        },
        milestones: [],
        teamMembers: [],
        cta: { label: 'View project brief', href: '#brief' },
        completeness: 'full',
      },
      secondary: [],
    };
  }

  it('renders the featured title inside the hero and suppresses the duplicate below-hero title (wide)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={posterModel('Final structural turnover phase')} forceMode="wide" />,
    );
    const layout = findFeaturedLayout(container);
    const mediaZone = layout.querySelector<HTMLElement>(
      '[data-has-image="true"]',
    );
    expect(mediaZone).not.toBeNull();
    expect(mediaZone?.getAttribute('data-poster-led')).toBe('true');
    // Exactly one title element, and it lives inside the hero.
    const titles = layout.querySelectorAll('h3');
    expect(titles.length).toBe(1);
    expect(mediaZone?.contains(titles[0])).toBe(true);
    expect(titles[0].textContent).toContain('Palm Beach Medical Campus');
    // Authored headline also rides inside the hero.
    expect(mediaZone?.textContent).toContain(
      'Final structural turnover phase',
    );
  });

  it('renders poster-led at medium with primary CTA in first view and no detail-hiding disclosure', () => {
    const { container, getByRole } = render(
      <HbcProjectSpotlightSurface model={posterModel('Final structural turnover phase')} forceMode="medium" />,
    );
    const layout = findFeaturedLayout(container);
    const mediaZone = layout.querySelector<HTMLElement>(
      '[data-has-image="true"]',
    );
    expect(mediaZone?.getAttribute('data-poster-led')).toBe('true');
    // CTA in first view (inline, not inside a closed region).
    const cta = getByRole('link', { name: /View project brief/i });
    expect(cta).toBeInTheDocument();
    // Wide/medium promote full-depth details to always-visible; the
    // "Show spotlight details" disclosure must not render at medium.
    const disclosure = Array.from(
      layout.querySelectorAll('button'),
    ).find((b) => /spotlight details/i.test(b.textContent ?? ''));
    expect(disclosure).toBeUndefined();
  });

  it('does not poster-lead at compact — title stays below the hero', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={posterModel('Final structural turnover phase')} forceMode="compact" />,
    );
    const layout = findFeaturedLayout(container);
    const mediaZone = layout.querySelector<HTMLElement>(
      '[data-has-image="true"]',
    );
    expect(mediaZone?.getAttribute('data-poster-led')).toBe('false');
    const titles = layout.querySelectorAll('h3');
    expect(titles.length).toBe(1);
    // Title is NOT inside the media zone at compact.
    expect(mediaZone?.contains(titles[0])).toBe(false);
  });

  it('omits the poster headline when the authored headline is absent', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={posterModel(undefined)}
        forceMode="wide"
      />,
    );
    const layout = findFeaturedLayout(container);
    const mediaZone = layout.querySelector<HTMLElement>(
      '[data-has-image="true"]',
    );
    expect(mediaZone?.getAttribute('data-poster-led')).toBe('true');
    // Title still present; no lingering empty headline.
    expect(mediaZone?.textContent).toContain('Palm Beach Medical Campus');
    expect(mediaZone?.textContent).not.toContain(
      'Final structural turnover phase',
    );
  });
});
