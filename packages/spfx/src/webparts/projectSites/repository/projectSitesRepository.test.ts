import { describe, expect, it } from 'vitest';
import {
  buildLegacyFallbackLookup,
  pickBestLegacyFallbackCandidate,
  toLegacyFallbackCandidate,
} from './projectSitesRepository.js';

describe('projectSitesRepository fallback selection', () => {
  it('accepts only matched rows with valid folder URLs', () => {
    expect(toLegacyFallbackCandidate({
      Id: 1,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: 'https://tenant.sharepoint.com/sites/2024Projects/Shared%20Documents',
      MatchStatus: 'matched',
      LastValidatedUtc: '2026-04-18T10:00:00.000Z',
      LastSeenUtc: '2026-04-18T09:00:00.000Z',
    })).not.toBeNull();

    expect(toLegacyFallbackCandidate({
      Id: 2,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: '',
      MatchStatus: 'matched',
    })).toBeNull();

    expect(toLegacyFallbackCandidate({
      Id: 3,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: 'https://tenant.sharepoint.com/sites/2024Projects/Shared%20Documents',
      MatchStatus: 'review-required',
    })).toBeNull();
  });

  it('selects the best duplicate fallback candidate deterministically', () => {
    const best = pickBestLegacyFallbackCandidate([
      {
        id: 10,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/a',
        matchStatus: 'matched',
        lastValidatedUtc: '2026-04-18T08:00:00.000Z',
        lastSeenUtc: '2026-04-18T09:00:00.000Z',
      },
      {
        id: 11,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/b',
        matchStatus: 'matched',
        lastValidatedUtc: '2026-04-18T09:00:00.000Z',
        lastSeenUtc: '2026-04-18T08:00:00.000Z',
      },
      {
        id: 12,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/c',
        matchStatus: 'matched',
        lastValidatedUtc: '2026-04-18T09:00:00.000Z',
        lastSeenUtc: '2026-04-18T10:00:00.000Z',
      },
    ]);

    expect(best?.id).toBe(12);
    expect(best?.folderWebUrl).toBe('https://tenant/c');
  });

  it('builds one lookup winner per project number + year', () => {
    const lookup = buildLegacyFallbackLookup([
      {
        Id: 20,
        ProjectNumber: '24-001-01',
        LegacyYear: 2024,
        FolderWebUrl: 'https://tenant/first',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T09:00:00.000Z',
      },
      {
        Id: 21,
        ProjectNumber: '24-001-01',
        LegacyYear: 2024,
        FolderWebUrl: 'https://tenant/second',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T10:00:00.000Z',
      },
      {
        Id: 22,
        ProjectNumber: '24-001-01',
        LegacyYear: 2025,
        FolderWebUrl: 'https://tenant/year-2025',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T07:00:00.000Z',
      },
    ]);

    expect(lookup.size).toBe(2);
    expect(lookup.get('24-001-01::2024')?.folderWebUrl).toBe('https://tenant/second');
    expect(lookup.get('24-001-01::2025')?.folderWebUrl).toBe('https://tenant/year-2025');
  });
});
