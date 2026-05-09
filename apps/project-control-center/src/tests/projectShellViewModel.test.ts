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
    expect(vm.clientDisplay).toBe(SAMPLE_PROJECT_PROFILE.clientName);
    expect(vm.estimatedValueDisplay).toBe('$25,000,000');
    expect(vm.scheduledCompletionDisplay).toBe('Sep 30, 2027');
    expect(vm.projectStageLabel).toBe('Active Construction');
  });

  // Wave 15A wave-b9 Prompt 4B-01 — `clientDisplay` is profile-derived
  // and global (the existing facts row already renders globally across
  // PCC surfaces), not surface-aware.
  it('derives clientDisplay identically across every surface (proves global, not surface-scoped)', () => {
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
      expect(vm.clientDisplay).toBe(SAMPLE_PROJECT_PROFILE.clientName);
    }
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
});

describe('deriveShellHeroViewModel — wave-b7 Prompt 02 surface header metadata', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`exposes non-empty surfaceSummaryItems / surfaceCues / readOnlyCue / heroHighlights / governanceMicrocopy for "${surfaceId}"`, () => {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
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
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const vm = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, surfaceId);
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
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
      // Wave 15A wave-b9 Prompt 4B-02 — heroHighlights labels are
      // production-visible end-user labels and must follow the same
      // affirmative-action guard as the legacy metadata fields. The scan
      // applies to LABELS only (per
      // `feedback_word_blocklists_break_on_corrected_copy`); microcopy
      // text and highlight values may legitimately reference governed
      // actions in negating phrases.
      for (const highlight of metadata.heroHighlights) {
        expect(
          affirmativeSet.has(highlight.label),
          `heroHighlight "${highlight.id}" on "${surfaceId}" must not use affirmative-action label "${highlight.label}"`,
        ).toBe(false);
      }
    }
  });

  it('locks project-readiness no-execution cue (wave-b8 Prompt 02)', () => {
    const cue = PCC_SHELL_SURFACE_HEADER_METADATA['project-readiness'].surfaceCues.find(
      (c) => c.id === 'no-execution',
    );
    expect(cue, 'no-execution cue must exist on project-readiness').toBeDefined();
    expect(cue!.label).toBe('Posture');
    expect(cue!.value).toContain('No checklist completion');
    expect(cue!.value).toContain('evidence execution');
    expect(cue!.value).toContain('from this header');
  });

  it('locks external-systems launch-context cue (wave-b8 Prompt 02)', () => {
    const cue = PCC_SHELL_SURFACE_HEADER_METADATA['external-systems'].surfaceCues.find(
      (c) => c.id === 'launch-context',
    );
    expect(cue, 'launch-context cue must exist on external-systems').toBeDefined();
    expect(cue!.label).toBe('Boundary');
    expect(cue!.value).toContain('Launch links open');
    expect(cue!.value).toContain('source system');
    expect(cue!.value).toContain('new tab');
  });

  it('keeps cue and summary-item ids unique per surface', () => {
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
      const cueIds = metadata.surfaceCues.map((c) => c.id);
      const summaryIds = metadata.surfaceSummaryItems.map((s) => s.id);
      expect(
        new Set(cueIds).size,
        `cue ids on "${surfaceId}" must be unique (got [${cueIds.join(', ')}])`,
      ).toBe(cueIds.length);
      expect(
        new Set(summaryIds).size,
        `summary item ids on "${surfaceId}" must be unique (got [${summaryIds.join(', ')}])`,
      ).toBe(summaryIds.length);
    }
  });

  // Wave 15A wave-b9 Prompt 4B-02 — heroHighlights / governanceMicrocopy
  // contract floor. heroHighlights ids and governanceMicrocopy ids must
  // be unique per surface; every entry must have non-empty fields; every
  // surface must define at least one of each.
  it('every surface defines at least one heroHighlight and at least one governanceMicrocopy item with unique ids', () => {
    for (const surfaceId of PCC_MVP_SURFACE_IDS) {
      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[surfaceId];
      expect(
        metadata.heroHighlights.length,
        `surface "${surfaceId}" must define at least one heroHighlight`,
      ).toBeGreaterThan(0);
      expect(
        metadata.governanceMicrocopy.length,
        `surface "${surfaceId}" must define at least one governanceMicrocopy item`,
      ).toBeGreaterThan(0);

      const highlightIds = metadata.heroHighlights.map((h) => h.id);
      expect(
        new Set(highlightIds).size,
        `heroHighlight ids on "${surfaceId}" must be unique (got [${highlightIds.join(', ')}])`,
      ).toBe(highlightIds.length);

      const microcopyIds = metadata.governanceMicrocopy.map((m) => m.id);
      expect(
        new Set(microcopyIds).size,
        `governanceMicrocopy ids on "${surfaceId}" must be unique (got [${microcopyIds.join(', ')}])`,
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

  it('Approvals heroHighlights cover approval-status / routing / escalations and microcopy preserves the governed-workflow reminder', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['approvals'];
    const highlightIds = metadata.heroHighlights.map((h) => h.id);
    expect(highlightIds).toContain('approval-status');
    expect(highlightIds).toContain('routing');
    expect(highlightIds).toContain('escalations');
    const microcopyTexts = metadata.governanceMicrocopy.map((m) => m.text).join(' ');
    expect(microcopyTexts).toContain('governed approval workflows');
  });

  it('Project Readiness governanceMicrocopy preserves the no-checklist-completion source-module reminder (governance posture from prior surfaceCues moved into demoted microcopy)', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['project-readiness'];
    const noChecklistCompletion = metadata.governanceMicrocopy.find(
      (m) => m.id === 'no-checklist-completion',
    );
    expect(noChecklistCompletion, 'no-checklist-completion microcopy must exist').toBeDefined();
    expect(noChecklistCompletion!.text).toContain('Checklist completion');
    expect(noChecklistCompletion!.text).toContain('source module');
  });

  it('External Systems governanceMicrocopy preserves the launch-context source-system-new-tab reminder (governance posture from prior surfaceCues moved into demoted microcopy)', () => {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['external-systems'];
    const launchContextReminder = metadata.governanceMicrocopy.find(
      (m) => m.id === 'launch-context-reminder',
    );
    expect(launchContextReminder, 'launch-context-reminder microcopy must exist').toBeDefined();
    expect(launchContextReminder!.text).toContain('Launch links open');
    expect(launchContextReminder!.text).toContain('source system');
    expect(launchContextReminder!.text).toContain('new tab');
  });
});
