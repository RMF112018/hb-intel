import type { FoleonContentType } from '../types/foleon-content.types.js';

export type FoleonPreviewSource = 'preview';

export type FoleonPreviewPlaceholderVariant =
  | 'project'
  | 'newsletter'
  | 'news'
  | 'market'
  | 'leadership'
  | 'general';

export interface FoleonPreviewRecord {
  readonly id: `preview-${string}`;
  readonly source: FoleonPreviewSource;
  readonly title: string;
  readonly summary: string;
  readonly contentTypeKey: FoleonContentType;
  readonly issueDateLabel: string;
  readonly relatedProjectName?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly isFeature: boolean;
  readonly previewBadgeLabel: string;
  readonly previewActionLabel: string;
  readonly placeholderVariant: FoleonPreviewPlaceholderVariant;
}
