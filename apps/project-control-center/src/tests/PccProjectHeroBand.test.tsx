import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import {
  PCC_MVP_SURFACES,
  PCC_MVP_SURFACE_IDS,
  SAMPLE_PROJECT_PROFILE,
  type PccMvpSurfaceId,
} from '@hbc/models/pcc';
import { PCC_RESPONSIVE_MODES, type PccResponsiveMode } from '../layout/footprints';
import { PCC_SURFACE_HERO_DESCRIPTIONS } from '../shell/surfaceHeroCopy';
import { deriveShellHeroViewModel } from '../preview/projectShellViewModel';
import { PccProjectHeroBand, type PccProjectHeroBandProps } from '../shell/PccProjectHeroBand';

afterEach(() => {
  cleanup();
});

function renderHero(overrides: Partial<PccProjectHeroBandProps> = {}) {
  const activeSurfaceId: PccMvpSurfaceId = overrides.viewModel ? 'project-home' : 'project-home';
  const props: PccProjectHeroBandProps = {
    mode: 'standardLaptop',
    viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, activeSurfaceId),
    ...overrides,
  };
  return render(<PccProjectHeroBand {...props} />);
}

describe('PccProjectHeroBand — locked content (Wave 15A wave-b2)', () => {
  it('renders primary title "Project Control Center"', () => {
    const { container } = renderHero();
    const primary = container.querySelector('[data-pcc-hero-primary-title]');
    expect(primary?.textContent).toBe('Project Control Center');
  });

  it('renders the active surface name as the secondary title', () => {
    const { container } = renderHero({
      viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'approvals'),
    });
    const secondary = container.querySelector('[data-pcc-hero-secondary-title]');
    expect(secondary?.textContent).toBe(PCC_MVP_SURFACES.approvals.displayName);
  });

  it.each(PCC_MVP_SURFACE_IDS)(
    'renders the local compact hero description for "%s" (never PCC_MVP_SURFACES.description)',
    (surfaceId) => {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId),
      });
      const description = container.querySelector('[data-pcc-hero-surface-description]');
      expect(description?.textContent).toBe(PCC_SURFACE_HERO_DESCRIPTIONS[surfaceId]);
    },
  );

  it('renders the four locked-in facts with formatter output for SAMPLE_PROJECT_PROFILE', () => {
    const { container } = renderHero();
    const location = container.querySelector('[data-pcc-hero-fact-location] dd');
    const value = container.querySelector('[data-pcc-hero-fact-estimated-value] dd');
    const completion = container.querySelector('[data-pcc-hero-fact-scheduled-completion] dd');
    const stage = container.querySelector('[data-pcc-hero-fact-project-stage] dd');
    expect(location?.textContent).toBe('Sample City, ST');
    expect(value?.textContent).toBe('$25,000,000');
    expect(completion?.textContent).toBe('Sep 30, 2027');
    expect(stage?.textContent).toBe('Active Construction');
  });

  it('renders a non-interactive command-search preview affordance inside the hero', () => {
    const { container } = renderHero();
    const slot = container.querySelector('[data-pcc-hero-command-search]');
    expect(slot).not.toBeNull();

    // Wave-b2 Prompt 04: the affordance is a purely informational preview
    // capsule. No <input>, <button>, or <a> renders inside the slot.
    expect(slot!.querySelectorAll('input').length).toBe(0);
    expect(slot!.querySelectorAll('button').length).toBe(0);
    expect(slot!.querySelectorAll('a').length).toBe(0);

    // Stable preview-state marker on the capsule.
    const capsule = slot!.querySelector('[data-pcc-command-search-state="preview"]');
    expect(capsule).not.toBeNull();

    // Visible text is the accessible name — no aria-label override.
    const text = slot!.textContent ?? '';
    expect(text).toContain('Command Search — Preview');
    expect(text).toContain('Search and project commands are unavailable in this preview.');
  });

  it('renders the visual hero surface and the hero/tab seam', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-hero-surface]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-hero-tab-seam]')).not.toBeNull();
  });

  it('renders the hero facts grid container', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-hero-facts]')).not.toBeNull();
  });
});

describe('PccProjectHeroBand — locked-out content (negative marker assertions)', () => {
  it('does not render any source-confidence marker', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-source-confidence]')).toBeNull();
    expect(container.querySelector('[data-pcc-source-confidence-label]')).toBeNull();
    expect(container.querySelector('[data-pcc-source-confidence-dot]')).toBeNull();
  });

  it('does not render a client fact marker', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-hero-fact-client]')).toBeNull();
  });

  it('does not render project-status, project-number, or last-updated fact markers', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-hero-fact-project-status]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-fact-project-number]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-fact-last-updated]')).toBeNull();
  });

  it('does not render any pill row markers', () => {
    const { container } = renderHero();
    expect(
      container.querySelectorAll(
        '[data-pcc-status-pill],[data-pcc-pill],[data-pcc-hero-pill],[data-pcc-hero-pill-row]',
      ).length,
    ).toBe(0);
  });

  it('does not render the legacy phone-mode project-intel toggle', () => {
    const { container } = renderHero({ mode: 'phone' });
    expect(container.querySelector('[data-pcc-project-intel-toggle]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-intel-region]')).toBeNull();
  });
});

describe('PccProjectHeroBand — forbidden preview literals', () => {
  it('does not contain "Reference Client", "Reference Location", or "$0" in the default preview', () => {
    const { container } = renderHero();
    const text = container.textContent ?? '';
    expect(text).not.toContain('Reference Client');
    expect(text).not.toContain('Reference Location');
    expect(text).not.toContain('$0');
  });
});

describe('PccProjectHeroBand — responsive markers preserved', () => {
  it.each(PCC_RESPONSIVE_MODES)('mirrors mode "%s" on the hero band root', (mode) => {
    cleanup();
    const { container } = renderHero({ mode });
    const root = container.querySelector('[data-pcc-project-hero-band]');
    expect(root?.getAttribute('data-pcc-mode')).toBe(mode);
  });

  it('marks density: compact at phone/tabletPortrait/tabletLandscape/smallLaptop; comfortable above', () => {
    const expectations: Array<[PccResponsiveMode, 'compact' | 'comfortable']> = [
      ['phone', 'compact'],
      ['tabletPortrait', 'compact'],
      ['tabletLandscape', 'compact'],
      ['smallLaptop', 'compact'],
      ['standardLaptop', 'comfortable'],
      ['largeLaptop', 'comfortable'],
      ['desktop', 'comfortable'],
      ['ultrawide', 'comfortable'],
    ];
    for (const [mode, density] of expectations) {
      cleanup();
      const { container } = renderHero({ mode });
      const root = container.querySelector('[data-pcc-project-hero-band]');
      expect(
        root?.getAttribute('data-pcc-hero-density'),
        `mode '${mode}' should be ${density}`,
      ).toBe(density);
    }
  });

  it('wide modes render the expanded command-search variant', () => {
    for (const mode of ['standardLaptop', 'largeLaptop', 'desktop', 'ultrawide'] as const) {
      cleanup();
      const { container } = renderHero({ mode });
      expect(container.querySelector('[data-pcc-command-search="expanded"]')).not.toBeNull();
      expect(container.querySelector('[data-pcc-command-search="icon"]')).toBeNull();
    }
  });

  it('compact modes render the icon command-search variant', () => {
    for (const mode of ['phone', 'tabletPortrait', 'tabletLandscape', 'smallLaptop'] as const) {
      cleanup();
      const { container } = renderHero({ mode });
      expect(container.querySelector('[data-pcc-command-search="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-pcc-command-search="expanded"]')).toBeNull();
    }
  });
});
