export type FoleonValidationStatus = 'valid' | 'warning' | 'blocked' | 'unknown';
export type FoleonOpenMode = 'Inline Reader' | 'Fullscreen Reader' | 'New Tab Only';
export type FoleonSyncSource = 'Manual' | 'Foleon API' | 'Hybrid';
export type FoleonReaderKey = 'project-spotlight' | 'company-pulse' | 'leadership-message';
export type FoleonCadence = 'Monthly' | 'Weekly' | 'Frequent' | 'Ad Hoc';
export type FoleonHomepageSlot =
  | 'Project Spotlight Reader'
  | 'Company Pulse Reader'
  | 'Leadership Message Reader';
export type FoleonPlacementKey =
  | 'Hero'
  | 'Primary Card'
  | 'Secondary Card'
  | 'Carousel'
  | 'Archive Rail'
  | 'Project Spotlight Active'
  | 'Company Pulse Active'
  | 'Leadership Message Active';
export type FoleonLayoutVariant =
  | 'Large Feature'
  | 'Compact Card'
  | 'Square Tile'
  | 'Text Rail';

export interface FoleonContentSummaryDto {
  readonly id: string;
  readonly sharePointItemId: number;
  readonly etag: string;
  readonly title: string;
  readonly foleonDocId: number;
  readonly contentTypeKey: string;
  readonly readerKey?: FoleonReaderKey;
  readonly cadence?: FoleonCadence;
  readonly homepageSlot?: FoleonHomepageSlot;
  readonly archiveGroup?: string;
  readonly activeEdition?: boolean;
  readonly primaryAudience?: string;
  readonly lastEditorialUpdate?: string;
  readonly publishStatus: string;
  readonly isVisible: boolean;
  readonly isHomepageEligible: boolean;
  readonly publishedUrl?: string;
  readonly embedUrl?: string;
  readonly thumbnailUrl?: string;
  readonly summary?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly publishedOn?: string;
  readonly validationStatus: FoleonValidationStatus;
  readonly blockingReasons: ReadonlyArray<string>;
}

export interface FoleonContentDetailDto extends FoleonContentSummaryDto {
  readonly previewUrl?: string;
  readonly heroImageUrl?: string;
  readonly marketingOwner?: string;
  readonly issueDate?: string;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly relatedProjectNumber?: string;
  readonly relatedProjectName?: string;
  readonly relatedProjectSiteUrl?: string;
  readonly tags: ReadonlyArray<string>;
  readonly openMode: FoleonOpenMode;
  readonly allowEmbed: boolean;
  readonly requiresExternalOpen: boolean;
  readonly syncSource: FoleonSyncSource;
  readonly lastSynced?: string;
  readonly adminNotes?: string;
}

export interface FoleonContentMutationRequest {
  readonly etag?: string;
  readonly title: string;
  readonly foleonDocId: number;
  readonly contentTypeKey: string;
  readonly readerKey?: FoleonReaderKey;
  readonly cadence?: FoleonCadence;
  readonly homepageSlot?: FoleonHomepageSlot;
  readonly archiveGroup?: string;
  readonly activeEdition?: boolean;
  readonly primaryAudience?: string;
  readonly lastEditorialUpdate?: string;
  readonly publishStatus: string;
  readonly isVisible: boolean;
  readonly isHomepageEligible?: boolean;
  readonly publishedUrl?: string;
  readonly embedUrl?: string;
  readonly thumbnailUrl?: string;
  readonly heroImageUrl?: string;
  readonly summary?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly openMode: FoleonOpenMode;
  readonly allowEmbed: boolean;
  readonly requiresExternalOpen?: boolean;
  readonly adminNotes?: string;
}

export interface FoleonPlacementDto {
  readonly id: string;
  readonly sharePointItemId: number;
  readonly etag: string;
  readonly title: string;
  readonly placementKey: FoleonPlacementKey;
  readonly contentItemId: number;
  readonly foleonDocId: number;
  readonly isActive: boolean;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly sortRank: number;
  readonly layoutVariant?: FoleonLayoutVariant;
  readonly validationStatus: Exclude<FoleonValidationStatus, 'unknown'>;
  readonly blockingReasons: ReadonlyArray<string>;
}

export interface FoleonPlacementMutationRequest {
  readonly etag?: string;
  readonly title: string;
  readonly placementKey: FoleonPlacementKey;
  readonly contentItemId: number;
  readonly isActive: boolean;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly sortRank: number;
  readonly layoutVariant?: FoleonLayoutVariant;
  readonly adminNotes?: string;
}

export interface FoleonValidationResult {
  readonly status: Exclude<FoleonValidationStatus, 'unknown'>;
  readonly blockingReasons: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly normalizedFields: Record<string, unknown>;
  readonly checkedAtUtc: string;
  readonly correlationId: string;
}

export interface FoleonSyncRunDto {
  readonly id: string;
  readonly startedAtUtc: string;
  readonly completedAtUtc?: string;
  readonly runType: 'Docs' | 'Projects' | 'Provisioning' | 'Validation';
  readonly status: 'Running' | 'Succeeded' | 'Failed' | 'Partial';
  readonly requestedBy?: string;
  readonly correlationId: string;
  readonly itemsScanned: number;
  readonly itemsCreated: number;
  readonly itemsUpdated: number;
  readonly itemsFailed: number;
  readonly message?: string;
  readonly failedItems: ReadonlyArray<{ readonly key: string; readonly message: string }>;
}

export interface FoleonSyncStatusDto {
  readonly health: 'not-configured' | 'ready' | 'running' | 'degraded';
  readonly lastRun?: FoleonSyncRunDto;
  readonly config: {
    readonly graphConfigured: boolean;
    readonly foleonApiConfigured: boolean;
    readonly sharePointSiteConfigured: boolean;
  };
}
