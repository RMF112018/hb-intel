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
 * The host site is HBCentral (control-plane). Generated pages are
 * written to the ProjectSpotlight destination site (destination-
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

// Tenant-aligned minimum column set for `HB Articles` (schema report
// §"HB Articles"). Every name below corresponds to a real internal
// field on the list — the publisher reads / writes exactly these
// columns through `PublisherArticleRow`. Pre-tenant names (PostFamily,
// PageShellKey, Banner*, HeroRendererKind, ShowGallery,
// GalleryLayoutProfile, TeamSectionHeading, TeamViewer[Layout|Density|
// EnableProfileDrawer], IncludeInProjectSpotlightRollups,
// TargetSiteKey, GeneratedPageName, SourceTemplatePath,
// AppliedTemplateVersion, AppliedShellVersion,
// LastSuccessfulPublishDateUtc, BannerTitleOverride) are intentionally
// absent — they do not exist on the tenant list.
const ARTICLES_MVP_FIELDS = [
  // Identity / routing.
  'ArticleId',
  'Title',
  'ArticleContentType',
  'Destination',
  'Slug',
  'TemplateKey',
  'WorkflowState',
  // Content.
  'Subhead',
  'SummaryExcerpt',
  'BodyRichText',
  'BodyIntro',
  'BodyClosing',
  'CalloutText',
  'PullQuote',
  // Discriminators / subject.
  'SpotlightType',
  'ProjectStage',
  'ArticleSubject',
  // Authoring / publication metadata.
  'AuthorEmail',
  'AuthorDisplayName',
  'PublishedByEmail',
  'CreatedDateUtc',
  'UpdatedDateUtc',
  'PublishedDateUtc',
  'ScheduledPublishDateUtc',
  'ArchiveDateUtc',
  // Milestone (milestone-spotlight content type).
  'MilestoneLabel',
  'MilestoneDateUtc',
  // Project context.
  'ProjectId',
  'ProjectName',
  'ProjectLocation',
  'ProjectSector',
  'ProjectStatusLabel',
  // Hero (required image + alt; optional theming).
  'HeroPrimaryImage',
  'HeroPrimaryImageAltText',
  'HeroTitle',
  'HeroSubhead',
  'HeroEyebrow',
  'HeroCategoryLabel',
  'HeroThemeVariant',
  'HeroShowMetadata',
  'HeroMetadataMode',
  'HeroCtaLabel',
  'HeroCtaUrl',
  // Team Viewer.
  'ShowTeamViewer',
  'TeamViewerTitle',
  'TeamViewerIntro',
  'TeamViewerMode',
  'TeamViewerGroupingMode',
  'TeamViewerSortMode',
  'TeamViewerMaxInitialVisible',
  'TeamViewerAllowExpand',
  // Secondary image.
  'SecondaryImage',
  'SecondaryImageAltText',
  'SecondaryImageCaption',
  'ShowSecondaryImage',
  // Feature / pin / rollup flags.
  'IsFeatured',
  'FeaturedRank',
  'IsPinned',
  'PinRank',
  'IncludeInArchive',
  'IncludeInDestinationLanding',
  'IncludeInHomepageFeed',
  'SuppressFromRollups',
  'ManualSortOverride',
  // Page identity / sync (tenant HB Articles columns).
  'TargetSiteUrl',
  'PageTemplateKey',
  'PageShellVersion',
  'RenderVersion',
  'PageId',
  'PageName',
  'PageUrl',
  'PageSyncStatus',
  'LastPageSyncDateUtc',
  'TemplateOverrideAllowed',
] as const;

// Tenant-aligned minimum column set for `HB Article Team Members`
// (schema report §B). Descriptor authority reflects the tenant
// field names — the `PersonPrincipal` column IS the SharePoint User
// field on the list. The REST write alias `PersonPrincipalId`
// (integer user id) is a transport concern emitted only by
// `mapTeamMemberRowToListFields`; it is intentionally absent here
// so tenant schema truth and descriptor authority cannot drift
// apart. Closes P2-1.
const TEAM_MEMBERS_MVP_FIELDS = [
  'ArticleId',
  'TeamMemberId',
  'Title',
  'PersonPrincipal',
  'DisplayName',
  'Role',
  'Company',
  'Department',
  'GroupKey',
  'ParentMemberId',
  'IsFeaturedMember',
  'SortOrder',
  'BioSnippet',
  'ContactLink',
] as const;

const MEDIA_MVP_FIELDS = [
  'ArticleId',
  'MediaId',
  'Title',
  'MediaRole',
  'ImageAsset',
  'AltText',
  'Caption',
  'SortOrder',
  'GalleryGroup',
  'FeaturedInGallery',
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
    mvpFields: ARTICLES_MVP_FIELDS,
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
