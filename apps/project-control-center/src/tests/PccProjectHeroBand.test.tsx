import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { PCC_RESPONSIVE_MODES, type PccResponsiveMode } from '../layout/footprints';
import {
  PccProjectHeroBand,
  type PccProjectHeroBandProps,
  type PccProjectHeroPill,
  type PccProjectHeroSourceConfidence,
} from '../shell/PccProjectHeroBand';

afterEach(() => {
  cleanup();
});

const PILLS: ReadonlyArray<PccProjectHeroPill> = [
  { label: 'Reference', tone: 'info' },
  { label: 'PCC', tone: 'neutral' },
];

function renderHero(overrides: Partial<PccProjectHeroBandProps> = {}) {
  const props: PccProjectHeroBandProps = {
    mode: 'standardLaptop',
    projectName: 'Project Control Center',
    clientName: 'Reference Client',
    location: 'Reference Location',
    estimatedValue: '$0',
    sourceConfidence: 'reference',
    pills: PILLS,
    activeSurfaceLabel: 'Project Home',
    activeSurfaceWorkflowLabel: 'Program Overview',
    ...overrides,
  };
  return render(<PccProjectHeroBand {...props} />);
}

describe('PccProjectHeroBand primitive', () => {
  it('renders the eyebrow "Project Control Center" at the top', () => {
    const { container } = renderHero();
    const eyebrow = container.querySelector('[data-pcc-project-hero-band] p');
    expect(eyebrow?.textContent).toBe('Project Control Center');
  });

  it('renders project identity marker with the project name', () => {
    const { container } = renderHero({ projectName: '23-CC-2024 // Coastal Center' });
    const identity = container.querySelector('[data-pcc-project-identity]');
    expect(identity).not.toBeNull();
    expect(identity?.textContent).toContain('23-CC-2024 // Coastal Center');
  });

  it('renders metadata marker with Client, Location, and Estimated Value', () => {
    const { container } = renderHero({
      clientName: 'Sample Client LLC',
      location: 'Tampa, FL',
      estimatedValue: '$42M',
    });
    const metadata = container.querySelector('[data-pcc-project-metadata]') as HTMLElement;
    expect(metadata).not.toBeNull();
    const text = metadata.textContent ?? '';
    expect(text).toContain('Sample Client LLC');
    expect(text).toContain('Tampa, FL');
    expect(text).toContain('$42M');
    expect(text).toContain('Client');
    expect(text).toContain('Location');
    expect(text).toContain('Estimated Value');
  });

  it('renders the active-surface marker with the active surface label', () => {
    const { container } = renderHero({ activeSurfaceLabel: 'Approvals' });
    const surface = container.querySelector('[data-pcc-active-surface-context]');
    expect(surface).not.toBeNull();
    expect(surface?.textContent).toContain('Approvals');
  });

  it('renders source-confidence "reference" with the label "Reference data"', () => {
    const { container } = renderHero({ sourceConfidence: 'reference' });
    const source = container.querySelector('[data-pcc-source-confidence="reference"]');
    expect(source).not.toBeNull();
    expect(source?.textContent).toContain('Reference data');
    const label = container.querySelector('[data-pcc-source-confidence-label]');
    expect(label?.textContent).toBe('Reference data');
  });

  it('renders source-confidence "live" with the label "Live project data"', () => {
    const { container } = renderHero({ sourceConfidence: 'live' });
    const source = container.querySelector('[data-pcc-source-confidence="live"]');
    expect(source).not.toBeNull();
    expect(source?.textContent).toContain('Live project data');
    const label = container.querySelector('[data-pcc-source-confidence-label]');
    expect(label?.textContent).toBe('Live project data');
  });

  it('source-confidence and metadata containers contain no forbidden phrases', () => {
    const sourceConfidenceCases: PccProjectHeroSourceConfidence[] = ['reference', 'live'];
    for (const sc of sourceConfidenceCases) {
      cleanup();
      const { container } = renderHero({ sourceConfidence: sc });
      const sourceText = container.querySelector('[data-pcc-source-confidence]')?.textContent ?? '';
      const metadataText =
        container.querySelector('[data-pcc-project-metadata]')?.textContent ?? '';
      for (const phrase of ['Preview mode', 'Mock data', 'Fixture data']) {
        expect(
          sourceText,
          `source-confidence text contains forbidden phrase: ${phrase}`,
        ).not.toContain(phrase);
        expect(metadataText, `metadata text contains forbidden phrase: ${phrase}`).not.toContain(
          phrase,
        );
      }
    }
  });

  it('renders status pills carrying their tone via data-tone', () => {
    const { container } = renderHero();
    const pillElements = container.querySelectorAll('[data-pcc-hero-pill]');
    expect(pillElements.length).toBe(PILLS.length);
    pillElements.forEach((el, idx) => {
      expect(el.getAttribute('data-tone')).toBe(PILLS[idx].tone);
      expect(el.textContent).toBe(PILLS[idx].label);
    });
  });

  it.each(PCC_RESPONSIVE_MODES)('mirrors mode "%s" on the hero band root', (mode) => {
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

  it('wide modes render metadata visibly with the expanded command-search variant', () => {
    for (const mode of ['standardLaptop', 'desktop'] as const) {
      cleanup();
      const { container } = renderHero({ mode });
      const metadata = container.querySelector('[data-pcc-project-metadata]') as HTMLElement | null;
      expect(metadata).not.toBeNull();
      // Ancestor `hidden` is the only structural visibility lever we control here.
      expect(metadata?.closest('[hidden]')).toBeNull();
      expect(container.querySelector('[data-pcc-command-search="expanded"]')).not.toBeNull();
      expect(container.querySelector('[data-pcc-command-search="icon"]')).toBeNull();
    }
  });

  it('compact non-phone modes render the icon command-search variant', () => {
    for (const mode of ['smallLaptop', 'tabletLandscape', 'tabletPortrait'] as const) {
      cleanup();
      const { container } = renderHero({ mode });
      expect(container.querySelector('[data-pcc-command-search="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-pcc-command-search="expanded"]')).toBeNull();
    }
  });

  it('phone mode collapses overflow content behind the Project Intel toggle', () => {
    const { container } = renderHero({ mode: 'phone' });
    const toggle = container.querySelector('[data-pcc-project-intel-toggle]') as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    expect(toggle.textContent).toBe('Project Intel');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('pcc-project-intel-collapsible');

    const region = container.querySelector('[data-pcc-project-intel-region]') as HTMLElement;
    expect(region).not.toBeNull();
    expect(region.hasAttribute('hidden')).toBe(true);

    // Identity + active-surface remain visible (outside the collapsible).
    const identity = container.querySelector('[data-pcc-project-identity]');
    const activeSurfaces = container.querySelectorAll('[data-pcc-active-surface-context]');
    expect(identity).not.toBeNull();
    expect(activeSurfaces).toHaveLength(1);
    expect(identity?.contains(activeSurfaces[0])).toBe(true);

    // Active-surface marker is NOT inside the collapsible region.
    expect(region.querySelector('[data-pcc-active-surface-context]')).toBeNull();

    // Command-search is rendered inside the collapsible region only (icon variant on phone).
    const search = container.querySelector('[data-pcc-command-search="icon"]');
    expect(search).not.toBeNull();
    expect(region.contains(search)).toBe(true);
    expect(search?.closest('[hidden]')).toBe(region);
  });

  it('phone-mode toggle expands the collapsible on click', () => {
    const { container } = renderHero({ mode: 'phone' });
    const toggle = container.querySelector('[data-pcc-project-intel-toggle]') as HTMLButtonElement;
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    const region = container.querySelector('[data-pcc-project-intel-region]') as HTMLElement;
    expect(region.hasAttribute('hidden')).toBe(false);

    // Metadata, source-confidence, command-search, and pills are now visible inside the region.
    expect(region.querySelector('[data-pcc-project-metadata]')).not.toBeNull();
    expect(region.querySelector('[data-pcc-source-confidence]')).not.toBeNull();
    expect(region.querySelector('[data-pcc-command-search="icon"]')).not.toBeNull();
    expect(region.querySelector('[data-pcc-hero-pill-row]')).not.toBeNull();
  });

  it('non-phone modes render the toggle in the DOM and the collapsible inline (no hidden)', () => {
    for (const mode of [
      'tabletPortrait',
      'tabletLandscape',
      'smallLaptop',
      'standardLaptop',
      'largeLaptop',
      'desktop',
      'ultrawide',
    ] as const) {
      cleanup();
      const { container } = renderHero({ mode });
      const toggle = container.querySelector('[data-pcc-project-intel-toggle]');
      const region = container.querySelector('[data-pcc-project-intel-region]') as HTMLElement;
      expect(toggle, `mode '${mode}' should still render the toggle for CSS hide`).not.toBeNull();
      expect(region.hasAttribute('hidden'), `mode '${mode}' collapsible should not be hidden`).toBe(
        false,
      );
    }
  });

  it.each(PCC_RESPONSIVE_MODES)(
    'renders identity and exactly one active-surface marker at mode "%s"',
    (mode) => {
      const { container } = renderHero({ mode });
      const identity = container.querySelector('[data-pcc-project-identity]');
      const activeSurfaces = container.querySelectorAll('[data-pcc-active-surface-context]');
      expect(identity).not.toBeNull();
      expect(activeSurfaces).toHaveLength(1);
    },
  );
});
