import { describe, expect, it } from 'vitest';
import {
  defaultHeroCategoryLabel,
  defaultTeamHeading,
  intelligentDefaultsForSave,
  resolveProjectChangeDefaults,
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

describe('resolveProjectChangeDefaults', () => {
  it('fills both fields when binding a project onto a blank draft', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: undefined,
      nextProjectName: 'Riverside Tower',
      current: { TeamViewerTitle: '', HeroCategoryLabel: undefined },
    });
    expect(result.TeamViewerTitle).toBe('The Team at Riverside Tower');
    expect(result.HeroCategoryLabel).toBe('Riverside Tower');
    expect([...result.applied].sort()).toEqual(['HeroCategoryLabel', 'TeamViewerTitle']);
  });

  it('refreshes a stale Team Viewer heading that matches the previous project default', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: 'Alpha',
      nextProjectName: 'Bravo',
      current: {
        TeamViewerTitle: 'The Team at Alpha',
        HeroCategoryLabel: 'Alpha',
      },
    });
    expect(result.TeamViewerTitle).toBe('The Team at Bravo');
    expect(result.HeroCategoryLabel).toBe('Bravo');
    expect([...result.applied].sort()).toEqual(['HeroCategoryLabel', 'TeamViewerTitle']);
  });

  it('preserves author-typed values even when the project changes', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: 'Alpha',
      nextProjectName: 'Bravo',
      current: {
        TeamViewerTitle: 'Meet the people who built it',
        HeroCategoryLabel: 'Field Story',
      },
    });
    expect(result.TeamViewerTitle).toBe('Meet the people who built it');
    expect(result.HeroCategoryLabel).toBe('Field Story');
    expect(result.applied).toEqual([]);
  });

  it('fills blanks even when the previous project had a default (first time author picks any project)', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: undefined,
      nextProjectName: 'Bravo',
      current: { TeamViewerTitle: '', HeroCategoryLabel: '' },
    });
    expect(result.TeamViewerTitle).toBe('The Team at Bravo');
    expect(result.HeroCategoryLabel).toBe('Bravo');
  });

  it('collapses stale defaults when the author clears the bound project', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: 'Alpha',
      nextProjectName: null,
      current: {
        TeamViewerTitle: 'The Team at Alpha',
        HeroCategoryLabel: 'Alpha',
      },
    });
    expect(result.TeamViewerTitle).toBe('The Team');
    expect(result.HeroCategoryLabel).toBeUndefined();
    expect([...result.applied].sort()).toEqual(['HeroCategoryLabel', 'TeamViewerTitle']);
  });

  it('does not reintroduce a hero category when no project is bound and the field is already blank', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: undefined,
      nextProjectName: null,
      current: { TeamViewerTitle: '', HeroCategoryLabel: undefined },
    });
    expect(result.HeroCategoryLabel).toBeUndefined();
    expect(result.applied).not.toContain('HeroCategoryLabel');
  });

  it('preserves an author-typed value when the project is cleared', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: 'Alpha',
      nextProjectName: null,
      current: {
        TeamViewerTitle: 'The Dream Team',
        HeroCategoryLabel: 'Infrastructure',
      },
    });
    expect(result.TeamViewerTitle).toBe('The Dream Team');
    expect(result.HeroCategoryLabel).toBe('Infrastructure');
    expect(result.applied).toEqual([]);
  });

  it('treats whitespace-only field values as blank and fills them', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: undefined,
      nextProjectName: 'Bravo',
      current: { TeamViewerTitle: '   ', HeroCategoryLabel: '  ' },
    });
    expect(result.TeamViewerTitle).toBe('The Team at Bravo');
    expect(result.HeroCategoryLabel).toBe('Bravo');
  });

  it('does not treat a value equal to the new default as a change', () => {
    const result = resolveProjectChangeDefaults({
      previousProjectName: 'Alpha',
      nextProjectName: 'Alpha',
      current: {
        TeamViewerTitle: 'The Team at Alpha',
        HeroCategoryLabel: 'Alpha',
      },
    });
    expect(result.TeamViewerTitle).toBe('The Team at Alpha');
    expect(result.HeroCategoryLabel).toBe('Alpha');
    expect(result.applied).toEqual([]);
  });
});
