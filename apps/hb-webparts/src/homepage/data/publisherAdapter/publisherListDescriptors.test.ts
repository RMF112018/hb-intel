/**
 * Tenant list-title drift guard.
 *
 * The publisher binds to SharePoint lists by Title (`getbytitle(...)`).
 * If any descriptor silently reverts to the obsolete
 * `Project Spotlight *` names, every read/write will fail against the
 * live tenant at HBCentral. This suite pins each descriptor's
 * `displayName` to the authoritative tenant list title from
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 * so Phase-02 Prompt-01's realignment cannot regress unnoticed.
 */
import { describe, expect, it } from 'vitest';
import {
  PUBLISHER_LIST_HOST_SITE_URL,
  PUBLISHER_LISTS,
  type PublisherListKey,
} from './publisherListDescriptors';

const EXPECTED_TENANT_TITLES: Readonly<Record<PublisherListKey, string>> = {
  articles: 'HB Articles',
  teamMembers: 'HB Article Team Members',
  media: 'HB Article Media',
  templateRegistry: 'HB Article Template Registry',
  pageBindings: 'HB Article Destination Pages',
  workflowHistory: 'HB Article Workflow History',
  publishingErrors: 'HB Article Publishing Errors',
  promotionRules: 'HB Article Promotion Rules',
};

describe('publisherListDescriptors — tenant title binding', () => {
  it.each(Object.entries(EXPECTED_TENANT_TITLES) as Array<[PublisherListKey, string]>)(
    'binds %s to the tenant title "%s"',
    (key, expectedTitle) => {
      expect(PUBLISHER_LISTS[key].displayName).toBe(expectedTitle);
    },
  );

  it('no descriptor uses an obsolete "Project Spotlight *" title', () => {
    for (const descriptor of Object.values(PUBLISHER_LISTS)) {
      expect(descriptor.displayName.startsWith('Project Spotlight')).toBe(false);
    }
  });

  it('every descriptor is scoped to the HBCentral host site', () => {
    for (const descriptor of Object.values(PUBLISHER_LISTS)) {
      expect(descriptor.hostSiteUrl).toBe(PUBLISHER_LIST_HOST_SITE_URL);
    }
  });
});

/**
 * Tenant `mvpFields` drift guard.
 *
 * The descriptor's `mvpFields` array is the runtime manifest of the
 * internal field names each tenant list carries. If a pre-tenant
 * name leaks back in (PostFamily, PageShellKey, Banner*,
 * HeroRendererKind, ShowGallery, TeamViewerLayout, …) the publisher
 * will emit REST calls with columns that do not exist on the tenant
 * list. Each expected set below is pinned directly from the
 * authoritative schema report in
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/
 *     publisher-list-schema-report.md
 * limited to the tenant-editable columns the publisher actually
 * reads or writes (system/OOB columns like `_ComplianceFlags`,
 * `Attachments`, `ContentType`, `Author`, `Editor`, `Modified`,
 * `Created`, etc. are excluded).
 */
const EXPECTED_MVP_FIELDS: Readonly<Record<PublisherListKey, readonly string[]>> = {
  articles: [
    'ArticleId', 'Title', 'ArticleContentType', 'Destination', 'Slug',
    'TemplateKey', 'WorkflowState',
    'Subhead', 'SummaryExcerpt', 'BodyRichText', 'BodyIntro', 'BodyClosing',
    'CalloutText', 'PullQuote',
    'SpotlightType', 'ProjectStage', 'ArticleSubject',
    'AuthorEmail', 'AuthorDisplayName', 'PublishedByEmail',
    'CreatedDateUtc', 'UpdatedDateUtc', 'PublishedDateUtc',
    'ScheduledPublishDateUtc', 'ArchiveDateUtc',
    'MilestoneLabel', 'MilestoneDateUtc',
    'ProjectId', 'ProjectName', 'ProjectLocation', 'ProjectSector',
    'ProjectStatusLabel',
    'HeroPrimaryImage', 'HeroPrimaryImageAltText', 'HeroTitle',
    'HeroSubhead', 'HeroEyebrow', 'HeroCategoryLabel',
    'HeroThemeVariant', 'HeroShowMetadata', 'HeroMetadataMode',
    'HeroCtaLabel', 'HeroCtaUrl',
    'ShowTeamViewer', 'TeamViewerTitle', 'TeamViewerIntro',
    'IsFeatured', 'FeaturedRank', 'IsPinned', 'PinRank',
    'IncludeInArchive', 'IncludeInDestinationLanding',
    'IncludeInHomepageFeed', 'SuppressFromRollups', 'ManualSortOverride',
    'TargetSiteUrl', 'PageTemplateKey', 'PageShellVersion',
    'RenderVersion', 'PageId', 'PageName', 'PageUrl',
    'PageSyncStatus', 'LastPageSyncDateUtc', 'TemplateOverrideAllowed',
  ],
  teamMembers: [
    'ArticleId', 'TeamMemberId', 'Title', 'PersonPrincipalId',
    'DisplayName', 'Role', 'Company', 'Department', 'GroupKey',
    'ParentMemberId', 'IsFeaturedMember', 'SortOrder', 'BioSnippet',
    'ContactLink',
  ],
  media: [
    'ArticleId', 'MediaId', 'Title', 'MediaRole', 'ImageAsset',
    'AltText', 'Caption', 'SortOrder', 'GalleryGroup',
    'FeaturedInGallery',
  ],
  templateRegistry: [
    'TemplateKey', 'TemplateName', 'IsActive', 'TemplatePriority',
    'VersionLabel', 'ContentTypes', 'Destination', 'SpotlightTypes',
    'ProjectStages', 'ArticleSubjects', 'PageShellTemplateKey',
    'HeroProfileKey', 'BodyProfileKey', 'TeamViewerProfileKey',
    'GalleryProfileKey', 'ShowHero', 'ShowBody', 'ShowTeamViewer',
    'ShowGallery', 'ShowSecondaryImage', 'RequiredFieldSetKey',
  ],
  pageBindings: [
    'BindingId', 'ArticleId', 'Title', 'TargetSiteUrl',
    'PageTemplateKey', 'PublishStatus', 'PageId', 'PageName',
    'PageUrl', 'PageShellVersion', 'RenderVersion', 'SyncStatus',
    'LastSyncDateUtc', 'LastSyncMessage', 'PublishedDateUtc',
  ],
  workflowHistory: [
    'HistoryId', 'ArticleId', 'Title', 'NewState', 'PreviousState',
    'ActionDateUtc', 'ActorEmail', 'ActionNote',
  ],
  publishingErrors: [
    'ErrorId', 'ArticleId', 'Title', 'Destination', 'Operation',
    'ErrorSummary', 'BindingId', 'LastAttemptDateUtc', 'RetryStatus',
  ],
  promotionRules: [
    'RuleId', 'Title', 'Destination', 'Scope', 'IsActive',
    'RuleContentType', 'FeaturedDefault', 'PinnedDefault',
    'ManualOverrideAllowed', 'FeedWindowDays', 'Notes',
  ],
};

// Obsolete pre-tenant names that must never reappear on any
// descriptor. Pinned here so a regression reads as a concrete test
// failure rather than a silent drift in the descriptor file.
const OBSOLETE_FIELDS = [
  'PostId', 'PostFamily',
  'PageShellKey', 'TargetSiteKey', 'SourceTemplatePath',
  'GeneratedPageName', 'AppliedTemplateVersion', 'AppliedShellVersion',
  'LastSuccessfulPublishDateUtc', 'IncludeInProjectSpotlightRollups',
  'BannerTitleOverride', 'BannerImageUrl', 'BannerImageAltText',
  'BannerEyebrow', 'BannerCategoryLabel', 'BannerThemeVariant',
  'BannerShowPublishDate', 'BannerShowGradient',
  'HeroRendererKind',
  'TeamSectionHeading', 'TeamViewerLayout', 'TeamViewerDensity',
  'TeamViewerEnableProfileDrawer',
  'GalleryLayoutProfile',
  'ImageAssetUrl',
  'JobTitle', 'PhotoUrl', 'IncludeInViewer',
  'ResumeRichText', 'ResumeDocumentUrl',
  'PersonPrincipal', // User fields are written as `PersonPrincipalId`
] as const;

describe('publisherListDescriptors — tenant mvpFields drift', () => {
  it.each(Object.entries(EXPECTED_MVP_FIELDS) as Array<[PublisherListKey, readonly string[]]>)(
    '%s descriptor mvpFields match the tenant-aligned expected set',
    (key, expected) => {
      const actual = [...PUBLISHER_LISTS[key].mvpFields];
      expect([...actual].sort()).toEqual([...expected].sort());
    },
  );

  it('no descriptor mvpFields entry uses an obsolete pre-tenant name', () => {
    const obsolete: ReadonlySet<string> = new Set<string>(OBSOLETE_FIELDS);
    for (const descriptor of Object.values(PUBLISHER_LISTS)) {
      for (const field of descriptor.mvpFields) {
        expect(obsolete.has(field)).toBe(false);
      }
    }
  });
});
