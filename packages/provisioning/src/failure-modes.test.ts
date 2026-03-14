import { describe, expect, it } from 'vitest';

import {
  PROJECT_SETUP_FAILURE_MODES,
  getFailureMode,
} from './failure-modes.js';

describe('PROJECT_SETUP_FAILURE_MODES', () => {
  it('contains exactly 10 failure modes', () => {
    expect(PROJECT_SETUP_FAILURE_MODES).toHaveLength(10);
  });

  it('every FM has a unique fmId', () => {
    const ids = PROJECT_SETUP_FAILURE_MODES.map((fm) => fm.fmId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every fmId matches the FM-## format', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.fmId).toMatch(/^FM-\d{2}$/);
    }
  });

  it('every FM has non-empty scenario and expectedDegradation', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.scenario.length).toBeGreaterThan(0);
      expect(fm.expectedDegradation.length).toBeGreaterThan(0);
    }
  });

  it('every FM has at least one affected package', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.affectedPackages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every FM has a non-empty title', () => {
    for (const fm of PROJECT_SETUP_FAILURE_MODES) {
      expect(fm.title.length).toBeGreaterThan(0);
    }
  });
});

describe('getFailureMode', () => {
  it('returns the correct FM by ID', () => {
    const fm = getFailureMode('FM-01');
    expect(fm).toBeDefined();
    expect(fm!.title).toBe('IndexedDB Unavailable');
  });

  it('returns undefined for nonexistent ID', () => {
    expect(getFailureMode('FM-99')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getFailureMode('')).toBeUndefined();
  });
});
