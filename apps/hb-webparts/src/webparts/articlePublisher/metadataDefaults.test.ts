import { describe, expect, it } from 'vitest';
import {
  defaultHeroCategoryLabel,
  defaultTeamHeading,
  intelligentDefaultsForSave,
} from './metadataDefaults';

describe('defaultTeamHeading', () => {
  it('uses the project name when a project is bound', () => {
    expect(defaultTeamHeading('Riverside Tower')).toBe('The Team at Riverside Tower');
  });

  it('falls back to a project-less heading when no project is set', () => {
    expect(defaultTeamHeading(undefined)).toBe('The Team');
    expect(defaultTeamHeading(null)).toBe('The Team');
    expect(defaultTeamHeading('')).toBe('The Team');
    expect(defaultTeamHeading('   ')).toBe('The Team');
  });

  it('trims surrounding whitespace from the project name', () => {
    expect(defaultTeamHeading('  Riverside Tower  ')).toBe('The Team at Riverside Tower');
  });
});

describe('defaultHeroCategoryLabel', () => {
  it('returns the trimmed project name when set', () => {
    expect(defaultHeroCategoryLabel('Riverside Tower')).toBe('Riverside Tower');
    expect(defaultHeroCategoryLabel('  Riverside Tower  ')).toBe('Riverside Tower');
  });

  it('returns undefined when no project name is bound', () => {
    expect(defaultHeroCategoryLabel(undefined)).toBeUndefined();
    expect(defaultHeroCategoryLabel(null)).toBeUndefined();
    expect(defaultHeroCategoryLabel('')).toBeUndefined();
    expect(defaultHeroCategoryLabel('   ')).toBeUndefined();
  });
});

describe('intelligentDefaultsForSave', () => {
  it('fills both defaults when both fields are empty and a project is bound', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: 'Riverside Tower',
      TeamViewerTitle: '',
      HeroCategoryLabel: undefined,
    });
    expect(result.draft.TeamViewerTitle).toBe('The Team at Riverside Tower');
    expect(result.draft.HeroCategoryLabel).toBe('Riverside Tower');
    expect([...result.applied].sort()).toEqual(['HeroCategoryLabel', 'TeamViewerTitle']);
  });

  it('preserves an author-typed Team Viewer heading', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: 'Riverside Tower',
      TeamViewerTitle: 'Meet the People Behind It',
      HeroCategoryLabel: undefined,
    });
    expect(result.draft.TeamViewerTitle).toBe('Meet the People Behind It');
    expect(result.applied).not.toContain('TeamViewerTitle');
  });

  it('preserves an author-typed hero category label', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: 'Riverside Tower',
      TeamViewerTitle: '',
      HeroCategoryLabel: 'Field Story',
    });
    expect(result.draft.HeroCategoryLabel).toBe('Field Story');
    expect(result.applied).not.toContain('HeroCategoryLabel');
  });

  it('still fills the Team Viewer heading when no project is bound', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: undefined,
      TeamViewerTitle: '',
    });
    expect(result.draft.TeamViewerTitle).toBe('The Team');
    expect(result.applied).toContain('TeamViewerTitle');
  });

  it('does not introduce a hero category label when no project is bound', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: undefined,
      TeamViewerTitle: 'Custom heading',
      HeroCategoryLabel: undefined,
    });
    expect(result.draft.HeroCategoryLabel).toBeUndefined();
    expect(result.applied).not.toContain('HeroCategoryLabel');
  });

  it('treats whitespace-only values as empty', () => {
    const result = intelligentDefaultsForSave({
      Title: 'Spotlight',
      ProjectName: 'Riverside Tower',
      TeamViewerTitle: '   ',
      HeroCategoryLabel: '   ',
    });
    expect(result.draft.TeamViewerTitle).toBe('The Team at Riverside Tower');
    expect(result.draft.HeroCategoryLabel).toBe('Riverside Tower');
  });
});
