import { describe, it, expect } from 'vitest';
import {
  createPreviewFoleonViewerTarget,
  createReadyFoleonViewerTarget,
} from '../FoleonViewerTypes.js';
import { FOLEON_READER_CONFIGS } from '../readerConfigs.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';

function makeRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'A Hosted Edition Title',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/edition',
    embedUrl: 'https://viewer.us.foleon.com/embed/edition',
    summary: 'A short editorial summary.',
    issueDate: '2026-04-01T00:00:00.000Z',
    publishedOn: '2026-04-20T00:00:00.000Z',
    archiveGroup: '2026-04',
    activeEdition: true,
    primaryAudience: 'Companywide',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

describe('createReadyFoleonViewerTarget — record-backed mapping', () => {
  it('maps embedUrl → viewerUrl, publishedUrl → url, and resolves canOpen=true when allowEmbed && !requiresExternalOpen', () => {
    const target = createReadyFoleonViewerTarget({
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record: makeRecord(),
    });
    expect(target.lane).toBe('projectSpotlight');
    expect(target.source).toBe('active-record');
    expect(target.viewerUrl).toBe('https://viewer.us.foleon.com/embed/edition');
    expect(target.url).toBe('https://viewer.us.foleon.com/published/edition');
    expect(target.canOpen).toBe(true);
    expect(target.disabledReason).toBeUndefined();
  });

  it('disables with reason "no-embed-url" when record has no embedUrl', () => {
    const target = createReadyFoleonViewerTarget({
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record: makeRecord({ embedUrl: undefined }),
    });
    expect(target.canOpen).toBe(false);
    expect(target.disabledReason).toBe('no-embed-url');
  });

  it('disables with reason "embed-not-allowed" when allowEmbed is false', () => {
    const target = createReadyFoleonViewerTarget({
      config: FOLEON_READER_CONFIGS.companyPulse,
      record: makeRecord({
        contentTypeKey: 'Company Pulse',
        readerKey: 'company-pulse',
        allowEmbed: false,
      }),
    });
    expect(target.canOpen).toBe(false);
    expect(target.disabledReason).toBe('embed-not-allowed');
  });

  it('disables with reason "requires-external-open" when requiresExternalOpen is true', () => {
    const target = createReadyFoleonViewerTarget({
      config: FOLEON_READER_CONFIGS.leadershipMessage,
      record: makeRecord({
        contentTypeKey: 'Leadership',
        readerKey: 'leadership-message',
        requiresExternalOpen: true,
      }),
    });
    expect(target.canOpen).toBe(false);
    expect(target.disabledReason).toBe('requires-external-open');
  });

  it('lets the orchestrator override embedUrl with the resolution-derived value', () => {
    const target = createReadyFoleonViewerTarget({
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record: makeRecord({ embedUrl: 'https://viewer.us.foleon.com/embed/record-url' }),
      embedUrl: 'https://viewer.us.foleon.com/embed/resolution-url',
    });
    expect(target.viewerUrl).toBe('https://viewer.us.foleon.com/embed/resolution-url');
    expect(target.canOpen).toBe(true);
  });
});

describe('createPreviewFoleonViewerTarget — labeled, never live', () => {
  it('returns canOpen=false with disabledReason="preview-only" for every governed lane', () => {
    for (const config of [
      FOLEON_READER_CONFIGS.projectSpotlight,
      FOLEON_READER_CONFIGS.companyPulse,
      FOLEON_READER_CONFIGS.leadershipMessage,
    ]) {
      const target = createPreviewFoleonViewerTarget(config);
      expect(target.canOpen).toBe(false);
      expect(target.disabledReason).toBe('preview-only');
      expect(target.viewerUrl).toBeUndefined();
      expect(target.source).toBe('preview');
    }
  });
});
