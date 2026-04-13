/**
 * Canonical enum values for the Project Spotlight publisher data model.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
 *
 * Keep this file in lockstep with the choice-default table in
 * packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1.
 *
 * All tuples are declared `as const` so consumers can derive literal-union
 * types directly; no runtime object mutation is required.
 */

export const POST_FAMILY_VALUES = [
  'monthlySpotlight',
  'milestoneSpotlight',
  'projectUpdate',
  'projectStory',
] as const;
export type PostFamily = (typeof POST_FAMILY_VALUES)[number];

export const SPOTLIGHT_TYPE_VALUES = [
  'inProgress',
  'milestone',
  'update',
  'feature',
] as const;
export type SpotlightType = (typeof SPOTLIGHT_TYPE_VALUES)[number];

export const PROJECT_STAGE_VALUES = [
  'preconstruction',
  'inProgress',
  'closeout',
  'completed',
] as const;
export type ProjectStage = (typeof PROJECT_STAGE_VALUES)[number];

export const ARTICLE_SUBJECT_VALUES = [
  'general',
  'people',
  'project',
  'operations',
  'safety',
] as const;
export type ArticleSubject = (typeof ARTICLE_SUBJECT_VALUES)[number];

export const WORKFLOW_STATE_VALUES = [
  'draft',
  'inReview',
  'approved',
  'scheduled',
  'published',
  'archived',
  'withdrawn',
] as const;
export type WorkflowState = (typeof WORKFLOW_STATE_VALUES)[number];

export const BANNER_THEME_VARIANT_VALUES = [
  'default',
  'light',
  'dark',
] as const;
export type BannerThemeVariant = (typeof BANNER_THEME_VARIANT_VALUES)[number];

export const HERO_RENDERER_KIND_VALUES = [
  'oobPageTitle',
  'hbSignatureHero',
] as const;
export type HeroRendererKind = (typeof HERO_RENDERER_KIND_VALUES)[number];

export const BANNER_RENDERER_KIND_VALUES = HERO_RENDERER_KIND_VALUES;
export type BannerRendererKind = HeroRendererKind;

export const BODY_RENDERER_KIND_VALUES = ['oobText'] as const;
export type BodyRendererKind = (typeof BODY_RENDERER_KIND_VALUES)[number];

export const TEAM_RENDERER_KIND_VALUES = ['teamViewer', 'none'] as const;
export type TeamRendererKind = (typeof TEAM_RENDERER_KIND_VALUES)[number];

export const GALLERY_RENDERER_KIND_VALUES = [
  'oobImageGallery',
  'none',
] as const;
export type GalleryRendererKind = (typeof GALLERY_RENDERER_KIND_VALUES)[number];

export const TEAM_VIEWER_LAYOUT_VALUES = ['grid', 'list'] as const;
export type TeamViewerLayout = (typeof TEAM_VIEWER_LAYOUT_VALUES)[number];

export const TEAM_VIEWER_DENSITY_VALUES = [
  'standard',
  'compact',
  'comfortable',
] as const;
export type TeamViewerDensity = (typeof TEAM_VIEWER_DENSITY_VALUES)[number];

export const GALLERY_LAYOUT_PROFILE_VALUES = [
  'grid',
  'carousel',
  'shellDefault',
] as const;
export type GalleryLayoutProfile =
  (typeof GALLERY_LAYOUT_PROFILE_VALUES)[number];

export const PAGE_SYNC_STATUS_VALUES = [
  'pending',
  'inSync',
  'error',
  'staleShell',
  'staleTemplate',
] as const;
export type PageSyncStatus = (typeof PAGE_SYNC_STATUS_VALUES)[number];

export const TEMPLATE_STATUS_VALUES = [
  'active',
  'inactive',
  'deprecated',
  'draft',
] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUS_VALUES)[number];

export const MEDIA_ROLE_VALUES = [
  'gallery',
  'supporting',
  'hero',
  'secondary',
] as const;
export type MediaRole = (typeof MEDIA_ROLE_VALUES)[number];

export const BINDING_STATUS_VALUES = [
  'previewOnly',
  'published',
  'archived',
  'withdrawn',
  'error',
] as const;
export type BindingStatus = (typeof BINDING_STATUS_VALUES)[number];

export const LAST_OPERATION_VALUES = [
  'preview',
  'publish',
  'republish',
  'regenerate',
  'archive',
  'withdraw',
] as const;
export type LastOperation = (typeof LAST_OPERATION_VALUES)[number];

export const WORKFLOW_HISTORY_ACTION_VALUES = [
  'transition',
  'publish',
  'republish',
  'regenerate',
  'archive',
  'withdraw',
  'approvalDecision',
] as const;
export type WorkflowHistoryAction =
  (typeof WORKFLOW_HISTORY_ACTION_VALUES)[number];

export const PUBLISHING_ERROR_CATEGORY_VALUES = [
  'templateResolution',
  'validation',
  'pageGeneration',
  'pageSync',
  'binding',
  'unknown',
] as const;
export type PublishingErrorCategory =
  (typeof PUBLISHING_ERROR_CATEGORY_VALUES)[number];

export const PUBLISHING_ERROR_OPERATION_VALUES = [
  'preview',
  'publish',
  'republish',
  'regenerate',
  'archive',
  'withdraw',
] as const;
export type PublishingErrorOperation =
  (typeof PUBLISHING_ERROR_OPERATION_VALUES)[number];

export const RETRY_STATUS_VALUES = ['none', 'pending', 'resolved'] as const;
export type RetryStatus = (typeof RETRY_STATUS_VALUES)[number];

/**
 * Destination key is architecturally locked to a single value in v1.
 * Exported as a tuple for symmetry and to support future multi-destination
 * extensions without changing the call-site shape.
 */
export const TARGET_SITE_KEY_VALUES = ['projectSpotlight'] as const;
export type TargetSiteKey = (typeof TARGET_SITE_KEY_VALUES)[number];
