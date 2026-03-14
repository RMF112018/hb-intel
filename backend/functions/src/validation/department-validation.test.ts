import { describe, it, expect } from 'vitest';
import { DEPARTMENT_LIBRARIES, DEPARTMENT_FOLDER_TREES } from '../config/core-libraries.js';
import { validateDepartmentConfig } from './department-validation.js';

describe('W0-G2-T08: Department validation helpers', () => {
  it('validates actual department config without errors', () => {
    const results = validateDepartmentConfig(DEPARTMENT_LIBRARIES, DEPARTMENT_FOLDER_TREES);
    for (const r of results) {
      expect(r.passed, `${r.message}`).toBe(true);
    }
  });

  it('config keys match (2 departments)', () => {
    const results = validateDepartmentConfig(DEPARTMENT_LIBRARIES, DEPARTMENT_FOLDER_TREES);
    const keyResult = results.find((r) => r.rule === 'department-key-alignment');
    expect(keyResult).toBeDefined();
    expect(keyResult!.passed).toBe(true);
    expect(keyResult!.details?.libraryKeys).toHaveLength(2);
  });

  it('library names match between libraries and trees', () => {
    for (const dept of Object.keys(DEPARTMENT_LIBRARIES)) {
      const tree = DEPARTMENT_FOLDER_TREES[dept];
      const libNames = DEPARTMENT_LIBRARIES[dept].map((l) => l.name);
      expect(libNames).toContain(tree.libraryName);
    }
  });

  it('commercial has 34 folders', () => {
    expect(DEPARTMENT_FOLDER_TREES.commercial.folders).toHaveLength(34);
  });

  it('luxury-residential has 37 folders', () => {
    expect(DEPARTMENT_FOLDER_TREES['luxury-residential'].folders).toHaveLength(37);
  });

  it('detects key mismatch', () => {
    const results = validateDepartmentConfig(
      { commercial: DEPARTMENT_LIBRARIES.commercial },
      DEPARTMENT_FOLDER_TREES
    );
    const keyResult = results.find((r) => r.rule === 'department-key-alignment');
    expect(keyResult!.passed).toBe(false);
  });
});
