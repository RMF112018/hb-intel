/**
 * Foleon content types — aligned to the canonical SharePoint data-model
 * plan at docs/architecture/plans/MASTER/spfx/foleon/integration-plan/
 * 02_sharepoint_data_model.md.
 */

export type FoleonContentType =
  | 'Project Spotlight'
  | 'Company Pulse'
  | 'Project Highlight'
  | 'Newsletter'
  | 'Company News'
  | 'Market Update'
  | 'Leadership'
  | 'Other';

export type FoleonPublishStatus =
  | 'Draft'
  | 'Preview'
  | 'Published'
  | 'Archived'
  | 'Offline'
  | 'Suppressed';

export type FoleonOpenMode = 'Inline Reader' | 'Fullscreen Reader' | 'New Tab Only';

export type FoleonSyncSource = 'Manual' | 'Foleon API' | 'Hybrid';

export type FoleonReaderKey = 'project-spotlight' | 'company-pulse';

export type FoleonCadence = 'Monthly' | 'Weekly' | 'Frequent' | 'Ad Hoc';

export type FoleonHomepageSlot = 'Project Spotlight Reader' | 'Company Pulse Reader';

export type FoleonPrimaryAudience =
  | 'Companywide'
  | 'Operations'
  | 'Field'
  | 'Leadership'
  | 'Marketing'
  | 'Safety'
  | 'IT';

export interface FoleonContentRecord {
  readonly id: number;
  readonly title: string;
  readonly foleonDocId: number;
  readonly foleonDocUid?: string;
  readonly foleonIdentifier?: string;
  readonly foleonProjectId?: number;
  readonly foleonProjectName?: string;
  readonly contentTypeKey: FoleonContentType;
  readonly readerKey?: FoleonReaderKey;
  readonly cadence?: FoleonCadence;
  readonly homepageSlot?: FoleonHomepageSlot;
  readonly archiveGroup?: string;
  readonly activeEdition?: boolean;
  readonly primaryAudience?: FoleonPrimaryAudience;
  readonly lastEditorialUpdate?: string;
  readonly publishStatus: FoleonPublishStatus;
  readonly isVisible: boolean;
  readonly isFeatured: boolean;
  readonly isHomepageEligible: boolean;
  readonly publishedUrl?: string;
  readonly previewUrl?: string;
  readonly embedUrl?: string;
  readonly thumbnailUrl?: string;
  readonly heroImageUrl?: string;
  readonly summary?: string;
  readonly issueDate?: string;
  readonly publishedOn?: string;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly sortRank?: number;
  readonly relatedProjectNumber?: string;
  readonly relatedProjectName?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly openMode: FoleonOpenMode;
  readonly allowEmbed: boolean;
  readonly requiresExternalOpen: boolean;
  readonly syncSource: FoleonSyncSource;
}
