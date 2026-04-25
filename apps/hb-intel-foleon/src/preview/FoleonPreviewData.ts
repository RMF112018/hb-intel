import type { FoleonPreviewRecord } from './FoleonPreviewTypes.js';

const highlights = freezePreviewRecords([
  {
    id: 'preview-highlight-feature',
    source: 'preview',
    title: 'Preview sample: client impact story',
    summary:
      'Sample-only highlight copy that shows how a featured Foleon card could describe a project outcome once real publications are available.',
    contentTypeKey: 'Project Highlight',
    issueDateLabel: 'Preview issue',
    relatedProjectName: 'Sample project showcase',
    region: 'Sample region',
    sector: 'Sample sector',
    isFeature: true,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'project',
  },
  {
    id: 'preview-highlight-newsletter',
    source: 'preview',
    title: 'Preview sample: marketing newsletter',
    summary:
      'Sample newsletter text for an empty configured route. This is placeholder content and not a live Foleon publication.',
    contentTypeKey: 'Newsletter',
    issueDateLabel: 'Preview edition',
    region: 'Sample region',
    isFeature: false,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'newsletter',
  },
  {
    id: 'preview-highlight-market',
    source: 'preview',
    title: 'Preview sample: market update',
    summary:
      'Sample market update copy that can support a compact card without requiring any live publication identifiers.',
    contentTypeKey: 'Market Update',
    issueDateLabel: 'Preview briefing',
    sector: 'Sample sector',
    isFeature: false,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'market',
  },
  {
    id: 'preview-highlight-leadership',
    source: 'preview',
    title: 'Preview sample: leadership message',
    summary:
      'Sample leadership summary for preview fallback states. Future UI must label this clearly as preview content.',
    contentTypeKey: 'Leadership',
    issueDateLabel: 'Preview note',
    isFeature: false,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'leadership',
  },
]);

const hubRecords = freezePreviewRecords([
  ...highlights,
  {
    id: 'preview-hub-company-news',
    source: 'preview',
    title: 'Preview sample: company news',
    summary:
      'Sample company news copy for the content hub preview set. It is safe display data, not synced Foleon content.',
    contentTypeKey: 'Company News',
    issueDateLabel: 'Preview update',
    region: 'Sample region',
    isFeature: false,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'news',
  },
  {
    id: 'preview-hub-other',
    source: 'preview',
    title: 'Preview sample: additional publication',
    summary:
      'Sample general publication copy that rounds out the preview hub without using live content fields.',
    contentTypeKey: 'Other',
    issueDateLabel: 'Preview item',
    isFeature: false,
    previewBadgeLabel: 'Preview sample',
    previewActionLabel: 'Preview only',
    placeholderVariant: 'general',
  },
]);

export const FOLEON_PREVIEW_HIGHLIGHTS: ReadonlyArray<FoleonPreviewRecord> = highlights;
export const FOLEON_PREVIEW_HUB_RECORDS: ReadonlyArray<FoleonPreviewRecord> = hubRecords;

export function getFoleonHighlightsPreviewRecords(): ReadonlyArray<FoleonPreviewRecord> {
  return FOLEON_PREVIEW_HIGHLIGHTS;
}

export function getFoleonHubPreviewRecords(): ReadonlyArray<FoleonPreviewRecord> {
  return FOLEON_PREVIEW_HUB_RECORDS;
}

export function isFoleonPreviewRecord(record: unknown): record is FoleonPreviewRecord {
  if (!record || typeof record !== 'object') return false;
  const candidate = record as Partial<FoleonPreviewRecord>;
  return candidate.source === 'preview' && typeof candidate.id === 'string' && candidate.id.startsWith('preview-');
}

function freezePreviewRecords(records: ReadonlyArray<FoleonPreviewRecord>): ReadonlyArray<FoleonPreviewRecord> {
  return Object.freeze(records.map((record) => Object.freeze(record)));
}
