export type FoleonValidationStatus = 'valid' | 'warning' | 'blocked' | 'unknown';
export type FoleonOpenMode = 'Inline Reader' | 'Fullscreen Reader' | 'New Tab Only';
export type FoleonReaderKey = 'project-spotlight' | 'company-pulse' | 'leadership-message';
export type FoleonCadence = 'Monthly' | 'Weekly' | 'Frequent' | 'Ad Hoc';
export type FoleonHomepageSlot =
  | 'Project Spotlight Reader'
  | 'Company Pulse Reader'
  | 'Leadership Message Reader';
export type FoleonPrimaryAudience =
  | 'Companywide'
  | 'Operations'
  | 'Field'
  | 'Leadership'
  | 'Marketing'
  | 'Safety'
  | 'IT';
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

export interface FoleonManagedContent {
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
  readonly primaryAudience?: FoleonPrimaryAudience;
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
  readonly openMode?: FoleonOpenMode;
  readonly allowEmbed?: boolean;
  readonly requiresExternalOpen?: boolean;
  readonly adminNotes?: string;
}

export interface FoleonContentMutation {
  readonly etag?: string;
  readonly title: string;
  readonly foleonDocId: number;
  readonly contentTypeKey: string;
  readonly readerKey?: FoleonReaderKey;
  readonly cadence?: FoleonCadence;
  readonly homepageSlot?: FoleonHomepageSlot;
  readonly archiveGroup?: string;
  readonly activeEdition?: boolean;
  readonly primaryAudience?: FoleonPrimaryAudience;
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
  readonly tags?: ReadonlyArray<string>;
  readonly openMode: FoleonOpenMode;
  readonly allowEmbed: boolean;
  readonly requiresExternalOpen: boolean;
  readonly adminNotes?: string;
}

export interface FoleonPlacement {
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

export interface FoleonPlacementMutation {
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
  readonly checkedAtUtc: string;
  readonly correlationId: string;
}

export interface FoleonSyncRun {
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

export interface FoleonSyncStatus {
  readonly health: 'not-configured' | 'ready' | 'running' | 'degraded';
  readonly lastRun?: FoleonSyncRun;
  readonly config: {
    readonly graphConfigured: boolean;
    readonly foleonApiConfigured: boolean;
    readonly sharePointSiteConfigured: boolean;
  };
}

export interface FoleonApiError {
  readonly code?: string;
  readonly message: string;
  readonly requestId?: string;
  readonly details?: unknown;
}
