import { describe, expect, it } from 'vitest';
import {
  FOLEON_PREVIEW_HIGHLIGHTS,
  FOLEON_PREVIEW_HUB_RECORDS,
  getFoleonHighlightsPreviewRecords,
  getFoleonHubPreviewRecords,
  isFoleonPreviewRecord,
} from '../FoleonPreviewData.js';
import type { FoleonPreviewRecord } from '../FoleonPreviewTypes.js';
import type { FoleonContentType } from '../../types/foleon-content.types.js';

const ALLOWED_CONTENT_TYPES: ReadonlySet<FoleonContentType> = new Set([
  'Project Highlight',
  'Newsletter',
  'Company News',
  'Market Update',
  'Leadership',
  'Other',
]);

const UNSAFE_KEY_PATTERN = /url|href|docId|itemId|embed|telemetry/i;

const allRecords = [...FOLEON_PREVIEW_HIGHLIGHTS, ...FOLEON_PREVIEW_HUB_RECORDS];

describe('Foleon preview fixtures', () => {
  it('exports non-empty preview fixture arrays', () => {
    expect(FOLEON_PREVIEW_HIGHLIGHTS.length).toBeGreaterThan(0);
    expect(FOLEON_PREVIEW_HUB_RECORDS.length).toBeGreaterThan(0);
  });

  it('marks every fixture with a preview discriminator and preview-prefixed ID', () => {
    for (const record of allRecords) {
      expect(record.source).toBe('preview');
      expect(record.id.startsWith('preview-')).toBe(true);
      expect(isFoleonPreviewRecord(record)).toBe(true);
    }
  });

  it('does not expose unsafe live content, URL, embed, or telemetry key names', () => {
    for (const record of allRecords) {
      for (const key of Object.keys(record)) {
        expect(key, `${record.id} includes unsafe preview key ${key}`).not.toMatch(UNSAFE_KEY_PATTERN);
      }
    }
  });

  it('includes required display fields for future preview UI', () => {
    for (const record of allRecords) {
      expectRequiredText(record, 'title');
      expectRequiredText(record, 'summary');
      expectRequiredText(record, 'issueDateLabel');
      expectRequiredText(record, 'previewBadgeLabel');
      expectRequiredText(record, 'previewActionLabel');
      expectRequiredText(record, 'placeholderVariant');
      expect(typeof record.isFeature).toBe('boolean');
    }
  });

  it('uses only current Foleon content type union values', () => {
    for (const record of allRecords) {
      expect(ALLOWED_CONTENT_TYPES.has(record.contentTypeKey)).toBe(true);
    }
  });

  it('supports one feature card and multiple compact cards', () => {
    const featureRecords = FOLEON_PREVIEW_HIGHLIGHTS.filter((record) => record.isFeature);
    const compactRecords = FOLEON_PREVIEW_HIGHLIGHTS.filter((record) => !record.isFeature);

    expect(featureRecords.length).toBeGreaterThanOrEqual(1);
    expect(compactRecords.length).toBeGreaterThanOrEqual(3);
  });

  it('returns readonly frozen arrays from preview helpers', () => {
    expect(Object.isFrozen(FOLEON_PREVIEW_HIGHLIGHTS)).toBe(true);
    expect(Object.isFrozen(FOLEON_PREVIEW_HUB_RECORDS)).toBe(true);
    expect(Object.isFrozen(FOLEON_PREVIEW_HIGHLIGHTS[0])).toBe(true);
    expect(Object.isFrozen(FOLEON_PREVIEW_HUB_RECORDS[0])).toBe(true);
    expect(getFoleonHighlightsPreviewRecords()).toBe(FOLEON_PREVIEW_HIGHLIGHTS);
    expect(getFoleonHubPreviewRecords()).toBe(FOLEON_PREVIEW_HUB_RECORDS);
  });
});

function expectRequiredText<K extends keyof FoleonPreviewRecord>(record: FoleonPreviewRecord, key: K): void {
  expect(typeof record[key]).toBe('string');
  expect(String(record[key]).trim().length).toBeGreaterThan(0);
}
