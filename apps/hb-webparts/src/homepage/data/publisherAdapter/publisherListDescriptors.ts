/**
 * Runtime-safe list metadata for the Project Spotlight publisher.
 *
 * Authority:
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/02-List-By-List-Architecture.md
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
 *
 * This module exposes display names, host-site URL, and the MVP=Yes field
 * set for each architecture-mandated list. Prompt-03 will layer the service
 * layer on top of these descriptors; no list I/O happens here.
 *
 * The host site is HBCentral (control-plane). ProjectSpotlight is the
 * destination for generated pages only.
 */

export const PUBLISHER_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' as const;

export type PublisherListKey =
  | 'posts'
  | 'teamMembers'
  | 'media'
  | 'templateRegistry'
  | 'pageBindings'
  | 'workflowHistory'
  | 'publishingErrors';

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
  'PostId',
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
  'PostId',
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
  'PostId',
  'MediaId',
  'MediaRole',
  'ImageAssetUrl',
  'AltText',
  'Caption',
  'SortOrder',
] as const;

const TEMPLATE_REGISTRY_MVP_FIELDS = [
  'TemplateKey',
  'TemplateDisplayName',
  'TemplateStatus',
  'TemplateVersion',
  'PageShellKey',
  'PageShellVersion',
  'ShellSourceSiteUrl',
  'ShellSourcePagePath',
  'PostFamily',
  'SpotlightType',
  'ProjectStage',
  'ArticleSubject',
  'BannerRendererKind',
  'BodyRendererKind',
  'TeamRendererKind',
  'GalleryRendererKind',
  'ShowTeamBlock',
  'ShowGalleryBlock',
  'RequiredFieldSetKey',
  'ValidationProfileKey',
  'RenderProfileKey',
  'AllowRepublishInPlace',
  'ForceRegenerationOnShellChange',
  'ControlMapJson',
] as const;

const PAGE_BINDINGS_MVP_FIELDS = [
  'BindingId',
  'PostId',
  'TargetSiteUrl',
  'TargetSiteKey',
  'PageId',
  'PageName',
  'PageUrl',
  'SourceTemplatePath',
  'PageShellKey',
  'PageShellVersion',
  'TemplateKey',
  'TemplateVersion',
  'BindingStatus',
  'LastOperation',
  'LastOperationDateUtc',
  'LastSuccessfulSyncDateUtc',
] as const;

const WORKFLOW_HISTORY_FIELDS = [
  'HistoryId',
  'PostId',
  'FromState',
  'ToState',
  'Action',
  'ActorEmail',
  'ActionDateUtc',
  'Note',
] as const;

const PUBLISHING_ERRORS_FIELDS = [
  'ErrorId',
  'PostId',
  'BindingId',
  'Operation',
  'TemplateKey',
  'PageShellKey',
  'OccurredDateUtc',
  'ErrorCategory',
  'ErrorSummary',
  'ErrorDetails',
  'RetryStatus',
] as const;

export const PUBLISHER_LISTS: Readonly<
  Record<PublisherListKey, PublisherListDescriptor>
> = Object.freeze({
  posts: {
    key: 'posts',
    displayName: 'Project Spotlight Posts',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: POSTS_MVP_FIELDS,
  },
  teamMembers: {
    key: 'teamMembers',
    displayName: 'Project Spotlight Post Team Members',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: TEAM_MEMBERS_MVP_FIELDS,
  },
  media: {
    key: 'media',
    displayName: 'Project Spotlight Post Media',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: MEDIA_MVP_FIELDS,
  },
  templateRegistry: {
    key: 'templateRegistry',
    displayName: 'Project Spotlight Template Registry',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: TEMPLATE_REGISTRY_MVP_FIELDS,
  },
  pageBindings: {
    key: 'pageBindings',
    displayName: 'Project Spotlight Page Bindings',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: PAGE_BINDINGS_MVP_FIELDS,
  },
  workflowHistory: {
    key: 'workflowHistory',
    displayName: 'Project Spotlight Workflow History',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: WORKFLOW_HISTORY_FIELDS,
  },
  publishingErrors: {
    key: 'publishingErrors',
    displayName: 'Project Spotlight Publishing Errors',
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    mvpFields: PUBLISHING_ERRORS_FIELDS,
  },
});
