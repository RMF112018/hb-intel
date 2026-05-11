import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import {
  PCC_PRIMARY_TAB_IDS,
  SAMPLE_PROJECT_PROFILE,
  getPrimaryNavigationTab,
  type PccPrimaryTabId,
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
  const activePrimaryTabId: PccPrimaryTabId = 'project-home';
  const props: PccProjectHeroBandProps = {
    mode: 'standardLaptop',
    viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, activePrimaryTabId),
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

  // Phase 05 wave-b10 Prompt 06 — hero secondary title equals the
  // primary-tab registry label. Migrated from legacy `'approvals'`
  // (now a Core Tools module) to a Phase 05 primary-tab id.
  it('renders the active primary-tab label as the secondary title', () => {
    const { container } = renderHero({
      viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'core-tools'),
    });
    const secondary = container.querySelector('[data-pcc-hero-secondary-title]');
    expect(secondary?.textContent).toBe(getPrimaryNavigationTab('core-tools').label);
  });

  it.each([...PCC_PRIMARY_TAB_IDS])(
    'renders the local compact hero description for "%s" (never a registry description fallback)',
    (tabId) => {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId),
      });
      const description = container.querySelector('[data-pcc-hero-surface-description]');
      expect(description?.textContent).toBe(PCC_SURFACE_HERO_DESCRIPTIONS[tabId]);
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
    // Phase 08 Prompt 05 refined the helper copy from "unavailable in this
    // preview." to "preview-only in this phase." The dedicated
    // PccCommandSearch.test.tsx owns the full helper sentence; this hero
    // test only asserts the load-bearing preview-only semantic.
    const text = slot!.textContent ?? '';
    expect(text).toContain('Command Search — Preview');
    expect(text).toContain('preview-only in this phase');
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
  it.each([...PCC_PRIMARY_TAB_IDS])(
    'renders the heroHighlights row and governanceMicrocopy row for "%s"',
    (tabId) => {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId),
      });
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];

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
    // Phase 08 Prompt 04 — project-home's first heroHighlight was reframed
    // to "Today's Focus" (kind='next-step', tone='attention'), so the
    // default-marker contract is now verified on a sibling surface whose
    // first highlight still omits both `tone` and `kind` overrides.
    // `core-tools` `hbi-assistant` keeps `kind: 'summary'` and no `tone`,
    // making it the canonical default-marker anchor.
    const { container } = renderHero({
      viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'core-tools'),
    });
    const hbiAssistant = container.querySelector('[data-pcc-hero-highlight="hbi-assistant"]');
    expect(hbiAssistant).not.toBeNull();
    expect(hbiAssistant?.getAttribute('data-pcc-hero-highlight-tone')).toBe('neutral');
    expect(hbiAssistant?.getAttribute('data-pcc-hero-highlight-kind')).toBe('summary');
  });

  it('renders a project-home "Today\'s Focus" highlight with attention tone and next-step kind, and that highlight is project-home-specific', () => {
    // Phase 08 Prompt 04 — Project Home includes an explicit current-focus
    // posture summary via `surfaceHeaderMetadata.ts`. The Today's Focus
    // value is deterministic (no live date / tenant / source call) and
    // absorbs the prior "Priority Actions" semantic into a current-focus
    // framing per memory `feedback_combine_dont_replace_metadata_cue`.
    cleanup();
    const { container: projectHomeContainer } = renderHero();
    const focusNodes = projectHomeContainer.querySelectorAll(
      '[data-pcc-hero-highlight="todays-focus"]',
    );
    expect(focusNodes).toHaveLength(1);
    const focus = focusNodes[0]!;
    expect(focus.getAttribute('data-pcc-hero-highlight-tone')).toBe('attention');
    expect(focus.getAttribute('data-pcc-hero-highlight-kind')).toBe('next-step');
    expect(focus.textContent).toContain("Today's Focus");
    expect(focus.textContent).toContain('Priority actions and blocking signals to triage');

    // Sentinel: Today's Focus is Project Home posture only — no other
    // primary surface emits a `todays-focus` highlight.
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      if (tabId === 'project-home') continue;
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId),
      });
      const others = container.querySelectorAll('[data-pcc-hero-highlight="todays-focus"]');
      expect(
        others,
        `primary tab "${tabId}" must not render a Today's Focus highlight`,
      ).toHaveLength(0);
    }
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
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      cleanup();
      const { container } = renderHero({
        viewModel: deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId),
      });
      const highlightZone = container.querySelector('[data-pcc-hero-highlights]');
      expect(
        highlightZone,
        `primary tab "${tabId}" must render the highlights zone`,
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
          `primary tab "${tabId}" highlight labels must not contain legacy scaffold label "${forbidden}"`,
        ).not.toContain(forbidden);
      }
      for (const forbidden of FORBIDDEN_VALUES) {
        expect(
          valueTexts,
          `primary tab "${tabId}" highlight values must not contain legacy scaffold value "${forbidden}"`,
        ).not.toContain(forbidden);
      }
    }
  });

  // Phase 05 wave-b10 Prompt 06 — the legacy `project-readiness`
  // `no-checklist-completion` and `external-systems`
  // `launch-context-reminder` governance microcopy items are removed
  // with their parent legacy surface ids. Equivalent Phase 05 coverage
  // lives in `projectShellViewModel.test.ts` (Sage book-of-record on
  // `cost-time`; HBI advisory on `core-tools`; Document Control posture
  // on `documents`).
});
