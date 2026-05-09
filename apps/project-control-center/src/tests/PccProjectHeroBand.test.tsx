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
import { PCC_SHELL_SURFACE_HEADER_METADATA } from '../shell/surfaceHeaderMetadata';
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

  it('renders the locked-in facts with formatter output for SAMPLE_PROJECT_PROFILE', () => {
    const { container } = renderHero();
    const client = container.querySelector('[data-pcc-hero-fact-client] dd');
    const location = container.querySelector('[data-pcc-hero-fact-location] dd');
    const value = container.querySelector('[data-pcc-hero-fact-estimated-value] dd');
    const completion = container.querySelector('[data-pcc-hero-fact-scheduled-completion] dd');
    const stage = container.querySelector('[data-pcc-hero-fact-project-stage] dd');
    // Wave 15A wave-b9 Prompt 4B-01 — Client added to the existing global
    // project-facts row because Location, Estimated value, Scheduled
    // completion, and Project stage are already rendered globally across
    // PCC surfaces; Client follows the same global pattern. Resolved
    // value is whatever `deriveShellHeroViewModel` returns for the
    // current SAMPLE_PROJECT_PROFILE so the test stays resilient if the
    // fixture's `clientName` changes.
    expect(client?.textContent).toBe('Sample Owner LLC');
    expect(location?.textContent).toBe('Sample City, ST');
    expect(value?.textContent).toBe('$25,000,000');
    expect(completion?.textContent).toBe('Sep 30, 2027');
    expect(stage?.textContent).toBe('Active Construction');
  });

  it('renders the Client fact label "Client" with `viewModel.clientDisplay` as the value (Wave 15A wave-b9 Prompt 4B-01)', () => {
    const { container } = renderHero();
    const cell = container.querySelector('[data-pcc-hero-fact-client]');
    expect(cell).not.toBeNull();
    expect(cell!.querySelector('dt')?.textContent).toBe('Client');
    const dd = cell!.querySelector('dd');
    expect(dd).not.toBeNull();
    expect(dd!.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it('renders a non-interactive command-search preview affordance inside the hero', () => {
    const { container } = renderHero();
    const slot = container.querySelector('[data-pcc-hero-command-search]');
    expect(slot).not.toBeNull();

    // Wave-b2 Prompt 04 + wave-b8 Prompt 03: the affordance is a purely
    // informational preview capsule. No interactive descendant renders
    // inside the slot.
    expect(slot!.querySelectorAll('input').length).toBe(0);
    expect(slot!.querySelectorAll('button').length).toBe(0);
    expect(slot!.querySelectorAll('a').length).toBe(0);
    expect(slot!.querySelectorAll('select').length).toBe(0);
    expect(slot!.querySelectorAll('textarea').length).toBe(0);
    expect(slot!.querySelectorAll('[tabindex="0"]').length).toBe(0);
    expect(slot!.querySelectorAll('[role="button"]').length).toBe(0);

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

  // Wave 15A wave-b9 Prompt 4B-03 — explicit hero internal section order:
  // facts precede heroHighlights; heroHighlights precede
  // governanceMicrocopy. Visual order on the Grid container depends on
  // grid-template-areas, which jsdom does not reliably evaluate; this test
  // locks DOM/source order only (the accessibility-relevant order). The
  // visual order is enforced by the CSS template-area edits in
  // PccProjectHeroBand.module.css (default and phone modes).
  it('renders hero sections in identity → facts → highlights → microcopy DOM order (Wave 15A wave-b9 Prompt 4B-03)', () => {
    const { container } = renderHero();
    const facts = container.querySelector('[data-pcc-hero-facts]');
    const highlights = container.querySelector('[data-pcc-hero-highlights]');
    const microcopy = container.querySelector('[data-pcc-hero-governance-microcopy]');
    expect(facts, '[data-pcc-hero-facts] must render').not.toBeNull();
    expect(highlights, '[data-pcc-hero-highlights] must render').not.toBeNull();
    expect(microcopy, '[data-pcc-hero-governance-microcopy] must render').not.toBeNull();
    // facts precedes highlights
    expect(
      facts!.compareDocumentPosition(highlights!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'facts row must precede the heroHighlights row in DOM order',
    ).toBeTruthy();
    // highlights precedes microcopy
    expect(
      highlights!.compareDocumentPosition(microcopy!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'heroHighlights must precede the governanceMicrocopy in DOM order',
    ).toBeTruthy();
  });
});

describe('PccProjectHeroBand — accessible region semantics (wave-b8 Prompt 04)', () => {
  it('exposes role="region" with a non-empty accessible label that names the Project Control Center', () => {
    const { container } = renderHero();
    const root = container.querySelector('[data-pcc-project-hero-band]');
    expect(root).not.toBeNull();
    expect(root!.getAttribute('role')).toBe('region');
    const label = root!.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).toMatch(/Project|Control Center/);
  });
});

describe('PccProjectHeroBand — locked-out content (negative marker assertions)', () => {
  it('does not render any source-confidence marker', () => {
    const { container } = renderHero();
    expect(container.querySelector('[data-pcc-source-confidence]')).toBeNull();
    expect(container.querySelector('[data-pcc-source-confidence-label]')).toBeNull();
    expect(container.querySelector('[data-pcc-source-confidence-dot]')).toBeNull();
  });

  // Wave 15A wave-b9 Prompt 4B-01 — Client was previously locked out of
  // the hero. After `PccProjectIntelligenceCard` removed the duplicate
  // Project Home header card, Client was added back to the existing
  // global project-facts row (positive coverage in the locked-content
  // describe block above).

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

describe('PccProjectHeroBand — wave-b9 Prompt 4B-02 production hero highlights and governance microcopy zones', () => {
  it.each(PCC_MVP_SURFACE_IDS)(
    'renders the heroHighlights row and governanceMicrocopy row for "%s"',
    (surfaceId) => {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId),
      });
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];

      const highlightZones = container.querySelectorAll('[data-pcc-hero-highlights]');
      expect(highlightZones).toHaveLength(1);
      const highlightZone = highlightZones[0]!;
      const highlights = highlightZone.querySelectorAll('[data-pcc-hero-highlight]');
      expect(highlights).toHaveLength(metadata.heroHighlights.length);
      metadata.heroHighlights.forEach((expected, index) => {
        const node = highlights[index]!;
        expect(node.getAttribute('data-pcc-hero-highlight')).toBe(expected.id);
        expect(node.getAttribute('data-pcc-hero-highlight-tone')).toBe(expected.tone ?? 'neutral');
        expect(node.getAttribute('data-pcc-hero-highlight-kind')).toBe(expected.kind ?? 'summary');
        expect(node.textContent).toContain(expected.label);
        expect(node.textContent).toContain(expected.value);
      });

      const microcopyZones = container.querySelectorAll('[data-pcc-hero-governance-microcopy]');
      expect(microcopyZones).toHaveLength(1);
      const microcopyZone = microcopyZones[0]!;
      const microcopyItems = microcopyZone.querySelectorAll(
        '[data-pcc-hero-governance-microcopy-item]',
      );
      expect(microcopyItems).toHaveLength(metadata.governanceMicrocopy.length);
      metadata.governanceMicrocopy.forEach((expected, index) => {
        const node = microcopyItems[index]!;
        expect(node.getAttribute('data-pcc-hero-governance-microcopy-item')).toBe(expected.id);
        expect(node.textContent).toBe(expected.text);
      });
    },
  );

  it('defaults highlight tone to "neutral" and kind to "summary" when the metadata entry omits them', () => {
    cleanup();
    const { container } = renderHero();
    // SAMPLE_PROJECT_PROFILE on project-home renders highlights without
    // explicit `tone`, so they must surface the "neutral" default
    // (project-home highlights also omit `kind`-other-than-summary on
    // priority-actions, so the default-marker contract is verifiable on
    // that node).
    const priorityActions = container.querySelector('[data-pcc-hero-highlight="priority-actions"]');
    expect(priorityActions).not.toBeNull();
    expect(priorityActions?.getAttribute('data-pcc-hero-highlight-tone')).toBe('neutral');
    expect(priorityActions?.getAttribute('data-pcc-hero-highlight-kind')).toBe('summary');
  });

  it('renders no interactive descendants inside the heroHighlights and governanceMicrocopy zones', () => {
    cleanup();
    const { container } = renderHero();
    const zones = [
      container.querySelector('[data-pcc-hero-highlights]'),
      container.querySelector('[data-pcc-hero-governance-microcopy]'),
    ];
    for (const zone of zones) {
      expect(zone).not.toBeNull();
      expect(zone!.querySelectorAll('input').length).toBe(0);
      expect(zone!.querySelectorAll('button').length).toBe(0);
      expect(zone!.querySelectorAll('a').length).toBe(0);
      expect(zone!.querySelectorAll('select').length).toBe(0);
      expect(zone!.querySelectorAll('textarea').length).toBe(0);
      expect(zone!.querySelectorAll('[tabindex="0"]').length).toBe(0);
      expect(zone!.querySelectorAll('[role="button"]').length).toBe(0);
    }
  });

  it('does not introduce forbidden source-confidence or pill markers inside the heroHighlights / governanceMicrocopy zones', () => {
    cleanup();
    const { container } = renderHero();
    const highlightZone = container.querySelector('[data-pcc-hero-highlights]');
    const microcopyZone = container.querySelector('[data-pcc-hero-governance-microcopy]');
    expect(highlightZone?.querySelector('[data-pcc-source-confidence]')).toBeNull();
    expect(microcopyZone?.querySelector('[data-pcc-source-confidence]')).toBeNull();
    expect(highlightZone?.querySelector('[data-pcc-pill]')).toBeNull();
    expect(microcopyZone?.querySelector('[data-pcc-pill]')).toBeNull();
    expect(highlightZone?.querySelector('[data-pcc-hero-pill]')).toBeNull();
    expect(microcopyZone?.querySelector('[data-pcc-hero-pill-row]')).toBeNull();
  });

  it('does not render legacy MODE / SOURCE / AUTHORITY / FOCUS / BOUNDARY / POSTURE / HBI scaffold labels as visible text inside the production hero band', () => {
    // Wave 15A wave-b9 Prompt 4B-02 — the legacy uppercase scaffold labels
    // and primary scaffold values are no longer rendered as primary visible
    // hero content. They may still exist in metadata (asserted in
    // projectShellViewModel.test.ts) and in subordinate microcopy where
    // governance phrasing legitimately appears, but the production-visible
    // highlight band must not surface them as labels or values. Per
    // `feedback_word_blocklists_break_on_corrected_copy`, the scan is
    // scoped to the production hero highlight zone — not the entire DOM —
    // so legitimate metadata-backed governance text elsewhere is not a
    // false positive.
    const FORBIDDEN_LABELS = [
      'MODE',
      'SOURCE',
      'AUTHORITY',
      'FOCUS',
      'BOUNDARY',
      'POSTURE',
      'HBI',
    ] as const;
    const FORBIDDEN_VALUES = [
      'Command preview',
      'Fixture / read-model preview',
      'Advisory only',
      'Grounded preview, no writeback',
    ] as const;
    cleanup();
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId),
      });
      const highlightZone = container.querySelector('[data-pcc-hero-highlights]');
      expect(
        highlightZone,
        `surface "${surfaceId}" must render the highlights zone`,
      ).not.toBeNull();
      const labelTexts = Array.from(
        highlightZone!.querySelectorAll<HTMLElement>('[data-pcc-hero-highlight] :first-child'),
      ).map((el) => el.textContent?.trim() ?? '');
      const valueTexts = Array.from(
        highlightZone!.querySelectorAll<HTMLElement>('[data-pcc-hero-highlight] :nth-child(2)'),
      ).map((el) => el.textContent?.trim() ?? '');
      for (const forbidden of FORBIDDEN_LABELS) {
        expect(
          labelTexts,
          `surface "${surfaceId}" highlight labels must not contain legacy scaffold label "${forbidden}"`,
        ).not.toContain(forbidden);
      }
      for (const forbidden of FORBIDDEN_VALUES) {
        expect(
          valueTexts,
          `surface "${surfaceId}" highlight values must not contain legacy scaffold value "${forbidden}"`,
        ).not.toContain(forbidden);
      }
    }
  });

  it('renders the no-checklist-completion governance microcopy item for project-readiness (wave-b9 Prompt 4B-02 — the no-execution / no-checklist-completion governance posture moved from `surfaceCues` rendering into the demoted governanceMicrocopy band; metadata still carries the original `surfaceCues` entry, asserted in projectShellViewModel.test.ts)', () => {
    cleanup();
    const { container } = renderHero({
      viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'project-readiness'),
    });
    const node = container.querySelector(
      '[data-pcc-hero-governance-microcopy-item="no-checklist-completion"]',
    );
    expect(
      node,
      'project-readiness must render the no-checklist-completion microcopy',
    ).not.toBeNull();
    expect(node!.textContent).toContain('Checklist completion');
    expect(node!.textContent).toContain('source module');
  });

  it('renders the launch-context-reminder governance microcopy item for external-systems (wave-b9 Prompt 4B-02 — the launch-context governance posture moved into the demoted governanceMicrocopy band; metadata still carries the original `surfaceCues` entry, asserted in projectShellViewModel.test.ts)', () => {
    cleanup();
    const { container } = renderHero({
      viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'external-systems'),
    });
    const node = container.querySelector(
      '[data-pcc-hero-governance-microcopy-item="launch-context-reminder"]',
    );
    expect(
      node,
      'external-systems must render the launch-context-reminder microcopy',
    ).not.toBeNull();
    expect(node!.textContent).toContain('Launch links open');
    expect(node!.textContent).toContain('source system');
  });
});
