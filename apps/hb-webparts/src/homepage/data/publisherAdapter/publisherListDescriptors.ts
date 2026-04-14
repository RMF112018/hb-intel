/**
 * Runtime-safe list metadata for the Article Publisher.
 *
 * Authority (tenant truth):
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 *
 * Supporting design context:
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/02-List-By-List-Architecture.md
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
 *
 * Display names below are the **actual tenant list titles** (`HB Article*`
 * family on the HBCentral host site). They are the source of truth for
 * every read/write; if these drift back to the obsolete `Project
 * Spotlight *` names, the publisher will silently bind to non-existent
 * lists — the descriptor-drift test enforces this invariant.
 *
 * The host site is HBCentral (control-plane). ProjectSpotlight remains
 * the first-sprint destination for generated pages only (destination-
 * scoped identity, preserved per the rebranding report).
 */

export const PUBLISHER_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' as const;

export type PublisherListKey =
  | 'articles'
  | 'teamMembers'
  | 'media'
  | 'templateRegistry'
  | 'pageBindings'
  | 'workflowHistory'
  | 'publishingErrors'
  | 'promotionRules';

export interface PublisherListDescriptor {
  /** The list key used across publisherAdapter code. */
  readonly key: PublisherListKey;
  /** SharePoint list display name (`Title` property on the list). */
  readonly displayName: string;
  /** Control-plane host-site URL for this list. */
  readonly hostSiteUrl: typeof PUBLISHER_LIST_HOST_SITE_URL;
  /** Internal field names that must exist on the list (arch 03 MVP=Yes set). */
  readonly mvpFields: readonly string[];
}

const POSTS_MVP_FIELDS = [
  'ArticleId',
  'Title',
  'BannerTitleOverride',
  'Subhead',
  'SummaryExcerpt',
  'BodyRichText',
  'PostFamily',
  'SpotlightType',
  'ProjectStage',
  'ArticleSubject',
  'TemplateKey',
  'PageShellKey',
  'Slug',
  'WorkflowState',
  'AuthorEmail',
  'AuthorDisplayName',
  'CreatedDateUtc',
  'UpdatedDateUtc',
  'PublishedDateUtc',
  'ScheduledPublishDateUtc',
  'ArchiveDateUtc',
  'ProjectId',
  'ProjectName',
  'ProjectLocation',
  'ProjectSector',
  'BannerImageUrl',
  'BannerImageAltText',
  'BannerEyebrow',
  'BannerCategoryLabel',
  'BannerThemeVariant',
  'BannerShowPublishDate',
  'BannerShowGradient',
  'HeroRendererKind',
  'ShowTeamViewer',
  'TeamSectionHeading',
  'TeamViewerLayout',
  'TeamViewerDensity',
  'TeamViewerEnableProfileDrawer',
  'ShowGallery',
  'GalleryLayoutProfile',
  'IsFeatured',
  'FeaturedRank',
  'IsPinned',
  'PinRank',
  'IncludeInProjectSpotlightRollups',
  'IncludeInArchive',
  'TargetSiteUrl',
  'TargetSiteKey',
  'GeneratedPageName',
  'PageUrl',
  'PageId',
  'SourceTemplatePath',
  'AppliedTemplateVersion',
  'AppliedShellVersion',
  'LastPageSyncDateUtc',
  'PageSyncStatus',
  'LastSuccessfulPublishDateUtc',
] as const;

const TEAM_MEMBERS_MVP_FIELDS = [
  'ArticleId',
  'TeamMemberId',
  'PersonPrincipal',
  'DisplayName',
  'JobTitle',
  'PhotoUrl',
  'SortOrder',
  'BioSnippet',
  'ResumeRichText',
  'ResumeDocumentUrl',
  'ContactLink',
  'IncludeInViewer',
] as const;

const MEDIA_MVP_FIELDS = [
  'ArticleId',
  'MediaId',
  'MediaRole',
  'ImageAssetUrl',
  'AltText',
  'Caption',
  'SortOrder',
] as const;

const TEMPLATE_REGISTRY_MVP_FIELDS = [
  'TemplateKey',
  'TemplateName',
  'IsActive',
  'TemplatePriority',
  'VersionLabel',
  'ContentTypes',
  'Destination',
  'SpotlightTypes',
  'ProjectStages',
  'ArticleSubjects',
  'PageShellTemplateKey',
  'HeroProfileKey',
  'BodyProfileKey',
  'TeamViewerProfileKey',
  'GalleryProfileKey',
  'ShowHero',
  'ShowBody',
  'ShowTeamViewer',
  'ShowGallery',
  'ShowSecondaryImage',
  'RequiredFieldSetKey',
] as const;

const PAGE_BINDINGS_MVP_FIELDS = [
  'BindingId',
  'ArticleId',
  'Title',
  'TargetSiteUrl',
  'PageTemplateKey',
  'PublishStatus',
  'PageId',
  'PageName',
  'PageUrl',
  'PageShellVersion',
  'RenderVersion',
  'SyncStatus',
  'LastSyncDateUtc',
  'LastSyncMessage',
  'PublishedDateUtc',
] as const;

const WORKFLOW_HISTORY_FIELDS = [
  'HistoryId',
  'ArticleId',
  'Title',
  'NewState',
  'PreviousState',
  'ActionDateUtc',
  'ActorEmail',
  'ActionNote',
] as const;

const PUBLISHING_ERRORS_FIELDS = [
  'ErrorId',
  'ArticleId',
  'Title',
  'Destination',
  'Operation',
  'ErrorSummary',
  'BindingId',
  'LastAttemptDateUtc',
  'RetryStatus',
] as const;

const PROMOTION_RULES_FIELDS = [
  'RuleId',
  'Title',
  'Destination',
  'Scope',
  'IsActive',
  'RuleContentType',
  'FeaturedDefault',
  'PinnedDefault',
  'ManualOverrideAllowed',
  'FeedWindowDays',
  'Notes',
] as const;

export const PUBLISHER_LISTS: Readonly<
  Record<PublisherListKey, PublisherListDescriptor>
> = Object.freeze({
  articles: {
    key: 'articles',
    displayName: 'HB Articles',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: POSTS_MVP_FIELDS,
  },
  teamMembers: {
    key: 'teamMembers',
    displayName: 'HB Article Team Members',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: TEAM_MEMBERS_MVP_FIELDS,
  },
  media: {
    key: 'media',
    displayName: 'HB Article Media',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: MEDIA_MVP_FIELDS,
  },
  templateRegistry: {
    key: 'templateRegistry',
    displayName: 'HB Article Template Registry',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: TEMPLATE_REGISTRY_MVP_FIELDS,
  },
  pageBindings: {
    key: 'pageBindings',
    displayName: 'HB Article Destination Pages',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: PAGE_BINDINGS_MVP_FIELDS,
  },
  workflowHistory: {
    key: 'workflowHistory',
    displayName: 'HB Article Workflow History',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: WORKFLOW_HISTORY_FIELDS,
  },
  publishingErrors: {
    key: 'publishingErrors',
    displayName: 'HB Article Publishing Errors',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: PUBLISHING_ERRORS_FIELDS,
  },
  promotionRules: {
    key: 'promotionRules',
    displayName: 'HB Article Promotion Rules',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: PROMOTION_RULES_FIELDS,
  },
});
