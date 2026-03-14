import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { diagnosePermissionModel } from './diagnose-permissions.js';

describe('diagnosePermissionModel', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to sites-selected when env var is not set', () => {
    delete process.env.SITES_PERMISSION_MODEL;
    const result = diagnosePermissionModel();
    expect(result.model).toBe('sites-selected');
    expect(result.groupReadWriteExpected).toBe(true);
    expect(result.summary).toContain('Path A');
  });

  it('returns sites-selected when SITES_PERMISSION_MODEL=sites-selected', () => {
    process.env.SITES_PERMISSION_MODEL = 'sites-selected';
    const result = diagnosePermissionModel();
    expect(result.model).toBe('sites-selected');
    expect(result.summary).toContain('Sites.Selected');
  });

  it('returns fullcontrol when SITES_PERMISSION_MODEL=fullcontrol', () => {
    process.env.SITES_PERMISSION_MODEL = 'fullcontrol';
    const result = diagnosePermissionModel();
    expect(result.model).toBe('fullcontrol');
    expect(result.groupReadWriteExpected).toBe(true);
    expect(result.summary).toContain('Path B');
  });

  it('defaults to sites-selected for unrecognized value', () => {
    process.env.SITES_PERMISSION_MODEL = 'something-invalid';
    const result = diagnosePermissionModel();
    expect(result.model).toBe('sites-selected');
  });

  it('is case insensitive', () => {
    process.env.SITES_PERMISSION_MODEL = 'FullControl';
    const result = diagnosePermissionModel();
    expect(result.model).toBe('fullcontrol');
  });

  it('trims whitespace', () => {
    process.env.SITES_PERMISSION_MODEL = '  fullcontrol  ';
    const result = diagnosePermissionModel();
    expect(result.model).toBe('fullcontrol');
  });
});
