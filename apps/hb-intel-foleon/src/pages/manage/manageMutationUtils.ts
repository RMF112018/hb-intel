import type { FoleonContentMutation, FoleonManagedContent } from '../../types/foleon-management.types.js';

export function toContentMutation(record: FoleonManagedContent): FoleonContentMutation {
  return {
    etag: record.etag,
    title: record.title,
    foleonDocId: record.foleonDocId,
    contentTypeKey: record.contentTypeKey,
    publishStatus: record.publishStatus,
    isVisible: record.isVisible,
    isHomepageEligible: record.isHomepageEligible,
    publishedUrl: record.publishedUrl,
    embedUrl: record.embedUrl,
    thumbnailUrl: record.thumbnailUrl,
    summary: record.summary,
    region: record.region,
    sector: record.sector,
    openMode: record.openMode ?? 'Inline Reader',
    allowEmbed: record.allowEmbed ?? true,
    requiresExternalOpen: record.requiresExternalOpen ?? false,
    adminNotes: record.adminNotes,
  };
}

export function contentMutationFingerprint(input: FoleonContentMutation): string {
  return JSON.stringify({
    etag: input.etag,
    title: input.title,
    foleonDocId: input.foleonDocId,
    contentTypeKey: input.contentTypeKey,
    publishStatus: input.publishStatus,
    isVisible: input.isVisible,
    isHomepageEligible: input.isHomepageEligible,
    publishedUrl: input.publishedUrl,
    embedUrl: input.embedUrl,
    thumbnailUrl: input.thumbnailUrl,
    summary: input.summary,
    region: input.region,
    sector: input.sector,
    openMode: input.openMode,
    allowEmbed: input.allowEmbed,
    requiresExternalOpen: input.requiresExternalOpen,
    adminNotes: input.adminNotes,
  });
}
