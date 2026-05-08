import { describe, expect, it } from 'vitest';
import {
  PCC_MVP_SURFACE_IDS,
  PCC_PROJECT_STAGES,
  SAMPLE_PROJECT_PROFILE,
  type IProjectProfile,
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
    // Boundary case: ISO day 01 should not regress to the previous month.
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
  // Iterate the canonical PccProjectStage tuple from @hbc/models so any new
  // member added in @hbc/models forces a label-map update via TypeScript.
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
    expect(vm.estimatedValueDisplay).toBe('$25,000,000');
    expect(vm.scheduledCompletionDisplay).toBe('Sep 30, 2027');
    expect(vm.projectStageLabel).toBe('Active Construction');
  });

  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`uses the local hero-copy description for ${surfaceId} (never PCC_MVP_SURFACES.description)`, () => {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
      expect(vm.surfaceDescription).toBe(PCC_SURFACE_HERO_DESCRIPTIONS[surfaceId]);
    });
  }

  it('renders "Not listed" when optional profile fields are absent', () => {
    const sparse: IProjectProfile = {
      ...SAMPLE_PROJECT_PROFILE,
      projectLocation: undefined,
      estimatedValue: undefined,
      scheduledCompletionDate: undefined,
    };
    const vm = deriveShellHeroViewModel(sparse, 'project-home');
    expect(vm.location).toBe('Not listed');
    expect(vm.estimatedValueDisplay).toBe('Not listed');
    expect(vm.scheduledCompletionDisplay).toBe('Not listed');
  });
});

describe('deriveShellHeroViewModel — wave-b7 Prompt 02 surface header metadata', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`exposes non-empty surfaceSummaryItems / surfaceCues / readOnlyCue for "${surfaceId}"`, () => {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
      expect(vm.surfaceSummaryItems.length).toBeGreaterThan(0);
      expect(vm.surfaceCues.length).toBeGreaterThan(0);
      expect(vm.readOnlyCue.trim().length).toBeGreaterThan(0);

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
    });
  }

  it('mirrors the canonical PCC_SHELL_SURFACE_HEADER_METADATA entries by reference', () => {
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
      expect(vm.surfaceSummaryItems).toBe(metadata.surfaceSummaryItems);
      expect(vm.surfaceCues).toBe(metadata.surfaceCues);
      expect(vm.readOnlyCue).toBe(metadata.readOnlyCue);
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

  it('Approvals metadata locks no-approval-authority and explicit-governed-action copy', () => {
    const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, 'approvals');
    const authority = vm.surfaceSummaryItems.find((item) => item.id === 'authority');
    const approvalBoundary = vm.surfaceCues.find((cue) => cue.id === 'approval-boundary');
    expect(authority?.value).toBe('No approval authority');
    expect(approvalBoundary).toBeDefined();
    expect(vm.readOnlyCue).toContain('approvals require explicit governed action');
  });

  it('does not leak forbidden DOM-marker strings into metadata copy', () => {
    // Structural guard only — keeps `data-pcc-source-confidence` and
    // `data-pcc-pill*` marker tokens out of the copy. Word blocklists
    // (e.g. "writeback authority", "source of truth") are intentionally
    // omitted: per-surface readOnlyCue copy legitimately describes the
    // *absence* of writeback authority and asserting against the bare
    // phrase produces false positives on negating copy
    // (feedback_word_blocklists_break_on_corrected_copy).
    const serialized = JSON.stringify(PCC_SHELL_SURFACE_HEADER_METADATA);
    expect(serialized).not.toContain('data-pcc-source-confidence');
    expect(serialized).not.toContain('data-pcc-pill');
    expect(serialized).not.toContain('data-pcc-hero-pill');
  });
});

describe('PCC_SHELL_SURFACE_HEADER_METADATA — wave-b7 Prompt 03 contract floor', () => {
  // Affirmative-action verbs that must never appear AS A LABEL on a
  // summary item or cue. We assert label *equality*, not substring on
  // values, because per-surface readOnlyCue / cue value copy
  // legitimately mentions these verbs in negating phrases (e.g.
  // "No approve / reject action from this header"). Memory:
  // feedback_word_blocklists_break_on_corrected_copy.
  const AFFIRMATIVE_ACTION_LABELS = [
    'Approve',
    'Reject',
    'Upload',
    'Delete',
    'Sync',
    'Launch',
  ] as const;

  it.each([...PCC_MVP_SURFACE_IDS])(
    '"%s" carries at least three summary items and two cues with non-empty fields',
    (surfaceId) => {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
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

  it('every entry covers exactly the canonical surface tuple', () => {
    expect(Object.keys(PCC_SHELL_SURFACE_HEADER_METADATA).sort()).toEqual(
      [...PCC_MVP_SURFACE_IDS].sort(),
    );
  });

  it('no metadata value contains a live URL', () => {
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
      for (const item of metadata.surfaceSummaryItems) {
        expect(
          item.value,
          `summary item "${item.id}" on "${surfaceId}" must not contain a live URL`,
        ).not.toMatch(/https?:\/\//i);
      }
      for (const cue of metadata.surfaceCues) {
        expect(
          cue.value,
          `cue "${cue.id}" on "${surfaceId}" must not contain a live URL`,
        ).not.toMatch(/https?:\/\//i);
      }
      expect(
        metadata.readOnlyCue,
        `readOnlyCue on "${surfaceId}" must not contain a live URL`,
      ).not.toMatch(/https?:\/\//i);
    }
  });

  it('no metadata label is an affirmative-action verb', () => {
    const affirmativeSet = new Set<string>(AFFIRMATIVE_ACTION_LABELS);
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
      for (const item of metadata.surfaceSummaryItems) {
        expect(
          affirmativeSet.has(item.label),
          `summary item "${item.id}" on "${surfaceId}" must not use affirmative-action label "${item.label}"`,
        ).toBe(false);
      }
      for (const cue of metadata.surfaceCues) {
        expect(
          affirmativeSet.has(cue.label),
          `cue "${cue.id}" on "${surfaceId}" must not use affirmative-action label "${cue.label}"`,
        ).toBe(false);
      }
    }
  });
});
