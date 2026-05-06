import { describe, expect, it } from 'vitest';
import {
  PCC_MVP_SURFACE_IDS,
  PCC_PROJECT_STAGES,
  SAMPLE_PROJECT_PROFILE,
  type IProjectProfile,
  type PccProjectStage,
} from '@hbc/models/pcc';
import { PCC_SURFACE_HERO_DESCRIPTIONS } from '../shell/surfaceHeroCopy';
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
