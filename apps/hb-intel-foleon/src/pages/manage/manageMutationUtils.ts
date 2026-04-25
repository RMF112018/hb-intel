import type { FoleonContentMutation, FoleonManagedContent } from '../../types/foleon-management.types.js';

export type FoleonReaderLane = 'project-spotlight' | 'company-pulse' | 'leadership-message';

const PUBLIC_READY_STATUS = 'Published';

export function toContentMutation(record: FoleonManagedContent): FoleonContentMutation {
  return {
    etag: record.etag,
    title: record.title,
    foleonDocId: record.foleonDocId,
    contentTypeKey: record.contentTypeKey,
    readerKey: record.readerKey,
    cadence: record.cadence,
    homepageSlot: record.homepageSlot,
    archiveGroup: record.archiveGroup,
    activeEdition: record.activeEdition,
    primaryAudience: record.primaryAudience,
    lastEditorialUpdate: record.lastEditorialUpdate,
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
    readerKey: input.readerKey,
    cadence: input.cadence,
    homepageSlot: input.homepageSlot,
    archiveGroup: input.archiveGroup,
    activeEdition: input.activeEdition,
    primaryAudience: input.primaryAudience,
    lastEditorialUpdate: input.lastEditorialUpdate,
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

export function applyReaderLanePreset(
  draft: FoleonContentMutation,
  lane: FoleonReaderLane,
): FoleonContentMutation {
  if (lane === 'project-spotlight') {
    return {
      ...draft,
      contentTypeKey: 'Project Spotlight',
      readerKey: 'project-spotlight',
      cadence: 'Monthly',
      homepageSlot: 'Project Spotlight Reader',
      primaryAudience: draft.primaryAudience ?? 'Companywide',
      openMode: 'Inline Reader',
      allowEmbed: true,
      requiresExternalOpen: false,
      isHomepageEligible: true,
    };
  }
  if (lane === 'company-pulse') {
    return {
      ...draft,
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      cadence: 'Frequent',
      homepageSlot: 'Company Pulse Reader',
      primaryAudience: draft.primaryAudience ?? 'Companywide',
      openMode: 'Inline Reader',
      allowEmbed: true,
      requiresExternalOpen: false,
      isHomepageEligible: true,
    };
  }
  return {
    ...draft,
    contentTypeKey: 'Leadership',
    readerKey: 'leadership-message',
    cadence: 'Frequent',
    homepageSlot: 'Leadership Message Reader',
    primaryAudience: draft.primaryAudience ?? 'Companywide',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    isHomepageEligible: true,
  };
}

export function readerLaneLabel(lane: FoleonReaderLane): string {
  if (lane === 'project-spotlight') return 'Project Spotlight';
  if (lane === 'company-pulse') return 'Company Pulse';
  return 'Leadership Message';
}

export function readerLaneForPlacementKey(placementKey: string | undefined): FoleonReaderLane | null {
  if (placementKey === 'Project Spotlight Active') return 'project-spotlight';
  if (placementKey === 'Company Pulse Active') return 'company-pulse';
  if (placementKey === 'Leadership Message Active') return 'leadership-message';
  return null;
}

export function readerLaneForContent(record: Pick<FoleonManagedContent, 'readerKey' | 'contentTypeKey'>): FoleonReaderLane | null {
  if (record.readerKey === 'project-spotlight' || record.contentTypeKey === 'Project Spotlight') {
    return 'project-spotlight';
  }
  if (record.readerKey === 'company-pulse' || record.contentTypeKey === 'Company Pulse') {
    return 'company-pulse';
  }
  if (record.readerKey === 'leadership-message' || record.contentTypeKey === 'Leadership') {
    return 'leadership-message';
  }
  return null;
}

export function isPublicReadyReaderRecord(
  record: Pick<FoleonManagedContent, 'publishStatus' | 'isVisible' | 'isHomepageEligible' | 'publishedUrl' | 'embedUrl' | 'allowEmbed' | 'requiresExternalOpen'>,
): boolean {
  return (
    record.publishStatus === PUBLIC_READY_STATUS &&
    record.isVisible &&
    record.isHomepageEligible &&
    (Boolean(record.publishedUrl) || Boolean(record.embedUrl)) &&
    (record.allowEmbed !== false || record.requiresExternalOpen === true)
  );
}

export function buildReaderLaneWarnings(args: {
  readonly draft: FoleonContentMutation;
  readonly record: FoleonManagedContent;
  readonly allContent: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<{ readonly placementKey: string; readonly contentItemId: number; readonly isActive: boolean }>;
}): ReadonlyArray<string> {
  const warnings: string[] = [];
  const lane = args.draft.readerKey;
  if (lane === 'project-spotlight' || lane === 'company-pulse' || lane === 'leadership-message') {
    const activeCount = args.allContent.filter((record) =>
      record.sharePointItemId !== args.record.sharePointItemId &&
      record.readerKey === lane &&
      record.activeEdition === true
    ).length + (args.draft.activeEdition ? 1 : 0);
    if (activeCount > 1) {
      warnings.push(`More than one active ${readerLaneLabel(lane)} edition is configured.`);
    }
    if (args.draft.activeEdition && !isPublicReadyDraft(args.draft)) {
      warnings.push('Active reader editions should be published, visible, homepage eligible, and have a reader URL.');
    }
    if (lane === 'company-pulse' && !args.draft.lastEditorialUpdate) {
      warnings.push('Company Pulse active editions should include Last Editorial Update.');
    }
    if (lane === 'project-spotlight' && !args.draft.archiveGroup?.trim()) {
      warnings.push('Project Spotlight active editions should include Archive Group.');
    }
  }

  for (const placement of args.placements) {
    if (!placement.isActive || placement.contentItemId !== args.record.sharePointItemId) continue;
    const placementLane = readerLaneForPlacementKey(placement.placementKey);
    if (placementLane && lane !== placementLane) {
      warnings.push(`${placement.placementKey} placement points to content that is not configured for ${readerLaneLabel(placementLane)}.`);
    }
  }
  return Array.from(new Set(warnings));
}

export function placementAlignmentWarnings(args: {
  readonly placementKey: string;
  readonly contentItemId: number;
  readonly content: ReadonlyArray<FoleonManagedContent>;
}): ReadonlyArray<string> {
  const lane = readerLaneForPlacementKey(args.placementKey);
  if (!lane) return [];
  const record = args.content.find((item) => item.sharePointItemId === args.contentItemId);
  if (!record) return [`${args.placementKey} requires a matching content record before save.`];
  const contentLane = readerLaneForContent(record);
  const warnings: string[] = [];
  if (contentLane !== lane) {
    warnings.push(`${args.placementKey} should point to ${readerLaneLabel(lane)} content.`);
  }
  if (!isPublicReadyReaderRecord(record)) {
    warnings.push(`${args.placementKey} points to content that is not public-ready.`);
  }
  return warnings;
}

function isPublicReadyDraft(draft: FoleonContentMutation): boolean {
  return (
    draft.publishStatus === PUBLIC_READY_STATUS &&
    draft.isVisible &&
    draft.isHomepageEligible &&
    (Boolean(draft.publishedUrl) || Boolean(draft.embedUrl))
  );
}
