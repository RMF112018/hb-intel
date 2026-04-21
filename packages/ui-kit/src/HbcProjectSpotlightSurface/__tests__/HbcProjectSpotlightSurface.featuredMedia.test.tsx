/**
 * HbcProjectSpotlightSurface — featured media posture contract.
 *
 * Pins the three supported media states so the flagship slot cannot
 * regress to the pre-fix behavior where a missing or broken image
 * filled the hero with a dominant "PROJECT IMAGE" placeholder label.
 *
 *   1. authored image present → <img> renders, zone carries
 *                               data-has-image="true", no filler text
 *   2. authored image errored → <img> unmounts on `error`, zone still
 *                               carries data-has-image="true" (authored
 *                               intent was a full hero), fallback band
 *                               replaces it
 *   3. no authored image      → <img> never renders, zone carries
 *                               data-has-image="false" (CSS collapses
 *                               the mode-governed min-height)
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
      milestones: [],
      teamMembers: [],
      image,
      completeness: 'full',
    },
    secondary: [],
  };
}

function findMediaZone(container: HTMLElement): HTMLElement {
  const zone = container.querySelector<HTMLElement>('[data-has-image]');
  if (!zone) {
    throw new Error('Spotlight media zone not rendered');
  }
  return zone;
}

describe('HbcProjectSpotlightSurface — featured media posture', () => {
  it('renders the <img> and marks the zone as image-bearing when authored', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/palm-beach.jpg',
          alt: 'Palm Beach aerial',
        })}
        forceMode="wide"
      />,
    );
    const zone = findMediaZone(container);
    expect(zone.getAttribute('data-has-image')).toBe('true');
    const img = zone.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(
      'https://cdn.example.invalid/projects/palm-beach.jpg',
    );
    expect(img?.getAttribute('alt')).toBe('Palm Beach aerial');
    // No dominant "PROJECT IMAGE" filler label anywhere in the zone.
    expect(zone.textContent).not.toMatch(/project\s*image/i);
  });

  it('unmounts the <img> and preserves image-bearing posture when the image fails to load', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/broken.jpg',
          alt: 'Broken asset',
        })}
        forceMode="wide"
      />,
    );
    const zone = findMediaZone(container);
    const img = zone.querySelector('img');
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(zone.querySelector('img')).toBeNull();
    // Authored intent was a hero, so the zone keeps its editorial posture
    // rather than collapsing to the no-image height.
    expect(zone.getAttribute('data-has-image')).toBe('true');
    expect(zone.textContent).not.toMatch(/project\s*image/i);
  });

  it('marks the zone as image-less when no image is authored and renders no <img>', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface
        model={modelWithImage(undefined)}
        forceMode="wide"
      />,
    );
    const zone = findMediaZone(container);
    expect(zone.getAttribute('data-has-image')).toBe('false');
    expect(zone.querySelector('img')).toBeNull();
    // The featured content (title) still renders — the composition
    // pivots to content-led instead of image-led.
    expect(container.textContent).toContain(
      'Palm Beach Medical Campus Expansion',
    );
    // No dominant filler label.
    expect(zone.textContent).not.toMatch(/project\s*image/i);
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
    const zone = findMediaZone(container);
    fireEvent.error(zone.querySelector('img')!);
    expect(zone.querySelector('img')).toBeNull();

    rerender(
      <HbcProjectSpotlightSurface
        model={modelWithImage({
          src: 'https://cdn.example.invalid/projects/recovered.jpg',
          alt: 'Recovered',
        })}
        forceMode="wide"
      />,
    );
    const recoveredImg = findMediaZone(container).querySelector('img');
    expect(recoveredImg).not.toBeNull();
    expect(recoveredImg?.getAttribute('src')).toBe(
      'https://cdn.example.invalid/projects/recovered.jpg',
    );
  });
});
