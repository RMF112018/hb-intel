/**
 * HbcProjectSpotlightSurface — mode-governed masthead furniture and
 * section-level CTA posture.
 *
 * Proves that:
 *   - wide/medium render the full editorial masthead (eyebrow dateline
 *     + section-level "View all" action) and suppress the rail footer
 *     CTA so the surface never double-furnishes with section-level
 *     CTAs,
 *   - compact/minimal drop the masthead dateline and the masthead
 *     action entirely, and keep the section-level CTA reachable only
 *     through the expanded history disclosure (rail footer),
 *   - exactly one "View all projects" affordance is present per mode,
 *   - the explicit details + past-spotlights disclosures remain
 *     present in every mode (guardrail).
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HbcProjectSpotlightSurface,
  SPOTLIGHT_LAYOUT_VISIBILITY,
  type ProjectSpotlightSurfaceModel,
  type SpotlightLayoutMode,
} from '../index.js';

const MODEL: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  allProjectsLabel: 'View all projects',
  allProjectsUrl: '/portfolio',
  featured: {
    id: 'featured',
    title: 'Palm Beach Medical Campus Expansion',
    headline: 'Final structural turnover phase',
    summary: 'Structural turnover enters final phase.',
    location: 'Palm Beach, FL',
    sector: 'Healthcare',
    image: { src: 'https://example.com/p.jpg', alt: 'Project site' },
    status: { label: 'On Track', variant: 'success' },
    strategicEmphasis: true,
    freshnessLabel: 'Updated today',
    milestones: [
      { id: 'm1', title: 'MEP closeout', completed: true },
      { id: 'm2', title: 'Owner turnover', completed: false },
    ],
    teamMembers: [
      { id: 'tm1', displayName: 'Jane Smith', role: 'PM' },
    ],
    cta: { label: 'View project brief', href: '#brief' },
    completeness: 'full',
  },
  secondary: [
    {
      id: 'secondary-1',
      title: 'Fort Lauderdale Waterfront Residence',
      location: 'Fort Lauderdale, FL',
      sector: 'Luxury Residential',
      status: { label: 'Watchlist', variant: 'warning' },
      cta: { label: 'Open', href: '#ftl' },
      completeness: 'full',
    },
    {
      id: 'secondary-2',
      title: 'Orlando Civic Center Modernization',
      location: 'Orlando, FL',
      sector: 'Civic',
      status: { label: 'On Track', variant: 'success' },
      cta: { label: 'Open', href: '#orl' },
      completeness: 'full',
    },
    {
      id: 'secondary-3',
      title: 'Tampa Riverfront Headquarters',
      location: 'Tampa, FL',
      sector: 'Commercial',
      status: { label: 'On Track', variant: 'success' },
      cta: { label: 'Open', href: '#tpa' },
      completeness: 'full',
    },
  ],
};

function renderMode(mode: SpotlightLayoutMode) {
  return render(
    <HbcProjectSpotlightSurface model={MODEL} forceMode={mode} />,
  );
}

/**
 * Returns the masthead block — the top editorial nameplate owned by
 * `Masthead.tsx`. The heading is the only `h2` on the surface and
 * lives inside the masthead, so its parent chain is a stable anchor.
 */
function getMasthead(): HTMLElement {
  const heading = screen.getByRole('heading', { level: 2, name: 'Project Spotlight' });
  let el: HTMLElement | null = heading.parentElement;
  // Walk up to the mastheadEyebrow's sibling container (`.masthead`).
  while (el && !/_masthead_/.test(el.className)) {
    el = el.parentElement;
  }
  if (!el) throw new Error('Masthead element not found');
  return el;
}

describe('HbcProjectSpotlightSurface — mode-governed masthead furniture', () => {
  describe('visibility matrix contract', () => {
    it('wide and medium show full masthead, suppress rail footer CTA', () => {
      for (const mode of ['wide', 'medium'] as const) {
        const v = SPOTLIGHT_LAYOUT_VISIBILITY[mode];
        expect(v.showMastheadDate).toBe(true);
        expect(v.showMastheadAction).toBe(true);
        expect(v.showRailFooterCta).toBe(false);
      }
    });

    it('compact and minimal drop masthead date+action, keep rail footer CTA', () => {
      for (const mode of ['compact', 'minimal'] as const) {
        const v = SPOTLIGHT_LAYOUT_VISIBILITY[mode];
        expect(v.showMastheadDate).toBe(false);
        expect(v.showMastheadAction).toBe(false);
        expect(v.showRailFooterCta).toBe(true);
      }
    });

    it('masthead action and rail footer CTA are mutually exclusive per mode', () => {
      for (const mode of ['wide', 'medium', 'compact', 'minimal'] as const) {
        const v = SPOTLIGHT_LAYOUT_VISIBILITY[mode];
        expect(v.showMastheadAction && v.showRailFooterCta).toBe(false);
      }
    });
  });

  describe('rendered surface per mode', () => {
    it('wide renders masthead dateline + masthead "View all" and omits rail footer CTA', () => {
      renderMode('wide');
      const masthead = getMasthead();
      expect(within(masthead).getByText('Updated today')).toBeTruthy();
      expect(within(masthead).getByText('View all projects')).toBeTruthy();
      // Rail is open by default in wide, so the rail is rendered —
      // but its footer CTA must be suppressed to avoid duplicating
      // the masthead action. The only "View all projects" on the
      // surface should be the masthead one.
      expect(screen.getAllByText('View all projects')).toHaveLength(1);
    });

    it('minimal hides dateline and masthead "View all"; overflow disclosure reveals rail footer CTA on expansion', () => {
      renderMode('minimal');
      const masthead = getMasthead();
      expect(within(masthead).queryByText('Updated today')).toBeNull();
      expect(within(masthead).queryByText('View all projects')).toBeNull();
      // Minimal previews exactly 1 past spotlight (railPreviewCount=1).
      // The overflow (2 remaining) is behind the disclosure; since the
      // preview carries overflow, `previewShowsFooterCta` is false and
      // no "View all projects" is in the DOM until expansion.
      expect(screen.queryByText('View all projects')).toBeNull();

      // Expand the overflow disclosure; the rail footer CTA on the
      // overflow rail becomes the single section-level affordance.
      fireEvent.click(screen.getByRole('button', { name: /show 2 more/i }));
      const viewAlls = screen.getAllByText('View all projects');
      expect(viewAlls).toHaveLength(1);
    });

    it('compact hides dateline and masthead action; overflow disclosure is explicit and keyboard-safe', () => {
      renderMode('compact');
      const masthead = getMasthead();
      expect(within(masthead).queryByText('Updated today')).toBeNull();
      expect(within(masthead).queryByText('View all projects')).toBeNull();
      // Details disclosure still present (guardrail).
      expect(
        screen.getByRole('button', {
          name: /show spotlight details|hide spotlight details/i,
        }),
      ).toBeTruthy();
      // Compact previews 2 past spotlights; the 3rd lives behind an
      // overflow disclosure labelled "Show 1 more".
      expect(
        screen.getByRole('button', { name: /show 1 more|hide full history/i }),
      ).toBeTruthy();
    });

    it('renders the history preview rail at first paint in every mode (always-visible preview)', () => {
      for (const mode of ['wide', 'medium', 'compact', 'minimal'] as const) {
        const { unmount } = renderMode(mode);
        // At least one past-spotlight title is visible without clicking
        // any disclosure — preview is always mounted.
        expect(
          screen.getByText(/Fort Lauderdale Waterfront Residence/),
        ).toBeTruthy();
        unmount();
      }
    });
  });
});
