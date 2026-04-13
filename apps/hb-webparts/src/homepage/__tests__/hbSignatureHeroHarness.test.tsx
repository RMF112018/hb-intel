/**
 * Phase-01 Prompt-05 visual-proof harness test.
 *
 * Renders the full `HbSignatureHeroHarness` and asserts each
 * scenario independently against the scoped DOM subtree:
 *
 *   1. Homepage mode is locked on HBCentral and ignores any article
 *      payload supplied (regression guard for the HBCentral lock).
 *   2. Article mode — full data — renders title, subheading, labels,
 *      byline, explicit avatar image, and destination link.
 *   3. Article mode — minimal — renders title + byline only and does
 *      not emit subheading/link wrappers.
 *   4. Article mode — author-photo fallback — renders initials when
 *      the Graph adapter returns undefined for the UPN.
 */
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor, within } from '@testing-library/react';
import type { PersonPhotoFn } from '@hbc/ui-kit/homepage';
import { HbSignatureHeroHarness } from '../../webparts/hbSignatureHero/HbSignatureHero.harness.js';

function caseEl(container: HTMLElement, name: string): HTMLElement {
  const el = container.querySelector(`[data-hbc-harness-case="${name}"]`);
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

describe('HbSignatureHeroHarness — Phase-01 visual proof', () => {
  it('locks HBCentral to the homepage flagship identity surface regardless of article payload', () => {
    const { container } = render(<HbSignatureHeroHarness />);
    const scope = within(caseEl(container, 'homepage-locked'));

    // Flagship identity surface intact.
    expect(scope.getByText('Build with GRIT.')).not.toBeNull();
    expect(
      scope.getByRole('img', { name: 'Hedrick Brothers' }),
    ).not.toBeNull();
    // Article payload must not leak into HBCentral render.
    expect(scope.queryByText(/IGNORED/)).toBeNull();
    expect(scope.queryByText(/Milestone/)).toBeNull();
  });

  it('renders article mode with full data (title, subheading, labels, byline, photo, link)', async () => {
    const { container } = render(<HbSignatureHeroHarness />);
    const scope = within(caseEl(container, 'article-full'));

    expect(
      scope.getByText('A Major Milestone on Project Horizon'),
    ).not.toBeNull();
    expect(
      scope.getByText('Field teams close out the structural phase ahead of schedule.'),
    ).not.toBeNull();
    expect(scope.getByText('Project · Field')).not.toBeNull();
    expect(
      scope.getByText('Avery Stone · 2026-04-13 · 09:15 AM'),
    ).not.toBeNull();

    const titleLink = scope.getByRole('link', {
      name: 'A Major Milestone on Project Horizon',
    });
    expect(titleLink.getAttribute('href')).toBe(
      'https://intranet.example.invalid/articles/horizon-milestone',
    );

    await waitFor(() => {
      const img = caseEl(container, 'article-full').querySelector(
        'img[alt="Avery Stone"]',
      ) as HTMLImageElement | null;
      expect(img).not.toBeNull();
      expect(img!.src).toBe('https://cdn.example.invalid/avery.jpg');
    });
  });

  it('renders article mode with only the required triad (graceful degradation)', () => {
    const { container } = render(<HbSignatureHeroHarness />);
    const scopeEl = caseEl(container, 'article-minimal');
    const scope = within(scopeEl);

    expect(scope.getByText('Minimal Article')).not.toBeNull();
    expect(scope.getByText('Pat Field · 2026-04-13')).not.toBeNull();
    // No subheading or destination link should be emitted.
    expect(scopeEl.querySelector('[data-hbc-article-subheading]')).toBeNull();
    expect(scopeEl.querySelector('[data-hbc-article-title-link]')).toBeNull();
  });

  it('falls back to author initials when the Graph photo adapter returns undefined', async () => {
    const fetchPersonPhoto = vi
      .fn<(upn: string) => Promise<string | undefined>>()
      .mockResolvedValue(undefined);
    const { container } = render(
      <HbSignatureHeroHarness
        fetchPersonPhoto={fetchPersonPhoto as PersonPhotoFn}
      />,
    );
    await waitFor(() =>
      expect(fetchPersonPhoto).toHaveBeenCalledWith('sam.river@example.invalid'),
    );

    const scopeEl = caseEl(container, 'article-photo-fallback');
    expect(scopeEl.querySelector('img[alt="Sam River"]')).toBeNull();
    expect(within(scopeEl).getByText('SR')).not.toBeNull();
  });

  it('keeps the HBCentral hero labelled as the flagship identity surface (accessibility/doctrine regression)', () => {
    const { container } = render(<HbSignatureHeroHarness />);
    const scopeEl = caseEl(container, 'homepage-locked');
    // The homepage adapter exposes its premium anchor + accessible label.
    expect(
      scopeEl.querySelector('[data-hbc-premium="signature-hero"]'),
    ).not.toBeNull();
    expect(
      scopeEl.querySelector('section[aria-label="HB Central homepage hero"]'),
    ).not.toBeNull();
  });
});
