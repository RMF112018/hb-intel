import type { FoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import { isAllowedFoleonUrl } from '../../services/FoleonOriginPolicy.js';
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
    displayFrom: record.displayFrom,
    displayThrough: record.displayThrough,
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
    displayFrom: input.displayFrom,
    displayThrough: input.displayThrough,
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

export interface FoleonWorkflowValidationIssue {
  readonly label: string;
  readonly status: 'pass' | 'warning' | 'blocked';
  readonly detail: string;
}

export function validateFoleonContentWorkflow(args: {
  readonly draft: FoleonContentMutation;
  readonly record?: Pick<FoleonManagedContent, 'sharePointItemId'>;
  readonly allContent: ReadonlyArray<FoleonManagedContent>;
  readonly originPolicy: FoleonOriginPolicy;
}): ReadonlyArray<FoleonWorkflowValidationIssue> {
  const issues: FoleonWorkflowValidationIssue[] = [];
  const lane = args.draft.readerKey;
  const publishedUrlCheck = checkUrlPolicy('Published URL', args.draft.publishedUrl, args.originPolicy);
  const embedUrlCheck = checkUrlPolicy('Embed URL', args.draft.embedUrl, args.originPolicy);
  const displayWindowCheck = checkDisplayWindow(args.draft.displayFrom, args.draft.displayThrough);
  const activeConflict = findActiveEditionConflict({
    draft: args.draft,
    currentSharePointItemId: args.record?.sharePointItemId,
    allContent: args.allContent,
  });

  issues.push(
    checklistItem('Foleon doc/publication ID present', Number.isInteger(args.draft.foleonDocId) && args.draft.foleonDocId > 0, 'A positive Foleon publication ID is required.'),
    checklistItem('Reader lane assigned', Boolean(lane), 'Assign Project Spotlight, Company Pulse, or Leadership Message.'),
    checklistItem('Homepage slot assigned', Boolean(args.draft.homepageSlot), 'Assign the matching homepage reader slot.'),
    checklistItem('Published URL or embed URL present', Boolean(args.draft.publishedUrl || args.draft.embedUrl), 'A production reader URL is required before publishing.'),
    checklistItem('Inline embed URL present', args.draft.openMode !== 'Inline Reader' || Boolean(args.draft.embedUrl), 'Inline Reader mode requires an embed URL.'),
    publishedUrlCheck,
    embedUrlCheck,
    checklistItem('Visibility enabled', args.draft.isVisible === true, 'Homepage content must be visible before it can be live.'),
    checklistItem('Homepage eligible', args.draft.isHomepageEligible === true, 'Content must be marked homepage eligible.'),
    checklistItem('Publish status valid', ['Draft', 'Preview', 'Published', 'Archived', 'Offline', 'Suppressed'].includes(args.draft.publishStatus), 'Use a governed publish status.'),
    displayWindowCheck,
    checklistItem('Active edition conflict check', !activeConflict, activeConflict ?? 'No overlapping active edition was found.'),
  );

  if (lane === 'company-pulse') {
    issues.push(checklistItem('Company Pulse update date present', Boolean(args.draft.lastEditorialUpdate), 'Company Pulse editions should include the latest editorial update date.'));
  }
  if (lane === 'project-spotlight') {
    issues.push(checklistItem('Project Spotlight archive group present', Boolean(args.draft.archiveGroup?.trim()), 'Project Spotlight editions should include an archive group.'));
  }

  return issues;
}

export function blockingWorkflowIssues(
  issues: ReadonlyArray<FoleonWorkflowValidationIssue>,
): ReadonlyArray<string> {
  return issues.filter((issue) => issue.status === 'blocked').map((issue) => `${issue.label}: ${issue.detail}`);
}

export function findActiveEditionConflict(args: {
  readonly draft: Pick<FoleonContentMutation, 'readerKey' | 'homepageSlot' | 'activeEdition' | 'isHomepageEligible' | 'publishStatus' | 'displayFrom' | 'displayThrough'>;
  readonly currentSharePointItemId?: number;
  readonly allContent: ReadonlyArray<FoleonManagedContent>;
}): string | null {
  if (!args.draft.readerKey || !args.draft.homepageSlot || args.draft.activeEdition !== true) return null;
  if (args.draft.isHomepageEligible !== true || args.draft.publishStatus !== 'Published') return null;
  const conflict = args.allContent.find((record) =>
    record.sharePointItemId !== args.currentSharePointItemId &&
    record.readerKey === args.draft.readerKey &&
    record.homepageSlot === args.draft.homepageSlot &&
    record.activeEdition === true &&
    record.isHomepageEligible === true &&
    record.publishStatus === 'Published' &&
    windowsOverlap(args.draft.displayFrom, args.draft.displayThrough, record.displayFrom, record.displayThrough)
  );
  return conflict
    ? `${readerLaneLabel(args.draft.readerKey)} already has an overlapping active edition: ${conflict.title}.`
    : null;
}

function checklistItem(label: string, pass: boolean, detail: string): FoleonWorkflowValidationIssue {
  return { label, status: pass ? 'pass' : 'blocked', detail };
}

function checkUrlPolicy(
  label: string,
  value: string | undefined,
  policy: FoleonOriginPolicy,
): FoleonWorkflowValidationIssue {
  if (!value) return { label, status: 'warning', detail: `${label} is not configured.` };
  const result = isAllowedFoleonUrl(policy, value);
  if (result.allowed) return { label, status: 'pass', detail: 'Origin and preview policy passed.' };
  const messageByReason: Record<string, string> = {
    'invalid-url': `${label} must be a valid URL.`,
    'wrong-scheme': `${label} must use HTTPS.`,
    'origin-not-allowlisted': `${label} origin is not allowlisted.`,
    'preview-url-blocked': `${label} is a preview URL and preview promotion is disabled.`,
    ok: 'Origin and preview policy passed.',
  };
  return { label, status: 'blocked', detail: messageByReason[result.reason] ?? `${label} failed URL policy.` };
}

function checkDisplayWindow(from: string | undefined, through: string | undefined): FoleonWorkflowValidationIssue {
  const fromTime = parseOptionalDate(from);
  const throughTime = parseOptionalDate(through);
  if ((from && fromTime === null) || (through && throughTime === null)) {
    return { label: 'Display window valid', status: 'blocked', detail: 'Display dates must be valid date or datetime values.' };
  }
  if (fromTime !== null && throughTime !== null && throughTime < fromTime) {
    return { label: 'Display window valid', status: 'blocked', detail: 'Display Through must be after Display From.' };
  }
  return { label: 'Display window valid', status: 'pass', detail: 'Display window is valid or open-ended.' };
}

function windowsOverlap(
  leftFrom: string | undefined,
  leftThrough: string | undefined,
  rightFrom: string | undefined,
  rightThrough: string | undefined,
): boolean {
  const leftStart = parseOptionalDate(leftFrom) ?? Number.NEGATIVE_INFINITY;
  const leftEnd = parseOptionalDate(leftThrough) ?? Number.POSITIVE_INFINITY;
  const rightStart = parseOptionalDate(rightFrom) ?? Number.NEGATIVE_INFINITY;
  const rightEnd = parseOptionalDate(rightThrough) ?? Number.POSITIVE_INFINITY;
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function parseOptionalDate(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function isPublicReadyDraft(draft: FoleonContentMutation): boolean {
  return (
    draft.publishStatus === PUBLIC_READY_STATUS &&
    draft.isVisible &&
    draft.isHomepageEligible &&
    (Boolean(draft.publishedUrl) || Boolean(draft.embedUrl))
  );
}
