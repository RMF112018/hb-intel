/**
 * HbcProjectSpotlightSurface — remediation regression contract.
 *
 * Pins three posture rules introduced by the hard remediation so the
 * surface cannot regress to the duplicated-CTA / auto-open-no-image /
 * invisible-history failure:
 *
 *   1. exactly one section-level CTA renders per surface instance.
 *      When the masthead owns the section action (wide/medium) or the
 *      rail footer owns it (compact/minimal with history), the
 *      featured body must not also render a section-fallback CTA.
 *   2. no-image mode keeps the details disclosure closed by default
 *      in every mode that has a closed default in the matrix — the
 *      missing-hero state does not spill depth content into first
 *      view. Wide/medium follow the matrix (open by default) but
 *      compact stays closed even without a hero.
 *   3. wide and medium render an explicit rail sectional header
 *      (label + count) above the disclosure so the history section
 *      owns authored identity while collapsed; compact/minimal stay
 *      button-only.
 */
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightSurfaceModel,
} from '../index.js';

function baseModel(
  overrides?: Partial<ProjectSpotlightSurfaceModel>,
): ProjectSpotlightSurfaceModel {
  return {
    heading: 'Project Spotlight',
    allProjectsLabel: 'View all projects',
    allProjectsUrl: '#all',
    featured: {
      id: 'featured',
      title: 'Palm Beach Medical Campus Expansion',
      summary: 'Structural turnover enters final phase.',
      status: { label: 'On Track', variant: 'success' },
      milestones: [],
      teamMembers: [],
      // No item-level CTA so the section fallback is the only
      // candidate for the featured-body CTA slot.
      completeness: 'full',
    },
    secondary: [
      {
        id: 'r1',
        title: 'Downtown Transit Hub',
        cta: { label: 'Open', href: '#r1' },
      },
      {
        id: 'r2',
        title: 'Riverside Mixed Use',
        cta: { label: 'Open', href: '#r2' },
      },
    ],
    ...overrides,
  };
}

function countSectionAllProjectsLinks(container: HTMLElement): number {
  const links = Array.from(container.querySelectorAll('a'));
  return links.filter((a) => /view all projects/i.test(a.textContent ?? ''))
    .length;
}

describe('HbcProjectSpotlightSurface — CTA hierarchy', () => {
  it('renders exactly one section-level "View all projects" in wide (masthead only; no featured-body fallback)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="wide" />,
    );
    expect(countSectionAllProjectsLinks(container)).toBe(1);
    // The featured CTA wrapper, if present, must not be a section
    // fallback — authored item CTA is absent in this model.
    const featuredCta = container.querySelector('[data-cta-source]');
    expect(featuredCta).toBeNull();
  });

  it('renders exactly one section-level "View all projects" in medium', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="medium" />,
    );
    expect(countSectionAllProjectsLinks(container)).toBe(1);
  });

  it('renders exactly one section-level "View all projects" in compact (rail footer owns it)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="compact" />,
    );
    // History is closed by default in compact — force it open so the
    // rail footer CTA mounts for the count to be observable.
    const disclosure = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => /past spotlights/i.test(b.textContent ?? ''));
    expect(disclosure).toBeTruthy();
    fireEvent.click(disclosure!);
    expect(countSectionAllProjectsLinks(container)).toBe(1);
    // And no featured-body fallback while the rail owns the section
    // action.
    expect(container.querySelector('[data-cta-source="section"]')).toBeNull();
  });

  it('lets an authored item CTA render alongside the masthead section CTA (different action classes)', () => {
    const model = baseModel({
      featured: {
        ...baseModel().featured,
        cta: { label: 'View project brief', href: '#brief' },
      },
    });
    const { container } = render(
      <HbcProjectSpotlightSurface model={model} forceMode="wide" />,
    );
    // One section action, plus an item-level CTA — section count stays
    // at one; item CTA label differs from the section label.
    expect(countSectionAllProjectsLinks(container)).toBe(1);
    const itemCta = container.querySelector('[data-cta-source="item"]');
    expect(itemCta).not.toBeNull();
  });
});

describe('HbcProjectSpotlightSurface — no-image details disclosure', () => {
  function findDisclosureButton(container: HTMLElement): HTMLButtonElement {
    const btn = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => /spotlight details/i.test(b.textContent ?? ''));
    if (!btn) throw new Error('details disclosure not rendered');
    return btn;
  }

  it('keeps details closed by default in compact even when the hero is missing', () => {
    const model = baseModel({
      featured: {
        ...baseModel().featured,
        summary: 'Structural turnover enters final phase.',
        headline: 'Final structural turnover phase',
        milestones: [
          { id: 'm1', title: 'Foundations', completed: true },
          { id: 'm2', title: 'Steel', completed: true },
          { id: 'm3', title: 'Envelope', completed: false },
        ],
      },
    });
    const { container } = render(
      <HbcProjectSpotlightSurface model={model} forceMode="compact" />,
    );
    const btn = findDisclosureButton(container);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    // The disclosure label reads "Show" — open state would read "Hide".
    expect(btn.textContent).toMatch(/show/i);
  });

  it('keeps compact closed-by-default even when the no-image surface has rich details', () => {
    const model = baseModel({
      featured: {
        ...baseModel().featured,
        summary:
          'Structural turnover is underway across all three towers this quarter.',
        headline: 'Final structural turnover phase',
        milestones: [
          { id: 'm1', title: 'Foundations', completed: true },
          { id: 'm2', title: 'Steel', completed: true },
          { id: 'm3', title: 'Envelope', completed: false },
        ],
      },
    });
    const { container } = render(
      <HbcProjectSpotlightSurface model={model} forceMode="compact" />,
    );
    const btn = findDisclosureButton(container);
    // Compact closed-by-default must hold regardless of has-image.
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('HbcProjectSpotlightSurface — rail sectional header', () => {
  it('renders the "Previously spotlighted" header in wide', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="wide" />,
    );
    expect(container.textContent).toMatch(/previously spotlighted/i);
  });

  it('renders the "Previously spotlighted" header in medium', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="medium" />,
    );
    expect(container.textContent).toMatch(/previously spotlighted/i);
  });

  it('omits the "Previously spotlighted" header in compact (button-only)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="compact" />,
    );
    expect(container.textContent).not.toMatch(/previously spotlighted/i);
  });

  it('omits the "Previously spotlighted" header in minimal (button-only)', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={baseModel()} forceMode="minimal" />,
    );
    expect(container.textContent).not.toMatch(/previously spotlighted/i);
  });
});
