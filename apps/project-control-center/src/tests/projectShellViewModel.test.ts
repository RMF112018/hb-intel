import { describe, expect, it } from 'vitest';
import {
  PCC_PRIMARY_TAB_IDS,
  PCC_PROJECT_STAGES,
  SAMPLE_PROJECT_PROFILE,
  getPrimaryNavigationTab,
  type IProjectProfile,
  type PccPrimaryTabId,
  type PccProjectStage,
} from '@hbc/models/pcc';
import { PCC_SURFACE_HERO_DESCRIPTIONS } from '../shell/surfaceHeroCopy';
import { PCC_SHELL_SURFACE_HEADER_METADATA } from '../shell/surfaceHeaderMetadata';
import {
  deriveShellHeroViewModel,
  formatEstimatedValue,
  formatProjectStage,
  formatScheduledCompletion,
} from '../preview/projectShellViewModel';

describe('formatEstimatedValue', () => {
  it('formats a finite USD value with no fractional digits', () => {
    expect(formatEstimatedValue(25_000_000)).toBe('$25,000,000');
  });

  it('formats zero as $0', () => {
    expect(formatEstimatedValue(0)).toBe('$0');
  });

  it('returns "Not listed" for undefined', () => {
    expect(formatEstimatedValue(undefined)).toBe('Not listed');
  });

  it('returns "Not listed" for non-finite values', () => {
    expect(formatEstimatedValue(Number.NaN)).toBe('Not listed');
    expect(formatEstimatedValue(Number.POSITIVE_INFINITY)).toBe('Not listed');
  });
});

describe('formatScheduledCompletion', () => {
  it('formats a YYYY-MM-DD string in UTC as Mon D, YYYY', () => {
    expect(formatScheduledCompletion('2027-09-30')).toBe('Sep 30, 2027');
  });

  it('is timezone-stable (UTC anchor)', () => {
    expect(formatScheduledCompletion('2027-01-01')).toBe('Jan 1, 2027');
    expect(formatScheduledCompletion('2027-12-31')).toBe('Dec 31, 2027');
  });

  it('returns "Not listed" for undefined or empty', () => {
    expect(formatScheduledCompletion(undefined)).toBe('Not listed');
    expect(formatScheduledCompletion('')).toBe('Not listed');
  });

  it('returns "Not listed" for unparseable input', () => {
    expect(formatScheduledCompletion('not-a-date')).toBe('Not listed');
  });
});

describe('formatProjectStage', () => {
  const expectedLabels: Record<PccProjectStage, string> = {
    lead: 'Lead',
    estimating: 'Estimating',
    preconstruction: 'Preconstruction',
    active_construction: 'Active Construction',
    closeout: 'Closeout',
    warranty: 'Warranty',
  };

  for (const stage of PCC_PROJECT_STAGES) {
    it(`maps "${stage}" to "${expectedLabels[stage]}"`, () => {
      expect(formatProjectStage(stage)).toBe(expectedLabels[stage]);
    });
  }
});

describe('deriveShellHeroViewModel', () => {
  it('derives the locked hero contract from SAMPLE_PROJECT_PROFILE on project-home', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'project-home');
    expect(vm.primaryTitle).toBe('Project Control Center');
    expect(vm.secondaryTitle).toBe('Project Home');
    expect(vm.surfaceDescription).toBe(PCC_SURFACE_HERO_DESCRIPTIONS['project-home']);
    expect(vm.projectName).toBe(SAMPLE_PROJECT_PROFILE.projectName);
    expect(vm.location).toBe(SAMPLE_PROJECT_PROFILE.projectLocation);
    expect(vm.clientDisplay).toBe(SAMPLE_PROJECT_PROFILE.clientName);
    expect(vm.estimatedValueDisplay).toBe('$25,000,000');
    expect(vm.scheduledCompletionDisplay).toBe('Sep 30, 2027');
    expect(vm.projectStageLabel).toBe('Active Construction');
  });

  // Phase 05 wave-b10 Prompt 06 — `clientDisplay` is profile-derived
  // and global, not primary-tab-aware.
  it('derives clientDisplay identically across every primary tab (proves global, not primary-tab-scoped)', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId);
      expect(vm.clientDisplay).toBe(SAMPLE_PROJECT_PROFILE.clientName);
    }
  });

  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`uses the local hero-copy description for ${tabId}`, () => {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId);
      expect(vm.surfaceDescription).toBe(PCC_SURFACE_HERO_DESCRIPTIONS[tabId]);
    });
  }

  it('secondaryTitle equals the registry primary-tab label for every primary tab', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId);
      expect(vm.secondaryTitle).toBe(getPrimaryNavigationTab(tabId).label);
    }
  });

  it('renders "Not listed" when optional profile fields are absent', () => {
    const sparse: IProjectProfile = {
      ...SAMPLE_PROJECT_PROFILE,
      projectLocation: undefined,
      clientName: undefined,
      estimatedValue: undefined,
      scheduledCompletionDate: undefined,
    };
    const vm = deriveShellHeroViewModel(sparse, 'project-home');
    expect(vm.location).toBe('Not listed');
    expect(vm.clientDisplay).toBe('Not listed');
    expect(vm.estimatedValueDisplay).toBe('Not listed');
    expect(vm.scheduledCompletionDisplay).toBe('Not listed');
  });

  it('invalid input passed through an unsafe cast normalizes to project-home', () => {
    const vm = deriveShellHeroViewModel(
      SAMPLE_PROJECT_PROFILE,
      'not-a-tab' as unknown as PccPrimaryTabId,
    );
    expect(vm.secondaryTitle).toBe('Project Home');
  });
});

describe('deriveShellHeroViewModel — Phase 05 wave-b10 Prompt 06 surface header metadata', () => {
  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`exposes non-empty surfaceSummaryItems / surfaceCues / readOnlyCue / heroHighlights / governanceMicrocopy for "${tabId}"`, () => {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId);
      expect(vm.surfaceSummaryItems.length).toBeGreaterThan(0);
      expect(vm.surfaceCues.length).toBeGreaterThan(0);
      expect(vm.readOnlyCue.trim().length).toBeGreaterThan(0);
      expect(vm.heroHighlights.length).toBeGreaterThan(0);
      expect(vm.governanceMicrocopy.length).toBeGreaterThan(0);

      for (const item of vm.surfaceSummaryItems) {
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.value.length).toBeGreaterThan(0);
      }
      for (const cue of vm.surfaceCues) {
        expect(cue.id.length).toBeGreaterThan(0);
        expect(cue.label.length).toBeGreaterThan(0);
        expect(cue.value.length).toBeGreaterThan(0);
      }
      for (const highlight of vm.heroHighlights) {
        expect(highlight.id.length).toBeGreaterThan(0);
        expect(highlight.label.length).toBeGreaterThan(0);
        expect(highlight.value.length).toBeGreaterThan(0);
      }
      for (const microcopy of vm.governanceMicrocopy) {
        expect(microcopy.id.length).toBeGreaterThan(0);
        expect(microcopy.text.trim().length).toBeGreaterThan(0);
      }
    });
  }

  it('mirrors the canonical PCC_SHELL_SURFACE_HEADER_METADATA entries by reference', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, tabId);
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      expect(vm.surfaceSummaryItems).toBe(metadata.surfaceSummaryItems);
      expect(vm.surfaceCues).toBe(metadata.surfaceCues);
      expect(vm.readOnlyCue).toBe(metadata.readOnlyCue);
      expect(vm.heroHighlights).toBe(metadata.heroHighlights);
      expect(vm.governanceMicrocopy).toBe(metadata.governanceMicrocopy);
    }
  });

  it('Project Home metadata locks command-preview / advisory / hbi-boundary copy', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'project-home');
    const mode = vm.surfaceSummaryItems.find((item) => item.id === 'mode');
    const authority = vm.surfaceSummaryItems.find((item) => item.id === 'authority');
    const hbiBoundary = vm.surfaceCues.find((cue) => cue.id === 'hbi-boundary');
    expect(mode?.value).toBe('Command preview');
    expect(authority?.value).toBe('Advisory only');
    expect(hbiBoundary?.value).toBe('Grounded preview, no writeback');
    expect(vm.readOnlyCue).toContain('no decisions');
    expect(vm.readOnlyCue).toContain('approvals');
    expect(vm.readOnlyCue).toContain('writeback');
  });

  it('Core Tools metadata communicates HBI advisory + no-decision + no-approval-authority + no-writeback', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'core-tools');
    const cue = vm.readOnlyCue.toLowerCase();
    expect(cue).toContain('advisory');
    expect(cue).toContain('decision');
    expect(cue).toContain('approval');
    // The PCC core-tools posture is "no write back" (separated form).
    // Match both 'writeback' and 'write back' so the assertion holds
    // across either canonical phrasing.
    expect(cue).toMatch(/(writeback|write back)/);
    const hbiNoAuthority = vm.governanceMicrocopy.find((m) => m.id === 'hbi-no-authority');
    expect(hbiNoAuthority?.text).toBeDefined();
    expect(hbiNoAuthority!.text.toLowerCase()).toContain('advisory');
    expect(hbiNoAuthority!.text.toLowerCase()).toContain('decision');
    expect(hbiNoAuthority!.text.toLowerCase()).toContain('approval');
    expect(hbiNoAuthority!.text.toLowerCase()).toMatch(/(writeback|write back)/);
  });

  it('Documents metadata uses Document Control language (not the bare "Documents" label)', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'documents');
    const mode = vm.surfaceSummaryItems.find((item) => item.id === 'mode');
    expect(mode?.value).toBe('Document Control preview');
    expect(vm.surfaceDescription).toContain('Document Control');
  });

  it('Cost & Time metadata includes the Sage book-of-record posture', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'cost-time');
    expect(vm.readOnlyCue).toContain('Sage remains the accounting book of record');
    const sageBoundary = vm.surfaceCues.find((cue) => cue.id === 'sage-book-of-record');
    expect(sageBoundary?.value).toContain('Sage');
    const sageMicrocopy = vm.governanceMicrocopy.find((m) => m.id === 'sage-no-writeback');
    expect(sageMicrocopy?.text).toContain('Sage');
    expect(sageMicrocopy!.text).toContain('does not write back');
  });

  it('does not leak forbidden DOM-marker strings into metadata copy', () => {
    const serialized = JSON.stringify(PCC_SHELL_SURFACE_HEADER_METADATA);
    expect(serialized).not.toContain('data-pcc-source-confidence');
    expect(serialized).not.toContain('data-pcc-pill');
    expect(serialized).not.toContain('data-pcc-hero-pill');
  });

  it('no metadata copy contains forbidden developer-facing terms', () => {
    // Note: 'fixture' and 'mock' are intentionally NOT in this list
    // because the carried-forward Project Home metadata uses
    // "Fixture / read-model preview" as the visible product Source
    // label — that posture statement is intentional and distinct from
    // a developer-only scaffold artifact.
    const FORBIDDEN_TERMS = [
      'todo',
      'tbd',
      'placeholder',
      'stub',
      'debug',
      'dev-only',
      'not implemented',
      'lorem',
      'developer',
      'code agent',
      'prompt',
      'repo',
      'test selector',
      'internal only',
    ];
    const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Concatenate every visible value (label and value strings) plus
    // governance microcopy text and readOnlyCue. JSON.stringify includes
    // 'fixture'-shaped tokens like `"surfaceSummaryItems"` (none of the
    // forbidden terms are field-name substrings, so a serialized scan is
    // safe), but to be conservative we scan only the visible value
    // surface. The descriptions map is also scanned.
    const visibleStrings: string[] = [];
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const m = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      visibleStrings.push(m.readOnlyCue);
      for (const item of m.surfaceSummaryItems) {
        visibleStrings.push(item.label, item.value);
      }
      for (const cue of m.surfaceCues) {
        visibleStrings.push(cue.label, cue.value);
      }
      for (const h of m.heroHighlights) {
        visibleStrings.push(h.label, h.value);
      }
      for (const m2 of m.governanceMicrocopy) {
        visibleStrings.push(m2.text);
      }
      visibleStrings.push(PCC_SURFACE_HERO_DESCRIPTIONS[tabId]);
    }
    const haystack = visibleStrings.join(' ').toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
      expect(re.test(haystack), `forbidden term '${term}' must not appear in hero copy`).toBe(
        false,
      );
    }
  });
});

describe('PCC_SHELL_SURFACE_HEADER_METADATA — Phase 05 wave-b10 Prompt 06 contract floor', () => {
  const AFFIRMATIVE_ACTION_LABELS = [
    'Approve',
    'Reject',
    'Upload',
    'Delete',
    'Sync',
    'Launch',
  ] as const;

  it.each([...PCC_PRIMARY_TAB_IDS])(
    '"%s" carries at least three summary items and two cues with non-empty fields',
    (tabId) => {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      expect(metadata.surfaceSummaryItems.length).toBeGreaterThanOrEqual(3);
      expect(metadata.surfaceCues.length).toBeGreaterThanOrEqual(2);
      expect(metadata.readOnlyCue.trim().length).toBeGreaterThan(0);
      for (const item of metadata.surfaceSummaryItems) {
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.value.length).toBeGreaterThan(0);
      }
      for (const cue of metadata.surfaceCues) {
        expect(cue.id.length).toBeGreaterThan(0);
        expect(cue.label.length).toBeGreaterThan(0);
        expect(cue.value.length).toBeGreaterThan(0);
      }
    },
  );

  it('every entry covers exactly the canonical Phase 05 primary-tab tuple', () => {
    expect(Object.keys(PCC_SHELL_SURFACE_HEADER_METADATA).sort()).toEqual(
      [...PCC_PRIMARY_TAB_IDS].sort(),
    );
  });

  it('PCC_SURFACE_HERO_DESCRIPTIONS covers exactly the canonical Phase 05 primary-tab tuple', () => {
    expect(Object.keys(PCC_SURFACE_HERO_DESCRIPTIONS).sort()).toEqual(
      [...PCC_PRIMARY_TAB_IDS].sort(),
    );
  });

  it('every primary tab has at least three hero highlights', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      expect(
        metadata.heroHighlights.length,
        `primary tab '${tabId}' must define at least three hero highlights`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('every primary tab has at least two governance microcopy items', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      expect(
        metadata.governanceMicrocopy.length,
        `primary tab '${tabId}' must define at least two governance microcopy items`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('no metadata value contains a live URL', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      for (const item of metadata.surfaceSummaryItems) {
        expect(
          item.value,
          `summary item "${item.id}" on "${tabId}" must not contain a live URL`,
        ).not.toMatch(/https?:\/\//i);
      }
      for (const cue of metadata.surfaceCues) {
        expect(cue.value, `cue "${cue.id}" on "${tabId}" must not contain a live URL`).not.toMatch(
          /https?:\/\//i,
        );
      }
      expect(
        metadata.readOnlyCue,
        `readOnlyCue on "${tabId}" must not contain a live URL`,
      ).not.toMatch(/https?:\/\//i);
    }
  });

  it('no metadata label is an affirmative-action verb', () => {
    const affirmativeSet = new Set<string>(AFFIRMATIVE_ACTION_LABELS);
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      for (const item of metadata.surfaceSummaryItems) {
        expect(
          affirmativeSet.has(item.label),
          `summary item "${item.id}" on "${tabId}" must not use affirmative-action label "${item.label}"`,
        ).toBe(false);
      }
      for (const cue of metadata.surfaceCues) {
        expect(
          affirmativeSet.has(cue.label),
          `cue "${cue.id}" on "${tabId}" must not use affirmative-action label "${cue.label}"`,
        ).toBe(false);
      }
      for (const highlight of metadata.heroHighlights) {
        expect(
          affirmativeSet.has(highlight.label),
          `heroHighlight "${highlight.id}" on "${tabId}" must not use affirmative-action label "${highlight.label}"`,
        ).toBe(false);
      }
    }
  });

  it('keeps cue and summary-item ids unique per primary tab', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      const cueIds = metadata.surfaceCues.map((c) => c.id);
      const summaryIds = metadata.surfaceSummaryItems.map((s) => s.id);
      expect(
        new Set(cueIds).size,
        `cue ids on "${tabId}" must be unique (got [${cueIds.join(', ')}])`,
      ).toBe(cueIds.length);
      expect(
        new Set(summaryIds).size,
        `summary item ids on "${tabId}" must be unique (got [${summaryIds.join(', ')}])`,
      ).toBe(summaryIds.length);
    }
  });

  it('every primary tab defines unique heroHighlight + governanceMicrocopy ids with non-empty fields', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];
      const highlightIds = metadata.heroHighlights.map((h) => h.id);
      expect(
        new Set(highlightIds).size,
        `heroHighlight ids on "${tabId}" must be unique (got [${highlightIds.join(', ')}])`,
      ).toBe(highlightIds.length);

      const microcopyIds = metadata.governanceMicrocopy.map((m) => m.id);
      expect(
        new Set(microcopyIds).size,
        `governanceMicrocopy ids on "${tabId}" must be unique (got [${microcopyIds.join(', ')}])`,
      ).toBe(microcopyIds.length);

      for (const highlight of metadata.heroHighlights) {
        expect(highlight.id.length).toBeGreaterThan(0);
        expect(highlight.label.length).toBeGreaterThan(0);
        expect(highlight.value.length).toBeGreaterThan(0);
      }
      for (const microcopy of metadata.governanceMicrocopy) {
        expect(microcopy.id.length).toBeGreaterThan(0);
        expect(microcopy.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('Project Home heroHighlights cover priority-actions / approvals / setup-gaps and microcopy includes a Read-only preview reminder', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['project-home'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('priority-actions');
    expect(highlightIds).toContain('approvals');
    expect(highlightIds).toContain('setup-gaps');
    const microcopyTexts = metadata.governanceMicrocopy.map((m) => m.text);
    expect(microcopyTexts.some((t) => t === 'Read-only preview')).toBe(true);
  });

  it('Core Tools heroHighlights cover hbi-assistant / team-access / approvals-checkpoints', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['core-tools'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('hbi-assistant');
    expect(highlightIds).toContain('team-access');
    expect(highlightIds).toContain('approvals-checkpoints');
  });

  it('Startup & Closeout heroHighlights cover startup-center / responsibility-matrix / closeout-warranty', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['startup-closeout'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('startup-center');
    expect(highlightIds).toContain('responsibility-matrix');
    expect(highlightIds).toContain('closeout-warranty');
  });

  it('Cost & Time heroHighlights cover financial-review / schedule-monitor / procurement-buyout', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['cost-time'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('financial-review');
    expect(highlightIds).toContain('schedule-monitor');
    expect(highlightIds).toContain('procurement-buyout');
  });

  it('Documents heroHighlights cover document-sources / record-source / open-items', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['documents'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('document-sources');
    expect(highlightIds).toContain('record-source');
    expect(highlightIds).toContain('open-items');
  });
});
