/**
 * Canonical enum values for the Article Publisher data model.
 *
 * Authority (tenant truth):
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 *
 * Master-record (HB Articles) enum values are pinned to the tenant
 * list schema. Non-master enums at the bottom of this file
 * (`HeroRendererKind`, `PostFamily`, `TargetSiteKey`, `BindingStatus`,
 * `LastOperation`, `TemplateStatus`, etc.) are retained because the
 * pure compositor / row-mapper plumbing still reads their shapes;
 * they are NOT used on master-record state. Consumers of
 * master-record state must use the tenant-aligned enums above.
 *
 * All tuples are declared `as const` so consumers can derive literal-union
 * types directly; no runtime object mutation is required.
 */

/* ── Master-record (HB Articles) enums — tenant-aligned ──────────────── */

/**
 * Article content type (tenant column `ArticleContentType`, Choice).
 * Replaces the prior `PostFamily` master-record enum.
 */
export const ARTICLE_CONTENT_TYPE_VALUES = [
  'newsUpdate',
  'monthlySpotlight',
  'milestoneSpotlight',
  'projectUpdate',
  'announcement',
] as const;
export type ArticleContentType = (typeof ARTICLE_CONTENT_TYPE_VALUES)[number];

/**
 * Destination (tenant column `Destination`, Choice).
 * Replaces the prior single-valued `TargetSiteKey` master enum. The
 * Project Spotlight destination identity is preserved (destination
 * scope, per the rebranding report); Company Pulse is a declared
 * future destination, not yet implemented by the app.
 *
 * This list is SCHEMA-COMPLETE — it matches every Choice value on
 * the tenant column so adapters can read legacy rows. For
 * operational scope (which destinations are actually wired for
 * authoring + publish in the current sprint) use
 * `SUPPORTED_DESTINATIONS` from `destinationSiteUrls.ts` — authoring
 * surfaces must gate on that list so operators are not invited
 * into destinations whose publish pipeline is not implemented.
 */
export const DESTINATION_VALUES = [
  'companyPulse',
  'projectSpotlight',
] as const;
export type Destination = (typeof DESTINATION_VALUES)[number];

export const SPOTLIGHT_TYPE_VALUES = ['monthly', 'milestone', 'other'] as const;
export type SpotlightType = (typeof SPOTLIGHT_TYPE_VALUES)[number];

export const PROJECT_STAGE_VALUES = [
  'precon',
  'active',
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
  'review',
  'approved',
  'scheduled',
  'published',
  'archived',
  'withdrawn',
] as const;
export type WorkflowState = (typeof WORKFLOW_STATE_VALUES)[number];

/**
 * Operational workflow states exposed by live authoring/publish UI.
 *
 * `scheduled` remains in `WORKFLOW_STATE_VALUES` for tenant-schema
 * compatibility and legacy-row readability, but is intentionally
 * excluded here until a real scheduled-publish executor exists.
 */
export const WORKFLOW_STATE_OPERATIONAL_VALUES = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
  'withdrawn',
] as const;

export const HERO_THEME_VARIANT_VALUES = [
  'default',
  'light',
  'dark',
] as const;
export type HeroThemeVariant = (typeof HERO_THEME_VARIANT_VALUES)[number];

export const HERO_METADATA_MODE_VALUES = [
  'standard',
  'compact',
  'hidden',
] as const;
export type HeroMetadataMode = (typeof HERO_METADATA_MODE_VALUES)[number];

export const PAGE_SYNC_STATUS_VALUES = [
  'in-sync',
  'pending',
  'error',
] as const;
export type PageSyncStatus = (typeof PAGE_SYNC_STATUS_VALUES)[number];

/**
 * Publish status on the tenant `HB Article Destination Pages` list
 * (`PublishStatus` column). Replaces the prior `BindingStatus` enum.
 */
export const PUBLISH_STATUS_VALUES = [
  'draft',
  'published',
  'error',
  'scheduled',
] as const;
export type PublishStatus = (typeof PUBLISH_STATUS_VALUES)[number];

/**
 * Sync status on the tenant `HB Article Destination Pages` list
 * (`SyncStatus` column).
 */
export const SYNC_STATUS_VALUES = ['in-sync', 'pending', 'error'] as const;
export type SyncStatus = (typeof SYNC_STATUS_VALUES)[number];

/* ── Legacy / non-master-record enums (retained for compositor plumbing) ── */
/* The tenant realignment of `TemplateRegistry`, `PageBinding`,
   `PublishingErrors`, `WorkflowHistory`, and `PromotionRules` is
   complete; the master-record contracts above are the source of
   truth for list writes. The enums in this section are retained
   because the pure compositor + row-mapper plumbing still reads
   their literal shapes (e.g. `HeroRendererKind` in template-registry
   rendering, `PostFamily` in legacy row-mapper parsers). They must
   not be used on master-record state. */

/**
 * Banner theme variant is retained as a legacy alias of the tenant
 * `HeroThemeVariant` enum so pre-tenant renderer identifiers in
 * `publisherContracts.PublisherTemplateRegistryRow` and the shell XML
 * compositor continue to compile. Do not use on master-record state.
 */
export const BANNER_THEME_VARIANT_VALUES = HERO_THEME_VARIANT_VALUES;
export type BannerThemeVariant = HeroThemeVariant;

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

/**
 * Team Viewer enum values are now owned by the TeamViewer webpart's
 * canonical contracts (`apps/hb-webparts/src/webparts/teamViewer/
 * teamViewerContracts.ts`). The publisher adapter re-exports the
 * webpart types so both surfaces speak the same enum set
 * (Phase-02 Prompt-13). The pre-tenant publisher-local sets
 * (`['grid','list']` / `['standard','compact','comfortable']`) are
 * intentionally removed; consume `TeamViewerLayout` /
 * `TeamViewerDensity` from `./teamViewerAdapter` instead.
 */

export const GALLERY_LAYOUT_PROFILE_VALUES = [
  'grid',
  'carousel',
  'shellDefault',
] as const;
export type GalleryLayoutProfile =
  (typeof GALLERY_LAYOUT_PROFILE_VALUES)[number];

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

/**
 * Operation classifier on the tenant `HB Article Publishing Errors`
 * list (`Operation` Choice column). Tenant choices are intentionally
 * coarser than the orchestrator's internal failure stages — those
 * stages collapse to one of these tenant values when persisted.
 */
export const PUBLISHING_ERROR_OPERATION_VALUES = [
  'create',
  'update',
  'publish',
  'sync',
] as const;
export type PublishingErrorOperation =
  (typeof PUBLISHING_ERROR_OPERATION_VALUES)[number];

/**
 * Scope on the tenant `HB Article Promotion Rules` list (`Scope`
 * Choice column). Determines whether a rule applies destination-wide,
 * to the homepage feed, or globally.
 */
export const PROMOTION_RULE_SCOPE_VALUES = [
  'destination',
  'homepage',
  'global',
] as const;
export type PromotionRuleScope = (typeof PROMOTION_RULE_SCOPE_VALUES)[number];

export const RETRY_STATUS_VALUES = ['none', 'pending', 'resolved'] as const;
export type RetryStatus = (typeof RETRY_STATUS_VALUES)[number];

/**
 * `PostFamily` is a pre-tenant-audit enum retained because the
 * row-mapper parser plumbing still reads its literal set. The
 * tenant `HB Article Template Registry` row contract uses
 * `ContentTypes` (MultiChoice of `ArticleContentType`) instead.
 * Do not use on master-record state — use `ArticleContentType`.
 */
export const POST_FAMILY_VALUES = [
  'monthlySpotlight',
  'milestoneSpotlight',
  'projectUpdate',
  'projectStory',
] as const;
export type PostFamily = (typeof POST_FAMILY_VALUES)[number];

/**
 * `TargetSiteKey` is a pre-tenant-audit enum retained for backward
 * compatibility with older callers. The tenant `HB Articles` +
 * `HB Article Destination Pages` rows use `Destination` (Choice);
 * authoritative destination site URLs are resolved via
 * `destinationSiteUrls.resolveDestinationSiteUrl`. Do not use on
 * master-record state — use `Destination`.
 */
export const TARGET_SITE_KEY_VALUES = ['projectSpotlight'] as const;
export type TargetSiteKey = (typeof TARGET_SITE_KEY_VALUES)[number];
