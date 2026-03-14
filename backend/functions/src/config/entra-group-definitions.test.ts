import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ENTRA_GROUP_DEFINITIONS,
  buildGroupDisplayName,
  buildGroupDescription,
  getDepartmentBackgroundViewers,
} from './entra-group-definitions.js';

describe('ENTRA_GROUP_DEFINITIONS', () => {
  it('has exactly 3 entries', () => {
    expect(ENTRA_GROUP_DEFINITIONS).toHaveLength(3);
  });

  it('Leaders entry has correct roleSuffix, permissionLevel, and template', () => {
    const leaders = ENTRA_GROUP_DEFINITIONS[0];
    expect(leaders.roleSuffix).toBe('Leaders');
    expect(leaders.sharePointPermissionLevel).toBe('Full Control');
    expect(leaders.descriptionTemplate).toContain('{projectNumber}');
    expect(leaders.descriptionTemplate).toContain('{projectName}');
  });

  it('Team entry has correct roleSuffix and Contribute permissionLevel', () => {
    const team = ENTRA_GROUP_DEFINITIONS[1];
    expect(team.roleSuffix).toBe('Team');
    expect(team.sharePointPermissionLevel).toBe('Contribute');
    expect(team.descriptionTemplate).toContain('{projectNumber}');
  });

  it('Viewers entry has correct roleSuffix and Read permissionLevel', () => {
    const viewers = ENTRA_GROUP_DEFINITIONS[2];
    expect(viewers.roleSuffix).toBe('Viewers');
    expect(viewers.sharePointPermissionLevel).toBe('Read');
    expect(viewers.descriptionTemplate).toContain('{projectNumber}');
  });
});

describe('buildGroupDisplayName', () => {
  it('returns correct format HB-{projectNumber}-{roleSuffix}', () => {
    expect(buildGroupDisplayName('25-001-01', 'Leaders')).toBe('HB-25-001-01-Leaders');
  });

  it('handles empty project number', () => {
    expect(buildGroupDisplayName('', 'Team')).toBe('HB--Team');
  });

  it('handles empty role suffix', () => {
    expect(buildGroupDisplayName('25-001-01', '')).toBe('HB-25-001-01-');
  });
});

describe('buildGroupDescription', () => {
  it('interpolates {projectNumber} and {projectName} placeholders', () => {
    const template = 'Project leaders for {projectNumber} — {projectName}. Full Control on project site.';
    const result = buildGroupDescription(template, '25-001-01', 'Test Project');
    expect(result).toBe('Project leaders for 25-001-01 — Test Project. Full Control on project site.');
  });

  it('handles multiple occurrences of the same placeholder', () => {
    const template = '{projectNumber} and {projectNumber} again';
    const result = buildGroupDescription(template, '99-999', 'Foo');
    expect(result).toBe('99-999 and 99-999 again');
  });

  it('returns template unchanged when no placeholders present', () => {
    expect(buildGroupDescription('no placeholders', '25-001-01', 'Test')).toBe('no placeholders');
  });
});

describe('getDepartmentBackgroundViewers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns empty array when department is undefined', () => {
    expect(getDepartmentBackgroundViewers(undefined)).toEqual([]);
  });

  it('returns empty array when department is empty string', () => {
    expect(getDepartmentBackgroundViewers('')).toEqual([]);
  });

  it('looks up env var with hyphens converted to underscores', () => {
    process.env.DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL = 'alice@hb.com';
    expect(getDepartmentBackgroundViewers('luxury-residential')).toEqual(['alice@hb.com']);
  });

  it('returns empty array when env var is not set', () => {
    delete process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL;
    expect(getDepartmentBackgroundViewers('commercial')).toEqual([]);
  });

  it('parses comma-separated UPNs', () => {
    process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL = 'a@hb.com,b@hb.com,c@hb.com';
    expect(getDepartmentBackgroundViewers('commercial')).toEqual(['a@hb.com', 'b@hb.com', 'c@hb.com']);
  });

  it('trims whitespace from UPNs', () => {
    process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL = ' a@hb.com , b@hb.com ';
    expect(getDepartmentBackgroundViewers('commercial')).toEqual(['a@hb.com', 'b@hb.com']);
  });

  it('filters empty entries from trailing commas', () => {
    process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL = 'a@hb.com,,b@hb.com,';
    expect(getDepartmentBackgroundViewers('commercial')).toEqual(['a@hb.com', 'b@hb.com']);
  });

  it('uppercases the department name for env key', () => {
    process.env.DEPT_BACKGROUND_ACCESS_ENGINEERING = 'eng@hb.com';
    expect(getDepartmentBackgroundViewers('engineering')).toEqual(['eng@hb.com']);
  });
});
