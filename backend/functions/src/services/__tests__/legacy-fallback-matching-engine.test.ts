import { describe, expect, it } from 'vitest';
import { LegacyFallbackMatchingEngine, type ILegacyFallbackProjectIndexRecord } from '../legacy-fallback/matching-engine.js';

const engine = new LegacyFallbackMatchingEngine();

function decide(
  overrides: Partial<{
    legacyYear: number;
    projectNumber: string;
    normalizedFolderName: string;
    projectIndex: ILegacyFallbackProjectIndexRecord[];
  }> = {},
) {
  return engine.decide({
    legacyYear: 2024,
    projectNumber: '',
    normalizedFolderName: '',
    projectIndex: [],
    ...overrides,
  });
}

describe('LegacyFallbackMatchingEngine', () => {
  it('returns high confidence for single project-number exact match', () => {
    const result = decide({
      projectNumber: '24-100-01',
      projectIndex: [
        {
          projectListItemId: 101,
          projectNumber: '24-100-01',
          projectTitle: 'Test Project',
          normalizedProjectTitle: 'test project',
          year: 2024,
        },
      ],
    });

    expect(result.matchStatus).toBe('matched');
    expect(result.matchConfidence).toBe('high');
    expect(result.matchMethod).toBe('project-number-exact');
    expect(result.matchedProjectListItemId).toBe(101);
  });

  it('returns matched medium for deterministic normalized title in-year match', () => {
    const result = decide({
      legacyYear: 2025,
      normalizedFolderName: 'lakeside center',
      projectIndex: [
        {
          projectListItemId: 201,
          projectNumber: '',
          projectTitle: 'Lakeside Center',
          normalizedProjectTitle: 'lakeside center',
          year: 2025,
        },
      ],
    });

    expect(result.matchStatus).toBe('matched');
    expect(result.matchConfidence).toBe('medium');
    expect(result.matchMethod).toBe('normalized-title-year');
    expect(result.matchedProjectListItemId).toBe(201);
  });

  it('routes ambiguous normalized matches to review-required', () => {
    const result = decide({
      legacyYear: 2024,
      normalizedFolderName: 'oak court',
      projectIndex: [
        {
          projectListItemId: 301,
          projectNumber: '',
          projectTitle: 'Oak Court',
          normalizedProjectTitle: 'oak court',
          year: 2024,
        },
        {
          projectListItemId: 302,
          projectNumber: '',
          projectTitle: 'Oak Court',
          normalizedProjectTitle: 'oak court',
          year: 2024,
        },
      ],
    });

    expect(result.matchStatus).toBe('review-required');
    expect(result.matchConfidence).toBe('low');
  });

  it('returns unmatched when no candidates are available', () => {
    const result = decide({
      projectNumber: '24-999-99',
      normalizedFolderName: 'unknown site',
      projectIndex: [],
    });

    expect(result.matchStatus).toBe('unmatched');
    expect(result.matchConfidence).toBe('none');
    expect(result.matchMethod).toBe('no-match');
  });
});
